/** @type import(".").NS */
let ns = null;

const log = (
  action,
  moneyCurrent,
  moneyThresh,
  securityCurrent,
  securityThresh,
  sleep,
  threads
) => {
  ns.printf(
    '%-6s: $%sk/$%sk, security: %.0f/%.0f, %s, %d t',
    action.toUpperCase(),
    ns.nFormat(moneyCurrent / 1000.0, '0,0'),
    ns.nFormat(moneyThresh / 1000.0, '0,0'),
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
  available -= ns.getScriptRam('homeAttack.js');
  available -= ns.getScriptRam('masterAttack.js');
  available -= ns.getScriptRam('findContracts.js');

  // allow for any script in sf4 to run on top
  available -= Math.max(...otherScripts.map(f => ns.getScriptRam('/sf4/' + f)));

  available -= backgroundMode ? 32 : 0;

  ns.printf('Available Ram: %d/%d GB', available, maxRam);
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

  if (backgroundMode) {
    ns.tprintf('Running in background mode...');
  }

  const targets = getTargets();
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

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    counter = (counter + 1) % targets.length;
    target = targets[counter];

    moneyMax = ns.getServerMaxMoney(target);
    moneyThresh = moneyMax * 0.8;
    moneyCurrent = ns.getServerMoneyAvailable(target);
    securityMin = ns.getServerMinSecurityLevel(target) + 5;
    securityThresh = securityMin + 5;
    securityCurrent = ns.getServerSecurityLevel(target);
    const availableRAM = getAvailableRam(backgroundMode);

    if (ns.getServerSecurityLevel(target) > securityThresh) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(target);
      const cost = ns.getScriptRam('miniweaken.js');
      threads = Math.floor(availableRAM / cost);
      if (threads > 0) {
        ns.exec('miniweaken.js', 'home', threads, target);
      }
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      action = 'grow';
      sleepTime = ns.getGrowTime(target);
      const cost = ns.getScriptRam('minigrow.js');
      threads = Math.floor(availableRAM / cost);
      if (threads > 0) {
        ns.exec('minigrow.js', 'home', threads, target);
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(target);
      const cost = ns.getScriptRam('minihack.js');
      threads = Math.floor(availableRAM / cost);

      if (threads > 0) {
        ns.exec('minihack.js', 'home', threads, target);
      }
    }

    log(
      action,
      moneyCurrent,
      moneyThresh,
      securityCurrent,
      securityThresh,
      sleepTime,
      threads
    );

    await ns.sleep(sleepTime + 50);
  }
}
