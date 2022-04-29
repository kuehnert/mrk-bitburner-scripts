/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  const server = ns.args[0];
  const delay = ns.args[1];
  // const shift = ns.args[2];

  await ns.asleep(delay);
  await ns.hack(server);
}
