/** @type import("..").NS */
let ns = null;

export default async function runScript(_ns, params) {
  ns = _ns;
  // ns.disableLog('sleep');

  const { script, host, args } = { host: 'home', ...params };
  let pid;

  if (ns.scriptRunning(script, host)) {
    return true;
  }

  if (args) {
    pid = ns.exec(script, host, 1, args);
  } else {
    pid = ns.exec(script, host, 1);
  }

  if (pid === 0) {
    ns.printf(
      'Error running script %s. Exiting.',
      JSON.stringify(params, null, 4)
    );
    ns.exit();
    return false;
  } else {
    return true;
  }
}
