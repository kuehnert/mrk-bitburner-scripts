/** @type import(".").NS */
let ns = null;

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

  // ns.disableLog('ALL');
  // ns.clearLog();
  ns.tprint("WARN Deleting all temporary data files...")

  for (const file of dataFiles) {
    ns.rm('/data/' + file, 'home');
  }
}
