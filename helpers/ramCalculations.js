/** @type import("..").NS */
let ns = null;

import { getGrowPercent, getHackPercent, hasFormulas } from 'helpers/fakeFormulas';
import { miniGrowScript, miniHackScript, miniWeakenScript, BUFFER } from 'helpers/globals';

export const simulatePrimedServer = (ns, serverName, percentage = 1.0) => {
  const serverData = ns.getServer(serverName);
  serverData.moneyAvailable = percentage * serverData.moneyMax;
  serverData.hackDifficulty = ns.getServerMinSecurityLevel(serverName);
  return serverData;
};

/**
 * calculates the number of grow threads for a primed server that has lost a known percentage of its max money
 * so the server recovers its maximum money
 * @param {*} serverName the name of the target server
 * @param {*} percentage the percentage of server's max money assumed to be hacked away
 * @returns tbe number of grow threads
 */
export const calcGrowThreads = (ns, serverName, percentage = 0.5) => {
  const serverData = simulatePrimedServer(ns, serverName, percentage);
  const growPercent = getGrowPercent(ns, serverData, 1, ns.getPlayer());

  return Math.round(Math.log(2) / Math.log(growPercent));
};

/**
 * calculates the number of hack threads needed to bring server from maximum to 50% of the money
 */
export const calcHackThreads = (ns, serverName, percentage = 0.5) => {
  const serverData = simulatePrimedServer(ns, serverName);
  const hackPercent = getHackPercent(ns, serverData, ns.getPlayer(), true);

  return Math.floor(percentage / hackPercent);
};

export const calcWeakenThreads = (ns, serverName, percentage = 0.5) => {
  // 1 grow increases security by 0.05, 1 weaken reduces 0.02
  const hackDamage = calcHackThreads(ns, serverName, percentage) * 0.002;
  const growDamage = calcGrowThreads(ns, serverName, percentage) * 0.004;
  const weakenDifference = hackDamage + growDamage;

  // ns.printf('hackDamage: %s', JSON.stringify(hackDamage, null, 4));
  // ns.printf('growDamage: %s', JSON.stringify(growDamage, null, 4));
  // ns.printf('weakenDifference: %s', JSON.stringify(weakenDifference, null, 4));
  return Math.round(weakenDifference / 0.02);
};

const calcScriptRamCost = (ns, script, threads) => {
  return ns.getScriptRam(script) * threads;
};

const calcServerRamSize = ramNeeded => {
  const exponent = Math.ceil(Math.log2(ramNeeded));
  return Math.pow(2, exponent);
};

export const calcMaxThreads = (_ns, sourceName) => {
  ns = _ns;
  let availableRam = (ns.getServerMaxRam(sourceName) - ns.getServerUsedRam(sourceName)) / 3.0;

  if (sourceName === 'home' && ns.getServerMaxRam(sourceName) >= 64) {
    availableRam -= 20; // buffer for other scripts
  }

  return {
    growThreads: Math.floor(availableRam / ns.getScriptRam(miniGrowScript)),
    hackThreads: Math.floor(availableRam / ns.getScriptRam(miniHackScript)),
    weakenThreads: Math.floor(availableRam / ns.getScriptRam(miniWeakenScript)),
  };
};

export const calcPossibleThreads = (_ns, targetName) => {
  ns = _ns;
  let threads = {
    growThreads: calcGrowThreads(ns, targetName),
    hackThreads: calcHackThreads(ns, targetName),
    weakenThreads: calcWeakenThreads(ns, targetName),
  };

  let totalThreads = threads.growThreads + threads.hackThreads + threads.weakenThreads;
  const sourceName = ns.getHostname();

  let availableRam = ns.getServerMaxRam(sourceName) - ns.getServerUsedRam(sourceName);
  if (sourceName === 'home') {
    availableRam -= 10; // Deduct 10 GB for other scripts
  }

  const possibleTotalThreads = availableRam / ns.getScriptRam(miniGrowScript);
  const possibleRatio = possibleTotalThreads / totalThreads;

  if (possibleRatio < 1) {
    threads.growThreads = Math.floor(possibleRatio * threads.growThreads);
    threads.hackThreads = Math.floor(possibleRatio * threads.hackThreads);
    threads.weakenThreads = Math.floor(possibleRatio * threads.weakenThreads);
  }

  return threads;
};

