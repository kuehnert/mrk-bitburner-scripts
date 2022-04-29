/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  const server = ns.args[0];
  const delay = ns.args[1];

  await ns.asleep(delay);
  await ns.grow(server);
}
