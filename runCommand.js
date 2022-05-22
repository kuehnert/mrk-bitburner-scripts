/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('sleep');
  // ns.clearLog();
  document.baseURI; // oomph ram usage so eval works

  const cmd = ns.args.join(' ');
  ns.tprintf('Running %s', cmd);
  const output = await eval(cmd);
  ns.tprintf('Result: %s', JSON.stringify(output, null, 4));
}
