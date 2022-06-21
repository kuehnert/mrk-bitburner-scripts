/** @type import(".").NS */
let ns = null;

import { priciestFactionAugmentation } from './helpers/augmentationHelper';
import { findFaction, simplifyName } from './helpers/factionHelper';
import { formatMoney, formatNumber } from './helpers/formatters';
import { MAPPED_ORGANISATIONS_FILE, MINUTE, SECOND } from './helpers/globals';

const audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');

const doInfiltrate = async ({ sell, location, faction, factionRealName }) => {
  if (ns.scriptRunning('infiltrate.js', 'home')) {
    await ns.sleep(10 * SECOND);
  } else {
    let result;
    if (sell) {
      const money = ns.getServerMoneyAvailable('home');
      ns.printf('Money: %s', formatMoney(ns, money));
      result = ns.run('infiltrate.js', 1, '--location', location, '--sell');
    } else {
      const rep = ns.getFactionRep(factionRealName);
      ns.printf('Faction Reputation: %s', formatNumber(ns, rep));
      result = ns.run('infiltrate.js', 1, '--location', location, '--faction', faction);
    }

    if (result === 0) {
      ns.tprintf('Something went wrong calling script. Exiting');
      ns.exit();
    }
  }
};

const infiltrateAll = async flags => {
  const orgs = Object.keys(JSON.parse(ns.read(MAPPED_ORGANISATIONS_FILE)));
  // const infiltrations = [];
  // const port = ns.getPortHandle(1);

  for (const org of orgs) {
    flags.location = simplifyName(org);
    ns.printf('infiltrating location “%s”', flags.location);
    await doInfiltrate(flags);

    // while (!port.empty()) {
    //   const response = JSON.parse(port.read());
    //   ns.printf('response: %s', JSON.stringify(response, null, 4));
    //   infiltrations.push(response);
    //   await ns.write(INFILTRATION_SUCCESS_FILE, JSON.stringify(infiltrations, null, 4), 'w');
    //   await ns.sleep(SECOND);
    // }

    // await ns.sleep(SECOND);
  }
};

const infiltrateLoop = async ({ sell, location, faction, factionRealName }) => {
  let pid = 0;
  let rep = -1;
  let priciestAug = null;
  let repReq = Number.MAX_VALUE;

  const args = ['--location', location];

  if (factionRealName) {
    rep = ns.getFactionRep(factionRealName);
    priciestAug = await priciestFactionAugmentation(ns, factionRealName, true);
    repReq = priciestAug?.repReq;
    args.push('--faction');
    args.push(faction);
  }

  if (sell || rep >= repReq) {
    args.push('--sell');
    sell = true;
  }

  while (true) {
    if (ns.isRunning(pid)) {
      await ns.sleep(10 * SECOND);
    } else {
      ns.printf('rep: %s/%s', formatNumber(ns, rep), formatNumber(ns, repReq));

      if (sell) {
        const money = ns.getServerMoneyAvailable('home');
        ns.toast('Infiltrating for money', 'info', MINUTE);
        ns.printf('Money: %s', formatMoney(ns, money));
      } else if (rep >= repReq) {
        sell = true;
        args.push('--sell');
      } else {
        rep = ns.getFactionRep(factionRealName);
        const repStr = ns.sprintf(
          'Infiltrating for %s reputation (%s/%s)',
          factionRealName,
          formatNumber(ns, rep),
          formatNumber(ns, repReq)
        );
        ns.toast(repStr, 'info', MINUTE);
        ns.printf(repStr);
      }
      pid = ns.run('infiltrate.js', 1, ...args);

      if (pid === 0) {
        ns.tprintf('Something went wrong calling script. Exiting');
        ns.exit();
      }

      await ns.sleep(10 * SECOND);
    }
  }
};

export const autocomplete = () => ['--all', '--faction', '--sell'];

export const main = async _ns => {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('run');
  ns.tail();
  ns.print('-'.repeat(50));

  const flags = ns.flags([
    ['sell', false],
    ['faction', ''],
    ['location', 'ecorp'],
    ['all', false],
  ]);

  ns.scriptKill('infiltrate.js', 'home');

  if (flags.sell) {
    flags.faction = null;
    flags.factionRealName = null;
  } else {
    if (!flags.faction || flags.faction === '') {
      ns.printf('ERROR You must specify a faction with --faction XY or --sell. Exiting.');
      ns.exit();
    }

    flags.factionRealName = findFaction(flags.faction);
  }

  if (flags.all) {
    await infiltrateAll(flags);
  } else {
    await infiltrateLoop(flags);
  }
};
