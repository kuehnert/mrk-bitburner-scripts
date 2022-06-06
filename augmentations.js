/** @type import(".").NS */
let ns = null;

import { getAugmentations } from './helpers/augmentationHelper';
import { getFactionsMap } from './helpers/factionHelper';
import { formatNumber, formatMoney } from './helpers/formatters';
import { hprint } from './helpers/hprint';

// const miniFStr = fs =>

const logAugmentation = ({ name, price, repReq, factionNames, purchased, installed }, factions, myFactionNames) => {
  let prefix = ' ';
  if (installed) {
    prefix = 'I';
  } else if (purchased) {
    prefix = 'P';
  }

  const factionStr = factionNames
    .map(fs => {
      const f = factions[fs];
      const fsMini = fs.replace(/The|\s/g, '').substring(0, 5);
      let fstr = myFactionNames.includes(fs) ? `W~${fsMini}~` : fsMini;

      if (f.rep === 0) {
        return fstr;
      } else if (f.rep >= repReq) {
        return fstr + ` (${formatNumber(ns, f.rep)})~`;
      } else {
        return fstr + ` (${formatNumber(ns, f.rep)})`;
      }
    })
    .join(', ');

  const seller = factionNames.find(fn => factions[fn].rep >= repReq);
  const buyButton = seller ? ns.sprintf("[BUY]!do ns.purchaseAugmentation(\\'%s\\', \\'%s\\')!", seller, name) : '   ';

  hprint(
    ns,
    '%s %-45.45s %s %s %s %s',
    prefix,
    name,
    formatMoney(ns, price, { markAffordable: true }),
    formatNumber(ns, repReq),
    buyButton,
    factionStr
  );
};

export async function main(_ns) {
  ns = _ns;
  // ns.clearLog();
  // ns.tail();

  const flags = ns.flags([
    ['includePurchased', false],
    ['byRep', false],
  ]);
  const allFactions = await getFactionsMap(ns);
  const myFactionNames = ns.getPlayer().factions;
  let augmentations = await getAugmentations(ns);

  if (!flags.includePurchased) {
    augmentations = augmentations.filter(a => !a.purchased);
  }

  if (flags.byRep) {
    augmentations = augmentations.sort((a, b) => b.repReq - a.repReq);
  } else {
    augmentations = augmentations.sort((a, b) => b.price - a.price);
  }

  hprint(ns, 'I~%s %-45s %9s %9s %s~', ' ', 'Name', 'Price', 'RepReq', 'Factions');

  for (const aug of augmentations) {
    if (aug.name.match(/^SoA/)) {
      continue;
    }

    logAugmentation(aug, allFactions, myFactionNames);
  }
}
