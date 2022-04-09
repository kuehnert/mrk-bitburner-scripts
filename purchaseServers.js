import { formatMoney, formatTime } from 'helpers/formatters';

/** @type import(".").NS */
let ns = null;

const scripts = ['minihack.js', 'miniweaken.js', 'minigrow.js'];

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('ALL');
  ns.clearLog();

  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  const myMoney = ns.getServerMoneyAvailable('home');
  const serverLimit = ns.getPurchasedServerLimit();

  const ownedServers = ns.getPurchasedServers();
  let ram = ns.getPurchasedServerMaxRam();
  ns.printf('Max possible ram: %d GB', ram);

  while (
    ram > 1 &&
    myMoney < 2 * serverLimit * ns.getPurchasedServerCost(ram)
  ) {
    ns.printf(
      'Cost for %d servers with %7d GB: %s',
      serverLimit,
      ram,
      formatMoney(serverLimit * ns.getPurchasedServerCost(ram))
    );
    ram /= 2;
  }

  ns.printf('%s Desired affordable ram now: %d GB', formatTime(ns), ram);

  if (ram === 1) {
    ns.printf('Too little money. Exiiting');
    ns.exit();
  }

  const currentRAM =
    ownedServers.length == 0 ? 0 : ns.getServerMaxRam(ownedServers[0]);
  if (currentRAM >= ram / 2) {
    ns.printf('Increase from %d GB to %d GB of RAM to small', currentRAM, ram);
    ns.exit();
  }

  // delete servers that have less ram
  for (const server of ownedServers) {
    const maxRAM = ns.getServerMaxRam(server);
    if (maxRAM < ram) {
      ns.killall(server);
      ns.deleteServer(server);
      ns.printf('WARN DELETED server %s max RAM: %d GB', server, maxRAM);
    } else {
      ns.printf('INFO KEPT    server %s max RAM: %d GB', server, maxRAM);
    }

    await ns.sleep(100);
  }

  let ownedServerCount = ns.getPurchasedServers().length;
  if (ownedServerCount < serverLimit) {
    ns.printf(
      'Purchasing %d servers with %d GB of RAM',
      serverLimit - ownedServers,
      ram
    );

    while (ownedServerCount < serverLimit) {
      ns.printf('Owned Servers: %2d/%2d', ownedServerCount, serverLimit);
      if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
        const server = ns.purchaseServer('pserv-' + ownedServerCount, ram);
        await ns.scp(scripts, server);
        ownedServerCount = ns.getPurchasedServers().length;
        await ns.sleep(500);
      } else {
        await ns.sleep(60000);
      }
    }
  }

  ns.print('Purchased all possible servers. Exiting');
}
