import { formatMoney } from '/helpers/formatters';

export const formatAugmentation = (ns, { name, price, reputationRequired }, factionRep) => {
  return ns.sprintf('%s, %s, %d/%d', name, formatMoney(ns, price), reputationRequired, factionRep);
};

export const getPriceMultiplier = (owned, installed) => Math.pow(1.9, owned.length - installed.length);

export const getAugmentations = ns => {
  const ownedAugmentations = ns.getOwnedAugmentations(true);
  const installedAugmentations = ns.getOwnedAugmentations(false);
  const factionNames = ns.getPlayer().factions;
  const _augmentations = {};

  for (const factionName of factionNames) {
    const factionAugmentations = ns.getAugmentationsFromFaction(factionName);

    for (const fa of factionAugmentations) {
      const aug = _augmentations[fa] ?? { name: fa };
      aug.prerequisites = {};  // ns.getAugmentationPrereq(fa);
      aug.price = 0;  // ns.getAugmentationPrice(fa);
      aug.reputationRequired = 0;  // ns.getAugmentationRepReq(fa);
      aug.stats = {};  // ns.getAugmentationStats(fa);
      aug.factionNames ??= [];
      aug.factionNames.push(factionName);
      aug.purchased = ownedAugmentations.includes(fa);
      aug.installed = installedAugmentations.includes(fa);
      _augmentations[fa] = aug;
    }
  }

  return _augmentations;
};

/*
const affordable = () => {
  const myMoney = ns.getServerMoneyAvailable('home');
  const augsArray = Object.values(getAugmentations());

  return augsArray.filter(a => !a.purchased && a.price <= myMoney);
};
*/

export const availableFactionAugmentations = (ns, faction) => {
  const factionAugs = ns.getAugmentationsFromFaction(faction);
  const ownedAugs = ns.getOwnedAugmentations(true);

  const availableFactionAugs = factionAugs.filter(a => !ownedAugs.includes(a));
  return availableFactionAugs;
};

export const priciestFactionAugmentation = (ns, factionName) => {
  // const augs = availableFactionAugmentations(faction);
  const detailedAugs = Object.values(getAugmentations(ns));
  const factionAugs = detailedAugs
    .filter(a => a.factionNames.includes(factionName) && !a.purchased)
    .sort((a, b) => b.price - a.price);

  // ns.printf('factionAugs: %s', JSON.stringify(factionAugs, null, 4));
  return factionAugs[0];
};
