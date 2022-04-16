/** @type import("..").NS */
let ns = null;
let _servers = null;
const MINUTE = 60 * 1000;
const filename = '/data/routes.txt';

const findServers = (node, done = [node], route = []) => {
  const connected = ns.scan(node).filter(s => !done.includes(s));
  let allServers = [{ name: node, route: route.concat([node]) }];

  for (const newServer of connected) {
    allServers = allServers.concat(
      findServers(newServer, done.concat([newServer]), route.concat([node]))
    );
  }

  return allServers;
};

export const getServers = async (_ns, forceReload = false) => {
  ns = _ns;

  if (forceReload || !ns.fileExists(filename, 'home')) {
    ns.print('WARN Rediscovering servers...');
    _servers = findServers('home');
    await ns.write(filename, JSON.stringify(_servers), 'w');
  } else if (!_servers) {
    ns.print('INFO Loading servers...');
    _servers = JSON.parse(ns.read(filename));
  }

  return _servers;
};

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
  newServer.isRoot = ns.hasRootAccess(name);
  newServer.organizationName = serverData.organizationName;

  return newServer;
};

export const getServersDetailed = async (_ns, forceReload = false) => {
  ns = _ns;
  const servers = await getServers(ns, forceReload);
  return servers.slice(1).map(s => analyseServer(s));
};

export default getServers;
