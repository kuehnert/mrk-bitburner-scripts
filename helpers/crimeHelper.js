/** @type import("..").NS */
let ns = null;

import { formatMoney, formatPercent, formatDuration } from './helpers/formatters';
import { hprint, tablePrint } from './helpers/hprint';

export const crimesFile = '/data/crimes.txt';

export const CRIMES = [
  'shoplift',
  'rob store',
  'mug someone',
  'larceny',
  'deal drugs',
  'bond forgery',
  'traffic illegal arms',
  'homicide',
  'grand theft auto',
  'kidnap and ransom',
  'assassinate',
  'heist',
];

export const CRIME_ARGS = CRIMES.map(s => s.replace(/\s/, '-'));

export const crimeLookup = crimeArg => {
  const lookup = CRIMES.reduce((map, c, i) => {
    map[CRIME_ARGS[i]] = c;
    return map;
  }, {});

  return lookup[crimeArg];
};

export const getCrimes = async _ns => {
  ns = _ns;

  let crimes;
  if (ns.fileExists(crimesFile)) {
    crimes = JSON.parse(ns.read(crimesFile));
  } else {
    const pid = ns.run('fetchCrimes.js', 1);

    if (pid === 0) {
      ns.tprintf('ERROR No crimes.txt file and error running fetchCrimes.js. Exiting.');
      ns.exit();
    } else {
      await ns.sleep(1000);
      crimes = JSON.parse(ns.read(crimesFile));
    }
  }

  return crimes;
};

export const logCrime = (
  _ns,
  {
    name,
    chance,
    stats: {
      money,
      hacking_exp,
      strength_exp,
      defense_exp,
      dexterity_exp,
      agility_exp,
      charisma_exp,
      intelligence_exp,
    },
    profitPerTime,
  }
) => {
  ns = _ns;
  const expSum = strength_exp + defense_exp + dexterity_exp + agility_exp + charisma_exp + intelligence_exp;

  hprint(
    ns,
    '%-20s\t%5.1f%%\t%3d %4d\t%s %s/s',
    name,
    chance * 100,
    hacking_exp,
    expSum,
    formatMoney(ns, money),
    formatMoney(ns, profitPerTime)
  );
};

export const printCrimesTable = (_ns, crimes) => {
  ns = _ns;
  const headers = ['Crime', 'Chance', 'Hacking', 'Combat', 'Profit', 'Profit/s', 'Time'];

  const data = crimes.map(crime => {
    const {
      name,
      chance,
      stats: {
        money,
        hacking_exp,
        strength_exp,
        defense_exp,
        dexterity_exp,
        agility_exp,
        charisma_exp,
        intelligence_exp,
        time,
      },
      profitPerTime,
    } = crime;

    const expSum = strength_exp + defense_exp + dexterity_exp + agility_exp + charisma_exp + intelligence_exp;

    return [
      name,
      formatPercent(ns, chance),
      hacking_exp,
      expSum,
      formatMoney(ns, money),
      formatMoney(ns, profitPerTime),
      formatDuration(ns, time),
    ];
  });

  tablePrint(ns, headers, data);
};
