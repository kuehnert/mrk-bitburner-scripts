/** @type import("..").NS */
let ns = null;

import { MINUTE } from 'helpers/formatters';

const DELETE_PERIOD = 3 * MINUTE;

const DATA_FILES = [
  'companies.txt',
  'gyms.txt',
  'jobs.txt',
  'organisations.txt',
  'routes.txt',
  'servers.txt',
  'targets.txt',
  'unknown_contracts.txt',
];

const isDone = () => ns.getTimeSinceLastAug() > DELETE_PERIOD;

const checkPreReqs = () => null;

const perform = () => {
  ns.tprint('WARN Deleting stale cache files');

  for (const file of DATA_FILES) {
    ns.rm('/data/' + file, 'home');
  }

  return true; // success
};

export async function main(_ns, params) {
  ns = _ns;

  if (params.checkIsDone) {
    return isDone();
  } else if (params.checkPreReqs) {
    return checkPreReqs();
  } else {
    return perform();
  }
}

export default main;
