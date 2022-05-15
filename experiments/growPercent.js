/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  const gP = ns.formulas.hacking.growPercent(
    ns.getServer('harakiri-sushi'),
    1,
    ns.getPlayer(),
    ns.getServer('HACKharakiri-sushi').cpuCores
  );

  ns.tprintf('gP: %d', gP);
  const diff = 100e6 - 49.834e6;
  ns.tprintf('diff: %d: %d', diff, gP * diff);
}
