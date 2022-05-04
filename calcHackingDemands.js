/** @type import(".").NS */
let ns = null;

import { calcTotalRamCost, calcAttackTimes, calcAttackDelays } from './helpers/ramCalculations';
import { formatDuration, formatMoney } from './helpers/formatters';

export const autocomplete = data => [...data.servers, '--shifts'];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('getServerMinSecurityLevel');

  const serverName = ns.args[0];
  const flags = ns.flags([['shifts', 1]]);

  const { growRam, growThreads, hackRam, hackThreads, ramRequired, serverSizeRequired, weakenRam, weakenThreads } =
    calcTotalRamCost(ns, serverName, flags.shifts);

  const times = calcAttackTimes(ns, serverName, flags.shifts);
  const { growTime, hackTime, weakenTime } = times;
  const { sleepTime } = calcAttackDelays(times);

  ns.tprintf('INFO analysing server %s', serverName);
  ns.tprintf('GROW   threads: %4d\tRAM required: %4d GB\ttime: %s', growThreads, growRam, formatDuration(ns, growTime));
  ns.tprintf('HACK   threads: %4d\tRAM required: %4d GB\ttime: %s', hackThreads, hackRam, formatDuration(ns, hackTime));
  ns.tprintf(
    'WEAKEN threads: %4d\tRAM required: %4d GB\ttime: %s',
    weakenThreads,
    weakenRam,
    formatDuration(ns, weakenTime)
  );
  ns.tprintf('serial attack                            requires: %5d GB => %5d GB server', ramRequired, serverSizeRequired);

  const maxShifts = flags.shifts === 1 ? Math.floor(sleepTime / 1000) : flags.shifts;

  for (let shift = 1; shift < maxShifts; shift++) {
    const { parallelRamRequired, parallelServerSizeRequired } = calcTotalRamCost(ns, serverName, shift);

    ns.tprintf(
      'parallel attack with %2d shifts (%s) requires: %5d GB => %5d GB server (%s)',
      shift,
      formatDuration(ns, sleepTime),
      parallelRamRequired,
      parallelServerSizeRequired,
      formatMoney(ns, ns.getPurchasedServerCost(parallelServerSizeRequired))
    );
  }
}