export const calcTotalRamCost = (ns, targetName, shifts = 1) => {
  const growThreads = calcGrowThreads(ns, targetName);
  const hackThreads = calcHackThreads(ns, targetName);
  const weakenThreads = calcWeakenThreads(ns, targetName);

  const growRam = calcScriptRamCost(ns, miniGrowScript, growThreads) * shifts;
  const hackRam = calcScriptRamCost(ns, miniHackScript, hackThreads) * shifts;
  const weakenRam = calcScriptRamCost(ns, miniWeakenScript, weakenThreads) * shifts;
  const maxRam = Math.max(growRam, hackRam, weakenRam);

  const mainScriptRam = ns.getScriptRam('multiAttack.js');
  const ramRequired = mainScriptRam + maxRam;
  const serverSizeRequired = calcServerRamSize(ramRequired);
  const parallelRamRequired = mainScriptRam + growRam + hackRam + weakenRam;
  const parallelServerSizeRequired = calcServerRamSize(parallelRamRequired);

  return {
    growThreads,
    hackThreads,
    weakenThreads,
    growRam,
    hackRam,
    weakenRam,
    ramRequired,
    serverSizeRequired,
    parallelRamRequired,
    parallelServerSizeRequired,
  };
};

export const calcAttackTimes = (_ns, serverName) => {
  ns = _ns;
  const serverData = simulatePrimedServer(ns, serverName);
  const player = ns.getPlayer();

  if (hasFormulas(ns)) {
    return {
      growTime: Math.round(ns.formulas.hacking.growTime(serverData, player)),
      hackTime: Math.round(ns.formulas.hacking.hackTime(serverData, player)),
      weakenTime: Math.round(ns.formulas.hacking.weakenTime(serverData, player)),
    };
  } else {
    return {
      growTime: Math.round(ns.getGrowTime(serverName)),
      hackTime: Math.round(ns.getHackTime(serverName)),
      weakenTime: Math.round(ns.getWeakenTime(serverName)),
    };
  }
};

export const calcAttackDelays = ({ growTime, hackTime, weakenTime }) => {
  let delays = {
    growDelay: weakenTime - BUFFER - growTime,
    hackDelay: weakenTime - 2 * BUFFER - hackTime,
    weakenDelay: 0, // assume weaken always takes longest
    sleepTime: weakenTime + BUFFER,
  };

  if (delays.growDelay < 0) {
    delays = {
      growDelay: 0,
      hackDelay: delays.hackDelay + -delays.growDelay,
      weakenDelay: delays.weakenDelay + -delays.growDelay,
      sleepTime: delays.sleepTime + -delays.growDelay,
    };
  }

  if (delays.hackDelay < 0) {
    delays = {
      growDelay: delays.growDelay + -delays.hackDelay,
      hackDelay: 0,
      weakenDelay: delays.weakenDelay + -delays.hackDelay,
      sleepTime: delays.sleepTime + -delays.hackDelay,
    };
  }

  if (delays.weakenDelay < 0) {
    delays = {
      growDelay: delays.growDelay + -delays.weakenDelay,
      hackDelay: delays.hackDelay + -delays.weakenDelay,
      weakenDelay: 0,
      sleepTime: delays.sleepTime + delays.weakenDelay,
    };
  }

  return delays;
};

export const calcMaxShifts = (_ns, serverName) => {
  const times = calcAttackTimes(_ns, serverName);
  const { sleepTime } = calcAttackDelays(times);
  return Math.floor(sleepTime / BUFFER);
};
