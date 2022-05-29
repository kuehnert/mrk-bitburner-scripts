/** @type import(".").NS */
let ns = null;

import { getAugmentations } from './helpers/augmentationHelper';
import { getFactionsMap } from './helpers/factionHelper';
import { formatNumber, formatMoney } from './helpers/formatters';
import { hprint } from './helpers/hprint';

const logAugmentation = ({ name, price, reputationRequired, factionNames, purchased, installed }, factions) => {
  let prefix = ' ';
  if (installed) {
    prefix = 'I';
  } else if (purchased) {
    prefix = 'P';
  }

  const factionStr = factionNames
    .map(fs => {
      const f = factions[fs];
      return f.rep >= reputationRequired ? `S~${fs}~` : `${fs} (${formatNumber(ns, f.rep)})`;
    })
    .join(', ');

  const seller = factionNames.find(fn => factions[fn].rep >= reputationRequired);
  const buyButton = seller ? ns.sprintf("[BUY]!do ns.purchaseAugmentation(\\'%s\\', \\'%s\\')!", seller, name) : '   ';

  hprint(
    ns,
    '%s %-55s %s %s %s %s',
    prefix,
    name,
    formatMoney(ns, price, { markAffordable: true }),
    formatNumber(ns, reputationRequired),
    // ns.sprintf('[BUY](do ns.purchaseAugmentation(%s, %s)', name, name),
    buyButton,
    factionStr
  );
};

export async function main(_ns) {
  ns = _ns;
  // ns.clearLog();
  // ns.tail();

  const flags = ns.flags([['includePurchased', false]]);
  const allFactions = await getFactionsMap(ns);
  let augmentations = await getAugmentations(ns);

  if (!flags.includePurchased) {
    augmentations = augmentations.filter(a => !a.purchased);
  }

  augmentations = augmentations.sort((a, b) => b.price - a.price);

  for (const aug of augmentations) {
    logAugmentation(aug, allFactions);
  }
}
