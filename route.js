/** @type import(".").NS */
let ns = null;

const formatPath = path => path.map(el => 'connect ' + el).join('; ');

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  if (ns.args.length === 0) {
    ns.tprintf('No target server given. Exiting');
    ns.exit();
  }

  const target = ns.args[0];
  let command = ns.args[1];
  const servers = JSON.parse(ns.read('/data/servers.txt'));

  for (const server of servers) {
    if (server.name === target) {
      let path = formatPath(server.path.concat(server.name));
      if (command) {
        if (command === 'b') {
          command = 'backdoor';
        }
        path += '; ' + command;
      }
      ns.tprint(path);
      ns.exit();
    }
  }

  ns.tprintf('server %s or path to it unknown.', target);
}
