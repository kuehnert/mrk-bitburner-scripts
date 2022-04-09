/** @type import(".").NS */
let ns = null;
let doneServers;
let hackingLevel;
let portLevel;
let allServers;

const programs = [
  'BruteSSH.exe',
  'FTPCrack.exe',
  'relaySMTP.exe',
  'HTTPWorm.exe',
  'SQLInject.exe',
];

function getPortLevel() {
  let pl = 0;
  while (pl < programs.length > 0 && ns.fileExists(programs[pl], 'home')) {
    pl++;
  }

  return pl;
}

function hackServer(server, portsNeeded) {
  if (ns.fileExists('BruteSSH.exe', 'home')) {
    ns.brutessh(server);
  }

  if (ns.fileExists('FTPCrack.exe', 'home')) {
    ns.ftpcrack(server);
  }

  if (ns.fileExists('relaySMTP.exe', 'home')) {
    ns.relaysmtp(server);
  }

  if (ns.fileExists('HTTPWorm.exe', 'home')) {
    ns.httpworm(server);
  }

  if (ns.fileExists('SQLInject.exe', 'home')) {
    ns.sqlinject(server);
  }

  if (portsNeeded <= portLevel) {
    ns.nuke(server);
  }

  // refetch values
  return ns.hasRootAccess(server);
}

async function copyScripts(server) {
  const files = ['minihack.js', 'minigrow.js', 'miniweaken.js'];
  await ns.scp(files, server);
}

async function stealFiles(server) {
  const files = ns.ls(server, '.lit'); // .concat(ns.ls(server, '.cct'));
  if (files.length > 0) {
    // ns.tprintf('Stealing %s from server "%s"...', files, server);
    await ns.scp(files, server, 'home');
    // ns.tprintf('Copying Done.');
  }
}

function log(index, server) {
  const {
    hasBackdoor,
    depth,
    hackMoneyPerTime,
    hackChance,
    hackTime,
    isRoot,
    maxMoney,
    name,
    ports,
    ram,
    requiredLevel,
  } = server;

  const isRootStr = isRoot ? 'ROOT' : '    ';
  const hasBackdoorStr = hasBackdoor ? 'BD' : '  ';

  const isCandidate =
    hackMoneyPerTime > 0 && portLevel >= ports && hackingLevel >= requiredLevel;

  const candidateStr = isCandidate ? '*' : ' ';

  // ns.tprintf(JSON.stringify(server, null, 4));

  ns.tprintf(
    "%s%2d %2d %-18s %d Ports, level %4d, %s %s, %4f GB, $%13.0f, %6.2f', $%9.2f, %3.0f%%",
    candidateStr,
    index,
    depth,
    name,
    ports,
    requiredLevel,
    isRootStr,
    hasBackdoorStr,
    ram,
    maxMoney,
    hackTime,
    hackMoneyPerTime / 1000.0,
    hackChance * 100.0
  );
}

async function scanServer(server, depth, path = []) {
  if (server.match('pserv')) {
    return;
  }

  const serverData = ns.getServer(server);
  // ns.tprintf('server %s: %s', server, JSON.stringify(serverData, null, 4));

  const ram = ns.getServerMaxRam(server);
  const maxMoney = ns.getServerMaxMoney(server);
  const money = ns.getServerMoneyAvailable(server) / 1000.0;
  const portsNeeded = ns.getServerNumPortsRequired(server);
  const hackTime =
    (ns.getHackTime(server) +
      ns.getWeakenTime(server) +
      ns.getGrowTime(server)) /
    1000 /
    60.0;
  // const mmoney = ns.getHa
  const hackLevel = serverData.requiredHackingSkill;
  const hasBackdoor = serverData.backdoorInstalled;
  const hackPercentage = ns.hackAnalyze(server);
  const hackMoney = maxMoney * hackPercentage;
  const hackChance = ns.hackAnalyzeChance(server);
  const hackMoneyPerTime = hackMoney / hackTime;
  const isRoot = ns.hasRootAccess(server) || hackServer(server, portsNeeded);
  const organizationName = serverData.organizationName;

  await stealFiles(server);
  await copyScripts(server);

  allServers.push({
    depth,
    hackChance,
    hackMoneyPerTime,
    hackPercentage,
    hackTime,
    hasBackdoor,
    isRoot,
    maxMoney,
    money,
    name: server,
    organizationName,
    path,
    ports: portsNeeded,
    ram,
    requiredLevel: hackLevel,
  });

  // scan for connected servers
  let servers = ns.scan(server);
  path.push(server);
  for (const remote of servers) {
    if (!doneServers.includes(remote)) {
      doneServers.push(remote);
      await scanServer(remote, depth + 1, JSON.parse(JSON.stringify(path)));
    }
  }
  path.pop();
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  const servers = ns.scan('home');
  doneServers = ['home'];
  allServers = [];

  hackingLevel = ns.getHackingLevel();
  portLevel = getPortLevel();

  ns.tprintf('Current port level: %d', portLevel);
  ns.tprintf('Current hacking level: %d', hackingLevel);

  for (const remote of servers) {
    if (!doneServers.includes(remote)) {
      doneServers.push(remote);
      await scanServer(remote, 0);
    }
  }

  // Save all servers to text file
  await ns.write('/data/servers.txt', JSON.stringify(allServers), 'w');

  // Pick three most lucrative targets and save them to file
  const lucrativeServers = allServers
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
    allServers = allServers.sort((a, b) => a.requiredLevel - b.requiredLevel);
  } else if (ns.args[0] === 'milestones') {
    allServers = allServers.filter(s =>
      s.name.match(/CSEC|CyberSec|avmnite-02h|I\.I\.I\.I|run4theh111z/)
    );
  } else if (ns.args[0] === 'targets') {
    allServers = lucrativeServers;
  } else if (ns.args[0] === 'quiet') {
    ns.exit();
  } else {
    allServers = allServers.sort((a, b) => (b.name > a.name ? -1 : 1));
  }

  for (let i = 0; i < allServers.length; i++) {
    log(i, allServers[i]);
  }
}
