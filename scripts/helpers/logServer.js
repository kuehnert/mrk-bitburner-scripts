/** @type import("..").NS */
let ns = null;

import { formatMoney, formatNumber, formatDuration } from 'helpers/formatters';
import { isHackCandidate } from 'helpers/isHackCandidate';

export default function logServer(_ns, myPortLevel, index, server) {
  ns = _ns;
  const {
    attackServerCost,
    attackServerSize,
    hackChance,
    hackLevel,
    hackMoneyPerTime,
    hackTime,
    hasBackdoor,
    homeAttacked,
    isAttacked,
    isRoot,
    maxMoney,
    hostname,
    portsNeeded,
    ram,
  } = server;

  const isRootStr = isRoot ? 'ROOT' : '    ';
  const hasBackdoorStr = hasBackdoor ? 'BD' : '  ';
  const isCandidate = isHackCandidate(_ns, server, myPortLevel);
  let candidateStr = '  ';

  if (homeAttacked) {
    candidateStr = 'H ';
  } else if (isAttacked) {
    candidateStr = 'A ';
  } else if (isCandidate) {
    candidateStr = '->';
  }

  ns.tprintf(
    '%s%2d %-23s %d Ports, level %4d, %s %s, %s GB, %9s, %s, %s, %6s, %10s, %3.0f%%',
    candidateStr,
    index,
    hostname,
    portsNeeded,
    hackLevel,
    isRootStr,
    hasBackdoorStr,
    formatNumber(ns, ram),
    formatMoney(ns, maxMoney),
    formatMoney(ns, hackMoneyPerTime),
    formatDuration(ns, hackTime),
    Number.isFinite(attackServerSize) ? attackServerSize : '-',
    Number.isFinite(attackServerSize) ? formatMoney(ns, attackServerCost) : '-',
    hackChance * 100.0
  );
}
