/** @type import(".").NS */
let ns = null;

import { formatMoney, SECOND } from '/helpers/formatters';

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
    formatMoney(moneyCurrent),
    formatMoney(moneyMax),
    // ns.nFormat(moneyMax / 1000.0, '0,0'),
    securityCurrent,
    securityThresh,
    // securityMin
    ns.nFormat(sleep / 1000.0, '00:00:00'),
    threads
  );
};

const getTargets = () => {
  const array = JSON.parse(ns.read('/data/targets.txt'));
  array.push(array.shift());
  return array;
};

const getAvailableRam = (backgroundMode = false) => {
  const otherScripts = [
    'augmentations.js',
    'backdoors.js',
    'buyPrograms.js',
    'crime.js',
    'study.js',
    'work.js',
  ];
  const maxRam = ns.getServerMaxRam('home');

  let available = maxRam;
  // available -= ns.getServerUsedRam('home');
  available -= ns.getScriptRam('doMilestones.js');
  available -= ns.getScriptRam('findContracts.js');
  available -= ns.getScriptRam('homeAttack.js');
  available -= ns.getScriptRam('masterAttack.js');
  available -= ns.getScriptRam('scanServers.js');

  // allow for any script in sf4 to run on top
  available -= Math.max(...otherScripts.map(f => ns.getScriptRam('/sf4/' + f)));

  available -= backgroundMode ? 32 : 0;

  // ns.printf('Available Ram: %d/%d GB', available, maxRam);
  return Math.max(0, available);
};

export async function main(_ns) {
  ns = _ns;

  ns.disableLog('ALL');
  ns.clearLog();
  ns.kill('miniweaken.js', 'home');
  ns.kill('minigrow.js', 'home');
  ns.kill('minihack.js', 'home');

  const backgroundMode = ns.args[0] === 'bg';
  let targets;

  if (backgroundMode) {
    ns.tprintf('Running in background mode...');
  } else if (ns.args) {
    targets = ns.args;
  } else {
    targets = getTargets();
  }

  ns.tprintf('targets: %s', targets);

  let action;
  let counter = 0;
  let moneyCurrent;
  let moneyMax;
  let moneyThresh;
  let securityCurrent;
  let securityMin;
  let securityThresh;
  let sleepTime;
  let target;
  let threads;

  for (const targetName of targets) {
    ns.printf('INFO PRIMING server %s...', targetName);
    const pid = ns.run('primeServer.js', 1, targetName);
    while (ns.isRunning(pid)) {
      await ns.sleep(SECOND);
    }
  }

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    counter = (counter + 1) % targets.length;
    target = targets[counter];

    moneyMax = ns.getServerMaxMoney(target);
    moneyThresh = moneyMax * 0.9;
    moneyCurrent = ns.getServerMoneyAvailable(target);

    securityMin = ns.getServerMinSecurityLevel(target);
    securityThresh = securityMin + 1.0;
    securityCurrent = ns.getServerSecurityLevel(target);

    const availableRAM = getAvailableRam(backgroundMode);

    if (ns.getServerSecurityLevel(target) > securityThresh) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(target);
      const cost = ns.getScriptRam('miniweaken.js');
      const maxThreads = Math.floor(availableRAM / cost);

      // const weakenThreads = Math.round((growThreads / 0.05) * 0.002); // 1 grow increases security by 0.05, 1 weaken reduces 0.02
      const weakenDifference = securityCurrent - securityMin;
      const weakenThreads = Math.round(weakenDifference / 0.02);
      threads = Math.min(maxThreads, weakenThreads);

      if (threads > 0) {
        ns.exec('miniweaken.js', 'home', threads, target);
      }
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      action = 'grow';
      sleepTime = ns.getGrowTime(target);
      const cost = ns.getScriptRam('minigrow.js');
      const maxThreads = Math.floor(availableRAM / cost);

      const growPercent = ns.formulas.hacking.growPercent(ns.getServer(target), 1, ns.getPlayer());
      threads = Math.min(maxThreads, Math.round(Math.log(2) / Math.log(growPercent)));

      if (threads > 0) {
        ns.exec('minigrow.js', 'home', threads, target);
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(target);
      const cost = ns.getScriptRam('minihack.js');
      const maxThreads = Math.floor(availableRAM / cost);
      const hackPercent = ns.formulas.hacking.hackPercent(ns.getServer(target), ns.getPlayer());
      threads = Math.min(maxThreads, Math.round(0.5 / hackPercent));

      if (threads > 0) {
        ns.exec('minihack.js', 'home', threads, target);
      }
    }

    log(target, action, moneyCurrent, moneyMax, securityCurrent, securityMin, sleepTime, threads);

    await ns.sleep(sleepTime + 100);
  }
}
