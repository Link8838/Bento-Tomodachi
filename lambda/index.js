/* *
 * Esta es una skill para la simulación de un tamagotchi.
 * Autores: Hernández Ferreiro Enrique Ehecatl, Lopez Soto Ramses Antonio.
 * Versión 4.3.
 * */
 
//Constantes para manejo de apis y funciones.
const Alexa = require('ask-sdk-core');
const objetoMascota = require('./mascota');
const funcion = require('./funciones');
const util = require('./util');
const aplDoc = require('./apl/visual/tamagochiView.json');
let persistenceAdapter = getPersistenceAdapter();

let aplAud = '';
let contexto = '';

//Funcion para saber si la mascota está viva.
function estaViva(mascota){
    return mascota.vivo;
}

//Obtenemos el adaptador de pesistencia.
function getPersistenceAdapter() {
    if(process.env.S3_PERSISTENCE_BUCKET) {
        const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({ 
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    } else {
        const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
        return new DynamoDbPersistenceAdapter({ 
            tableName: 'name_table',
            createTable: true
        });
    }
}

//Launcher de la Skill.
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        attributesManager.deletePersistentAttributes();
        
        //Variables del Launcher.
        var primeraVez = sessionAttributes.primeraV;
        let hTitle = '';
        let hSTitle = '';
        let tAvatar = '';
        let tName = '';
        let aHint = '';
        let reprompt = '';
        let speakOutput = "";
        hTitle = 'Bienvenido a Bentō tomodachi.';
        //Verificamos si es la primera vez que se usa la Skill.
        if(!primeraVez){
            speakOutput += "<prosody volume='x-loud'>Aquí podrás cuidar un Bentōchi, una mascota virtual. Deberás darle de comer, bañarla, jugar con ella y curarla si se enferma.<break time='.5s'/> Aún no tienes una mascota.<break time='.5s'/>Aquí tienes un <sub alias='Taiki-yaki'>Taikiyaki</sub>, que son los huevitos de Bentōchi, di: \"abrir huevito\" para que nazca tu nuevo amigo.</prosody>"; 
            hSTitle = 'Parece que aun no tienes una mascota. Aquí tienes un huevito.';
            tAvatar = 'https://i.ibb.co/72wHcHZ/Takoyaki.gif';
            aHint = 'abre huevito, para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
            primeraVez = false;
            let enPeligo = false;
            sessionAttributes['primeraV'] = primeraVez;
            sessionAttributes['peligro'] = enPeligo;
            aplAud = require('./apl/audio/introPV.json');
        } else {
            //Si no es la primera vez cargamos los atributos de sesión.
            const pet = sessionAttributes.mascota;
            const nombre = sessionAttributes.mascota.nombre;
            //Verificamos que la mascota esté viva.
            if(pet.vivo){
                aplAud = require('./apl/audio/intro.json');
                pet.dormido = false;
                hTitle = funcion.mascotaTitle(pet);
                hSTitle = funcion.mascotaSubTitle(pet);
                tAvatar = pet.avatar;
                aHint = `ayuda.`;
                tName = nombre;
                if(pet.hambre === 0){
                    speakOutput += ` <prosody volume='x-loud'><s>¡Cuidado!.</s></prosody><prosody volume='loud'>${nombre} tiene mucha hambre, creo que no ha comido nada.<break time='.5s'/></prosody>`;
                    aHint = `alimenta a ${nombre}`;
                    reprompt = `<prosody volume='x-loud'><s>Deberías probar darle de comer a ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    aplAud = require('./apl/audio/introAl.json');
                }
                if (pet.enfermedad){
                    speakOutput += `<prosody volume='loud'><s>Parece que ${nombre} se siente mal.</s> Si no la curas, <say-as interpret-as='interjection'>va a colgar los tenis.</say-as><break time='.5s'/></prosody>`;
                    aHint = `cura a ${nombre}`;
                    reprompt = `<prosody volume='x-loud'><s>Deberías curar ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    aplAud = require('./apl/audio/introAl.json');
                } else {
                    speakOutput += `<prosody volume='x-loud'><s> ${nombre} te estaba esperando.</s></prosody>`;
                    reprompt = `<prosody volume='x-loud'><s>Deberías probar darle de comer a ${nombre}.</s></prosody>`;
                    //speakOutput += "<break time='.3s'/>"+reprompt;
                    const pet = sessionAttributes.mascota;
                }
                //pet.limpio = false;
                //pet.enfermedad = true;
                sessionAttributes['mascota'] = pet;
            } else{
                //Si no está viva cargamos las variables con los atributos necesarios.
                aplAud = require('./apl/audio/final.json');
                tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
                let fechaNac = pet.tiempo_de_vida;
                let fechaHoy = funcion.getTodayDate();
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                speakOutput = `<prosody volume='x-loud'><say-as interpret-as='interjection'>Oh no</say-as>,</prosody><prosody volume='loud'>${nombre} ya no está entre nosotros, parece que le hicieron falta cuidados.<break time='.5s'/><s>${nombre} vivió desde el: ${fechaNac} hasta hoy: ${fechaHoy}.</s> Si quieres una nueva mascota solo di: 'abrir huevito</prosody>`;
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
            }
            speakOutput += funcion.randomPhrase(7);
        }
        //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
        if (util.supportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
        }
        
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse();
    }
};

