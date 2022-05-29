import { FACTIONS } from './helpers/factionHelper';
import { AUGMENTATIONS_FILE } from './helpers/globals';
import { formatMoney } from '/helpers/formatters';

let ns = null;

export const formatAugmentation = (_ns, { name, price, reputationRequired }, factionRep) => {
  return _ns.sprintf('%s, %s, %d/%d', name, formatMoney(ns, price), reputationRequired, factionRep);
};

export const getPriceMultiplier = (purchased, installed) => Math.pow(1.9, purchased - installed);

const findAllAugmentations = _ns => {
  let augs = [];
  const factionNames = FACTIONS.sort();

  for (const factionName of factionNames) {
    const facAugs = _ns.getAugmentationsFromFaction(factionName);
    for (const augName of facAugs) {
      const aug = augs.find(a => a.name === augName);
      if (aug == null) {
        augs.push({
          name: augName,
          factionNames: [factionName],
        });
      } else {
        aug.factionNames.push(factionName);
      }
    }
  }

  return augs.sort((a, b) => a.name.localeCompare(b.name));
};

const findAugmentationDetails = async _ns => {
  ns = _ns;

  if (ns.fileExists(AUGMENTATIONS_FILE)) {
    return JSON.parse(ns.read(AUGMENTATIONS_FILE));
  }

  const augs = findAllAugmentations(ns);

  for (const aug of augs) {
    const augName = aug.name;
    aug.prereq = ns.getAugmentationPrereq(augName);
    aug.price = ns.getAugmentationPrice(augName);
    aug.repReq = ns.getAugmentationRepReq(augName);
    aug.stats = ns.getAugmentationStats(augName);
  }

  await ns.write(AUGMENTATIONS_FILE, JSON.stringify(augs));

  return augs;
};

export const getAugmentations = async _ns => {
  ns = _ns;

  const augs = await findAugmentationDetails(ns);
  // const myFactions = ns.getPlayer().factions;
  const installedAugs = ns.getOwnedAugmentations(false);
  const purchasedAugs = ns.getOwnedAugmentations(true);
  const priceMult = getPriceMultiplier(purchasedAugs.length, installedAugs.length);
  const myMoney = ns.getServerMoneyAvailable('home');

  for (const aug of augs) {
    const augName = aug.name;
    const cost = aug.price * priceMult;
    aug.installed = installedAugs.includes(augName);
    aug.purchased = purchasedAugs.includes(augName);
    aug.cost = cost;
    aug.affordable = myMoney > cost;
  }

  return augs;
};

// export const getAugmentations = async ns => {
//   const ownedAugmentations = ns.getOwnedAugmentations(true);
//   const installedAugmentations = ns.getOwnedAugmentations(false);
//   const factionNames = ns.getPlayer().factions;
//   const _augmentations = {};

//   for (const factionName of factionNames) {
//     const factionAugmentations = ns.getAugmentationsFromFaction(factionName);

//     for (const fa of factionAugmentations) {
//       const aug = _augmentations[fa] ?? { name: fa };
//       aug.prerequisites = ns.getAugmentationPrereq(fa);
//       aug.price = ns.getAugmentationPrice(fa);
//       aug.reputationRequired = ns.getAugmentationRepReq(fa);
//       aug.stats = ns.getAugmentationStats(fa);
//       aug.factionNames ??= [];
//       aug.factionNames.push(factionName);
//       aug.purchased = ownedAugmentations.includes(fa);
//       aug.installed = installedAugmentations.includes(fa);
//       _augmentations[fa] = aug;
//     }

//     await ns.sleep(10);
//   }

//   return _augmentations;
// };

// export const availableFactionAugmentations = (ns, faction) => {
//   const factionAugs = ns.getAugmentationsFromFaction(faction);
//   const ownedAugs = ns.getOwnedAugmentations(true);

//   const availableFactionAugs = factionAugs.filter(a => !ownedAugs.includes(a));
//   return availableFactionAugs;
// };

// export const priciestFactionAugmentation = async (ns, factionName) => {
//   const augsMap = await getAugmentations(ns);

//   const detailedAugs = Object.values(augsMap);
//   const factionAugs = detailedAugs
//     .filter(a => a.factionNames.includes(factionName) && !a.purchased)
//     .sort((a, b) => b.price - a.price);

//   return factionAugs[0];
// };
