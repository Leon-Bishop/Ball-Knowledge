
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

  window.BKPoints = Object.freeze({ calculate });
})();
