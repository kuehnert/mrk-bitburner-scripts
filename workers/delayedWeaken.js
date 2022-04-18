/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  const server = ns.args[0];
  const delay = ns.args[1];

  if (delay < 0) {
    ns.printf("Delay < 0! You doin' your math right?");
    ns.exit();
  }

  await ns.sleep(delay);
  await ns.weaken(server);
}
