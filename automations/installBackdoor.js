/** @type import("..").NS */
let ns = null;

import { getServersDetailed } from 'helpers/getServers';

const installBackdoorsOnAll = async () => {
  const hackLevel = ns.getHackingLevel();
  let servers = await getServersDetailed(ns);

  ns.connect('home');
  servers = servers.filter(s => s.isRoot && !s.hasBackdoor && s.requiredLevel <= hackLevel);
  ns.printf('Will install backdoors on %d servers', servers.length);

  for (const server of servers) {
    const { route } = server;
    ns.connect('home');
    for (const node of route) {
      ns.connect(node);
    }
    ns.connect(server.hostname);

    await ns.installBackdoor();
    ns.connect('home');
  }
};

const installBackdoorOnServer = async targetName => {
  let servers = await getServersDetailed(ns);
  const { hostname, route } = servers.find(s => s.hostname === targetName);

  if (ns.getServer(hostname).backdoorInstalled) {
    return true;
  }

  for (const node of route) {
    ns.connect(node);
  }

  ns.connect(hostname);
  await ns.installBackdoor();

  const success = ns.getServer(hostname).backdoorInstalled;
  if (success) {
    ns.connect('home');
    return true;
  } else {
    return false;
  }
};

export default async function installBackdoor(_ns, params) {
  ns = _ns;
  ns.disableLog('ALL');

  if (params.toUpperCase() === 'ALL') {
    await installBackdoorsOnAll();
  } else {
    return installBackdoorOnServer(params);
  }
}
