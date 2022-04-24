/** @type import(".").NS */
let ns = null;
let _crimes = null;

const SECOND = 1000;
const MIN_CHANCE_LIMIT = 0.6;

const crimesStr = [
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

let _lookup;

const crimeArgs = crimesStr.map(s => s.replace(/\s/, '-'));
const crimeLookup = arg => {
  _lookup ??= crimesStr.reduce((map, c, i) => {
    map[crimeArgs[i]] = c;
    return map;
  }, {});

  return _lookup[arg];
};

const getCrimes = () => {
  _crimes ??= crimesStr.map(c => ({
    name: c,
    stats: ns.getCrimeStats(c),
    chance: ns.getCrimeChance(c),
  }));

  return _crimes.map(c => ({
    ...c,
    profitPerTime: c.stats.money / c.stats.time,
  }));
};

const findBestCrimes = () => {
  const crimes = getCrimes();
  const filtered = crimes.filter(c => c.chance >= MIN_CHANCE_LIMIT);
  const best = filtered.length > 0 ? filtered : crimes.sort(c => c.chance).slice(0, 1);

  return best.sort((a, b) => b.profitPerTime - a.profitPerTime).slice(0, 4);
};

const findBestCrime = () => {
  return findBestCrimes()[0];
};

export const autocomplete = () => [...crimeArgs, 'noop'];

const commitCrime = async name => {
  const time = ns.commitCrime(name);
  await ns.asleep(time * 0.8); // sleep 80% of the projected time

  if (!ns.isBusy()) {
    // user must have cancelled crime – halt script!
    ns.print('Oh, you seem to have lost interest. Aborting auto-crime.');
    ns.exit();
  }

  while (ns.isBusy()) {
    await ns.asleep(SECOND);
  }
};

const commitOneCrime = async name => {
  // Stop ongoing action so commitCrime output is less cluttered
  ns.stopAction();
  while (true) {
    await commitCrime(name);
  }
};

const commitBestCrimes = async () => {
  // Stop ongoing action so commitCrime output is less cluttered
  ns.stopAction();

  let crimeIndex = 0;
  while (true) {
    const bestCrimes = findBestCrimes();
    await commitOneCrime(bestCrimes[crimeIndex].name);
    crimeIndex = (crimeIndex + 1) % bestCrimes.length;
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exit');
  ns.disableLog('singularity.stopAction');
  let currentCrimes;

  if (!ns.args[0]) {
    ns.clearLog();
    ns.tail();
    await commitBestCrimes();
  } else if (ns.args[0] === 'noop') {
    ns.tprintf('Best crimes: %s. Exiting.', JSON.stringify(findBestCrimes(), null, 4));
    ns.exit();
  } else if (crimeArgs.includes(ns.args[0])) {
    const crime = crimeLookup(ns.args[0]);
    await commitOneCrime(crime);
  } else {
    ns.tprintf("ERROR Invalid crime '%s'. Valid crimes are: %s. Exiting", ns.args[0], crimeArgs.join(', '));
    ns.exit();
  }
}
