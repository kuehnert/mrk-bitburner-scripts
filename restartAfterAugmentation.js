/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('sleep');
  ns.clearLog();
  ns.rm('/data/done_job_ids.txt');
  ns.rm('/data/been_to_the_casino.txt');
  ns.rm('/data/routes.txt');
  ns.rm('/data/servers.txt');
  ns.rm('/data/unknown_contracts.txt');
}
