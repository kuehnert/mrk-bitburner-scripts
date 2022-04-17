/** @type import("..").NS */
let ns = null;

import { formatMoney } from '/helpers/formatters';

export default function logServer(_ns, myPortLevel, index, server) {
  ns = _ns;
  const {
    hackChance,
    hackLevel,
    hackMoneyPerTime,
    hackTime,
    hasBackdoor,
    isRoot,
    maxMoney,
    name,
    portsNeeded,
    ram,
  } = server;

  const isRootStr = isRoot ? 'ROOT' : '    ';
  const hasBackdoorStr = hasBackdoor ? 'BD' : '  ';
  const isCandidate =
    hackMoneyPerTime > 0 && myPortLevel >= portsNeeded && ns.getHackingLevel() >= hackLevel;
  let candidateStr = ' ';
  const isAttacked = ns.getPurchasedServers().includes('Attack' + name.toUpperCase());

  if (isAttacked) {
    candidateStr = 'A';
  } else if (isCandidate) {
    candidateStr = '*';
  }

  ns.tprintf(
    "%s%2d %-18s %d Ports, level %4d, %s %s, %4f GB, %9s, %6.2f', %9s, %3.0f%%",
    candidateStr,
    index,
    name,
    portsNeeded,
    hackLevel,
    isRootStr,
    hasBackdoorStr,
    ram,
    formatMoney(ns, maxMoney),
    hackTime,
    formatMoney(ns, hackMoneyPerTime),
    hackChance * 100.0
  );
}
