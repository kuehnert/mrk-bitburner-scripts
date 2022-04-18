import { getGrowPercent, getHackPercent } from '/helpers/fakeFormulas';

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
  const growPercent = getGrowPercent(ns, serverData);

  return Math.round(Math.log(2) / Math.log(growPercent));
};

/**
 * calculates the number of hack threads needed to bring server from maximum to 50% of the money
 */
export const calcHackThreads = (ns, serverName, percentage = 0.5) => {
  const serverData = simulatePrimedServer(ns, serverName);
  const hackPercent = getHackPercent(ns, serverData);

  return Math.round(percentage / hackPercent);
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

export const calcTotalRamCost = (ns, serverName) => {
  const growThreads = calcGrowThreads(ns, serverName);
  const hackThreads = calcHackThreads(ns, serverName);
  const weakenThreads = calcWeakenThreads(ns, serverName);

  const growRam = calcScriptRamCost(ns, 'minigrow.js', growThreads);
  const hackRam = calcScriptRamCost(ns, 'minihack.js', hackThreads);
  const weakenRam = calcScriptRamCost(ns, 'miniweaken.js', weakenThreads);
  const maxRam = Math.max(growRam, hackRam, weakenRam);

  const mainScriptRam = ns.getScriptRam('singleAttack.js');
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

export const calcAttackTimes = (ns, serverName) => {
  const serverData = simulatePrimedServer(ns, serverName);
  const player = ns.getPlayer();

  return {
    growTime:   Math.round(ns.formulas.hacking.growTime(serverData, player)),
    hackTime:   Math.round(ns.formulas.hacking.hackTime(serverData, player)),
    weakenTime: Math.round(ns.formulas.hacking.weakenTime(serverData, player)),
  };
};