//Intent para abrir huevitos de tamagochi.
const EggIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EggIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        //variables del EggIntent
        contexto = 'EggIntent';
        let hTitle = 'Abriendo huevito...';
        let hSTitle = '';
        let tAvatar = '';
        let tName = '';
        let aHint = 'ayuda';
        let reprompt = '';
        aplAud = require('./apl/audio/huevito.json');
        //Se obtiene el slot con el nombre de la mascota.
        let nombre = handlerInput.requestEnvelope.request.intent.slots.name.value;
        let speakOutput;
        const primeraVez = sessionAttributes.primeraV;
        
        //Verificamo si es la primera vez que se abre un huevo.
        if(!primeraVez){
            //Cargamos una mascota vacía para poder crear mas abajo.
            hSTitle = 'Esta es la mascota que te tocó:';
            objetoMascota.mascota.nombre = 'aux';
            objetoMascota.mascota.vivo = false;
            sessionAttributes['mascota'] = objetoMascota.mascota;
            const primeraVez = true;
            sessionAttributes['primeraV'] = primeraVez;
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        }
        const pet = sessionAttributes.mascota;
        //Si ya existe una mascota termina el intent.
        if(nombre && pet.vivo) {
            speakOutput = "<s>Espera, espera.</s> Ya tienes una mascota, ¿para qué quieres otra?, ni huevos hay.";
            reprompt = "<prosody volume='x-loud'><s>Podrías intentar cuidar la mascota que ya tienes.</s></prosody>";
            hTitle = speakOutput;
            hSTitle = '';
        } else {
            //Si no existe mascosta, se crea una nueva con los datos necesarios.
            hSTitle = 'Esta es la mascota que te tocó:';
            nombre = funcion.upperCase(nombre);
            objetoMascota.mascota.nombre = nombre;
            sessionAttributes['name'] = nombre;
            objetoMascota.mascota.vivo = true;
            objetoMascota.mascota.tiempo_de_vida = funcion.getTodayDate();
            objetoMascota.mascota = funcion.randomPet(objetoMascota.mascota);
            tAvatar = objetoMascota.mascota.avatar;
            tName = nombre;
            sessionAttributes['mascota'] = objetoMascota.mascota;
            sessionAttributes['peligro'] = false;
            speakOutput = "<prosody volume='x-loud'>" + funcion.putNameOnString(funcion.randomPhrase(1), nombre) + "</prosody>";
            speakOutput += `, <s>cuidala bien</s>,<s> te recomiendo alimentarla.</s><s>Si necesitas ayuda solo di: 'ayuda'.</s>`;
            reprompt = `<prosody volume='x-loud'><s>Podrías darle de comer a ${nombre}.</s></prosody>`;
            //speakOutput += "<break time='.3s'/>"+reprompt;
        }
        //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
        if (util.supportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
        }

        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent para darle de comer a la mascota virtual.
const FeedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FeedIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        let speakOutput;
        let reprompt = '';
        contexto = 'FeedIntent';
        
        //Verificamos que exista una mascota.
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres alimentar a una mascota virtual primero necesitas una. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Si existe se cargan los atributos necesarios.
            const nombre = sessionAttributes.mascota.nombre;
            let pet = sessionAttributes.mascota;
            
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = ` jugar con ${nombre}.`;
            aplAud = require('./apl/audio/comer.json');
            //Verificamos que esté viva.
            if(pet.vivo){
                //Verificamos que se le pueda dar de comer.
                if(funcion.nivelHambre(pet)){
                    //speakOutput = `Le has dado de comer a ${nombre}, pancita llena corazón contento.`;
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(2), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar si ${nombre} necesita un baño.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    pet = funcion.aumentarHambre(pet);
                    if(funcion.randomNumber(2)){
                        pet.limpio = false;
                    }
                    if(funcion.randomNumber(1)){
                        pet.enfermedad = true;
                    }
                    sessionAttributes['mascota'] = pet;
                    sessionAttributes['peligro'] = false;
                } else {
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(22), nombre) + "</s></prosody>";
                    speakOutput += " <s>Prueba darle de comer mas tarde cuando tenga hambre.</s>";
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar como está ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    aplAud = require('./apl/audio/alterno.json');
                }
                tAvatar = pet.avatar;
            } else {
                //Si no está viva mandamos mensaje adecuado.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `${nombre} ya no está con nosotros, por lo que no puedes darle de comer,  Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += funcion.randomPhrase(7);
            
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
            
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }

        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent para curar a la mascota virtual.
const SickIntnetHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SickIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        contexto = 'SickIntent';
        let reprompt = '';
        let speakOutput;
        
        //Verificamos que exista la mascota virtual.
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres atender a una mascota virtual primero necesitas una. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Si existe cargamos los atributos necesarios.
            let pet = sessionAttributes.mascota;    
            const nombre = sessionAttributes.mascota.nombre;   
            
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = ` dar de comer a ${nombre}.`;
            
            //Verificamos que la mascota esté viva
            if(pet.vivo){
                //Verificamos que esté enferma.
                if(pet.enfermedad){
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(4), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Tal vez ${nombre} pueda comer un poco.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    pet.enfermedad = false;
                    pet = funcion.disminuirHambre(pet);
                    pet = funcion.disminuirFelicidad(pet);
                    sessionAttributes['mascota'] = pet;
                    sessionAttributes['peligro'] = false;
                    aplAud = require('./apl/audio/curar.json');
                } else {
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(44), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar como está ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    aplAud = require('./apl/audio/alterno.json');
                }
                tAvatar = pet.avatar;
            } else {
                //Si no está viva mandamos mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `<s>${nombre} ya no está con nosotros, ya no se enfermará más.</s> Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += `<break time='.5s'/><prosody volume='x-loud'><s>¿Qué quieres hacer ahora?</s>, quizá ${nombre} pueda comer un poco.</prosody>`;
            
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
            
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent para bañar a la mascota virtual
const BathIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BathIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        contexto = 'BathIntent';
        let reprompt = '';
        let speakOutput;
        
        //Verificamos que exista la mascota virtual
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres bañar a una mascota virtual primero necesitas una. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Cargamos los atributos necesarios.
            const nombre = sessionAttributes.mascota.nombre;
            const banio = sessionAttributes.mascota.limpio;
            const pet = sessionAttributes.mascota;
            
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = ` jugar con ${nombre}.`;
            aplAud = require('./apl/audio/ducha.json');
            //Verificamos que esté viva la mascota.
            if(pet.vivo){
                //Verificamos que esté sucia la mascota.
                if(!sessionAttributes.mascota.limpio){
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(3), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar como está ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    pet.limpio = true;
                    if(funcion.randomNumber(2)){
                        pet.enfermedad = true;
                    }
                    sessionAttributes['mascota'] = pet;
                } else{
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(33), nombre) + "</s></prosody>";
                    aplAud = require('./apl/audio/alterno.json');
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar como está ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                }
                tAvatar = pet.avatar;
            } else {
                //Si no esta viva mandamos el mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `<s>${nombre} ya no se puede bañar.</s> Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += `<prosody volume='x-loud'><s>¿Qué quieres hacer ahora?</s></prosody>`;
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
            
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent para jugar la mascota virtual.
const GiveLoveIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GiveLoveIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        contexto = 'GiveLoveIntent';
        let reprompt = '';
        let speakOutput;
        
        //Verificamos que exista la mascota virtual.
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres jugar con una mascota virtual primero necesitas una. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Cargamos los atributos necesarios.
            const nombre = sessionAttributes.mascota.nombre;
            let pet = sessionAttributes.mascota;
            sessionAttributes['mascota'] = pet;
            
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = ` dar de comer ${nombre}.`;
            //Verificamos que esté viva la mascota.
            if(pet.vivo){
                //Verificamos nivel de felicidad.
                if(funcion.nivelFelicidad(pet)){
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(5), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Tal vez ${nombre} quiera comer un poco.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    pet = funcion.aumentarFelicidad(pet);
                    pet = funcion.disminuirHambre(pet);
                    if(funcion.randomNumber(3)){
                        pet.limpio = false;
                    }
                    sessionAttributes['mascota'] = pet;
                    aplAud = require('./apl/audio/juego.json');
                } else {
                    speakOutput = "<prosody volume='x-loud'><s>" + funcion.putNameOnString(funcion.randomPhrase(55), nombre) + "</s></prosody>";
                    reprompt = `<prosody volume='x-loud'><s>Deberías revizar como está ${nombre}.</s></prosody>`;
                    speakOutput += "<break time='.3s'/>"+reprompt;
                    aplAud = require('./apl/audio/alterno.json');
                }
                tAvatar = pet.avatar;
            } else {
                //Si no está viva mandamos mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `Ya no puedes jugar mas con ${nombre},<break time='.5s'/>déjalo ir. Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                speakOutput += "<break time='.3s'/>"+reprompt;
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += funcion.randomPhrase(7);
            
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
              //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent para conocer el estado de la mascota virtual.
const StatusIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatusIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        contexto = 'StatusIntent';
        let reprompt = '';
        let speakOutput = `<prosody volume='x-loud'>`;
        
        //Verificamos que exista la mascota.
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres atender a una mascota virtual primero necesitas una. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Si existe cargamos los atributos necesarios.
            const pet = sessionAttributes.mascota;    
            const nombre = sessionAttributes.mascota.nombre;   
            speakOutput = `<prosody volume='x-loud'><s>Veamos como se encuentra ${nombre}: </s>`;
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let aHint = ` manda a dormir a ${nombre}`;
            let tName = '';
            
            //Verificamos que este viva la mascota virtual.
            if(pet.vivo){
                //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
                if (util.supportsAPL(handlerInput)) {
                    //Creamo mensaje basado en APL, sin detalles.
                    if(pet.enfermedad){
                        speakOutput += ` Parece que se siente mal de salud.`;
                        reprompt = `<prosody volume='x-loud'><s>Deberías curar a ${nombre}.</s></prosody>`;
                        aHint = ` curar a ${nombre}.`;
                    } else {
                        speakOutput += ` Se ve bastante sana.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                    
                    if(funcion.nivelHambre(pet)){
                        speakOutput += ` Creo que su pancita suena, quizá pueda comer un poco.`;
                        reprompt = `<prosody volume='x-loud'><s>Podrías darle de comer a ${nombre}.</s></prosody>`;
                        aHint = ` dar de comer a ${nombre}.`;
                    }else{
                        speakOutput += ` Por el momento no tiene hambre.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                    
                    if(pet.limpio){
                        speakOutput += ` Está rechinante de limpia.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    } else {
                        speakOutput += ` Quizá debería tomar un baño, huele un poco mal.`;
                        reprompt = `<prosody volume='x-loud'><s>Deberías darle un baño a ${nombre}.</s></prosody>`;
                        aHint = ` bañar a ${nombre}.`;
                    }
                    
                    if(funcion.nivelFelicidad(pet)){
                        speakOutput += ` Y creo que ${nombre} quiere jugar un rato contigo.`;
                        reprompt = `<prosody volume='x-loud'><s>Podrías jugar un poco con ${nombre}.</s></prosody>`;
                        aHint = ` jugar con ${nombre}.`;
                    }else{
                        speakOutput += ` Además se ve cansada, tal vez no quiera jugar por ahora.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                } else {
                    //Si no soporta APL creamo mensaje con detalles de estado.
                    if(pet.enfermedad){
                        speakOutput += ` Parece que se siente mal de salud.`;
                        reprompt = `<prosody volume='x-loud'><s>Deberías curar a ${nombre}.</s></prosody>`;
                        aHint = ` curar a ${nombre}.`;
                    } else {
                        speakOutput += ` Se ve bastante sana.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                    if(funcion.nivelHambre(pet)){
                        speakOutput += ` Su nivel de hambre es de: ${pet.hambre}, quizá pueda comer un poco.`;
                        reprompt = `<prosody volume='x-loud'><s>Podrías darle de comer a ${nombre}.</s></prosody>`;
                        aHint = ` dar de comer a ${nombre}.`;
                    }else{
                        speakOutput += ` Su nivel de hambre es de: ${pet.hambre}. Por el momento no tiene hambre.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                    if(pet.limpio){
                        speakOutput += ` Está rechinante de limpia.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    } else {
                        speakOutput += ` Quizá debería tomar un baño, huele un poco mal.`;
                        reprompt = `<prosody volume='x-loud'><s>Deberías darle un baño a ${nombre}.</s></prosody>`;
                        aHint = ` bañar a ${nombre}.`;
                    }
                    if(funcion.nivelFelicidad(pet)){
                        speakOutput += ` Su nivel de felicidad es de: ${pet.felicidad}, quiere jugar un rato contigo.`;
                        reprompt = `<prosody volume='x-loud'><s>Podrías jugar un poco con ${nombre}.</s></prosody>`;
                        aHint = ` jugar con ${nombre}.`;
                    }else{
                        speakOutput += `  Además su nivel de felicidad es de: ${pet.felicidad}. Tal vez no quiera jugar por ahora.`;
                        reprompt = `<prosody volume='x-loud'><s>Quizá deberías mandar a ${nombre} a dormir.</s></prosody>`;
                    }
                }
                tAvatar = pet.avatar;
                aplAud = require('./apl/audio/estado.json');
            } else {
                //Si no esta viva mandamos mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `Solo te puedo decir que ${nombre} ya se encuentra mejor. Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += " <break time='.5s'/>" + reprompt + `</prosody>`;
            speakOutput += funcion.randomPhrase(7);
            
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
                
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse(speakOutput);
    }
};

//Intent de ayuda.
const TypeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TypeIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        let speakOutput;
        let reprompt = '';
        contexto = 'TypeIntent';
        console.log("TYPE INTENT");
        
        if(sessionAttributes.mascota === undefined){
            speakOutput = "<s>Actualmente tienes un <sub alias='Taiki-yaki'>Taikiyaki</sub></s><p><s>Los <sub alias='Taiki-yaki'>Taikiyaki</sub> son huevitos de Bentōchi</s>, su forma recuerda a la comida Japonesa Takoyaki,<break time='.4s'/> bolitas redondas hechas a base de harina de trigo y pulpo.</p><p>El nombre <sub alias='Taiki-yaki'>Taikiyaki</sub> viene del nombre 'Taiki', que significa grandes esperanzas.</p><s>Si quieres abrir tu <sub alias='Taiki-yaki'>Taikiyaki</sub> solo di: 'abrir huevito'.</s>";
            reprompt = "<prosody volume='x-loud'><s>Si quieres abrir tu <sub alias='Taiki-yaki'>Taikiyaki</sub> solo di: \"abrir huevito\".</s></prosody>";
        } else {
            console.log("TYPE INTENT IF");
            //Cargamos los atributos necesarios.
            const nombre = sessionAttributes.mascota.nombre;
            let pet = sessionAttributes.mascota;
            sessionAttributes['mascota'] = pet;
            
            let hTitle = '';
            let hSTitle = '';
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = ` jugar con ${nombre}.`;
            aplAud = require('./apl/audio/estado.json');
            //Verificamos que esté viva la mascota.
            if(pet.vivo){
                tAvatar = pet.avatar;
                speakOutput = pet.descripcion;
                reprompt = `<prosody volume='x-loud'><s>Deberías ver como está ${nombre}.</s></prosody>`;
            } else {
                //Si no está viva mandamos mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `"<s>${nombre} se convirtió en un Magatama</s><p><s>Los Magatama son abalorios originarios de Japón</s>, usualmente asosiados a deidades o espíritus.</p>" Si quieres una nueva mascota solo di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
            speakOutput += funcion.randomPhrase(7);
            
            hTitle = funcion.mascotaTitle(pet);
            hSTitle = funcion.mascotaSubTitle(pet);
            tName = pet.nombre;
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective(funcion.showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint));
            }
        }

        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .reprompt(reprompt)
            .getResponse();
    }
};

//Intent de ayuda.
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        let pet = sessionAttributes.mascota;
        sessionAttributes['mascota'] = pet;
        const nombre = sessionAttributes.mascota.nombre;
        
        let speakOutput;
        let reprompt = '';
        contexto = 'AMAZON.HelpIntent';
        speakOutput = `<prosody volume='x-loud'>Hay 4 acciones que puedes hacer con tu Bentōchi: darle de comer, bañarla, jugar con él y, curarla si se enferma. Puedes preguntar como está tu mascota para conocer mas sobre su estado actual. Para salir puedes mandarla a dormir.</prosody>`;
        reprompt = `<prosody volume='x-loud'><s>Deberías ver como está ${nombre}.</s></prosody>`;
        //Verificamos que exista la mascota.
        if(sessionAttributes.mascota === undefined){
            speakOutput += ' Aun no tienes una mascota. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        }
        speakOutput += funcion.randomPhrase(7);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

//Intent de repetir acción.
const RepetirIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepetirIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        let reprompt = '';
        let speakOutput = '';
        
        //Verificamos que exista la mascota.
        if(sessionAttributes.mascota === undefined){
            speakOutput += ' Aun no tienes una mascota. Di: \'abrir huevito\' para que nazca tu nuevo amigo';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        }
        speakOutput = `Vale.`;
        
        handlerInput.responseBuilder.addDelegateDirective({
                    name: contexto,
                    confirmationStatus: 'NONE',
                    slots: {}
        });
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

//Intent para poner a dormir a la mascota virtual y cerrar la sesión.
const SleepTimeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SleepTimeIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        let speakOutput;
        let reprompt = '';
        //Verificamos que exista la mascota.
        if(sessionAttributes.mascota === undefined){
            speakOutput = 'Parece que aun no tienes una mascota. Si quieres atender a una mascota virtual primero necesitarás una. Abre de nuevo la skill diciendo: \'Jugar tamagochi\', para empezar a jugar.';
            reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
        } else {
            //Si existe cargamos los atributos necesarios.
            let pet = sessionAttributes.mascota;
            let enPeligo = sessionAttributes.peligro;
            let hTitle = funcion.mascotaTitle(pet);
            let hSTitle = funcion.mascotaSubTitle(pet);
            let tAvatar = 'https://i.ibb.co/S7tr73c/Magatama.gif';
            let tName = '';
            let aHint = '';
            aplAud = require('./apl/audio/dormir.json');
            //Verificamos que este viva la mascota.
            if(pet.vivo){
                //Si está enferma o con hambre y existe alerta la mascota muere.
                if((pet.enfermedad || pet.hambre === 0) && enPeligo){
                    pet.vivo = false;
                }
                //Si tiene hambre seteamos alerta.
                if(pet.hambre === 0){
                    enPeligo = true;
                    sessionAttributes['peligro'] = enPeligo;
                }
                //Si está enferma seteamos alerta.
                if(pet.enfermedad && !enPeligo){
                    enPeligo = true;
                    sessionAttributes['peligro'] = enPeligo;
                }
                pet.dormido = true;
                
                if(funcion.randomNumber(2)){
                    pet.limpio = false;
                }
                
                pet = funcion.alterarFelicidad(pet);
                pet = funcion.disminuirHambre(pet);
                
                sessionAttributes['mascota'] = pet;
                tAvatar = 'https://i.ibb.co/zPMDJR0/Box.gif';
                speakOutput = `${pet.nombre} se fue a dormir<break time='.3s'/>, <amazon:effect name='whispered'>no hagamos ruido para no despertarla.</amazon:effect>`;
            } else {
                //Si no esta viva mandamos mensaje correspondiente.
                aHint = 'abre huevito, para que nazca tu nuevo amigo';
                speakOutput = `${pet.nombre} ya está descansando. Si quieres una nueva mascota, vuelve a abrir la Skill y di: 'abrir huevito'. `;
                reprompt = "<prosody volume='x-loud'><s>Si quieres una nueva mascota solo di: \"abrir huevito\".</s></prosody>";
                aplAud = require('./apl/audio/finalAl.json');
            }
                tName = pet.nombre;
                
            //Verificamos si el dispositivo de ejecución soporta APL (Alexa Presentation Language)                
            if (util.supportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.4',
                    document: aplDoc,
                    datasources: {
                        launchData: {
                            type: 'object',
                            properties: {
                                headerTitle : hTitle,
                                headersubTitle : hSTitle,
                                headerImage : 'https://i.ibb.co/8N4kpNw/1.png',
                                tamagochiAvatar : tAvatar,
                                tamagochiName : tName,
                                alexaHint : aHint,
                            },
                        },
                    },
                });
            }
        }
        return handlerInput.responseBuilder
            .addDirective(funcion.loadAPLA(aplAud, speakOutput))
            .getResponse();
    }
};

