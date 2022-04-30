/** @type import(".").NS */
let ns = null;

import { getServersDetailed } from '/helpers/getServers';
import logServer from '/helpers/logServer';
import isHackCandidate from '/helpers/isHackCandidate';
import getMyPortLevel, { getPrograms } from '/helpers/getMyPortLevel';

function hackServer(server, portsNeeded) {
  const programs = getPrograms(ns);
  const portLevel = getMyPortLevel(ns);

  for (let i = 0; i < portLevel; i++) {
    programs[i].command(server);
  }

  if (portsNeeded <= portLevel) {
    ns.nuke(server);
  }

  return ns.hasRootAccess(server);
}

async function stealFiles(server) {
  const litFiles = ns.ls(server, '.lit');

  if (litFiles.length > 0) {
    await ns.scp(litFiles, server, 'home');
  }
}

export function autocomplete() {
  return ['--forceRefresh', 'owned', 'levels', 'milestones', 'quiet', 'targets'];
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('ALL');

  const flags = ns.flags([
    ['forceRefresh', false],
    ['quiet', false],
  ]);

  let detailedServers = await getServersDetailed(ns, flags.forceRefresh || ns.args[0] == 'owned');

  for (const server of detailedServers) {
    const { hostname, portsNeeded, isRoot } = server;
    await stealFiles(hostname);

    if (!isRoot) {
      server.isRoot = hackServer(hostname, portsNeeded);
    }
  }

  await ns.write('/data/servers.txt', JSON.stringify(detailedServers), 'w');

  if (flags.quiet) {
    ns.exit();
  }

  if (ns.args[0] === 'owned') {
    detailedServers = detailedServers.filter(s => s.purchasedByPlayer).sort(a => a.hostname);
  } else {
    detailedServers = detailedServers.filter(s => !s.purchasedByPlayer).sort(a => a.hostname);

    if (ns.args[0] === 'levels') {
      detailedServers = detailedServers.sort((a, b) => a.hackLevel - b.hackLevel);
    } else if (ns.args[0] === 'milestones') {
      detailedServers = detailedServers
        .filter(s => s.hostname.match(/CSEC|CyberSec|avmnite-02h|I\.I\.I\.I|run4theh111z/))
        .sort((a, b) => a.hackLevel - b.hackLevel);
    } else if (ns.args[0] === 'targets') {
      detailedServers = detailedServers
        .filter(s => isHackCandidate(ns, s, getMyPortLevel(ns)))
        .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);
    }
  }

  for (let i = 0; i < detailedServers.length; i++) {
    logServer(ns, getMyPortLevel(ns), i, detailedServers[i]);
  }
}
