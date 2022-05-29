let organisations = null;
let organisationsMapped = null;

export const CITIES = ['Sector-12', 'Aevum', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima'];

import { MAPPED_ORGANISATIONS_FILE, ORGANISATIONS_FILE } from 'helpers/globals';

export const getCityForLocation = (ns, location) => {
  organisationsMapped ??= JSON.parse(ns.read(MAPPED_ORGANISATIONS_FILE));

  return organisationsMapped[location];
};

export const findLocation = (ns, name) => {
  organisations ??= JSON.parse(ns.read(ORGANISATIONS_FILE));
  name = name.toLowerCase();

  return organisations.find(o => o.toLowerCase().replace(/[\s\-']/g, '') === name);
};
