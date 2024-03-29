/** @type import("..").NS */
let ns = null;

export const isHackCandidate = (
  _ns,
  { hackMoneyPerTime, portsNeeded, hackChance, hackLevel },
  portLevel
) => {
  ns = _ns;
  ns.disableLog('getHackingLevel');

  return (
    hackMoneyPerTime > 0 &&
    portLevel >= portsNeeded &&
    _ns.getHackingLevel() >= hackLevel &&
    hackChance >= 0.85
  );
};

export default isHackCandidate;
