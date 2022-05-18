/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  await ns.asleep(ns.args[1]);
  await ns.weaken(ns.args[0]);
}
