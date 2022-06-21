/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  ns.scriptKill('/workers/delayedGrow.js', 'home');
  ns.scriptKill('/workers/delayedHack.js', 'home');
  ns.scriptKill('/workers/delayedWeaken.js', 'home');
  ns.scriptKill('/workers/miniGrow.js', 'home');
  ns.scriptKill('/workers/miniHack.js', 'home');
  ns.scriptKill('/workers/miniWeaken.js', 'home');
  ns.scriptKill('/workers/primeServer.js', 'home');
  ns.scriptKill('masterAttack.js', 'home');
  ns.scriptKill('multiAttack.js', 'home');
  ns.scriptKill('singleAttack.js', 'home');

  // let attackerNames = JSON.parse(ns.read('/data/servers.txt'))
  //   .filter(s => s.isRoot)
  //   .map(s => s.name);
  // attackerNames = attackerNames.concat(ns.getPurchasedServers());

  // for (const name of attackerNames) {
  //   ns.printf('Stopping all attacks from attacker %s', name);
  //   ns.killall(name);
  // }
}
