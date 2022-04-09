/** @type import(".").NS */
let ns = null;

const programs = [
  'BruteSSH.exe',
  'FTPCrack.exe',
  'relaySMTP.exe',
  'HTTPWorm.exe',
  'SQLInject.exe',
];

let targets;

const findAttackLevel = () => {
  let level = 0;

  while (level < programs.length && ns.fileExists(programs[level])) {
    level++;
  }

  return level;
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  let result;

  // ns.tprint(ns.getBitNodeMultipliers()); // SF5
  // ns.tprint(ns.bladeburner.getCity()); // join bladeburner
  // result = ns.applyToCompany('4sigma'); // SF4

  // result = ns.purchaseTor(); // SF4
  // ns.tprint(result);
  // result = ns.purchaseProgram(programs[0]); // SF4
  // ns.tprint(result);

  ns.tprint('StartOver finished!');
}
