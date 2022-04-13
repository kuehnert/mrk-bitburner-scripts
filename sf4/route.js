/** @type import("..").NS */
let ns = null;

import getServers from '/helpers/getServers';

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;

  if (ns.args.length === 0) {
    ns.tprintf('No target server given. Exiting');
    ns.exit();
  }

  const target = ns.args[0];
  const servers = await getServers(ns);
  const server = servers.find(s => s.name === target);

  if (!server) {
    ns.tprintf('ERROR connecting to %s: server unknown. Exiting.', target);
    ns.exit();
  }

  const { name, route } = server;
  ns.connect('home');
  while (route.length > 0) {
    const node = route.shift();
    const success = ns.connect(node);

    if (!success) {
      ns.tprintf('ERROR connecting to %s. Exiting', node);
      ns.exit();
    }
  }

  ns.connect(name);
}
