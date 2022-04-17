/** @type import(".").NS */
let ns = null;

import { formatMoney, SECOND } from 'helpers/formatters';
import { getGrowPercent, getHackPercent } from 'helpers/fakeFormulas';

const log = (
  targetName,
  action,
  moneyCurrent,
  moneyMax,
  securityCurrent,
  securityThresh,
  sleep,
  threads
) => {
  ns.printf(
    '%-6s: %12s money %s/%s, security: %2.1f/%2.1f, %s, %d t',
    targetName,
    action.toUpperCase(),
    formatMoney(ns, moneyCurrent),
    formatMoney(ns, moneyMax),
    // ns.nFormat(moneyMax / 1000.0, '0,0'),
    securityCurrent,
    securityThresh,
    // securityMin
    ns.nFormat(sleep / 1000.0, '00:00:00'),
    threads
  );
};

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;

  // ns.disableLog('ALL');
  ns.disableLog('disableLog');
  // ns.disableLog('exec');
  ns.disableLog('kill');
  ns.disableLog('sleep');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMoneyAvailable');
  ns.clearLog();

  const sourceName = ns.getServer().hostname;

  ns.kill('miniweaken.js', sourceName);
  ns.kill('minigrow.js', sourceName);
  ns.kill('minihack.js', sourceName);

  if (!ns.args[0]) {
    ns.print('ERROR No target server give. Exiting.');
    ns.exit();
  }
  const targetName = ns.args[0];
  ns.tprintf('INFO Attacking target %s from %s', targetName, sourceName);

  let action;
  let moneyCurrent;
  let moneyMax;
  let moneyThresh;
  let securityCurrent;
  let securityMin;
  let securityThresh;
  let sleepTime;
  let threads;

  ns.printf('INFO PRIMING target server %s...', targetName);
  const pid = ns.exec('primeServer.js', sourceName, 1, targetName);
  while (ns.isRunning(pid, sourceName)) {
    await ns.sleep(SECOND);
  }

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    moneyMax = ns.getServerMaxMoney(targetName);
    moneyThresh = moneyMax * 0.9;
    moneyCurrent = ns.getServerMoneyAvailable(targetName);

    securityMin = ns.getServerMinSecurityLevel(targetName);
    securityThresh = securityMin + 1.0;
    securityCurrent = ns.getServerSecurityLevel(targetName);

    const availableRAM = ns.getServerMaxRam(sourceName) - ns.getServerUsedRam(sourceName);

    if (ns.getServerSecurityLevel(targetName) > securityThresh) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(targetName);
      const cost = ns.getScriptRam('miniweaken.js');
      const maxThreads = Math.floor(availableRAM / cost);

      const weakenDifference = securityCurrent - securityMin;
      const weakenThreads = Math.round(weakenDifference / 0.02);
      threads = Math.min(maxThreads, weakenThreads);

      if (threads > 0) {
        ns.exec('miniweaken.js', sourceName, threads, targetName);
      }
    } else if (ns.getServerMoneyAvailable(targetName) < moneyThresh) {
      action = 'grow';
      sleepTime = ns.getGrowTime(targetName);
      const cost = ns.getScriptRam('minigrow.js');
      const maxThreads = Math.floor(availableRAM / cost);
      const growPercent = getGrowPercent(ns, ns.getServer(targetName));
      const growThreads = Math.round(Math.log(2) / Math.log(growPercent));
      threads = Math.min(maxThreads, growThreads);

      if (threads > 0) {
        ns.exec('minigrow.js', sourceName, threads, targetName);
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(targetName);
      const cost = ns.getScriptRam('minihack.js');
      const maxThreads = Math.floor(availableRAM / cost);
      const hackPercent = getHackPercent(ns, ns.getServer(targetName));
      const hackThreads = Math.round(0.5 / hackPercent);
      threads = Math.min(maxThreads, hackThreads);

      if (threads > 0) {
        ns.exec('minihack.js', sourceName, threads, targetName);
      }
    }

    log(
      targetName,
      action,
      moneyCurrent,
      moneyMax,
      securityCurrent,
      securityMin,
      sleepTime,
      threads
    );

    await ns.sleep(sleepTime + 100);
  }
}
