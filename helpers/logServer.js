/** @type import(".").NS */
let ns = null;
import {formatMoney} from '/helpers/formatters'
export default function logServer(ns, myPortLevel, index, server) {
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
    hackMoneyPerTime > 0 &&
    myPortLevel >= portsNeeded &&
    ns.getHackingLevel() >= hackLevel;
  const candidateStr = isCandidate ? '*' : ' ';

  ns.tprintf(
    "%s%2d %-18s %d Ports, level %4d, %s %s, %4f GB, %s, %6.2f', $%9.2f, %3.0f%%",
    candidateStr,
    index,
    name,
    portsNeeded,
    hackLevel,
    isRootStr,
    hasBackdoorStr,
    ram,
    formatMoney(maxMoney),
    hackTime,
    hackMoneyPerTime / 1000.0,
    hackChance * 100.0
  );
}
