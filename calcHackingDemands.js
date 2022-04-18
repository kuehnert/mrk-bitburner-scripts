/** @type import(".").NS */
let ns = null;

import { calcTotalRamCost, calcAttackTimes } from './helpers/ramCalculations';
import { formatDuration } from './helpers/formatters';

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

  const { growTime, hackTime, weakenTime } = calcAttackTimes(ns, serverName);

  ns.tprintf('INFO analysing server %s', serverName);
  ns.tprintf(
    'GROW   threads: %3d\tRAM required: %3d GB\ttime: %s',
    growThreads,
    growRam,
    formatDuration(ns, growTime)
  );
  ns.tprintf(
    'HACK   threads: %3d\tRAM required: %3d GB\ttime: %s',
    hackThreads,
    hackRam,
    formatDuration(ns, hackTime)
  );
  ns.tprintf(
    'WEAKEN threads: %3d\tRAM required: %3d GB\ttime: %s',
    weakenThreads,
    weakenRam,
    formatDuration(ns, weakenTime)
  );
  ns.tprintf(
    'single-thread       server ram required: %4d GB => %4d GB server',
    ramRequired,
    serverSizeRequired
  );
  ns.tprintf(
    'parallel processing server ram required: %4d GB => %4d GB server',
    parallelRamRequired,
    parallelServerSizeRequired
  );
}
