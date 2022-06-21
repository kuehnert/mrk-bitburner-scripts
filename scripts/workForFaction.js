/** @type import(".").NS */
let ns = null;

import { formatDuration, formatNumber, amountFromString } from '/helpers/formatters';
import { findFaction, FACTION_INPUT_NAMES } from '/helpers/factionHelper';
import { SECOND } from 'helpers/globals';

const interval = 30; // 30-second sleeps

const WORK_TYPES = ['hacking contracts', 'security work', 'field work'];

const maxRep = (a, b) => (a > ns.getAugmentationRepReq(b) ? a : b);

const getPurchasableAugmentations = faction => {
  const myAugs = ns.getOwnedAugmentations(true);
  const factionAugs = ns.getAugmentationsFromFaction(faction);
  const purchasableAugs = factionAugs.filter(a => !myAugs.includes(a));

  return purchasableAugs;
};

const getMaxRepReq = augs => augs.map(a => ns.getAugmentationRepReq(a)).reduce((d, a) => Math.max(d, a), 0);

export const autocomplete = () => [...FACTION_INPUT_NAMES, '--focus', '--target'];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('singularity.workForFaction');
  ns.disableLog('sleep');
  ns.tail();

  const faction = findFaction(ns.args[0]);
  const flags = ns.flags([
    ['focus', false],
    ['target', null],
  ]);

  if (!faction) {
    ns.tprintf(
      "ERROR Invalid faction name: '%s'. Valid names are: %s. Exiting.",
      ns.args[0],
      FACTION_INPUT_NAMES.join(', ')
    );
    ns.exit();
  }

  if (ns.getFactionRep(faction) < 1) {
    ns.tprintf('ERROR You are not a member of faction %s. Exiting.'.faction);
    ns.exit();
  }

  const augs = getPurchasableAugmentations(faction);
  let factionRep = ns.getFactionRep(faction);
  let maxRepReq = getMaxRepReq(augs);

  if (flags.target) {
    maxRepReq = amountFromString(flags.target);
  }

  let bestType = null;
  for (let i = 0; i < WORK_TYPES.length; i++) {
    const success = ns.workForFaction(faction, WORK_TYPES[i], true);
    if (success) {
      bestType = WORK_TYPES[i];
      break;
    } else {
      ns.tprintf("No work type '%s'", WORK_TYPES[i]);
    }
  }

  if (!bestType) {
    ns.tprintf('ERROR No suitable work type for faction %s. Exiting.', faction);
    ns.exit();
  }

  const msg = ns.sprintf(
    'INFO Doing %s for faction %s, increasing reputation from %s to %s...',
    bestType,
    faction,
    formatNumber(ns, factionRep),
    formatNumber(ns, maxRepReq)
  );
  ns.print(msg);
  ns.tprint(msg);

  while (factionRep < maxRepReq) {
    const previous = factionRep;
    ns.workForFaction(faction, bestType, flags.focus);
    await ns.sleep(interval * SECOND);

    factionRep = ns.getFactionRep(faction);
    const toGo = maxRepReq - factionRep;
    const gainRate = (factionRep - previous) / interval;

    const duration = (toGo / gainRate) * 1000;
    const durationStr = formatDuration(ns, duration);

    ns.printf(
      '%s: %s reputation to go (%.1f/s). ETA: %s...',
      faction,
      formatNumber(ns, toGo),
      // formatNumber(ns, maxRepReq),
      gainRate,
      durationStr
    );
  }
}

export default main;