//Intet de cancelación (por defecto de AMAZON)
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        let pet = sessionAttributes.mascota;
        //En caso de flujo excepconal, cargamos el estado de la mascota.
        let enPeligo = sessionAttributes.peligro;
        
        if((pet.enfermedad || pet.hambre === 0) && enPeligo){
            pet.vivo = false;
        }
        
        if(pet.hambre === 0){
            enPeligo = true;
            sessionAttributes['peligro'] = enPeligo;
        }
        
        if(pet.enfermedad && !enPeligo){
            enPeligo = true;
            sessionAttributes['peligro'] = enPeligo;
        }
       
        pet.dormido = true;
        
        if(funcion.randomNumber(2)){
            pet.limpio = false;
        }
        
        pet = funcion.alterarFelicidad(pet);
        pet = funcion.disminuirHambre(pet);
        
        sessionAttributes['mascota'] = pet;
        
        const speakOutput = '¡Nos vemos en otra ocasión!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Al parecer ocurrió un error, por favor, prueba de nuevo. Si el problema persiste ponte en contacto con el soporte para reportar el error.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.speak('Intentalo de nuevo').getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Se inició ${intentName} sin éxito, ponte en contacto con el soporte para reportar el error.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Parece que ocurrió un error, no puedo realizar esa acción.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        if(handlerInput.requestEnvelope.session['new']){ //is this a new session?
            const {attributesManager} = handlerInput;
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            //copy persistent attribute to session attributes
            handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

// Interceptor / middleware que permite obtener variables de sesión
const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession);//is this a session end?
        if(shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out            
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
            //await attributesManager.deletePersistentAttributes();
        }
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        EggIntentHandler,
        FeedIntentHandler,
        SickIntnetHandler,
        BathIntentHandler,
        GiveLoveIntentHandler,
        StatusIntentHandler,
        TypeIntentHandler,
        RepetirIntentHandler,
        SleepTimeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LoadAttributesRequestInterceptor)
    .addResponseInterceptors(
        SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(
        persistenceAdapter)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();