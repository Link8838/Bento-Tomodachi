# Bento Tomodachi

_Bento Tomodachi es una Skill que implementa la simulación de una mascota virtual al estilo Tamagotchi con el único objetivo de entretener al usuario haciéndose cargo de una mascota virtual, la skill hace uso de la nostalgia de los Tamagotchis originales y brinda la posibilidad a nuevos usuarios de experimentar el cuidado virtual. El nombre proviene del japonés donde “Bentō” (弁当) es una pequeña porción de comida preparada para llevar y “tomodachi” (友達) significa textualmente “amigo”._

## ¿Por qué un Tamagotchi en una App de Voz? 

_La implementación de una mascota virtual en una app de voz, es una forma más moderna de experimentar el cuidado virtual lo cual podría llamar la atención de los usuarios para probar este tipo de interacción._


## 📋 ¿Qué puede hacer la Skill? 📋

_Al igual que los Tamagotchis originales, la skill brinda al usuario la posibilidad de brindar cuidados a su mascota virtual con la diferencia de que ahora es por medio de acciones de voz. Las posibles acciones dentro de la app de voz son las siguientes:_

* Alimentar:
        _Con esta acción podrás darle de comer a tu mascota virtual, siempre y cuando ésta tenga hambre, el hambre se mide en niveles del `0-5` donde `5` es el máximo y significa que tu mascota está satisfecha._
```
Alimentar
Dar de comer
Dar de comer a {nombre}
```
       
* Jugar:
        _Podrás hacer que tu mascota juegue un poco, quizá con una pelota o en un parque, eso está a tu imaginación, jugar con tu mascota aumentará su nivel de felicidad, que se mide en una escala del `0-10` ¡mientras más mejor!._
```
Jugar
Hora de divertirse
Jugar con {name}
```
* Bañar:
        _Siempre es importante revizar si tu mascota necesita un baño, por lo que tu mascota podría necesitar un baño si juega o come mucho._
```
Bañar
Hora del baño
Dar baño a {nombre}
```
* Curar:
        _La salud es un tema serio, así que si tu mascota se llega a enfermar después de tomar un baño o por comer mucho será necesario curarla, de lo contrario, bueno... mejor no hablemos de eso._
```
Curar
Dar medicina
Dar medicina a {nombre}
```

* Dormir:
        _Descansar es muy necesario para estar saludable, así que una buena siesta no le va mal a nadie, menos a tu mascota, pero quizá se moleste si la despiertas pronto, y tenga hambre después de dormir._
```
A dormir
Hora de dormir
Mandar a dormir a {name}
```
_Estos son solo algunos ejemplos sobre como activar las actividades principales, aunque hay muchas mas formas de hacerlo. Además hay otro tipo de acciones que se pueden realizar._

### Algunas acciones adicionales son:

* Estado:
        _Siempre que quieras conocer el esatdo de tu mascota virtual podrás preguntar como está para conocer todas sus estadísticas._
```
Dime el estado
Nivel de felicidad
Como esta {nombre}
```
* Tipo:
        _Las mascotas virtuales pueden llegar a ser muy interesantes, mas aún si quieres conocer un poco mas sobre la tuya, quizá sea buena idea preguntar..._
```
Como es mi mascota
Especie de mi mascota
Como es mi mascota virtual
```

## Sobre las mascotas virtuales 

_Las mascotas virtuales implementadas aquí responden al nombre de "Bentochis" y están inspirados en la gastronomía asiática, aunque no todos los dispositivos Alexa soportan contenido visual la Skill evalúa si es posible mostrarlo para desplegar en pantalla tiernos avatares, ademas de otros sprites._

![Image of Yaktocat](https://i.ibb.co/xfyhFqr/Characters-800.png)

## ⚙️ Sobre la programación ⚙️

_El modelo de interacción de la Skill se puede encontrar en **interactionModels**, mientras que el código fuente está contenido en **lambda**, por último en la carpeta **APL** contenida en **lambda** se pueden visualizar los documentos del Alexa Presentation Languaje necesarios para mostrar imágenes y reproducir audios._

## 📌 Versión 📌

Este proyecto está en la verisón 1.0 publicada en la tienda de Skills de Alexa. 
### La skill puede ser obtenida a través de:
`https://skills-store.amazon.com.mx/deeplink/dp/B08VR9SC4X?deviceType=app&share&refSuffix=ss_copy`

## ✒️ Autores ✒️

_Este proyecto fue realizado para el Seminario A: **Diseño de Interfaces de Usuario Basadas en Voz** dirigido por:_

* **Estefanía Prieto Larios**
* **Gustavo De La Cruz Martínez**
* **Rodrígo Eduardo Colín Rivera**

_Y elaborado por:_

* **Hernández Ferreiro Enrique Ehecatl**
* **López Soto Ramsés Antonio**




---
El equipo de desarrollo.
