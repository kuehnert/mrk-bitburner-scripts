/** @type import(".").NS */
let ns = null;

// import { formatMoney, formatNumber, formatDuration } from '/helpers/formatters';
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
    weakenRam,
    weakenThreads,
  } = calcTotalRamCost(ns, serverName);

  ns.tprintf('INFO analysing server %s', serverName);
  ns.tprintf('necessary grow   threads: %d, RAM required: %d GB', growThreads, growRam);
  ns.tprintf('necessary hack   threads: %d, RAM required: %d GB', hackThreads, hackRam);
  ns.tprintf('necessary weaken threads: %d, RAM required: %d GB', weakenThreads, weakenRam);
  ns.tprintf('server ram required: %d GB => %d GB server', ramRequired, serverSizeRequired);
}
