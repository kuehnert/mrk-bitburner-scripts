/** @type import("..").NS */
let ns = null;

import { getServers } from 'helpers/getServers';
import getMyPortLevel from 'helpers/getMyPortLevel'

const isDone = ({ server }) => ns.getServer(server).backdoorInstalled;

const checkPreReqs = ({ server }) => {
  const s = ns.getServer(server);
  if (getMyPortLevel(ns) >= s.numOpenPortsRequired && ns.getPlayer().hacking >= s.requiredHackingSkill) {
    return null;
  } else {
    return { portLevel: s.numOpenPortsRequired, hacking: s.requiredHackingSkill };
  }
};

const perform = async ({ server }) => {
  let servers = await getServers(ns);
  const { hostname, route } = servers.find(s => s.hostname === server);

  for (const node of route) {
    ns.connect(node);
  }

  await ns.installBackdoor();
  ns.connect('home');

  return ns.getServer(hostname).backdoorInstalled;
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
