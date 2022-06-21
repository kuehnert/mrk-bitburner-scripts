/** @type import("..").NS */
let ns = null;

export const getPrograms = ns => [
  { filename: 'BruteSSH.exe', command: ns.brutessh },
  { filename: 'FTPCrack.exe', command: ns.ftpcrack },
  { filename: 'RelaySMTP.exe', command: ns.relaysmtp },
  { filename: 'HTTPWorm.exe', command: ns.httpworm },
  { filename: 'SQLInject.exe', command: ns.sqlinject },
];

export function getMyPortLevel(_ns) {
  ns = _ns;
  const programs = getPrograms(ns);

  let pl = 0;
  while (pl < programs.length && ns.fileExists(programs[pl].filename, 'home')) {
    pl++;
  }

  return pl;
}

export default getMyPortLevel;
