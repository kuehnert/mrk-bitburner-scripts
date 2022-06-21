/** @type import(".").NS */
let ns = null;

import { getAugmentations } from './helpers/augmentationHelper';

export async function main(_ns) {
  ns = _ns;
  // ns.clearLog();
  // ns.tail();
  const augs = await getAugmentations(ns);
  ns.tprintf('augs: %s', JSON.stringify(augs, null, 4));
}
