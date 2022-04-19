/** @type import("..").NS */
let ns = null;

import { MINUTE } from 'helpers/formatters';

const DELETE_PERIOD = 5 * MINUTE;
const dataFiles = [
  'companies.txt',
  'gyms.txt',
  'jobs.txt',
  'organisations.txt',
  'routes.txt',
  'servers.txt',
  'targets.txt',
  'unknown_contracts.txt',
];

export async function main(_ns) {
  ns = _ns;
  const flags = ns.flags([['force', false]])

  // HACK: if installing augmentations was less than 5 minutes ago, delete stale cache files
  if (flags.force || ns.getTimeSinceLastAug() < DELETE_PERIOD) {
    ns.tprint('WARN Deleting stale cache files');

    for (const file of dataFiles) {
      ns.rm('/data/' + file, 'home');
    }
  }

  return true;
}

export default main;
