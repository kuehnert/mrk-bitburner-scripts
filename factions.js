/** @type import(".").NS */
let ns = null;

import { formatNumber, formatMoney } from './helpers/formatters';
import { FACTIONS, getFactionsDetailed } from './helpers/factionHelper';

const logFaction = (faction, playerFactions, invites) => {
  const { name, favor, favorGain, priciest, rep, factionAugs, ownedFactionAugs } = faction;

  let marker = '  ';
  if (playerFactions.includes(faction)) {
    marker = 'M ';
  } else if (invites.includes(faction)) {
    marker = 'I ';
  }

  ns.tprintf(
    '%s%-27s %s %s %2d/%2d %-40s\t%s\t%s/%s',
    marker,
    name,
    formatNumber(ns, favor),
    formatNumber(ns, favorGain),
    ownedFactionAugs.length - 1, // Don't count Neuroflux Govenor
    factionAugs.length - 1, // Don't count Neuroflux Govenor
    priciest ? priciest.name : '-',
    priciest ? formatMoney(ns, priciest.price) : '       - ',
    formatNumber(ns, rep),
    priciest ? formatNumber(ns, priciest.reputationRequired) : '       - '
  );
};

export const autocomplete = data => ['--all'];

export async function main(_ns) {
  ns = _ns;
  const flags = ns.flags([['all', false]]);

  const playerFactions = ns.getPlayer().factions.sort();
  const factionNames = flags.all ? FACTIONS : playerFactions;
  const factions = getFactionsDetailed(ns, factionNames).sort((a, b) => a.sortValue - b.sortValue);
  const invites = ns.checkFactionInvitations();

  for (const faction of factions) {
    logFaction(faction, playerFactions, invites);
  }
}
