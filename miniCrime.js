/** @type import(".").NS */
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

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('asleep');
  ns.disableLog('exit');
  ns.disableLog('stopAction');

  const crimeName = ns.args[0] || 'mug someone'

  while (true) {
    const time = ns.commitCrime(crimeName);
    await ns.asleep(time * 0.8); // sleep 80% of the projected time

    if (!ns.isBusy()) {
      // user must have cancelled crime – halt script!
      ns.print('Oh, you seem to have lost interest. Aborting auto-crime.');
      ns.exit();
    }

    while (ns.isBusy()) {
      await ns.asleep(SECOND);
    }
  }
}
