
(function () {
  "use strict";

  const BASE_POINTS = {
    short: 500,
    medium: 1150,
    long: 1750
  };

  function calculate(mode, rounds) {
    const base = BASE_POINTS[mode];

    if (!base || !Array.isArray(rounds) || rounds.length === 0) {
      throw new Error("Invalid quiz mode or rounds");
    }

    let weightedScore = 0;

    for (const round of rounds) {
      const attempt = round.attempt;
      const multiplier = round.multiplier;

      if (
        attempt !== null &&
        (!Number.isInteger(attempt) || attempt < 1 || attempt > 5)
      ) {
        throw new Error("Invalid attempt");
      }

      if (
        !Number.isFinite(multiplier) ||
        multiplier < 1 ||
        multiplier > 1.15
      ) {
        throw new Error("Invalid league multiplier");
      }

      const performance = attempt === null ? 0 : 6 - attempt;
      weightedScore += performance * multiplier;
    }

    return Math.round(
      base * weightedScore / (5 * rounds.length)
    );
  }

  
const LEAGUE_MULTIPLIERS = Object.freeze({
  "england-premier-league": 1.00,
  "spain-la-liga": 1.00,
  "italy-serie-a": 1.00,
  "germany-bundesliga": 1.00,
  "france-ligue-1": 1.00,
  "turkey-super-lig": 1.00,

  "portugal-liga-portugal": 1.05,
  "netherlands-eredivisie": 1.05,
  "belgian-pro-league": 1.05,

  "brazil-serie-a": 1.08,
  "scotland-premiership": 1.10,
  "greece-super-league": 1.15
});

function calculateSession(session) {
  if (
    !session?.completed ||
    !Array.isArray(session.order) ||
    !Array.isArray(session.results) ||
    session.order.length !== session.results.length
  ) {
    throw new Error("Quiz session is not complete");
  }

  const rounds = session.results.map((result, index) => {
    const club = session.order[index];

    if (result.id !== club.id) {
      throw new Error("Club and result do not match");
    }

    const multiplier = LEAGUE_MULTIPLIERS[club.league_id];

    if (multiplier === undefined) {
      throw new Error("Unknown league: " + club.league_id);
    }

    return {
      attempt: result.won ? result.attempts : null,
      multiplier
    };
  });

  return calculate(session.leaderboardMode, rounds);
}

window.BKPoints = Object.freeze({
  calculate,
  calculateSession
});

})();
