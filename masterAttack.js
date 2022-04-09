/** @type import(".").NS */
// $185.007m / sec
let ns = null;

const getAttackers = () => {
  const attackers = JSON.parse(ns.read('/data/servers.txt')).filter(
    s => s.isRoot && s.ram >= 4
  );

  const myServers = ns.getPurchasedServers().map(name => ({
    name,
    ram: ns.getServerMaxRam(name),
  }));
  // myServers.push({ name: 'home', ram: ns.getServerMaxRam('home') });

  return attackers.concat(myServers);
};

const getTargets = () => {
  return JSON.parse(ns.read('/data/targets.txt')).slice(0, 4);
};

const log = (
  action,
  target,
  moneyCurrent,
  moneyThresh,
  securityCurrent,
  securityThresh,
  sleep
) => {
  ns.printf(
    '%-15s, %-6s: $%sk/$%sk, security: %.0f/%.0f, %s',
    target,
    action.toUpperCase(),
    ns.nFormat(moneyCurrent / 1000.0, '0,0'),
    ns.nFormat(moneyThresh / 1000.0, '0,0'),
    // ns.nFormat(moneyMax / 1000.0, '0,0'),
    securityCurrent,
    securityThresh,
    // securityMin
    ns.nFormat(sleep / 1000.0, '00:00:00')
  );
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('getServerUsedRam');
  ns.disableLog('sleep');
  ns.disableLog('ALL');

  const targets = getTargets();
  ns.tprintf('targets: %s', targets);

  const attackers = getAttackers();
  // ns.tprintf('attackers: %s', JSON.stringify(attackers, null, 4));

  let moneyMax;
  let moneyThresh;
  let securityMin;
  let securityThresh;
  let moneyCurrent;
  let securityCurrent;
  let sleepTime;
  let action;
  let target;
  let counter = 0;

  while (true) {
    counter = (counter + 1) % targets.length;
    target = targets[counter];
    // Defines how much money a server should have before we hack it
    // In this case, it is set to 75% of the server's max money
    // var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    // const moneyMax = ns.getServerMaxMoney(target);
    // const moneyThresh = moneyMax * 0.8;
    moneyMax = ns.getServerMaxMoney(target);
    moneyThresh = moneyMax * 0.8;
    moneyCurrent = ns.getServerMoneyAvailable(target);
    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    // const securityMin = ns.getServerMinSecurityLevel(target) + 5;
    // const securityThresh = securityMin + 5;
    securityMin = ns.getServerMinSecurityLevel(target) + 5;
    securityThresh = securityMin + 5;
    securityCurrent = ns.getServerSecurityLevel(target);

    if (securityCurrent > securityThresh) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(target);
      const cost = ns.getScriptRam('miniweaken.js');

      for (const attacker of attackers) {
        const attackerName = attacker.name;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec('miniweaken.js', attackerName, threads, target);
        }
      }
    } else if (moneyCurrent < moneyThresh) {
      action = 'grow';
      sleepTime = ns.getGrowTime(target);
      const cost = ns.getScriptRam('minigrow.js');

      for (const attacker of attackers) {
        const attackerName = attacker.name;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec('minigrow.js', attackerName, threads, target);
        }
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(target);
      const cost = ns.getScriptRam('minihack.js');

      for (const attacker of attackers) {
        const attackerName = attacker.name;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec('minihack.js', attackerName, threads, target);
        }
      }
    }

    // ns.printf('%-6s %s, sleep %.0fs', action, target, sleepTime / 1000);
    log(
      action,
      target,
      moneyCurrent,
      moneyThresh,
      securityCurrent,
      securityThresh,
      sleepTime
    );
    await ns.sleep(sleepTime + 100);
  }
}
