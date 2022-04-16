/** @type import(".").NS */
let ns = null;

import {
  formatMoney,
  formatNumber,
  formatDuration,
  SECOND,
} from '/helpers/formatters';

import logServerInfo from '/helpers/logServerInfo';

const hackServer = async (targetName, player = ns.getPlayer()) => {
  let target = ns.getServer(targetName);

  // we assume target is maxed out; we want to hack 50% of the money
  const hackPercent = ns.formulas.hacking.hackPercent(target, player);
  const hackThreads = Math.floor(0.5 / hackPercent);

  const growPercent = ns.formulas.hacking.growPercent(target, 1, player);
  const growThreads = Math.round(Math.log(2) / Math.log(growPercent));

  const weakenThreads = Math.round((growThreads / 0.05) * 0.002); // 1 grow increases security by 0.05, 1 weaken reduces 0.02

  const hackCost = ns.getScriptRam('minihack.js', 'home');
  const growCost = ns.getScriptRam('minigrow.js', 'home');
  const weakenCost = ns.getScriptRam('miniweaken.js', 'home');

  ns.printf(
    'growThreads: %d (%s), hackThreads: %d (%s), weakenThreads: %d (%s)',
    growThreads,
    growCost,
    hackThreads,
    hackCost,
    weakenThreads,
    weakenCost
  );

  /*
  const ramNeeded =
    hackThreads * hackCost +
    growThreads * growCost +
    weakenThreads * weakenCost;
  ns.printf('ramNeeded: %s', formatNumber(ramNeeded));
  ns.printf('ramAvailable: %s', formatNumber(ns.getServerMaxRam('home')));

  const shifts =
    (ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) / ramNeeded;
  ns.printf('possible shifts: %d', shifts);

  if (shifts < 1) {
    ns.print('Not enough money to do any shifts. Exiting.');
    ns.exit();
  }
  */

  const growTime = Math.round(ns.getGrowTime(targetName));
  const hackTime = Math.round(ns.getHackTime(targetName));
  const weakenTime = Math.round(ns.getWeakenTime(targetName));

  ns.printf(
    'growTime: %s, hackTime: %s, weakenTime: %s',
    formatDuration(ns, growTime),
    formatDuration(ns, hackTime),
    formatDuration(ns, weakenTime)
  );

  logServerInfo(ns, targetName);
  ns.exec('/newserver/hack.js', 'home', hackThreads, targetName, 0);
  await ns.sleep(hackTime);
  logServerInfo(ns, targetName);
  ns.exec('/newserver/grow.js', 'home', growThreads, targetName, 0);
  await ns.sleep(growTime);
  logServerInfo(ns, targetName);
  ns.exec('/newserver/weaken.js', 'home', weakenThreads, targetName, 0);
  await ns.sleep(weakenTime);
  logServerInfo(ns, targetName);

  // const sleepTime = weakenTime / shifts;
  // const weakenOffset = Math.floor(sleepTime / 2);
  // const growOffset = Math.floor(weakenOffset / 4);
  // const hackOffset = Math.floor(weakenOffset / 2);

  // const weakenSleep = 0;
  // const growSleep = weakenTime - growTime - growOffset;
  // const hackSleep = weakenTime - hackTime - hackOffset;

  /*
  let currentShift = 0;
  while (true) {
    logServerInfo(targetName);

    ns.exec(
      '/newserver/weaken.js',
      'home',
      weakenThreads,
      targetName,
      weakenSleep,
      currentShift
    );
    ns.exec(
      '/newserver/grow.js',
      'home',
      growThreads,
      targetName,
      growSleep,
      currentShift
    );
    ns.exec(
      '/newserver/hack.js',
      'home',
      hackThreads - 10,
      targetName,
      hackSleep,
      currentShift
    );

    if (++currentShift < shifts) {
      await ns.sleep(sleepTime + 200);
    } else {
      currentShift = 0;
      await ns.sleep(sleepTime + weakenOffset + 200);
    }
  }
  */
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

  ns.print('INFO PRIMING server...');
  const pid = ns.run('primeServer.js', 1, targetName);
  while (ns.isRunning(pid)) {
    await ns.sleep(SECOND);
  }

  ns.printf('INFO HACKING server %s', targetName);
  await hackServer(targetName);
}
