/** @type import(".").NS */
let ns = null;

import { formatMoney, formatTime } from 'helpers/formatters';

const commands = ['buy', 'delete-all', 'cost', 'owned'];

export function autocomplete() {
  return commands;
}

const buyServers = async () => {
  const myMoney = ns.getServerMoneyAvailable('home');
  const serverLimit = ns.getPurchasedServerLimit();

  const ownedServers = ns.getPurchasedServers();
  let ram = ns.getPurchasedServerMaxRam();
  // ns.printf('Max possible ram: %d GB', ram);

  while (ram > 1 && (noop || myMoney < 1.5 * serverLimit * ns.getPurchasedServerCost(ram))) {
    ns.printf(
      'Cost for %d servers with %7d GB: %s',
      serverLimit,
      ram,
      formatMoney(serverLimit * ns.getPurchasedServerCost(ram))
    );

    ram /= 2;
  }

  if (noop) {
    ns.exit();
  }

  ns.printf(
    '%s Desired RAM now: %d x %d GB => %s',
    formatTime(ns),
    serverLimit,
    ram,
    formatMoney(serverLimit * ns.getPurchasedServerCost(ram))
  );

  if (ram === 1) {
    ns.printf('Too little money. Exiiting');
    ns.exit();
  }

  const currentRAM = ownedServers.length == 0 ? 0 : ns.getServerMaxRam(ownedServers[0]);
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
    ns.printf('Purchasing %d servers with %d GB of RAM', serverLimit - ownedServers, ram);

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

  ns.print('(Re)starting master attack...');
  ns.kill('masterAttack.js', 'home');
  ns.exec('scanServers.js', 'home', 1, 'forceRefresh');
  await ns.sleep(1000);
  ns.exec('masterAttack.js', 'home');

  ns.print('Purchased all possible servers. Exiting');
};

const deleteAll = () => {
  const serverNames = ns.getPurchasedServers();

  for (const serverName of serverNames) {
    ns.killall(serverName);
    ns.deleteServer(serverName);
  }

  ns.tprintf('WARN Deleted all purchased servers. Exiting.');
};

const getOwned = () => {
  const purchasedNames = ns.getPurchasedServers();
  const limit = ns.getPurchasedServerLimit();

  ns.tprintf('INFO You own %d/%d personal servers.', purchasedNames.length, limit);

  for (const purchasedName of purchasedNames) {
    // ns.tprintf('sD: %s', JSON.stringify(ns.getServer(purchasedName), null, 4));
    const { cpuCores, maxRam, ramUsed } = ns.getServer(purchasedName);
    ns.tprintf('%-10s %d cores %4d/%4d GB ', purchasedName, cpuCores, ramUsed, maxRam);
  }
};

const getServerCost = () => {
  let ram = ns.getPurchasedServerMaxRam();
  const myMoney = ns.getServerMoneyAvailable('home');

  while (ram > 1) {
    const cost = ns.getPurchasedServerCost(ram);
    const costStr = formatMoney(cost);
    const affordable = Math.floor(myMoney / cost);
    ns.tprintf('Cost for 1 server with %7d GB: %9s (%5d affordable)', ram, costStr, affordable);
    ram /= 2;
  }
};

export async function main(_ns) {
  ns = _ns;
  const command = ns.args[0];

  switch (command) {
    case 'buy':
      await buyServers();
      break;

    case 'delete-all':
      await deleteAll();
      break;

    case 'cost':
      getServerCost();
      break;

    case 'owned':
      getOwned();
      break;

    default:
      ns.tprintf('WARN Accepted commands: %s', commands.join(', '));
  }
}
