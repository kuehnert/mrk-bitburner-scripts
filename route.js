/** @type import(".").NS */
let ns = null;

import getServers from '/helpers/getServers';

const findServer = async target => {
  const servers = await getServers(ns);
  const server = servers.find(s => s.name === target);

  if (!server) {
    ns.tprintf('ERROR routing to %s: server unknown. Exiting.', target);
    ns.exit();
  }

  return server;
};

const printRoute = ({ name, route }) => {
  ns.tprintf('INFO Route to %s: %s', name, route.join(', '));
};

const followRoute = route => {
  while (route.length > 0) {
    const node = route.shift();
    const success = ns.connect(node);

    if (!success) {
      ns.tprintf('ERROR connecting to %s. Exiting', node);
      ns.exit();
    }
  }
};

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;

  const flags = ns.flags([['print', false]]);

  const targetName = ns.args[0];
  if (targetName === '') {
    ns.tprintf('ERROR No target server given. Exiting');
    ns.exit();
  }

  const server = await findServer(targetName);

  if (flags.print) {
    printRoute(server);
    ns.exit();
  }

  followRoute(server.route);
}
