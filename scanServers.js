import getServers from '/helpers/getServers';
import logServer from '/helpers/logServer';

/** @type import(".").NS */
let ns = null;

const MINUTE = 60 * 1000;
const programs = ns => [
  { filename: 'BruteSSH.exe', command: ns.brutessh },
  { filename: 'FTPCrack.exe', command: ns.ftpcrack },
  { filename: 'RelaySMTP.exe', command: ns.relaysmtp },
  { filename: 'HTTPWorm.exe', command: ns.httpworm },
  { filename: 'SQLInject.exe', command: ns.sqlinject },
];

const files = ['minihack.js', 'minigrow.js', 'miniweaken.js'];

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

const calcHackTime = name =>
  (ns.getHackTime(name) + ns.getWeakenTime(name) + ns.getGrowTime(name)) /
  MINUTE;

const analyseServer = server => {
  const { name } = server;
  const serverData = ns.getServer(name);

  let newServer = { ...server };
  newServer.ram = ns.getServerMaxRam(name);
  newServer.maxMoney = ns.getServerMaxMoney(name);
  newServer.money = ns.getServerMoneyAvailable(name) / 1000.0;
  newServer.portsNeeded = ns.getServerNumPortsRequired(name);
  newServer.hackTime = calcHackTime(name);
  newServer.hackLevel = serverData.requiredHackingSkill;
  newServer.hasBackdoor = serverData.backdoorInstalled;
  newServer.hackPercentage = ns.hackAnalyze(name);
  newServer.hackMoney = newServer.maxMoney * newServer.hackPercentage;
  newServer.hackChance = ns.hackAnalyzeChance(name);
  newServer.hackMoneyPerTime = newServer.hackMoney / newServer.hackTime;
  newServer.isRoot =
    ns.hasRootAccess(name) || hackServer(name, newServer.portsNeeded);
  newServer.organizationName = serverData.organizationName;

  return newServer;
};

const getServersDetailed = async () => {
  const servers = await getServers(ns);
  return servers.slice(1).map(s => analyseServer(s));
};

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

  let detailedServers = await getServersDetailed();

  for (const { name } of detailedServers) {
    await stealFiles(name);
    await copyScripts(name);
  }

  // Pick three most lucrative targets and save them to file
  const hackingLevel = ns.getHackingLevel();
  const lucrativeServers = detailedServers
    .filter(
      s =>
        s.isRoot &&
        s.maxMoney > 0 &&
        s.requiredLevel <= hackingLevel &&
        s.hackChance >= 0.8 &&
        s.hackTime < 15 // less than ten minutes
    )
    .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);

  await ns.write(
    '/data/targets.txt',
    JSON.stringify(lucrativeServers.slice(0, 2).map(s => s.name)),
    'w'
  );

  if (ns.args[0] === 'levels') {
    detailedServers = detailedServers.sort(
      (a, b) => a.requiredLevel - b.requiredLevel
    );
  } else if (ns.args[0] === 'milestones') {
    detailedServers = detailedServers.filter(s =>
      s.name.match(/CSEC|CyberSec|avmnite-02h|I\.I\.I\.I|run4theh111z/)
    );
  } else if (ns.args[0] === 'targets') {
    detailedServers = lucrativeServers;
  } else if (ns.args[0] === 'quiet') {
    ns.exit();
  } else {
    detailedServers = detailedServers.sort((a, b) =>
      b.name > a.name ? -1 : 1
    );
  }

  ns.printf('getMyPortLevel(): %s', JSON.stringify(getMyPortLevel(), null, 4));

  for (let i = 0; i < detailedServers.length; i++) {
    logServer(ns, getMyPortLevel(), i, detailedServers[i]);
  }
}
