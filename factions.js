/** @type import(".").NS */
let ns = null;

import { formatNumber, formatMoney } from './helpers/formatters';
import { FACTIONS } from './helpers/factionHelper';
import { priciestFactionAugmentation } from './helpers/augmentationHelper';

// export const autocomplete = data => [
//   ...data.servers,
// ];

const logFaction = (faction, playerFactions) => {
  const rep = ns.getFactionRep(faction);
  const favor = ns.getFactionFavor(faction);
  const favorGain = ns.getFactionFavorGain(faction);
  const invites = ns.checkFactionInvitations(faction);
  const factionAugs = ns.getAugmentationsFromFaction(faction);
  const ownedAugs = ns.getOwnedAugmentations(true);
  const ownedFactionAugs = factionAugs.filter(a => ownedAugs.includes(a));
  // const availableFactionAugs = factionAugs.filter(a => !ownedAugs.includes(a));
  const priciest = priciestFactionAugmentation(ns, faction);

  let marker = '  ';
  if (playerFactions.includes(faction)) {
    marker = 'M ';
  } else if (invites.includes(faction)) {
    marker = 'I ';
  }

  ns.tprintf(
    '%s%-22s %s %s %s %2d/%2d %-35s %s %s',
    marker,
    faction,
    formatNumber(ns, rep),
    formatNumber(ns, favor),
    formatNumber(ns, favorGain),
    ownedFactionAugs.length - 1, // Don't count Neuroflux Govenor
    factionAugs.length - 1, // Don't count Neuroflux Govenor
    priciest.name,
    formatMoney(ns, priciest.price),
    formatNumber(ns, priciest.reputationRequired)
  );
};

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('sleep');
  ns.clearLog();

  const flags = ns.flags([['all', false]]);

  const playerFactions = ns.getPlayer().factions.sort();
  const factions = flags.all ? FACTIONS : playerFactions;

  for (const faction of factions) {
    logFaction(faction, playerFactions);
  }
}
