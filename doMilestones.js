/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  ns.connect("foodnstuff")
  ns.connect("CSEC")
  await ns.installBackdoor()
}
