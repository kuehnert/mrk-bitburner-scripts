/** @type import("..").NS */
let ns = null;

import { getServersDetailed } from '/helpers/getServers';

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerNumPortsRequired');
  ns.clearLog();
  ns.tail();

  const hackLevel = ns.getHackingLevel();
  let servers = await getServersDetailed(ns);

  servers = servers.filter(
    s => s.isRoot && !s.hasBackdoor && s.hackLevel <= hackLevel
  );

  ns.printf('INFO installing backdoors on %d servers: %s', servers.length, servers.map(s => s.name).join(", ").toUpperCase());

  for (const server of servers) {
    const { route } = server;
    for (const node of route) {
      ns.connect(node);
    }

    await ns.installBackdoor();
    ns.connect('home');
  }
}
