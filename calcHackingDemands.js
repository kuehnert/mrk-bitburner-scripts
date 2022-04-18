/** @type import(".").NS */
let ns = null;

import { calcTotalRamCost } from '/helpers/ramCalculations';
export const autocomplete = data => [...data.servers];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('getServerMinSecurityLevel');

  const serverName = ns.args[0];
  const {
    growRam,
    growThreads,
    hackRam,
    hackThreads,
    ramRequired,
    serverSizeRequired,
    parallelRamRequired,
    parallelServerSizeRequired,
    weakenRam,
    weakenThreads,
  } = calcTotalRamCost(ns, serverName);

  ns.tprintf('INFO analysing server %s', serverName);
  ns.tprintf('necessary grow   threads: %3d, RAM required: %3d GB', growThreads, growRam);
  ns.tprintf('necessary hack   threads: %3d, RAM required: %3d GB', hackThreads, hackRam);
  ns.tprintf('necessary weaken threads: %3d, RAM required: %3d GB', weakenThreads, weakenRam);
  ns.tprintf('single-thread       server ram required: %4d GB => %4d GB server', ramRequired, serverSizeRequired);
  ns.tprintf('parallel processing server ram required: %4d GB => %4d GB server', parallelRamRequired, parallelServerSizeRequired);
}
