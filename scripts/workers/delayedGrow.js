export async function main(ns) {
  await ns.asleep(ns.args[1]);
  await ns.grow(ns.args[0]);
}
