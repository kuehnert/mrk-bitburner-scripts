/** @type import(".").NS */
let ns = null;

import { crimesFile, CRIMES } from '/helpers/crimeHelper';

export const main = async _ns => {
  ns = _ns;

  let crimes = CRIMES.map(c => ({
    name: c,
    stats: ns.getCrimeStats(c),
    chance: ns.getCrimeChance(c),
  }));

  crimes = crimes.map(c => ({
    ...c,
    profitPerTime: c.stats.money / c.stats.time,
  }));

  await ns.write(crimesFile, JSON.stringify(crimes), 'w');

  return crimes;
};

export default main;
