/** @type import(".").NS */
let ns = null;

import { findFaction, FACTION_INPUT_NAMES } from 'helpers/factionHelper';
import { formatMoney, formatNumber, amountFromString } from './helpers/formatters';

const MILLION = 1000000;
const KILO = 1000;

export const autocomplete = () => [...FACTION_INPUT_NAMES];

export async function main(_ns) {
  ns = _ns;

  const player = ns.getPlayer();
  const reputationMultiplier = player.faction_rep_mult;
  const myMoney = player.money;

  const faction = findFaction(ns.args[0]);
  if (!faction) {
    ns.tprint("Invalid faction '%s'. Exiting.", ns.args[0]);
    ns.exit();
  }

  const targetRepStr = ns.args[1];
  const targetRep = amountFromString(targetRepStr);

  const favor = ns.getFactionFavor(faction);
  if (favor < 150) {
    ns.tprintf('ERROR Your favour for %s is too low to donate (%d/150). Exiting.', faction, favor);
    ns.exit();
  }

  const currentRep = ns.getFactionRep(faction);
  const difference = targetRep - currentRep;

  const requiredDonation = Math.round((difference * MILLION) / reputationMultiplier);

  if (requiredDonation <= 0) {
    ns.tprint('INFO You already have that much reputation: %s', formatNumber(ns, currentRep));
  } else if (myMoney > requiredDonation) {
    const success = ns.donateToFaction(faction, requiredDonation);
    if (success) {
      ns.tprintf('SUCCESS donated required amount: %s', formatMoney(ns, requiredDonation));
    } else {
      ns.tprintf("ERROR donating %s to %s didn't work.", formatMoney(ns, requiredDonation), faction);
    }
  } else {
    ns.tprintf(
      "WARN you can't afford the required donation: %s/%s",
      formatMoney(ns, myMoney),
      formatMoney(ns, requiredDonation)
    );
  }
}
