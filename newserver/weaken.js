/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  const server = ns.args[0];
  const sleeptime = ns.args[1];

  await ns.sleep(sleeptime);
  await ns.weaken(server);
}
