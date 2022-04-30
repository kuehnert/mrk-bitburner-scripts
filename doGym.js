/** @type import(".").NS */
let ns = null;

import gymWorkout from '/milestones/gymWorkout';

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('singularity.gymWorkout');
  ns.disableLog('sleep');

  const flags = ns.flags([
    ['skill', 'ALL'],
    ['level', 10],
    ['speed', true],
  ]);

  await gymWorkout(ns, flags);
}
