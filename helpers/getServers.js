/** @type import("..").NS */
let ns = null;
let _servers = null;
const filename = "/data/routes.txt";

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

const getServers = async (_ns, forceReload = false) => {
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

export default getServers;
