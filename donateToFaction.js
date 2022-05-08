/** @type import(".").NS */
let ns = null;

import { findFaction, FACTION_INPUT_NAMES } from 'helpers/factionHelper';
import { priciestFactionAugmentation } from './helpers/augmentationHelper';
import { formatMoney, formatNumber, amountFromString } from './helpers/formatters';
import { MILLION } from './helpers/globals';

const calcDonation = (faction, targetReputation) => {
  const player = ns.getPlayer();
  const reputationMultiplier = player.faction_rep_mult;
  const currentRep = ns.getFactionRep(faction);
  const difference = targetReputation - currentRep;
  const requiredDonation = Math.round((difference * MILLION) / reputationMultiplier);

  return requiredDonation;
};

const donate = (faction, amount) => {
  const success = ns.donateToFaction(faction, amount);
  if (success) {
    ns.tprintf('SUCCESS donated required amount: %s', formatMoney(ns, amount));
  } else {
    ns.tprintf("ERROR donating %s to %s didn't work.", formatMoney(ns, amount), faction);
  }
};

export const autocomplete = () => [...FACTION_INPUT_NAMES, '--donate', '--target'];

export async function main(_ns) {
  ns = _ns;

  const flags = ns.flags([
    ['target', null],
    ['donate', false],
  ]);

  const faction = findFaction(ns.args[0]);
  if (!faction) {
    ns.tprint("Invalid faction '%s'. Exiting.", ns.args[0]);
    ns.exit();
  }

  const favor = ns.getFactionFavor(faction);
  if (favor < 150) {
    ns.tprintf('ERROR Your favour for %s is too low to donate (%d/150). Exiting.', faction, favor);
    ns.exit();
  }

  let targetRep;
  if (flags.target) {
    const targetRepStr = flags.target;
    targetRep = amountFromString(targetRepStr);
  } else {
    // if no target given, find priciest purchasble augmentation from faction
    const augmentation = priciestFactionAugmentation(ns, faction);
    if (!augmentation) {
      ns.tprint(
        'ERROR You did not specify a reputation target, and there is no more augmentation to purchase from this faction. Exiting.'
      );
      ns.exit();
    }

    const { name, reputationRequired } = augmentation;
    ns.tprintf(
      'Setting target reputation to necessary value to purchase %s: %s',
      name,
      formatNumber(ns, reputationRequired)
    );
    targetRep = reputationRequired;
  }

  const requiredDonation = calcDonation(faction, targetRep);
  const myMoney = ns.getServerMoneyAvailable('home');
  const affordable = myMoney >= requiredDonation;
  const marker = affordable ? 'INFO' : 'WARN';

  if (requiredDonation <= 0) {
    ns.tprint('INFO You already have %s reputation from %s', formatNumber(ns, targetRep), faction);
    ns.exit();
  }

  ns.tprintf(
    '%s You need to donate %s/%s to %s to achieve %s reputation.',
    marker,
    formatMoney(ns, requiredDonation),
    formatMoney(ns, myMoney),
    faction,
    formatNumber(ns, targetRep)
  );

  if (flags.donate && affordable) {
    donate(faction, requiredDonation);
  }
}
