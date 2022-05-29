/** @type import(".").NS */
let ns = null;

import { formatMoney, formatNumber } from './helpers/formatters';
import { SECOND } from './helpers/globals';

const LOCATION = 'ECorp';
const FACTION = 'Tetrads';

export const autocomplete = () => ['--moneyMode'];

export const main = async _ns => {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('run');
  ns.tail();

  const flags = ns.flags([['moneyMode', false]]);

  while (true) {
    if (ns.scriptRunning('infiltrate.js', 'home')) {
      await ns.sleep(10 * SECOND);
    } else {
      const money = ns.getServerMoneyAvailable('home');
      const rep = ns.getFactionRep(FACTION);
      ns.printf('Faction Rep: %s, Money: %s', formatNumber(ns, rep), formatMoney(ns, money));

      let result;
      if (flags.moneyMode) {
        result = ns.run('infiltrate.js', 1, '--location', LOCATION, '--sell');
      } else {
        result = ns.run('infiltrate.js', 1, '--location', LOCATION, '--faction', FACTION);
      }

      if (result === 0) {
        ns.tprintf('Something went wrong calling script. Exiting');
        ns.exit();
      }
    }
  }
};
