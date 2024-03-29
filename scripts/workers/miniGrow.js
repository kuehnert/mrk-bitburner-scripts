/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  // Defines the "target server", which is the server
  // that we're going to hack. In this case, it's "n00dles"
  const target = ns.args[0] ?? 'joesguns';
  await ns.grow(target);
}
