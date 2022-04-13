/** @type import("..").NS */
let ns = null;

import { getServersDetailed } from '/helpers/getServers';

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.clearLog();
  ns.tail();

  const hackLevel = ns.getHackingLevel();
  let servers = await getServersDetailed(ns);
  // ns.printf('servers: %s', JSON.stringify(servers, null, 4));

  servers = servers.filter(
    s => s.isRoot && !s.hasBackdoor && s.hackLevel <= hackLevel
  );

  ns.printf('INFO Able to install backdoors on %d servers', servers.length);

  for (const server of servers) {
    const { route } = server;
    for (const node of route) {
      ns.connect(node);
    }

    await ns.installBackdoor();
    ns.connect('home');
  }
}
