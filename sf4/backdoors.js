/** @type import("..").NS */
let ns = null;

const loadServers = async () => {
  // Update file to check for newly installed backdoors
  ns.exec('scanServers.js', 'home', 1, 'quiet');
  await ns.asleep(800);
  return JSON.parse(ns.read('/data/servers.txt'));
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('getHackingLevel');
  ns.clearLog();
  ns.tail();

  ns.connect('home');
  const hackLevel = ns.getHackingLevel();
  let servers = await loadServers();

  servers = servers.filter(
    s => s.isRoot && !s.hasBackdoor && s.requiredLevel <= hackLevel
  );
  // ns.tprint(JSON.stringify(servers, null, 4));
  ns.printf('Able to install backdoors on %d servers', servers.length);

  for (const server of servers) {
    const { path } = server;
    ns.connect('home');
    for (const node of path) {
      ns.connect(node);
    }
    ns.connect(server.name);

    // ns.printf('Installing backdoor on %s...', server.name);
    await ns.installBackdoor();
    ns.connect('home');
  }
}
