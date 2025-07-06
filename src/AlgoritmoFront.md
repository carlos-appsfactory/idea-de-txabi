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
