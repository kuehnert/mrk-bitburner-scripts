/** @type import("..").NS */
let ns = null;

const loadServers = async () => {
  // Update file to check for newly installed backdoors
  ns.exec('/scanServers.js', 'home', 1, 'quiet');
  await ns.asleep(800);
  return JSON.parse(ns.read('/data/servers.txt'));
};

const installBackdoorsOnAll = async () => {
  const hackLevel = ns.getHackingLevel();
  let servers = await loadServers();

  ns.connect('home');
  servers = servers.filter(
    s => s.isRoot && !s.hasBackdoor && s.requiredLevel <= hackLevel
  );
  ns.printf('Will install backdoors on %d servers', servers.length);

  for (const server of servers) {
    const { path } = server;
    ns.connect('home');
    for (const node of path) {
      ns.connect(node);
    }
    ns.connect(server.name);

    await ns.installBackdoor();
    ns.connect('home');
  }
};

const installBackdoorOnServer = async targetName => {
  let servers = await loadServers();
  const { name, path } = servers.find(s => s.name === targetName);

  if (ns.getServer(name).backdoorInstalled) {
    return true;
  }

  ns.connect('home');
  for (const node of path) {
    ns.connect(node);
  }

  ns.connect(name);
  await ns.installBackdoor();

  const success = ns.getServer(name).backdoorInstalled;
  if (success) {
    ns.connect('home');
    return true;
  } else {
    return false;
  }
};

export default async function installBackdoor(_ns, params) {
  ns = _ns;

  if (params.toUpperCase() === 'ALL') {
    await installBackdoorsOnAll();
  } else {
    return installBackdoorOnServer(params);
  }
}
