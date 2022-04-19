import { getServersDetailed } from '/helpers/getServers';
import logServer, { isHackCandidate } from '/helpers/logServer';

/** @type import(".").NS */
let ns = null;

const programs = ns => [
  { filename: 'BruteSSH.exe', command: ns.brutessh },
  { filename: 'FTPCrack.exe', command: ns.ftpcrack },
  { filename: 'RelaySMTP.exe', command: ns.relaysmtp },
  { filename: 'HTTPWorm.exe', command: ns.httpworm },
  { filename: 'SQLInject.exe', command: ns.sqlinject },
];

// const files = [
//   'minihack.js',
//   'minigrow.js',
//   'miniweaken.js',
//   '/newserver/OP.js',
//   '/newserver/grow.js',
//   '/newserver/hack.js',
//   '/newserver/weaken.js',
// ];

function getMyPortLevel() {
  let pl = 0;
  while (pl < programs(ns).length && ns.fileExists(programs(ns)[pl].filename, 'home')) {
    pl++;
  }

  return pl;
}

function hackServer(server, portsNeeded) {
  const portLevel = getMyPortLevel();
  for (let i = 0; i < portLevel; i++) {
    programs(ns)[i].command(server);
  }

  if (portsNeeded <= portLevel) {
    ns.nuke(server);
  }

  // ns.printf('%s ports: %d/%d', server, portLevel, portsNeeded);
  return ns.hasRootAccess(server);
}

// async function copyScripts(server) {
//   await ns.scp(files, server);
// }

async function stealFiles(server) {
  const litFiles = ns.ls(server, '.lit');

  if (litFiles.length > 0) {
    await ns.scp(litFiles, server, 'home');
  }
}

export function autocomplete() {
  return ['forceRefresh', 'owned', 'levels', 'milestones', 'quiet', 'targets'];
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  // ns.disableLog('disableLog');
  // ns.disableLog('getServerMaxRam');
  // ns.disableLog('getServerMaxMoney');
  // ns.disableLog('getServerMoneyAvailable');
  // ns.disableLog('getServerNumPortsRequired');
  // ns.disableLog('getHackingLevel');
  // ns.disableLog('scp');

  const flags = ns.flags([
    ['forceRefresh', false],
    ['quiet', false],
  ]);

  let detailedServers = await getServersDetailed(ns, flags.forceRefresh);

  for (const server of detailedServers) {
    const { hostname, portsNeeded, isRoot } = server;
    await stealFiles(hostname);
    // await copyScripts(hostname);
    if (!isRoot) {
      server.isRoot = hackServer(hostname, portsNeeded);
    }
  }

  // ns.printf('detailedServers: %s', JSON.stringify(detailedServers, null, 4));
  await ns.write('/data/servers.txt', JSON.stringify(detailedServers), 'w');

  if (flags.quiet) {
    ns.exit();
  }

  if (ns.args[0] === 'owned') {
    detailedServers = detailedServers.filter(s => s.purchasedByPlayer).sort(a => a.hostname);
  } else {
    detailedServers = detailedServers.filter(s => !s.purchasedByPlayer).sort(a => a.hostname);

    if (ns.args[0] === 'levels') {
      detailedServers = detailedServers.sort((a, b) => a.hackLevel - b.hackLevel);
    } else if (ns.args[0] === 'milestones') {
      detailedServers = detailedServers.filter(s =>
        s.name.match(/CSEC|CyberSec|avmnite-02h|I\.I\.I\.I|run4theh111z/)
      );
    } else if (ns.args[0] === 'targets') {
      detailedServers = detailedServers
        .filter(s => isHackCandidate(ns, s, getMyPortLevel()))
        .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);
    }
  }

  for (let i = 0; i < detailedServers.length; i++) {
    logServer(ns, getMyPortLevel(), i, detailedServers[i]);
  }
}
