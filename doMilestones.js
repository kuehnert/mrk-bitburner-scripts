/** @type import(".").NS */
let ns = null;
const DEBUG = false;

import { formatMoney } from '/helpers/formatters';
import gymWorkout from '/automations/gymWorkout';
import deleteStaleDataFiles from '/automations/deleteStaleDataFiles';
import installBackdoor from '/automations/installBackdoor';
import purchaseAugmentations from '/automations/purchaseAugmentations';
import purchaseProgram from '/automations/purchaseProgram';
import purchaseTor from '/automations/purchaseTor';
import runScript from '/automations/runScript';
import universityCourse from '/automations/universityCourse';
import milestones, { MILLION } from '/automations/milestones';

const buildCommand = ({ action, params }) => {
  const command = ns.sprintf('%s(ns, %s)', action, JSON.stringify(params));
  if (DEBUG) {
    ns.printf('eval: %s', command);
  }

  return command;
};

const runCommand = async milestone => {
  const command = buildCommand(milestone);
  const success = await eval(command);

  if (success) {
    return true;
  } else {
    ns.printf('Command failed: %s. Exiting.', command);
    ns.exit();
  }
};

export async function main(_ns) {
  ns = _ns;

  if (!DEBUG) {
    ns.disableLog('disableLog');
    ns.disableLog('asleep');
    ns.disableLog('exec');
    ns.disableLog('getHackingLevel');
    ns.disableLog('purchaseProgram');
    ns.disableLog('purchaseTor');
    ns.disableLog('singularity.gymWorkout');
    ns.disableLog('singularity.stopAction');
    ns.disableLog('singularity.travelToCity');
    ns.disableLog('sleep');
  }

  ns.clearLog();
  ns.tail();

  let index = 0;
  while (index < milestones.length) {
    const milestone = milestones[index];
    const { action, params, prereq, doneExpression } = milestone;
    const { hacking, money, factions } = ns.getPlayer();

    ns.printf(
      'INFO Milestone #%2d: %s %s',
      index,
      action,
      JSON.stringify(params)
    );

    // check if milestone is already complete
    if (doneExpression && eval(doneExpression)) {
      index++;
      continue;
    }

    // check prerequisites
    if (prereq) {
      if (prereq.hacking > hacking) {
        ns.printf(
          'WARNING Hacking skill too low (have: %d/req: %d). Aborting.',
          hacking,
          prereq.hacking
        );

        ns.exit();
      }

      if (prereq.money > money) {
        ns.printf(
          'WARNING Too little money (%s / %s). Exiting.',
          formatMoney(ns, prereq.money),
          formatMoney(ns, money)
        );
        ns.exit();
      }

      if (prereq.faction) {
        if (!factions.includes(prereq.faction)) {
          // try to join
          const success = ns.joinFaction(prereq.faction);
          if (!success) {
            ns.printf(
              'WARNING: Unable to join faction %s. Exiting.',
              prereq.faction
            );
            ns.exit();
          }
        }
      }
    }

    await runCommand(milestone);
    await ns.sleep(100);
    index++;
  }
}
