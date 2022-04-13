/** @type import("..").NS */
let ns = null;

import { formatMoney } from '/helpers/formatters';

let _augmentations = null;

const formatAugmentation = ({ name, price, reputationRequired }, factionRep) => {
  return ns.sprintf('%s, %s, %d/%d', name, formatMoney(price), reputationRequired, factionRep);
};

const getAugmentations = () => {
  if (_augmentations != null) {
    return _augmentations;
  } else {
    _augmentations = {};
    const ownedAugmentations = ns.getOwnedAugmentations(true);
    const installedAugmentations = ns.getOwnedAugmentations(false);
    const player = ns.getPlayer();
    const factions = player.factions;

    for (const faction of factions) {
      const factionAugmentations = ns.getAugmentationsFromFaction(faction);

      for (const fa of factionAugmentations) {
        const aug = _augmentations[fa] ?? { name: fa };
        aug.prerequisites = ns.getAugmentationPrereq(fa);
        aug.price = ns.getAugmentationPrice(fa);
        aug.reputationRequired = ns.getAugmentationRepReq(fa);
        aug.stats = ns.getAugmentationStats(fa);
        aug.factions ??= [];
        aug.factions.push(faction);
        aug.purchased = ownedAugmentations.includes(fa);
        aug.installed = installedAugmentations.includes(fa);
        _augmentations[fa] = aug;
      }
    }

    // ns.printf('_augmentations: %s', JSON.stringify(_augmentations, null, 4));
    return _augmentations;
  }
};

const affordable = () => {
  const myMoney = ns.getServerMoneyAvailable('home');
  const augsArray = Object.values(getAugmentations());
  ns.printf('augsArray: %s', JSON.stringify(augsArray, null, 4));

  return augsArray.filter(a => !a.purchased && a.price <= myMoney);
};

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

  const augmentations = Object.values(getAugmentations()).filter(
    a => a.factions.includes(faction) && !a.purchased
  );

  if (augmentations.length === 0) {
    return true;
  } else {
    // Separate Augmentations into purchasable and not purchasable
    const factionRep = ns.getFactionRep(faction);
    const purchasable = augmentations.filter(
      a => a.price <= ns.getServerMoneyAvailable('home') && a.reputationRequired <= factionRep
    );
    const needed = augmentations.filter(a => !purchasable.includes(a));

    // ns.printf('ns.getPlayer(): %s', JSON.stringify(ns.getPlayer(), null, 4));
    ns.printf(
      'purchasable:\n%s',
      purchasable.map(a => formatAugmentation(a, factionRep)).join('\n')
    );
    ns.printf('needed:\n%s', needed.map(a => formatAugmentation(a, factionRep)).join('\n'));
    ns.exit();

    return false;
  }
}
