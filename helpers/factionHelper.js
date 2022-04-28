export const FACTIONS = [
  'Aevum',
  'BitRunners',
  'CyberSec',
  'Daedalus',
  'Ishima',
  'New Tokyo',
  'NiteSec',
  'Sector-12',
  'Slum Snakes',
  'Tetrads',
  'The Black Hand',
  'Tian Di Hui',
];

const FIND_NAMES = {
  aevum: 'Aevum',
  bitrunners: 'BitRunners',
  cybersec: 'CyberSec',
  daedalus: 'Daedalus',
  ishima: 'Ishima',
  nitesec: 'NiteSec',
  newtokyo: 'New Tokyo',
  sector12: 'Sector-12',
  slumsnakes: 'Slum Snakes',
  tetrads: 'Tetrads',
  theblackhand: 'The Black Hand',
  tiandiui: 'Tian Di Hui',
};

export const FACTION_INPUT_NAMES = Object.keys(FIND_NAMES);

export const findFaction = s => FIND_NAMES[s.replace(/[\s\-]/, '').toLowerCase()];

export const validFaction = s => FACTIONS.includes(s);
