/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  ns.tprintf('Current karma: %f', ns.heart.break());
}
