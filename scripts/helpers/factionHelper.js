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

  // Special
  'Shadows of Anarchy',
];

export const simplifyName = s => s.replace(/[\s\-]/g, '').toLowerCase();

export const FIND_NAMES = FACTIONS.reduce((map, s) => {
  map[simplifyName(s)] = s;
  return map;
}, {});

export const FACTION_INPUT_NAMES = Object.keys(FIND_NAMES);

export const findFaction = s => FIND_NAMES[simplifyName(s)];

export const validFaction = s => FACTIONS.includes(s);

const beefFaction = async (ns, s, ownedAugs) => {
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
    sortValue,
  };
};

export const getFactionsDetailed = async (ns, factionNames) => {
  const ownedAugs = ns.getOwnedAugmentations(true);
  const factionDetails = [];

  for (const faction of factionNames) {
    const factionDetailed = await beefFaction(ns, faction, ownedAugs);
    factionDetails.push(factionDetailed);
  }

  return factionDetails;
};

export const getFactionsMap = async ns => {
  const fad = await getFactionsDetailed(ns, FACTIONS);
  const fa = fad.map(f => [f.name, f]);
  return Object.fromEntries(fa);
};
