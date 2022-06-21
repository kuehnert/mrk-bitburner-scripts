export async function main(ns) {
  await ns.asleep(ns.args[1]);
  await ns.hack(ns.args[0]);
}
