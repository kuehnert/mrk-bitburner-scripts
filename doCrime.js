/** @type import(".").NS */
let ns = null;

import { SECOND } from '/helpers/globals';
import { getCrimes, logCrime } from '/helpers/crimeHelper';
import { crimeLookup, printCrimesTable, CRIME_ARGS } from './helpers/crimeHelper';
import hprint from 'helpers/hprint';

// will consider crimes with 60% chance or better
const MIN_CHANCE_LIMIT = 0.5;

const findBestCrimes = async (all = false) => {
  const crimes = await getCrimes(ns);
  const filtered = all ? crimes : crimes.filter(c => c.chance >= MIN_CHANCE_LIMIT);
  let best = filtered.length > 0 ? filtered : crimes.sort(c => c.chance).slice(0, 1);

  return best.sort((a, b) => b.profitPerTime - a.profitPerTime);
};

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

const commitBestCrimes = async myCrimes => {
  // Stop ongoing action so commitCrime output is less cluttered
  // ns.stopAction();
  let bestCrimes = myCrimes;
  if (!myCrimes) {
    const cs = await findBestCrimes();
    bestCrimes = cs.map(c => c.name);
  }

  const maxCrimes = Math.min(2, bestCrimes.length);
  let crimeIndex = 0;

  while (true) {
    await commitCrime(bestCrimes[crimeIndex]);
    crimeIndex = (crimeIndex + 1) % maxCrimes;
  }
};

const listCrimes = async () => {
  hprint(ns, 'I~Best crimes:~');

  const crimes = await findBestCrimes(true);
  printCrimesTable(ns, crimes);
};

export const autocomplete = () => ['list', '--all', '--tail', ...CRIME_ARGS];

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('disableLog');
  // ns.disableLog('asleep');
  // ns.disableLog('exit');
  // ns.disableLog('singularity.stopAction');
  // ns.clearLog();
  // ns.tail();

  // const flags = ns.flags([['all', false]]);
  await listCrimes();

  if (!ns.args[0]) {
    await commitBestCrimes();
  } else if (ns.args[0] === 'list') {
    ns.exit();
  } else if (CRIME_ARGS.includes(ns.args[0])) {
    const crime = crimeLookup(ns.args[0]);
    await commitBestCrimes([crime]);
  } else {
    hprint(ns, 'E~ERROR Invalid crime~ W~%s~. Valid crimes are: S~%s~. Exiting.', ns.args[0], CRIME_ARGS.join(', '));
    ns.exit();
  }
}
