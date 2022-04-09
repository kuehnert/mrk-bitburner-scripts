/** @type import("..").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  ns.formulas.skills.calculateExp(100, 1);
}
