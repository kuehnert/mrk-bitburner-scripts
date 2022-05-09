/** @type import(".").NS */
let ns = null;

import { getAugmentations } from './helpers/augmentationHelper';
import { getFactionsMap } from './helpers/factionHelper';
import { formatNumber, formatMoney } from './helpers/formatters';
import { hprint } from './helpers/hprint';

const logAugmentation = ({ name, price, reputationRequired, factionNames, purchased, installed }, factions) => {
  let prefix = ' ';
  if (installed) {
    prefix = 'I';
  } else if (purchased) {
    prefix = 'P';
  }

  const factionStr = factionNames
    .map(fs => {
      const f = factions[fs];
      return f.rep >= reputationRequired ? `S~${fs}~` : `${fs} (${formatNumber(ns, f.rep)})`;
    })
    .join(', ');

  hprint(
    ns,
    '%s %-55s %s %s %s',
    prefix,
    name,
    formatMoney(ns, price, { markAffordable: true }),
    formatNumber(ns, reputationRequired),
    factionStr
  );
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  // ns.tail();

  const flags = ns.flags([['includePurchased', false]]);

  // const augmentations = loadAugmentations();
  let augmentations = Object.values(getAugmentations(ns));
  if (!flags.includePurchased) {
    augmentations = augmentations.filter(a => !a.purchased);
  }

  augmentations = augmentations.sort((a, b) => b.price - a.price);

  const allFactions = getFactionsMap(ns);
  // ns.tprintf('allFactions: %s', JSON.stringify(allFactions, null, 4));

  for (const aug of augmentations) {
    logAugmentation(aug, allFactions);
  }
}

/*
import uniqueElements from './helpers/uniqueElements';

const allAugmentationsNamesFile = '/data/allAugmentationNames.txt';
const allAugmentationsFile = '/data/allAugmentationDetails.txt';

// const joinAllInvitations = () => {
//   const invites = ns.checkFactionInvitations();
//   for (const invite of invites) {
//     ns.joinFaction(invite);
//   }
// };

const fetchAllAugmentationsDetailed = async () => {
  const names = await fetchAllAugmentationNames();
  const ownedAugmentations = ns.getOwnedAugmentations(true);
  const installedAugmentations = ns.getOwnedAugmentations(false);

  const augmentations = names.map(an => ({
    name: an,
    prerequisites: ns.getAugmentationPrereq(an),
    price: ns.getAugmentationPrice(an),
    reputationRequired: ns.getAugmentationRepReq(an),
    stats: ns.getAugmentationStats(an),
    purchased: ownedAugmentations.includes(an),
    installed: installedAugmentations.includes(an),
  }));

  // await ns.write(allAugmentationsFile, JSON.stringify(augmentations), 'w');
  return augmentations;
};

const fetchAllAugmentationNames = async () => {
  let augmentationNames = ns.getOwnedAugmentations(true);
  const factions = ns.getPlayer().factions;
  for (const faction of factions) {
    augmentationNames = augmentationNames.concat(
      ns.getAugmentationsFromFaction(faction)
    );
  }
  augmentationNames = uniqueElements(augmentationNames).sort();

  if (!ns.fileExists(allAugmentationsNamesFile)) {
    await ns.write(
      allAugmentationsNamesFile,
      JSON.stringify(augmentationNames),
      'w'
    );
  } else {
    const readAugmentationsNames = JSON.parse(
      ns.read(allAugmentationsNamesFile)
    );
    if (augmentationNames.length > readAugmentationsNames.length) {
      await ns.write(
        allAugmentationsNamesFile,
        JSON.stringify(augmentationNames),
        'w'
      );
    }
  }

  return augmentationNames;
};

const loadAugmentations = () => {
  const json = ns.read(allAugmentationsFile);
  return JSON.parse(json);
};

const affordable = () => {
  const myMoney = ns.getServerMoneyAvailable('home');
  return Object.values(getAugmentations()).filter(
    a => !a.purchased && a.price <= myMoney
  );
};
*/
