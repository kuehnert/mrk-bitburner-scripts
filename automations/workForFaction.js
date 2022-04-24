/** @type import("..").NS */
let ns = null;

import { formatDuration, formatNumber, SECOND } from '/helpers/formatters';
import { findFaction, FACTION_INPUT_NAMES } from '/helpers/factionHelper';

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

export const autocomplete = () => [...FACTION_INPUT_NAMES, '--focus'];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('singularity.workForFaction');
  ns.disableLog('sleep');
  ns.tail();

  const faction = findFaction(ns.args[0]);
  const flags = ns.flags([['focus', false]]);

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
  const maxRepReq = getMaxRepReq(augs);
  let factionRep = ns.getFactionRep(faction);

  ns.printf(
    'Working for faction %s, increasing reputation from %s to %s...',
    faction,
    formatNumber(ns, factionRep),
    formatNumber(ns, maxRepReq)
  );

  while (factionRep < maxRepReq) {
    const previous = factionRep;
    ns.workForFaction(faction, WORK_TYPES[0], flags.focus);
    await ns.sleep(interval * SECOND);

    factionRep = ns.getFactionRep(faction);
    const toGo = maxRepReq - factionRep;
    const gainRate = (factionRep - previous) / interval;

    const duration = (toGo / gainRate) * 1000;
    const durationStr = formatDuration(ns, duration);

    ns.printf(
      'Fackion %s: %s reputation points to go (%.1f/s). ETA: %s...',
      faction,
      formatNumber(ns, toGo),
      // formatNumber(ns, maxRepReq),
      gainRate,
      durationStr
    );
  }
}

export default main;
