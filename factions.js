/** @type import(".").NS */
let ns = null;

import { formatNumber, formatMoney } from './helpers/formatters';
import { FACTIONS, getFactionsDetailed } from './helpers/factionHelper';
import hprint from './helpers/hprint';
import { priciestFactionAugmentation } from './helpers/augmentationHelper';

const logFaction = (faction, playerFactions, invites, priciest, myMoney) => {
  const { name, favor, favorGain, rep, factionAugs, ownedFactionAugs } = faction;

  let marker = '  ';
  if (playerFactions.includes(name)) {
    marker = 'M ';
  } else if (invites.includes(name)) {
    marker = 'I ';
  }

  let countStr = ns.sprintf('%2d/%2d', ownedFactionAugs.length, factionAugs.length);
  const allPurchased = ownedFactionAugs.length === factionAugs.length;
  if (allPurchased) {
    countStr = `G~${countStr}~`;
  } else if (ownedFactionAugs.length / factionAugs.length < 0.3) {
    countStr = `S~${countStr}~`;
  } else if (ownedFactionAugs.length / factionAugs.length <= 0.5) {
    countStr = `W~${countStr}~`;
  }

  let priceStr = priciest ? formatMoney(ns, priciest.price) : '       - ';
  if (priciest?.price < myMoney) {
    priceStr = 'S~' + priceStr + '~';
  }

  hprint(
    ns,
    '%s%s %3d %s %s %-50.50s %s %s/%s',
    marker,
    allPurchased ? `G~${ns.sprintf('%-27s', name)}~` : ns.sprintf('%-27s', name),
    Math.round(favor),
    formatNumber(ns, favorGain),
    countStr,
    priciest ? priciest.name : '-',
    priceStr,
    formatNumber(ns, rep),
    priciest ? formatNumber(ns, priciest.repReq) : '       - '
  );
};

export const autocomplete = () => ['--all'];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  const flags = ns.flags([['all', false]]);

  const playerFactions = ns.getPlayer().factions.sort();
  const factionNames = flags.all ? FACTIONS : playerFactions;
  const factionsSimple = await getFactionsDetailed(ns, factionNames);
  const factions = factionsSimple.sort((a, b) => a.sortValue - b.sortValue);
  const invites = ns.checkFactionInvitations();
  const myMoney = ns.getServerMoneyAvailable('home');

  hprint(
    ns,
    'I~%s%-25s %3s %s %s %-50s %9s %8s/%8s~',
    '  ',
    'Faction',
    'Favor',
    '   Gain',
    '  Augs',
    'Priciest',
    'Price',
    'Rep',
    'RepReq'
  );

  for (const faction of factions) {
    const priciest = await priciestFactionAugmentation(ns, faction.name);
    logFaction(faction, playerFactions, invites, priciest, myMoney);
  }
}
