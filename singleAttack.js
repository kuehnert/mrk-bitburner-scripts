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
  securityMin,
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
    securityMin,
    // securityMin
    ns.nFormat(sleep / 1000.0, '00:00:00'),
    threads
  );
};

const growScript = '/workers/miniGrow.js';
const hackScript = '/workers/miniHack.js';
const weakenScript = '/workers/miniWeaken.js';
const primeScript = '/workers/primeServer.js';

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;

  const flags = ns.flags([['debug', false]]);

  if (!flags.debug) {
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
  }

  const sourceName = ns.getServer().hostname;

  ns.kill(weakenScript, sourceName);
  ns.kill(growScript, sourceName);
  ns.kill(hackScript, sourceName);

  if (!ns.args[0]) {
    ns.print('ERROR No target server given. Exiting.');
    ns.exit();
  }
  const targetName = ns.args[0];
  ns.tprintf('INFO Attacking target %s from %s', targetName, sourceName);

  let action;
  let moneyCurrent;
  let moneyMax;
  let securityCurrent;
  let securityMin;
  let sleepTime;
  let threads;

  // ns.printf('INFO PRIMING target server %s...', targetName);
  // const pid = ns.exec(primeScript, sourceName, 1, targetName);
  // while (ns.isRunning(pid, sourceName)) {
  //   await ns.sleep(SECOND);
  // }

  ns.printf('INFO PRIMING target server %s...', targetName);
  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    moneyMax = ns.getServerMaxMoney(targetName);
    moneyCurrent = ns.getServerMoneyAvailable(targetName);

    securityMin = ns.getServerMinSecurityLevel(targetName);
    securityCurrent = ns.getServerSecurityLevel(targetName);

    const availableRAM =
      ns.getServerMaxRam(sourceName) - ns.getServerUsedRam(sourceName) - 10;

    if (ns.getServerMoneyAvailable(targetName) < moneyMax * 0.8) {
      action = 'grow';
      sleepTime = ns.getGrowTime(targetName);
      const cost = ns.getScriptRam(growScript, sourceName);
      const maxThreads = Math.floor(availableRAM / cost);
      const growPercent = getGrowPercent(ns, ns.getServer(targetName));
      const growThreads = Math.round(Math.log(2) / Math.log(growPercent));
      threads = Math.min(maxThreads, growThreads);

      if (threads > 0) {
        ns.exec(growScript, sourceName, threads, targetName);
      }
    } else if (ns.getServerSecurityLevel(targetName) > securityMin * 3) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(targetName);
      const cost = ns.getScriptRam(weakenScript, sourceName);
      const maxThreads = Math.floor(availableRAM / cost);

      const weakenDifference = securityCurrent - securityMin;
      const weakenThreads = Math.round(weakenDifference / 0.02);
      threads = Math.min(maxThreads, weakenThreads);

      if (threads > 0) {
        ns.exec(weakenScript, sourceName, threads, targetName);
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(targetName);
      const cost = ns.getScriptRam(hackScript, sourceName);
      const maxThreads = Math.floor(availableRAM / cost);
      const hackPercent = getHackPercent(ns, ns.getServer(targetName));
      const hackThreads = Math.floor(0.5 / hackPercent);
      threads = Math.min(maxThreads, hackThreads);

      if (threads > 0) {
        ns.exec(hackScript, sourceName, threads, targetName);
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
