/** @type import(".").NS */
let ns = null;

import { getAugmentations } from './helpers/augmentationHelper';
import { formatNumber, formatMoney } from './helpers/formatters';

const logAugmentation = ({ name, price, reputationRequired, stats, factions, purchased, installed }) => {
  const prefix = installed ? 'I' : purchased ? 'P' : ' ';

  ns.tprintf(
    '%s %-40s %s %s %s',
    prefix,
    name,
    formatMoney(ns, price, { isAffordable: true }),
    formatNumber(ns, reputationRequired),
    factions
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

  // ns.tprintf('augmentations: %s', JSON.stringify(augmentations, null, 4));

  for (const aug of augmentations) {
    logAugmentation(aug);
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
