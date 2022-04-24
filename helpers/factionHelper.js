export const FACTIONS = [
  'Aevum',
  'BitRunners',
  'CyberSec',
  'New Tokyo',
  'NiteSec',
  'Sector-12',
  'Slum Snakes',
  'The Black Hand',
  'Tian Di Hui',
];

const FIND_NAMES = {
  aevum: 'Aevum',
  bitrunners: 'BitRunners',
  cybersec: 'CyberSec',
  nitesec: 'NiteSec',
  newtokyo: 'New Tokyo',
  sector12: 'Sector-12',
  slumsnakes: 'Slum Snakes',
  theblackhand: 'The Black Hand',
  tiandiui: 'Tian Di Hui',
};

export const FACTION_INPUT_NAMES = Object.keys(FIND_NAMES);

export const findFaction = s => FIND_NAMES[s.replace(/[\s\-]/,'').toLowerCase()];

export const validFaction = s => FACTIONS.includes(s);
