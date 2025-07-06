import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = path.join(__dirname, "db.json");

function getPreferenceScore(rank) {
  return rank >= 0 ? 3 - rank : 0;
}

const exampleVotesTeams = {
  team1: ["mentor1", "mentor3", "mentor2"],
  team2: ["mentor2", "mentor1", "mentor4"],
  team3: ["mentor3", "mentor4", "mentor1"],
  team4: ["mentor4", "mentor2", "mentor3"]
};

const exampleVotesMentors = {
  mentor1: ["team2", "team1", "team3"],
  mentor2: ["team1", "team3", "team4"],
  mentor3: ["team3", "team4", "team2"],
  mentor4: ["team4", "team2", "team1"]
};

export async function runMatching() {
  const data = JSON.parse(await fs.readFile(db, "utf8"));
  const equipos = data.equipos;
  const mentores = data.mentores;

  const votesTeams = {};
  equipos.forEach(team => {
    if (team.mentores.length === 3) {
      votesTeams[`team${team.id}`] = team.mentores.map(mid => `mentor${mid}`);
    } else {
      votesTeams[`team${team.id}`] = exampleVotesTeams[`team${team.id}`];
    }
  });

  const votesMentors = {};
  mentores.forEach(mentor => {
    if (mentor.equipos.length === 3) {
      votesMentors[`mentor${mentor.id}`] = mentor.equipos.map(tid => `team${tid}`);
    } else {
      votesMentors[`mentor${mentor.id}`] = exampleVotesMentors[`mentor${mentor.id}`];
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
    ties
  };
}

