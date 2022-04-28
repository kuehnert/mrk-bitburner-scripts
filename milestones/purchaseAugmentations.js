/** @type import("..").NS */
/*
let ns = null;

import { formatMoney } from '/helpers/formatters';

export default async function purchaseAugmentations(_ns, faction) {
  ns = _ns;
  ns.disableLog('getServerMoneyAvailable');

  if (!ns.getPlayer().factions.includes(faction)) {
    ns.printf(
      "Cannot buy augmentations from faction %s because we're not a member. Exiting.",
      faction
    );
    ns.exit();
  }

  const augmentations = Object.values(getAugmentations())
    .filter(a => a.factions.includes(faction) && !a.purchased)
    .sort((a, b) => b.price - a.price);

  if (augmentations.length === 0) {
    return true;
  } else {
    // Separate Augmentations into purchasable and not purchasable
    const factionRep = ns.getFactionRep(faction);
    const purchasable = augmentations.filter(
      a =>
        a.price <= ns.getServerMoneyAvailable('home') &&
        a.reputationRequired <= factionRep
    );
    const needed = augmentations.filter(a => !purchasable.includes(a));

    ns.printf(
      'INFO Augmentations from %s: %d purchasable, %d out-of-reach now, %d total.',
      faction,
      purchasable.length,
      needed.length,
      augmentations.length
    );

    ns.printf(
      'purchasable:\n%s',
      purchasable.map(a => formatAugmentation(a, factionRep)).join('\n')
    );
    ns.printf(
      'not purchasable:\n%s',
      needed.map(a => formatAugmentation(a, factionRep)).join('\n')
    );

    // assuming that the most expensive contracts appear last, wait and grow money until all augmentations are purchasable
    if (needed.length > 0) {
      ns.print(
        'WARN The cannot purchase all augmentations right now. Wating for more money/reputation'
      );
      return false;
    }

    // buy the most expensive augmentation
    const augName = purchasable[0].name;
    ns.printf(
      'INFO Purchasing %s from faction %s for %s...',
      augName,
      faction,
      formatMoney(ns, purchasable[0].price)
    );
    const result = ns.purchaseAugmentation(faction, augName);

    return result && purchasable.length === 1;
  }
}
*/

/** @type import("..").NS */
let ns = null;

const isDone = ({program}) => ns.fileExists(program, 'home');

const checkPreReqs = ({program}) => PRICES[program] <= ns.getServerMoneyAvailable('home');

const perform = ({program}) => ns.purchaseProgram(program);

export default async function main(_ns, params) {
  ns = _ns;

  if (params.checkIsDone) {
    return isDone(params);
  } else if (params.checkPreReqs) {
    return checkPreReqs(params);
  } else {
    return perform(params);
  }
}
