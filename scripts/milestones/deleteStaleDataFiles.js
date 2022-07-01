/** @type import("..").NS */
let ns = null;

import { MINUTE } from 'helpers/globals';

const DELETE_PERIOD = 3 * MINUTE;

const DATA_FILES = [
  'augmentations.txt',
  'been_to_the_casino.txt',
  'crimes.txt',
  'done_job_ids.txt',
  'jobs.txt',
  'routes.txt',
  'servers.txt',
  'targets.txt',
  'unknown_contracts.txt',
  // 'companies.txt',
  // 'gyms.txt',
  // 'organisations.txt',
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

  if (params.getName) {
    return 'Delete stale data files from last augmentation reset';
  } else if (params.checkIsDone) {
    return isDone();
  } else if (params.checkPreReqs) {
    return checkPreReqs();
  } else {
    return perform();
  }
}

export default main;
