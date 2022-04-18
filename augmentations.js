/** @type import(".").NS */
let ns = null;
let _augmentations = null;

const joinInvitations = () => {
  const invites = ns.checkFactionInvitations();

  for (const invite of invites) {
    ns.joinFaction(invite);
  }
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

    return _augmentations;
  }
};

const affordable = () => {
  const myMoney = ns.getServerMoneyAvailable('home');
  return Object.values(getAugmentations()).filter(
    a => !a.purchased && a.price <= myMoney
  );
};



export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('asleep');
  ns.clearLog();
  ns.tail();

  // const augmentations = getAugmentations();
  // ns.printf('augmentations: %s', JSON.stringify(augmentations, null, 4));



  ns.printf('affordable: %s', JSON.stringify(affordable(), null, 4));
}
