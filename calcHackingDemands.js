/** @type import(".").NS */
let ns = null;

import { calcTotalRamCost, calcAttackTimes, calcAttackDelays } from './helpers/ramCalculations';
import { formatCmd, formatDuration, formatMoney, formatNumber } from './helpers/formatters';
import { hprint } from './helpers/hprint';
import { BUFFER } from './helpers/globals'

const logData = (serverName, shifts, ram, size, cost) => {
  hprint(
    ns,
    'parallel attack with %s requires: %s GB => %s GB server (%s)',
    formatCmd(ns.sprintf('%3d shifts', shifts), `dep ${serverName} --shifts ${shifts}`, {
      onlyIf: cost <= ns.getServerMoneyAvailable('home'),
    }),
    formatNumber(ns, ram),
    formatNumber(ns, size),
    formatMoney(ns, cost, { markAffordable: true })
  );
};

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
  const maxShifts = flags.shifts === 1 ? Math.floor(sleepTime / BUFFER) : flags.shifts;

  hprint(ns, 'Analysing server I~%s~', serverName);
  hprint(ns, 'GROW   threads: %4d\tRAM required: %4d GB\ttime: %s', growThreads, growRam, formatDuration(ns, growTime));
  hprint(ns, 'HACK   threads: %4d\tRAM required: %4d GB\ttime: %s', hackThreads, hackRam, formatDuration(ns, hackTime));
  hprint(
    ns,
    'WEAKEN threads: %4d\tRAM required: %4d GB\ttime: %s',
    weakenThreads,
    weakenRam,
    formatDuration(ns, weakenTime)
  );
  hprint(ns, 'max shifts: %d; @ %s each', maxShifts, formatDuration(ns, sleepTime));

  hprint(
    ns,
    'serial attack                   requires: %s GB => %s GB server (%s)',
    formatNumber(ns, ramRequired),
    formatNumber(ns, serverSizeRequired),
    formatMoney(ns, ns.getPurchasedServerCost(serverSizeRequired), { markAffordable: true })
  );

  const previous = calcTotalRamCost(ns, serverName, 1);
  let previousRam = previous.parallelRamRequired;
  let previousServerSize = previous.parallelServerSizeRequired;

  for (let shift = 2; shift <= maxShifts; shift++) {
    const current = calcTotalRamCost(ns, serverName, shift);
    const cost = ns.getPurchasedServerCost(previousServerSize);

    if (previousServerSize < current.parallelServerSizeRequired) {
      logData(serverName, shift - 1, previousRam, previousServerSize, cost);
    }

    previousRam = current.parallelRamRequired;
    previousServerSize = current.parallelServerSizeRequired;
  }

  const { parallelRamRequired, parallelServerSizeRequired } = calcTotalRamCost(ns, serverName, maxShifts);
  logData(
    serverName,
    maxShifts,
    parallelRamRequired,
    parallelServerSizeRequired,
    ns.getPurchasedServerCost(parallelServerSizeRequired)
  );
}
