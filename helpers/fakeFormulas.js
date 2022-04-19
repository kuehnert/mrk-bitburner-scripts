// sources:
// https://github.com/danielyxie/bitburner/blob/23baae56cf430f002e806e953681998decff22da/src/NetscriptFunctions/Formulas.ts
// source: https://github.com/danielyxie/bitburner/blob/23baae56cf430f002e806e953681998decff22da/src/Server/formulas/grow.ts#L6
// https://github.com/danielyxie/bitburner/blob/23baae56cf430f002e806e953681998decff22da/src/Constants.ts
// https://github.com/danielyxie/bitburner/blob/23baae56cf430f002e806e953681998decff22da/src/BitNode/BitNodeMultipliers.ts

export const hasFormulas = ns => ns.fileExists('Formulas.exe', 'home');

export const getGrowPercent = (ns, serverData, threads = 1, player = ns.getPlayer()) => {
  if (hasFormulas(ns)) {
    return ns.formulas.hacking.growPercent(serverData, threads, player, ns.getServer().cpuCores);
  } else {
    return myGrowPercent(serverData, threads, player);
  }
};

export const getHackPercent = (ns, serverData, player = ns.getPlayer()) => {
  if (hasFormulas(ns)) {
    return ns.formulas.hacking.hackPercent(serverData, player);
  } else {
    return myHackPercent(serverData, player) / 5; // BAD HACK
  }
};

/**
 * Returns the percentage of money that will be stolen from a server if
 * it is successfully hacked (returns the decimal form, not the actual percent value)
 * source:
 */
export function myHackPercent(server, player) {
  // Adjust if needed for balancing. This is the divisor for the final calculation
  const balanceFactor = 240;

  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking;
  const percentMoneyHacked =
    (difficultyMult * skillMult * player.hacking_money_mult * BitNodeMultipliers.ScriptHackMoney) /
    balanceFactor;

  if (percentMoneyHacked < 0) {
    return 0;
  }
  if (percentMoneyHacked > 1) {
    return 1;
  }

  return percentMoneyHacked;
}

export function myGrowPercent(server, threads, player, cores = 1) {
  const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

  //Get adjusted growth rate, which accounts for server security
  const growthRate = CONSTANTS.ServerBaseGrowthRate;
  let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
  if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
    adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;
  }

  //Calculate adjusted server growth rate based on parameters
  const serverGrowthPercentage = server.serverGrowth / 100;
  const numServerGrowthCyclesAdjusted =
    numServerGrowthCycles * serverGrowthPercentage * BitNodeMultipliers.ServerGrowthRate;

  //Apply serverGrowth for the calculated number of growth cycles
  const coreBonus = 1 + (cores - 1) / 16;

  return Math.pow(
    adjGrowthRate,
    numServerGrowthCyclesAdjusted * player.hacking_grow_mult * coreBonus
  );
}

const CONSTANTS = {
  ServerBaseGrowthRate: 1.03, // Unadjusted Growth rate
  ServerMaxGrowthRate: 1.0035, // Maximum possible growth rate (max rate accounting for server security)
};

const BitNodeMultipliers = {
  ScriptHackMoney: 1,
  ServerGrowthRate: 1,
};
