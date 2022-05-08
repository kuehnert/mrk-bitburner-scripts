import { priciestFactionAugmentation } from './helpers/augmentationHelper';

export const FACTIONS = [
  // City
  'Aevum',
  'Chongqing',
  'Ishima',
  'New Tokyo',
  'Sector-12',
  'Volhaven',

  // Hacking
  'BitRunners',
  'CyberSec',
  'Daedalus',
  'Illuminati',
  'Netburners',
  'NiteSec',
  'The Black Hand',
  'The Covenant',

  // Crime
  'Silhouette',
  'Slum Snakes',
  'Speakers for the Dead',
  'Tetrads',
  'The Dark Army',
  'The Syndicate',
  'Tian Di Hui',

  // Corporations
  'Bachman & Associates',
  'Blade Industries',
  'Clarke Incorporated',
  'ECorp',
  'Four Sigma',
  'Fulcrum Secret Technologies',
  'KuaiGong International',
  'MegaCorp',
  'NWO',
  'OmniTek Incorporated',
];

const simplifyName = s => s.replace(/[\s\-]/g, '').toLowerCase();

const FIND_NAMES = FACTIONS.reduce((map, s) => {
  map[simplifyName(s)] = s;
  return map;
}, {});

export const FACTION_INPUT_NAMES = Object.keys(FIND_NAMES);

export const findFaction = s => FIND_NAMES[simplifyName(s)];

export const validFaction = s => FACTIONS.includes(s);

const beefFaction = (ns, s, ownedAugs) => {
  const factionAugs = ns.getAugmentationsFromFaction(s);
  const ownedFactionAugs = factionAugs.filter(a => ownedAugs.includes(a));
  const sortValue = ownedFactionAugs.length / factionAugs.length;

  return {
    name: s,
    rep: ns.getFactionRep(s),
    favor: ns.getFactionFavor(s),
    favorGain: ns.getFactionFavorGain(s),
    factionAugs,
    ownedFactionAugs,
    priciest: priciestFactionAugmentation(ns, s),
    sortValue,
  };
};

export const getFactionsDetailed = (ns, factionNames) => {
  // const playerFactions = ns.getPlayer().factions.sort();
  const ownedAugs = ns.getOwnedAugmentations(true);

  return factionNames.map(s => beefFaction(ns, s, ownedAugs));
};
