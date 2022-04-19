/** @type import("..").NS */
let ns = null;

import { getMyPortLevel } from 'helpers/getMyPortLevel'

let _servers = null;
const MINUTE = 60 * 1000;
const filename = '/data/routes.txt';

export const isHackCandidate = (
  _ns,
  { hackMoneyPerTime, portsNeeded, hackChance, hackLevel },
  portLevel
) =>
  hackMoneyPerTime > 0 &&
  portLevel >= portsNeeded &&
  _ns.getHackingLevel() >= hackLevel &&
  hackChance >= 0.6;

const findServers = (node, done = [node], route = []) => {
  const nodeData = ns.getServer(node);
  const connected = ns.scan(node).filter(s => !done.includes(s));
  let allServers = [
    {
      hostname: node,
      route: route.concat([node]),
      hackLevel: nodeData.requiredHackingSkill,
      hasBackdoor: nodeData.backdoorInstalled,
      organizationName: nodeData.organizationName,
      purchasedByPlayer: nodeData.purchasedByPlayer,
    },
  ];

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
    ns.tprint('WARN Rediscovering servers...');
    _servers = findServers('home');
    await ns.write(filename, JSON.stringify(_servers), 'w');
  } else if (!_servers) {
    ns.tprint('INFO Loading servers...');
    _servers = JSON.parse(ns.read(filename));
  }

  return _servers;
};

export const getHackedServers = async (_ns, forceReload = false) => {
  ns = _ns;
  return (await getServers(_ns, forceReload)).filter(s => !s.purchasedByPlayer);
};

export const getViableTargets = async _ns => {
  ns = _ns;
  return getHackedServers(ns).filter(s => isHackCandidate(ns, s, getMyPortLevel(ns)));
};

const calcHackTime = hostname =>
  (ns.getHackTime(hostname) + ns.getWeakenTime(hostname) + ns.getGrowTime(hostname)) / MINUTE;

const analyseServer = server => {
  const { hostname } = server;

  let newServer = { ...server };
  newServer.ram = ns.getServerMaxRam(hostname);
  newServer.maxMoney = ns.getServerMaxMoney(hostname);
  newServer.money = ns.getServerMoneyAvailable(hostname);
  newServer.portsNeeded = ns.getServerNumPortsRequired(hostname);
  newServer.hackTime = calcHackTime(hostname);
  newServer.hackPercentage = ns.hackAnalyze(hostname);
  newServer.hackChance = ns.hackAnalyzeChance(hostname);
  newServer.hackMoneyPerTime = newServer.maxMoney / newServer.hackTime / 100.0;
  newServer.isRoot = ns.hasRootAccess(hostname);

  return newServer;
};

export const getServersDetailed = async (_ns, forceReload = false) => {
  ns = _ns;
  const servers = await getServers(ns, forceReload);

  // slice kicks out 'home'
  return servers.slice(1).map(s => analyseServer(s));
};

export default getServers;
