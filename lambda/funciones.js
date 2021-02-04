const objetoMascota = require('./mascota');
const moment = require('moment-timezone');

module.exports = {
    
    showAPL(aplDoc, hTitle, hSTitle, tAvatar, tName, aHint){
        return {
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
                        transformers: [{
                            inputPath: 'alexaHint',
                            transformer: 'textToHint',
                        }]
                    },
                },
            }
    },
    
    loadAPLA(aplAud, speakOutput){
        return {
                type: 'Alexa.Presentation.APLA.RenderDocument',
                token: 'INTRO',
                document: aplAud,
                datasources: {
                    data: {
                        type: 'object',
                        properties: {
                            speak : speakOutput
                        }
                    }
                }
            }
    },
    
    estaViva(objetoMascotamascota){
        return objetoMascotamascota.vivo;
    },
    
    nivelFelicidad(objetoMascotamascota){
        var aux = false;
        if(objetoMascotamascota.felicidad < 10){
            aux = true;
        }
        return aux;
    },
    
    aumentarFelicidad(objetoMascotamascota){
        objetoMascotamascota.felicidad = objetoMascotamascota.felicidad+1;
        return objetoMascotamascota;
    },
    
    disminuirFelicidad(objetoMascotamascota){
        if(objetoMascotamascota.felicidad > 1 && objetoMascotamascota.felicidad <= 10){
            objetoMascotamascota.felicidad = objetoMascotamascota.felicidad-2;
        }
        return objetoMascotamascota;
    },
    
    alterarFelicidad(objetoMascotamascota){
        let feliz = 1;
        feliz += Math.floor(Math.random()*10);
        objetoMascotamascota.felicidad = feliz;
        return objetoMascotamascota;
    },
    
    nivelHambre(objetoMascotamascota){
        var aux = false;
        if(objetoMascotamascota.hambre < 5){
            aux = true;
        }
        return aux;
    },
    
    aumentarHambre(objetoMascotamascota){
        objetoMascotamascota.hambre = objetoMascotamascota.hambre+1;
        return objetoMascotamascota;
    },
    
    disminuirHambre(objetoMascotamascota){
        if(objetoMascotamascota.hambre > 0 && objetoMascotamascota.hambre <= 5){
            objetoMascotamascota.hambre = objetoMascotamascota.hambre-1;
        }
        return objetoMascotamascota;
    },
    
    getTodayDate(){
        //let timezone = timezone ? timezone : 'Europe/Paris';
        //const today = moment().tz(timezone).startOf('day');
        const currDate = new moment()
        const userDatetime = currDate.tz('America/Mexico_City').format('DD-MM-YYYY HH:mm');
        let dia = userDatetime.substring(3,5);
        return userDatetime;
    },
    
    randomNumber(porcentaje){
        let random = 1;
        let ran = false;
        random = Math.floor(Math.random()*11);
        if(porcentaje === 3){
            if(random === 2 || random === 4 || random === 6 || random === 8 ||random === 10){
                ran = true;
            }   
        } else if(porcentaje === 2){
             if(random === 3 || random === 5 || random === 7){
                ran = true;
            }
        } else {
             if(random === 5){
                ran = true;
            }
        }
        return ran;
    },
    
    mascotaTitle(objetoMascotamascota){
        let toString;
        
        if(objetoMascotamascota.limpio){
            toString = 'Limpia | ';
        } else {
            toString = 'Sucia | ';
        }
        
        if(objetoMascotamascota.enfermedad){
            toString += 'Enferma';
        } else {
            toString += 'Saludable';
        }
        return toString;
    },
    
    mascotaSubTitle(objetoMascotamascota){
      let toString;
      let happy = objetoMascotamascota.felicidad;
      let hungry = objetoMascotamascota.hambre;
      
      toString = 'Felicidad: ' + happy + ' | Hambre: ' + hungry;
      return toString;
      
    },
    
    randomPet(objetoMascotamascota){
        var avatars = ["https://i.ibb.co/R4MBCJj/Dumpling.gif", "https://i.ibb.co/z7jmNqh/Gohan.gif", "https://i.ibb.co/fr9xwLw/Sushi.gif"];
        let descrip = "<s>Actualmente tienes un <sub alias='Taiki-yaki'>Taikiyaki</sub></s><p><s>Los <sub alias='Taiki-yaki'>Taikiyaki</sub> son huevitos de Bentōchi</s>, su forma recuerda a la comida Japonesa Takoyaki,<break time='.4s'/> bolitas redondas hechas a base de harina de trigo y pulpo.</p><p>El nombre <sub alias='Taiki-yaki'>Taikiyaki</sub> viene del nombre 'Taiki', que significa grandes esperanzas.</p>";
        let typee = "Taikiyaki";
        let random = Math.floor(Math.random() * 3);
        
        if(random === 0){
            descrip = "<s>Actualmente tienes un <sub alias='Jao-pling'>Haopling</sub></s><p>Los <sub alias='Jao-plings'>Haoplings</sub> son muy parecidos a la comida china <sub alias='Dom-pling'>'Dumpling'</sub>, pequeños trozos de masa rellenos de verdura y/o carne.<s>Los <sub alias='Jao-plings'>Haoplings</sub> tienen una actitud alegre y misteriosa.</s><s> Su nombre viene de la palabra china <sub alias='Jao'>'Hao'</sub>, que significa bueno.</s></p>"
            typee = "Haopling";
        } else if(random === 1){
            descrip = "<s>Actualmente tienes un <sub alias='Nekojan'>Nekohan.</sub></s><p>Los <sub alias='Nekojan'>Nekohan</sub> son muy parecidos a la comida japonesa <sub alias='Gojan'>Gohan</sub>, arroz blanco cocido, pero con caracteristicas felinas. <s>Los <sub alias='Nekojan'>Nekohan</sub> tienen una actitud tierna y curiosa.</s><s> Su nombre viene de la palabra japonesa 'Neko', que significa gato.</s></p>";
            typee = "Nekohan";
        } else if(random === 2){
            descrip = "<s>Actualmente tienes un <sub alias='Kat-suki'>Katsushi.</sub></s><p>Los <sub alias='Kat-suki'>Katsushi</sub> son muy similares a la comida japonesa Sushi, un platillo a base de arroz, relleno y aderezado con distintos tipos de ingredientes. <s>Los <sub alias='Kat-sukis'>Katsushi.</sub> tienen una actitud tímida pero noble.</s><s> Su nombre viene de la palabra japonesa <sub alias='Kátsumi'>'Katsumi'.</sub>, que significa belleza.</s></p>";            
            typee = "Katsushi";
        }
        
        objetoMascotamascota.avatar = avatars[random];
        objetoMascotamascota.tipo = typee;
        objetoMascotamascota.descripcion = descrip;
        
        return objetoMascotamascota;
    },
    
    randomPhrase(n){
        var phrases = {
            uno: ["¡$TN, ESTÁ VIVA!", "¡Ha nacido $TN! <say-as interpret-as='interjection'>Felicidades</say-as>", "Ya nació $TN, <say-as interpret-as='interjection'>ay ternurita</say-as>"],
            dos: ["Le has dado de comer a $TN, pancita llena corazón contento.", "La comida favorita de $TN, <say-as interpret-as='interjection'>mmh qué rico.</say-as>", "¡YUMMY! ¡A $TN le gustó mucho la comida!"],
            dosA: ["$TN ya está satisfecha", "$TN ya está llena", "$TN no puede dar un bocado más"],
            tres: ["Le has dado un baño a $TN, ahora está limpiecita.", "$TN se dio un regaderazo", "Ahora $TN esta limpicita, como debe ser"],
            tresA: ["Parece que $TN no necesita un baño por ahora.", "$TN está rechinante de limpia, no necesita un baño.", "$TN no necesita un baño ahora, quizá después de jugar."],
            cuatro: ["Curando a $TN, ahora está saludable de nuevo.","La pastilla  mejoró a  $TN.", "El sana sana colita de rana curó a  $TN."],
            cuatroA: ["$TN se encuentra bien de salud, que bueno que te preocupes.", "Por ahora $TN está saludable.","$TN está saludable y fuerte por el momento."],
            cinco: ["Has jugado con $TN, se ve muy feliz ahora.","¡Qué divertido!, Se ve que quieres mucho a $TN, está mas feliz.", "$TN la está pasando muy bien."],
            cincoA: ["Parece que $TN ya está muy feliz, tal vez no necesite jugar ahora.","$TN ya ha jugado mucho, quizá necesite un descanso.","$TN ya se cansó de jugar, quizá pueda comer un poco."],
            seis: ["¡A dormir! *suena la familia Telerín de fondo*", "$TN cayó rendida,¡Hora de dormir!",  "$TN  ya se lavó los dientes"],
            siete: ["<break time='.5s'/><prosody volume='x-loud'><s>¿Qué quieres hacer ahora?</s></prosody>", "<break time='.5s'/><prosody volume='x-loud'><s>¿Qué harás ahora?</s></prosody>", "<break time='.5s'/><prosody volume='x-loud'><s>¿Qué harás a continuación?</s></prosody>"]
        }
        let frase;
        let randomfrase;
        
        if (n === 1) {
            frase = phrases.uno;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 2) {
            frase = phrases.dos;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 22) {
            frase = phrases.dosA;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 3) {
            frase = phrases.tres;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        }  else if (n === 33) {
            frase = phrases.tresA;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 4) {
            frase = phrases.cuatro;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        }  else if (n === 44) {
            frase = phrases.cuatroA;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 5) {
            frase = phrases.cinco;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        }  else if (n === 55) {
            frase = phrases.cincoA;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 6) {
            frase = phrases.seis;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        } else if (n === 7) {
            frase = phrases.siete;
            randomfrase = frase[Math.floor(Math.random() * 3)];
        }
        
        return randomfrase;
    },
    
    putNameOnString(cadena, nombre){
        let str = cadena;
        str = str.replace('$TN', nombre);
        return str;
    },
    
    upperCase(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    identificaPeticion(string){
        let tipo = 0;
        
        if(string === 'tengo que curar a mi mascota'){ tipo = 1; }
        if(string === 'esta saludable'){ tipo = 1; }
        if(string === 'necesita curarcion'){ tipo = 1; }
        if(string === 'estado de salud'){ tipo = 1; }
        if(string === 'mi mascota se siente mal'){ tipo = 1; }
        if(string === 'mi mascota esta enferma'){ tipo = 1; }
        if(string === 'nivel de salud'){ tipo = 1; }
        
        if(string === 'tengo que bañar a mi mascota'){ tipo = 2; }
        if(string === 'mi mascota esta sucia'){ tipo = 2; }
        if(string === 'mi mascota esta limpia'){ tipo = 2; }
        if(string === 'nivel de limpieza'){ tipo = 2; }
        if(string === 'esta bañado'){ tipo = 2; }
        if(string === 'limpieza'){ tipo = 2; }
        if(string === 'esta sucia'){ tipo = 2; }
        if(string === 'esta limpia'){ tipo = 2; }
        if(string === 'necesita un baño'){ tipo = 2; }
        
        if(string === 'nivel felicidad'){ tipo = 3; }
        if(string === 'nivel de felicidad'){ tipo = 3; }
        if(string === 'cuanta felicidad'){ tipo = 3; }
        if(string === 'felicidad'){ tipo = 3; }
        
        if(string === 'nivel hambre'){ tipo = 4; }
        if(string === 'nivel de hambre'){ tipo = 4; }
        if(string === 'cuanta hambre'){ tipo = 4; }
        if(string === 'tiene hambre'){ tipo = 4; }
        if(string === 'hambre'){ tipo = 4; }

        return tipo;
    }
    
}