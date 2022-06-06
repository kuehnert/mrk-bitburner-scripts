/** @type import(".").NS */
let ns = null;

import { findFaction } from './helpers/factionHelper';
import { formatMoney, formatNumber } from './helpers/formatters';
import { SECOND } from './helpers/globals';

const LOCATION = 'ecorp';
const FACTION = 'theblackhand';

export const autocomplete = () => ['--sell'];

export const main = async _ns => {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('run');
  ns.tail();

  const flags = ns.flags([
    ['sell', false],
    ['faction', FACTION],
  ]);

  const factionName = findFaction(flags.faction);

  while (true) {
    if (ns.scriptRunning('infiltrate.js', 'home')) {
      await ns.sleep(10 * SECOND);
    } else {
      const money = ns.getServerMoneyAvailable('home');
      const rep = ns.getFactionRep(factionName);
      ns.printf('Faction Rep: %s, Money: %s', formatNumber(ns, rep), formatMoney(ns, money));

      let result;
      if (flags.sell) {
        result = ns.run('infiltrate.js', 1, '--location', LOCATION, '--sell');
      } else {
        result = ns.run('infiltrate.js', 1, '--location', LOCATION, '--faction', factionName);
      }

      if (result === 0) {
        ns.tprintf('Something went wrong calling script. Exiting');
        ns.exit();
      }
    }
  }
};
