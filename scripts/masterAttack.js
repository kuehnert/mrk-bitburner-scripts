/** @type import(".").NS */
let ns = null;

import { getHackedServers, getViableTargets } from '/helpers/getServers';

const hackScript = '/workers/miniHack.js';
const growScript = '/workers/miniGrow.js';
const weakenScript = '/workers/miniWeaken.js';

const dependencies = [growScript, hackScript, weakenScript];

const getAttackers = async () => {
  return (await getHackedServers(ns, false)).filter(s => s.isRoot && s.ram >= 4);
};

const getTargetNames = async () => {
  return (await getViableTargets(ns)).slice(0, 1).map(s => s.hostname);
};

const log = (action, target, moneyCurrent, moneyThresh, securityCurrent, securityThresh, sleep) => {
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

export const autocomplete = data => [...data.servers];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scp');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerNumPortsRequired');
  ns.disableLog('sleep');
  ns.disableLog('ALL');
  // ns.tail();

  const attackers = await getAttackers();
  let targetNames;
  if (ns.args[0]) {
    targetNames = [ns.args[0]];
  } else {
    targetNames = await getTargetNames();
  }

  ns.printf('INFO Attacking target(s): %s', targetNames.join(', '));
  ns.printf('INFO Attacking sources(s): %s', attackers.map(s => s.hostname).join(', '));

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

  for (const attacker of attackers) {
    const attackerName = attacker.hostname;
    await ns.scp(dependencies, attackerName);
  }

  while (true) {
    counter = (counter + 1) % targetNames.length;
    target = targetNames[counter];
    moneyMax = ns.getServerMaxMoney(target);
    moneyThresh = moneyMax * 0.7;
    moneyCurrent = ns.getServerMoneyAvailable(target);
    securityMin = ns.getServerMinSecurityLevel(target);
    securityThresh = securityMin * 3;
    securityCurrent = ns.getServerSecurityLevel(target);

    if (securityCurrent > securityThresh) {
      action = 'weaken';
      sleepTime = ns.getWeakenTime(target);
      const cost = ns.getScriptRam(weakenScript);

      for (const attacker of attackers) {
        const attackerName = attacker.hostname;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec(weakenScript, attackerName, threads, target);
        }
      }
    } else if (moneyCurrent < moneyThresh) {
      action = 'grow';
      sleepTime = ns.getGrowTime(target);
      const cost = ns.getScriptRam(growScript);

      for (const attacker of attackers) {
        const attackerName = attacker.hostname;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec(growScript, attackerName, threads, target);
        }
      }
    } else {
      action = 'hack';
      sleepTime = ns.getHackTime(target);
      const cost = ns.getScriptRam(hackScript);

      for (const attacker of attackers) {
        const attackerName = attacker.hostname;
        const attackerRAM = attacker.ram - ns.getServerUsedRam(attackerName);
        const threads = Math.floor(attackerRAM / cost);

        if (threads > 0) {
          ns.exec(hackScript, attackerName, threads, target);
        }
      }
    }

    // ns.printf('%-6s %s, sleep %.0fs', action, target, sleepTime / 1000);
    log(action, target, moneyCurrent, moneyMax, securityCurrent, securityMin, sleepTime);
    await ns.sleep(sleepTime + 100);
  }
}
