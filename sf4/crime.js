/** @type import("..").NS */
let ns = null;

const SECOND = 1000;

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

const getCrimes = () => {
  return crimesStr.map(c => ({
    name: c,
    stats: ns.getCrimeStats(c),
    chance: ns.getCrimeChance(c),
  }));
};

const sortCrimes = crimes => {
  return (
    crimes
      .map(c => ({ ...c, profitPerTime: c.stats.money / c.stats.time }))
      .filter(c => c.chance >= 0.4)
      // .sort((a, b) => b.chance - a.chance)
      // .slice(0, 4)
      .sort((a, b) => b.profitPerTime - a.profitPerTime)
      .slice(0, 4)
  );
};

const findBestCrime = () => {
  const crimes = getCrimes();
  return sortCrimes(crimes)[0] ?? crimes.find(c => c.name === 'mug someone');
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('asleep');
  ns.disableLog('exit');
  ns.disableLog('stopAction');
  ns.clearLog();
  ns.tail();

  if (ns.args[0] === 'noop') {
    ns.printf('best crime: %s', JSON.stringify(findBestCrime(), null, 4));
    ns.print('Exiting');
    ns.exit();
  }

  // Stop ongoing action so commitCrime output is less cluttered
  ns.stopAction();

  while (true) {
    const time = ns.commitCrime(findBestCrime().name);
    await ns.asleep(time * 0.8); // sleep 80% of the projected time

    if (!ns.isBusy()) {
      // user must have cancelled crime – halt script!
      ns.print('Oh, you seem to have lost intereset. Aborting auto-crime.');
      ns.exit();
    }

    while (ns.isBusy()) {
      await ns.asleep(SECOND);
    }
  }
}
