/** @type import("..").NS */
let ns = null;

const MIN_LEVEL = 50;
const SECOND = 1000;

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('sleep');
  ns.clearLog();

  if (ns.getHackingLevel() >= MIN_LEVEL) {
    ns.printf(
      'Hacking level (%d) already >= %d, exiting.',
      ns.getHackingLevel(),
      MIN_LEVEL
    );

    ns.exit();
  }

  const success = ns.universityCourse(
    'rothman university',
    'study computer science',
    true
  );
  ns.printf('studying cs');

  if (success) {
    while (ns.getHackingLevel() < MIN_LEVEL) {
      await ns.sleep(10 * SECOND);
    }

    ns.stopAction();
  }
}
