# La Idea de Txabi

Una fantastica idea que ha tenido el tutor de Apps Factory Txabi Anastasio. Una idea revolucionaria que arreglará la democracia

## Diseño Figma

- link: https://www.figma.com/design/We3W3DFmcExSEc0Z5p9Zzz/App--Vote-your-Group-Mentor?node-id=59-3415&t=zzOlVt5CBeZXkgzY-1

## DB

Los **equipos** representan a los grupos que van a desarrollar cada app. Para cada equipo guardamos los siguientes datos:

- **id**
- **Nombre**
- **Descripción**
- **Mentores elegidos**

Los **mentores** representan a las personas que asistirán en el desarrollo de la app. Para cada mentor guardamos los siguientes datos:

- **id**
- **Nombre**
- **Foto**
- **Equipos elegidos**

## Endpoints

**GET - /api/equipos**
Obtiene la información de todos los equipos. Ejemplo:

```json
{
  [
    {
      "id": 1,
      "nombre": "Vetrams + Sugar Paws",
      "descripcion": "Animales y veterinarios"
    },
    {
      "id": 2,
      "nombre": "Stylo + Evora",
      "descripcion": "Ropa y moda"
    },
    {
      "id": 3,
      "nombre": "Scapian + Suburbis",
      "descripcion": "Escape room y barrios de barcelona"
    },
    {
      "id": 4,
      "nombre": "Packo + Unara",
      "descripcion": "Viajes con tu mejor amigo Packo"
    }
  ]
}
```

**POST - /api/equipos/\<id\>**
Envía un array con los IDs de los mentores favoritos del equipo, ordenados. Ejemplo:

```json
{
  [3, 1, 4]
}
```

**GET - /api/mentores**
Obtiene la información de todos los mentores. Ejemplo:

```json
{
  [
    {
      "id": 1,
      "nombre": "Eric Salat",
      "empresa": "Freelance",
      "foto": "/img/eric_salat.jpg",
      "equipos": []
    },
    {
      "id": 2,
      "nombre": "Tian",
      "empresa": "Scopely",
      "foto": "/img/tian.jpg",
      "equipos": []
    },
    {
      "id": 3,
      "nombre": "Fátima",
      "empresa": "INQBarna",
      "foto": "/img/fatima.jpg",
      "equipos": []
    },
    {
      "id": 4,
      "nombre": "Toni y Joan",
      "empresa": "Margot",
      "foto": "/img/toni_joan.jpg",
      "equipos": []
    }
  ]
}
```

**POST - /api/mentores/\<id\>**
Envía un array con los IDs de los equipos favoritos del mentor, ordenados. Ejemplo:

```json
{
  [1, 3, 2]
}
```
