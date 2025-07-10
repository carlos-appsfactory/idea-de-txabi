## 📦 Algoritmo de Matching (Backend)

### Funcionamiento general

- El script lee el fichero `db.json` con los datos de equipos y mentores
- Obtiene los votos de preferencia de:
  - equipos (3 mentores ordenados)
  - mentores (3 equipos ordenados)
- Si no existen votos, se inyectan unos votos de ejemplo para simular el resultado
- Construye una matriz 4x4 (`votingMatrix`) con:
  - `voteEmitted`: puntos que el mentor da al equipo
  - `voteReceived`: puntos que el equipo da al mentor
  - `totalScore`: suma de ambos
  - `adequacyScore`: bonus basado en tecnologías, skills y temática coincidente
- Genera un `matching1` usando un algoritmo greedy:
  - ordena mentor–equipo por `totalScore`
  - si hay empate, ordena por `adequacyScore`
  - evita asignar dos veces el mismo mentor o equipo
- Detecta empates:
  - `totalScoreTies`: equipos con el mismo totalScore para un mentor
  - `mentorVotesReceivedTies`: varios equipos priorizando al mismo mentor
  - `teamVotesReceivedTies`: varios mentores priorizando al mismo equipo
  - En caso de empate total + empate de adequacy, marca:
    - `adequacyTie: true`
    - `irresolubleTie: true`
- Devuelve un JSON con:
  - `votingMatrix` para auditoría completa
  - `matchings.matching1` como propuesta automática
  - `ties` con los empates detectados para revisión manual
