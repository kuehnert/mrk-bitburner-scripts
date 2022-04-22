/** @type import("..").NS */
let ns = null;

import { formatMoney, formatNumber } from 'helpers/formatters';
import { isHackCandidate } from 'helpers/isHackCandidate';

export default function logServer(_ns, myPortLevel, index, server) {
  ns = _ns;
  const {
    hackChance,
    hackLevel,
    hackMoneyPerTime,
    hackTime,
    hasBackdoor,
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

  if (isAttacked) {
    candidateStr = ' ✓';
  } else if (isCandidate) {
    candidateStr = '🎯';
  }

  ns.tprintf(
    "%s%2d %-23s %d Ports, level %4d, %s %s, %s GB, %9s, %6.2f', %9s, %3.0f%%",
    candidateStr,
    index,
    hostname,
    portsNeeded,
    hackLevel,
    isRootStr,
    hasBackdoorStr,
    formatNumber(ns, ram),
    formatMoney(ns, maxMoney),
    hackTime,
    formatMoney(ns, hackMoneyPerTime),
    hackChance * 100.0
  );
}
