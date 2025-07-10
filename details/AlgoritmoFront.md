## 🎨 Renderizado del Matching (Frontend)

### ¿Qué se recibe?

- `votingMatrix`: toda la matriz de puntuaciones
- `matchings.matching1`: el emparejamiento propuesto
- `ties`: lista de empates y conflictos

### ¿Cómo mostrarlo?

- Renderizar tarjetas de mentor–equipo según `matching1`
- En cada tarjeta:
  - Mostrar mentor y equipo emparejados
  - Al hacer click:
    - mostrar detalles: `voteEmitted`, `voteReceived`, `totalScore`, `adequacyScore`
- Si existe `ties.totalScoreTies` para ese mentor:
  - en la misma tarjeta, listar las **otras opciones** con el mismo totalScore
  - ordenarlas por adequacyScore (mayor primero)
  - si `irresolubleTie: true`, avisar claramente de que la decisión final es manual
- Con `mentorVotesReceivedTies` o `teamVotesReceivedTies`:
  - mostrar alertas de potenciales conflictos de asignación

### ¿Qué aportará el jurado?

- Revisar la propuesta automática
- Revisar alternativas en caso de empate
- Tomar la decisión final con toda la información visible

NNUEVA VERSION

---

## ✅ 1. ENTRADA: Cambios en cómo el frontend guarda los votos

### Antes:

* Los equipos y mentores votaban a **3 opciones** (ordenadas), por ejemplo:

```json
"mentores": [2, 1, 3]  // 3 votos para equipo
"equipos": [1, 4, 3]   // 3 votos para mentor
```

### Ahora:

* **Obligatoriamente 4 votos**, uno para cada opción posible, en orden de preferencia.
* Esto implica que el frontend debe asegurarse de que:

  * No se repiten opciones
  * Se seleccionan exactamente 4
  * Se guarda un array ordenado con los **IDs** (no strings) de los 4 seleccionados

```json
"mentores": [3, 1, 4, 2]  // 4 votos (mentor preferido = id 3)
"equipos": [2, 4, 1, 3]   // 4 votos (equipo preferido = id 2)
```

📌 **Frontend debe validar**: que haya exactamente 4 votos únicos, y enviar los IDs como enteros.

---

## ✅ 2. SALIDA: Cambios en los datos que devuelve `runMatching()`

### 🔁 Se mantienen igual:

* `votingMatrix`: array de objetos con puntuaciones por par mentor-equipo.
* `matchings.matching1`: resultado del algoritmo greedy de asignación.
* `ties`: sigue con la misma estructura.

---

### 🆕 Nuevas estructuras que ahora puedes mostrar en el frontend

#### 📌 `rawVotes`

```js
{
  votesTeams: {
    team1: ["mentor3", "mentor1", "mentor4", "mentor2"],
    ...
  },
  votesMentors: {
    mentor1: ["team2", "team3", "team1", "team4"],
    ...
  }
}
```

✅ Útil para mostrar:

* Qué ha votado cada equipo y cada mentor, en orden de preferencia.
* Transparencia para jueces o visualización educativa.

---

#### 📌 `voteStatus`

```js
{
  teamsThatVoted: ["team1", "team2"],
  mentorsThatVoted: ["mentor1", "mentor3", "mentor4"],
  teamsThatDidNotVote: ["team3", "team4"],
  mentorsThatDidNotVote: ["mentor2"]
}
```

✅ Útil para:

* Mostrar una tabla de control de participación
* Bloquear o avisar si alguien no ha votado aún
* Condicionar el botón de "Ejecutar matching" solo si todos han votado

---

## 🛠 Cambios prácticos en componentes React (o similares)

| Componente / Vista        | Cambios necesarios                                                      |
| ------------------------- | ----------------------------------------------------------------------- |
| Formulario de votación    | Validar 4 votos únicos; evitar arrays de menos de 4                     |
| Backend POST/PUT de votos | Guardar arrays ordenados de IDs (`[3,1,2,4]`)                           |
| Página de resultados      | Mostrar rawVotes si es necesario (`votesTeams`, `votesMentors`)         |
| Vista de participación    | Mostrar estado con `voteStatus` (quién ha votado / quién no)            |
| Botón de matching         | Deshabilitar si falta alguien por votar (según `voteStatus`)            |
| Vista de empates          | Sin cambios, salvo mostrar valores `4-1` en lugar de `3-1` si necesario |

---

## ✅ Resumen final

| Elemento    | Antes                 | Ahora                    | ¿Cambio necesario?  |
| ----------- | --------------------- | ------------------------ | ------------------- |
| Nº de votos | 3                     | **4**                    | ✅ Sí                |
| Formato     | Array ordenada de IDs | Igual                    | ⚠️ Validar 4        |
| Score       | 3-2-1                 | **4-3-2-1**              | ⚠️ Cambia la escala |
| Datos extra | No había              | `rawVotes`, `voteStatus` | ✅ Opcional          |

---

¿Quieres que te ayude a actualizar la parte del frontend que envía los votos, o a renderizar los `rawVotes` o `voteStatus` en una tabla visual?

