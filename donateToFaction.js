/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';
import { formatNumber } from './helpers/formatters';

const MILLION = 1000000;
const KILO = 1000;

const calcAmountFromString = str => {
  const lastChar = str.slice(-1);
  const rest = str.slice(0, -1);

  if (lastChar === 'm') {
    return +rest * MILLION;
  } else if (lastChar === 'k') {
    return +rest * KILO;
  } else {
    return +str;
  }
};

export async function main(_ns) {
  ns = _ns;

  const player = ns.getPlayer();
  const reputationMultiplier = player.faction_rep_mult;
  const myMoney = player.money;

  const faction = ns.args[0];
  const targetRepStr = ns.args[1];
  const targetRep = calcAmountFromString(targetRepStr);

  const currentRep = ns.getFactionRep(faction);
  const difference = targetRep - currentRep;

  const requiredDonation = Math.round((difference * MILLION) / reputationMultiplier);

  if (requiredDonation <= 0) {
    ns.tprint('INFO You already have that much reputation: %s', formatNumber(ns, currentRep));
  } else if (myMoney > requiredDonation) {
    ns.donateToFaction(faction, requiredDonation);
    ns.tprintf('SUCCESS donated required amount: %s', formatMoney(ns, requiredDonation));
  } else {
    ns.tprintf(
      "WARN you can't afford the required donation: %s/%s",
      formatMoney(ns, myMoney),
      formatMoney(ns, requiredDonation)
    );
  }
}
