/** @type import(".").NS */
let ns = null;

import { getServersDetailed } from '/helpers/getServers';

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerNumPortsRequired');
  ns.disableLog('getPurchasedServerCost');
  ns.clearLog();
  ns.tail();

  const hackLevel = ns.getHackingLevel();
  let servers = await getServersDetailed(ns);

  servers = servers.filter(s => !s.purchasedByPlayer && s.isRoot && !s.hasBackdoor && s.hackLevel <= hackLevel);

  servers = servers.sort((a, b) => a.hackLevel - b.hackLevel);

  ns.printf(
    'INFO installing backdoors on %d servers: %s',
    servers.length,
    servers
      .map(s => s.hostname)
      .join(', ')
      .toUpperCase()
  );

  for (const server of servers) {
    const { route } = server;
    for (const node of route) {
      ns.connect(node);
    }

    await ns.installBackdoor();
    ns.connect('home');
  }
}
