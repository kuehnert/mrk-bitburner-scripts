/** @type import(".").NS */
let ns = null;

import { MAPPED_ORGANISATIONS_FILE, ORGANISATIONS_FILE } from './helpers/globals';
import { CITIES, findLocation, getCityForLocation } from './helpers/locationHelper';

const fetchLocations = async () => {
  const organisations = JSON.parse(ns.read(ORGANISATIONS_FILE));
  const mapped = {};

  for (const city of CITIES) {
    ns.printf('Going to city %s', city);
    ns.travelToCity(city);

    for (let i = 0; i < organisations.length; i++) {
      let organisation = organisations[i];

      if (!organisation) {
        continue;
      }

      if (organisation.match(/ Network/)) {
        organisation = organisation.slice(0, -8);
      }

      if (organisation.match(/Fitness/)) {
        organisation += ' Gym';
      }

      ns.printf('Visiting organisation: %s', organisation);

      const success = ns.goToLocation(organisation);
      if (success) {
        mapped[organisation] = city;
        organisations[i] = null;
      }
    }

    ns.printf('mapped: %s', JSON.stringify(mapped, null, 4));
  }

  await ns.write(MAPPED_ORGANISATIONS_FILE, JSON.stringify(mapped), 'w');
  ns.print('Finiss!');
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.tail();

  // await fetchLocations();

  const location = 'NWO';
  const city = getCityForLocation(ns, location);
  ns.tprintf('%s is in %s', location, city);

  const location2 = 'noodlebar';
  ns.tprintf('%s → %s', location2, findLocation(ns, location2));
}
