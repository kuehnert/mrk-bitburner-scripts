/** @type import("..").NS */
let ns = null;

const unwanted = [
  'ServerProfiler.exe',
  'DeepscanV1.exe',
  'DeepscanV2.exe',
  'AutoLink.exe',
  'Formulas.exe',
];

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('sleep');
  // ns.clearLog();
  // ns.tail();

  const programs = ns.getDarkwebPrograms().filter(p => !unwanted.includes(p));

  if (!ns.purchaseTor()) {
    ns.tprint(
      "You don't own the TOR router and can't afford it right now (). Exiting."
    );
    ns.exit();
  }

  for (const program of programs) {
    ns.tprintf('Trying to purchase %s...', program);

    if (!ns.purchaseProgram(program)) {
      ns.tprintf("You can't afford %s right now. Exiting.", program);
      ns.exit();
    }
  }

  ns.tprint('Congrats, you have all the tools in the world. Happy Hacking!');
}
