/** @type import("..").NS */
let ns = null;

const unwanted = ['ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe', 'Formulas.exe'];

export default async function purchaseProgram(_ns, params) {
  ns = _ns;

  if (params.toUpperCase() === 'ALL') {
    const programs = ns.getDarkwebPrograms().filter(p => !unwanted.includes(p));

    for (const program of programs) {
      const success = ns.purchaseProgram(program);

      if (success) {
        ns.run()
        return true;
      } else {
        return false;
      }
    }
  } else {
    return ns.purchaseProgram(params);
  }
}
