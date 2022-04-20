/** @type import("..").NS */
let ns = null;

import { getMyPortLevel } from 'helpers/getMyPortLevel';
import isHackCandidate from 'helpers/isHackCandidate';
import { target2SourceName } from 'helpers/names';

let _servers = null;
const MINUTE = 60 * 1000;
const filename = '/data/routes.txt';

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
  const hacked = await getServersDetailed(ns, forceReload);
  return hacked.filter(s => !s.purchasedByPlayer);
};

export const getViableTargets = async _ns => {
  ns = _ns;
  const viable = await getHackedServers(ns);
  return viable
    .filter(s => !s.isAttacked && isHackCandidate(ns, s, getMyPortLevel(ns)))
    .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);
};

const calcHackTime = hostname =>
  (ns.getHackTime(hostname) + ns.getWeakenTime(hostname) + ns.getGrowTime(hostname)) / MINUTE;

const analyseServer = server => {
  const { hostname } = server;

  let newServer = {
    ...server,
    ram: ns.getServerMaxRam(hostname),
    maxMoney: ns.getServerMaxMoney(hostname),    money: ns.getServerMoneyAvailable(hostname),
    portsNeeded: ns.getServerNumPortsRequired(hostname),
    hackTime: calcHackTime(hostname),
    hackPercentage: ns.hackAnalyze(hostname),
    hackChance: ns.hackAnalyzeChance(hostname),
    isRoot: ns.hasRootAccess(hostname),
    isAttacked: ns.getPurchasedServers().includes(target2SourceName(hostname)),
    hasBackdoor: ns.getServer(hostname).backdoorInstalled,
  };

  newServer.hackMoneyPerTime = newServer.maxMoney / newServer.hackTime / 100.0;

  return newServer;
};

export const getServersDetailed = async (_ns, forceReload = false) => {
  ns = _ns;
  const servers = await getServers(ns, forceReload);

  // slice kicks out 'home'
  return servers.slice(1).map(s => analyseServer(s));
};

export default getServers;
