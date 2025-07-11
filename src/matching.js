import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = path.join(__dirname, "db.json");

function getPreferenceScore(rank) {
  return rank >= 0 ? 4 - rank : 0;  // ordinal 1 → 4 puntos, ordinal 4 → 1 punto
}

export async function runMatching() {
  const data = JSON.parse(await fs.readFile(db, "utf8"));
  const equipos = data.equipos;
  const mentores = data.mentores;

  // Construcción de votos en bruto
  const votesTeams = {};
  const votesMentors = {};
  const teamsThatVoted = [];
  const mentorsThatVoted = [];

  equipos.forEach(team => {
    const teamId = `team${team.id}`;
    if (Array.isArray(team.mentores) && team.mentores.length === 4) {
      votesTeams[teamId] = team.mentores.map(id => `mentor${id}`);
      teamsThatVoted.push(teamId);
    }
  });

  mentores.forEach(mentor => {
    const mentorId = `mentor${mentor.id}`;
    if (Array.isArray(mentor.equipos) && mentor.equipos.length === 4) {
      votesMentors[mentorId] = mentor.equipos.map(id => `team${id}`);
      mentorsThatVoted.push(mentorId);
    }
  });

  const votingMatrix = [];

  mentores.forEach(mentor => {
    const mentorId = `mentor${mentor.id}`;
    const mentorVotes = votesMentors[mentorId] || [];
    const row = [];

    equipos.forEach(team => {
      const teamId = `team${team.id}`;
      const teamVotes = votesTeams[teamId] || [];

      const emitted = getPreferenceScore(mentorVotes.indexOf(teamId));
      const received = getPreferenceScore(teamVotes.indexOf(mentorId));
      const total = emitted + received;

      const techMatch = team.technologies.filter(t => mentor.technologies.includes(t)).length * 0.2;
      const skillsMatch = team.skills.filter(s => mentor.skills.includes(s)).length * 0.2;
      const topicMatch = mentor.topics_experience.includes(team.topics_experience?.[0]) ? 0.5 : 0;
      const adequacyScore = parseFloat((techMatch + skillsMatch + topicMatch).toFixed(2));

      row.push({
        mentorId,
        teamId,
        voteEmitted: emitted,
        voteReceived: received,
        totalScore: total,
        adequacyScore
      });
    });

    votingMatrix.push(row);
  });

  // Matching greedy con desempate por adecuacyScore
  const assignments = {};
  const assignedMentors = new Set();
  const assignedTeams = new Set();

  const flat = votingMatrix.flat().sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.adequacyScore - a.adequacyScore;
  });

  for (const pair of flat) {
    if (!assignedMentors.has(pair.mentorId) && !assignedTeams.has(pair.teamId)) {
      assignments[pair.teamId] = pair.mentorId;
      assignedMentors.add(pair.mentorId);
      assignedTeams.add(pair.teamId);
    }
  }

  // Análisis de empates
  const ties = {
    totalScoreTies: [],
    mentorVotesReceivedTies: [],
    teamVotesReceivedTies: []
  };

  mentores.forEach(mentor => {
    const mentorId = `mentor${mentor.id}`;
    const row = votingMatrix[mentor.id - 1];
    const scores = row.map(x => x.totalScore);
    const max = Math.max(...scores);
    const tied = row.filter(x => x.totalScore === max);
    const teams = tied.map(x => x.teamId);
    if (teams.length > 1) {
      const adequacyValues = tied.map(x => x.adequacyScore);
      const firstAdequacy = adequacyValues[0];
      const adequacyTie = adequacyValues.every(a => a === firstAdequacy);
      ties.totalScoreTies.push({
        mentorId,
        score: max,
        teams,
        adequacyTie,
        irresolubleTie: adequacyTie
      });
    }
  });

  // Ties por votos recibidos desde mentores
  mentores.forEach(mentor => {
    const mentorId = `mentor${mentor.id}`;
    const votes = votingMatrix[mentor.id - 1].map(x => x.voteReceived);
    const max = Math.max(...votes);
    const teams = votingMatrix[mentor.id - 1]
      .filter(x => x.voteReceived === max)
      .map(x => x.teamId);
    if (teams.length > 1) {
      ties.mentorVotesReceivedTies.push({
        mentorId,
        votesReceived: max,
        teams
      });
    }
  });

  // Ties por votos recibidos desde equipos
  equipos.forEach(team => {
    const teamId = `team${team.id}`;
    const votes = votingMatrix.map(row =>
      row.find(x => x.teamId === teamId).voteReceived
    );
    const max = Math.max(...votes);
    const mentors = votingMatrix
      .map(row => row.find(x => x.teamId === teamId))
      .filter(x => x.voteReceived === max)
      .map(x => x.mentorId);
    if (mentors.length > 1) {
      ties.teamVotesReceivedTies.push({
        teamId,
        votesReceived: max,
        mentors
      });
    }
  });

  return {
    votingMatrix,
    matchings: {
      matching1: assignments,
      matching2: null
    },
    ties,
    rawVotes: {
      votesTeams,
      votesMentors
    },
    voteStatus: {
      teamsThatVoted,
      mentorsThatVoted,
      teamsThatDidNotVote: equipos.map(e => `team${e.id}`).filter(id => !teamsThatVoted.includes(id)),
      mentorsThatDidNotVote: mentores.map(m => `mentor${m.id}`).filter(id => !mentorsThatVoted.includes(id))
    }
  };
}
