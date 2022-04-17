/** @type import("..").NS */
let ns = null;

import { formatNumber } from '/helpers/formatters'

export default async function runScript(_ns, params) {
  ns = _ns;
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');

  const { script, host, args } = { host: 'home', ...params };
  let pid;

  if (ns.scriptRunning(script, host)) {
    return true;
  }

  const scriptRam = ns.getScriptRam(script, host);
  const serverRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  if (scriptRam > serverRam) {
    ns.printf("Too little RAM on server %s to run script %s (%s > %s GB).", host, script, formatNumber(ns, scriptRam), formatNumber(ns, serverRam));
    return false;
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
