import { FACTIONS } from './helpers/factionHelper';
import { AUGMENTATIONS_FILE } from './helpers/globals';
import { formatMoney } from '/helpers/formatters';

let ns = null;
let allAugs = null;

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

  const augsD = findAllAugmentations(ns);

  for (const aug of augsD) {
    const augName = aug.name;
    aug.prereq = ns.getAugmentationPrereq(augName);
    aug.price = ns.getAugmentationPrice(augName);
    aug.repReq = ns.getAugmentationRepReq(augName);
    aug.stats = ns.getAugmentationStats(augName);
  }

  await ns.write(AUGMENTATIONS_FILE, JSON.stringify(augsD));

  return augsD;
};

export const getAugmentations = async _ns => {
  ns = _ns;

  allAugs ??= await findAugmentationDetails(ns);
  const installedAugs = ns.getOwnedAugmentations(false);
  const purchasedAugs = ns.getOwnedAugmentations(true);
  const priceMult = getPriceMultiplier(purchasedAugs.length, installedAugs.length);
  const myMoney = ns.getServerMoneyAvailable('home');

  for (const aug of allAugs) {
    const augName = aug.name;
    const cost = aug.price * priceMult;
    aug.installed = installedAugs.includes(augName);
    aug.purchased = purchasedAugs.includes(augName);
    aug.cost = cost;
    aug.affordable = myMoney > cost;
  }

  return allAugs;
};

export const priciestFactionAugmentation = async (_ns, factionName, repMode = false) => {
  ns = _ns;
  const augs = await getAugmentations(ns);
  const factionAugs = augs
    .filter(a => a.factionNames.includes(factionName) && !a.purchased)
    .sort((a, b) => (repMode ? b.repReq - a.repReq : b.price - a.price));

  return factionAugs[0];
};
