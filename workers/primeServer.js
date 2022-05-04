/** @type import("..").NS */
let ns = null;

import logServerInfo, { isServerPrimed } from '/helpers/logServerInfo';
import { miniGrowScript, miniWeakenScript } from '/helpers/globals';

const runWeaken = (sourceName, targetName, weakenThreads) => {
  if (weakenThreads > 0) {
    const result = ns.exec(miniWeakenScript, sourceName, weakenThreads, targetName);

    if (result === 0) {
      ns.print('Error running weaken script. Aborting.');
      ns.exit();
    }
  }
};

const runGrow = (sourceName, targetName, growThreads) => {
  if (growThreads > 0) {
    const result = ns.exec(miniGrowScript, sourceName, growThreads, targetName);

    if (result === 0) {
      ns.print('Error running grow script. Aborting.');
      ns.exit();
    }
  }
};

const primeServer = async (sourceName, targetName) => {
  const serverMaxRam = ns.getServerMaxRam(sourceName);
  const weakenCost = ns.getScriptRam(miniWeakenScript, sourceName);
  const growCost = ns.getScriptRam(miniGrowScript, sourceName);
  let target = ns.getServer(targetName);

  while (!isServerPrimed(ns, target)) {
    logServerInfo(ns, targetName);
    let usedRam = ns.getServerUsedRam(sourceName);

    if (ns.getHostname() === 'home' && serverMaxRam > 1024) {
      // usedRam += 50; // reserve 10 GB for other scripts
      usedRam += 806; // reserve 10 GB for other scripts
    }

    const availableRam = serverMaxRam - usedRam;
    const currentSecurity = ns.getServerSecurityLevel(targetName);
    const minSecurity = ns.getServerMinSecurityLevel(targetName);
    const maxWeakenThreads = Math.floor(availableRam / weakenCost);
    const optWeakenThreads = Math.round((currentSecurity - minSecurity) / 0.02); // 1 thread weakens 2%
    const weakenThreads = Math.min(maxWeakenThreads, optWeakenThreads);

    // use all available memory for threads to grow server
    const growThreads = Math.floor((availableRam - weakenCost * weakenThreads) / growCost);

    const weakenTime = ns.getWeakenTime(targetName);
    const growTime = ns.getGrowTime(targetName);
    const waitTime = Math.max(weakenTime, growTime) + 100;
    ns.printf('running %d grow threads and %d weaken threads...', growThreads, weakenThreads);

    runWeaken(sourceName, targetName, weakenThreads);
    runGrow(sourceName, targetName, growThreads);
    await ns.asleep(waitTime);
    target = ns.getServer(targetName);
  }

  logServerInfo(ns, targetName);
};

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('exec');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('asleep');
  // ns.tail();

  const sourceName = ns.getServer().hostname;
  const targetName = ns.args[0];

  ns.printf('INFO PRIMING server %s from %s', targetName, sourceName);
  await primeServer(sourceName, targetName);
}
