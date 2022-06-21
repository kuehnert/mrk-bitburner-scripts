/** @type import("..").NS */
let ns = null;

import { BUFFER } from './helpers/globals';
import logServerInfo from './helpers/logServerInfo';

export const autocomplete = data => [...data.servers];

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMinSecurityLevel');
  ns.tail();

  const server = ns.args[0];

  while (true) {
    logServerInfo(ns, server);
    await ns.sleep(BUFFER);
  }
}
