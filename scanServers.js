import { getServersDetailed } from '/helpers/getServers';
import logServer from '/helpers/logServer';

/** @type import(".").NS */
let ns = null;

const programs = ns => [
  { filename: 'BruteSSH.exe', command: ns.brutessh },
  { filename: 'FTPCrack.exe', command: ns.ftpcrack },
  { filename: 'RelaySMTP.exe', command: ns.relaysmtp },
  { filename: 'HTTPWorm.exe', command: ns.httpworm },
  { filename: 'SQLInject.exe', command: ns.sqlinject },
];

const files = [
  'minihack.js',
  'minigrow.js',
  'miniweaken.js',
  '/newserver/OP.js',
  '/newserver/grow.js',
  '/newserver/hack.js',
  '/newserver/weaken.js',
];

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

async function copyScripts(server) {
  await ns.scp(files, server);
}

async function stealFiles(server) {
  const litFiles = ns.ls(server, '.lit');

  if (litFiles.length > 0) {
    await ns.scp(litFiles, server, 'home');
  }
}

export function autocomplete() {
  return ['forceRefresh', 'levels', 'money', 'milestones', 'quiet', 'targets']; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerNumPortsRequired');
  ns.disableLog('getHackingLevel');
  ns.disableLog('scp');

  const forceRefresh = ns.args[0] === 'forceRefresh';

  let detailedServers = await getServersDetailed(ns, forceRefresh);

  for (const server of detailedServers) {
    const { name, portsNeeded, isRoot } = server;
    await stealFiles(name);
    await copyScripts(name);
    if (!isRoot) {
      server.isRoot = hackServer(name, portsNeeded);
    }
  }

  // ns.printf('detailedServers: %s', JSON.stringify(detailedServers, null, 4));
  await ns.write('/data/servers.txt', JSON.stringify(detailedServers), 'w');

  // Pick three most lucrative targets and save them to file
  const hackingLevel = ns.getHackingLevel();
  const lucrativeServers = detailedServers
    .filter(
      s =>
        s.isRoot &&
        s.maxMoney > 0 &&
        s.hackLevel <= hackingLevel &&
        s.hackChance >= 0.8 &&
        s.hackTime < 15 // less than fifteen minutes
    )
    .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime)
    .slice(0, 5);

  await ns.write(
    '/data/targets.txt',
    JSON.stringify(lucrativeServers.slice(0, 2).map(s => s.name)),
    'w'
  );

  if (ns.args[0] === 'levels') {
    detailedServers = detailedServers.sort((a, b) => a.hackLevel - b.hackLevel);
  } else if (ns.args[0] === 'milestones') {
    detailedServers = detailedServers.filter(s =>
      s.name.match(/CSEC|CyberSec|avmnite-02h|I\.I\.I\.I|run4theh111z/)
    );
  } else if (ns.args[0] === 'money') {
    detailedServers = detailedServers
      .filter(s => s.maxMoney > 0 && s.hackLevel <= hackingLevel && s.hackChance >= 0.8)
      .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);
  } else if (ns.args[0] === 'targets') {
    detailedServers = lucrativeServers;
  } else if (ns.args[0] === 'quiet') {
    ns.exit();
  } else {
    detailedServers = detailedServers.sort((a, b) => (b.name > a.name ? -1 : 1));
  }

  ns.printf('getMyPortLevel(): %s', JSON.stringify(getMyPortLevel(), null, 4));

  for (let i = 0; i < detailedServers.length; i++) {
    logServer(ns, getMyPortLevel(), i, detailedServers[i]);
  }
}
