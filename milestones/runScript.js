/** @type import("..").NS */
let ns = null;

import { formatNumber } from '/helpers/formatters';

const isDone = ({ script, host = 'home' }) => ns.scriptRunning(script, host);

const checkPreReqs = ({ script, host = 'home' }) => {
  const scriptRam = ns.getScriptRam(script, host);
  const serverRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  if (scriptRam > serverRam) {
    return {
      freeRam: scriptRam,
      message: ns.sprintf(
        'Too little RAM on server %s to run script %s (%s > %s GB).',
        host,
        script,
        formatNumber(ns, scriptRam),
        formatNumber(ns, serverRam)
      ),
    };
  } else {
    return null;
  }
};

const perform = ({ script, host = 'home', args }) => {
  let pid;
  if (args) {
    pid = ns.exec(script, host, 1, args);
  } else {
    pid = ns.exec(script, host, 1);
  }

  if (pid === 0) {
    return { error: ns.sprintf('Error running script %s.', JSON.stringify(params, null, 4)) };
  } else {
    return true;
  }
};

export default async function main(_ns, params) {
  ns = _ns;

  if (params.checkIsDone) {
    return isDone(params);
  } else if (params.checkPreReqs) {
    return checkPreReqs(params);
  } else {
    return perform(params);
  }
}
