/** @type import(".").NS */
let ns = null;

import { formatMoney, formatDuration } from '/helpers/formatters';

const logServerInfo = serverName => {
  const server = ns.getServer(serverName);
  const weakenTime = ns.getWeakenTime(serverName);
  const growTime = ns.getGrowTime(serverName);

  ns.printf(
    'Money: %s/%s (%s) %s; Security: %.1f/%.1f (%s) %s',
    formatMoney(server.moneyAvailable),
    formatMoney(server.moneyMax),
    formatDuration(ns, growTime),
    hasMaxMoney(server) ? '✓' : '❌',
    server.hackDifficulty,
    ns.getServerMinSecurityLevel(serverName),
    formatDuration(ns, weakenTime),
    hasMinSecurity(server) ? '✓' : '❌'
  );
};

const hasMaxMoney = server => server.moneyAvailable >= server.moneyMax;

const hasMinSecurity = server =>
  server.hackDifficulty <= 1.02 * ns.getServerMinSecurityLevel(server.hostname);

const isServerPrimed = server => hasMaxMoney(server) && hasMinSecurity(server);

const runWeaken = (targetName, weakenThreads) => {
  if (weakenThreads > 0) {
    const result = ns.exec('miniweaken.js', 'home', weakenThreads, targetName);

    if (result === 0) {
      ns.print('Error running weaken script. Aborting.');
      ns.exit();
    }
  }
};

const runGrow = (targetName, growThreads) => {
  if (growThreads > 0) {
    const result = ns.exec('minigrow.js', 'home', growThreads, targetName);

    if (result === 0) {
      ns.print('Error running grow script. Aborting.');
      ns.exit();
    }
  }
};

const primeServer = async targetName => {
  const serverMaxRam = ns.getServerMaxRam('home');
  const weakenTime = ns.getWeakenTime(targetName);
  const growTime = ns.getGrowTime(targetName);
  const waitTime = Math.max(weakenTime, growTime) + 100;

  logServerInfo(targetName);
  let target = ns.getServer(targetName);

  while (!isServerPrimed(target)) {
    let availableRam = serverMaxRam - ns.getServerUsedRam('home');
    const currentSecurity = ns.getServerSecurityLevel(targetName);
    const minSecurity = ns.getServerMinSecurityLevel(targetName);
    const weakenThreads = Math.round((currentSecurity - minSecurity) / 0.02); // 2% tolerance
    const weakenCost = ns.getScriptRam('miniweaken.js', 'home');
    const growCost = ns.getScriptRam('minigrow.js', 'home');
    // use all available memory for threads to grow server
    availableRam -= weakenCost * weakenThreads;
    const growThreads = availableRam / growCost;

    runWeaken(targetName, weakenThreads);
    runGrow(targetName, growThreads);
    await ns.sleep(waitTime);
    target = ns.getServer(targetName);
    logServerInfo(targetName);
  }
};

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.tail();

  const targetName = ns.args[0];
  await primeServer(targetName);
}
