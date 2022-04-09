/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('ALL');

  ns.kill('homeAttack.js', 'home');
  ns.kill('minigrow.js', 'home');
  ns.kill('minihack.js', 'home');
  ns.kill('miniweaken.js', 'home');
  ns.kill('masterAttack.js', 'home');

  let attackerNames = JSON.parse(ns.read('AllServers.txt'))
    .filter(s => s.isRoot)
    .map(s => s.name);
  attackerNames = attackerNames.concat(ns.getPurchasedServers());

  for (const name of attackerNames) {
    ns.printf('Stopping all attacks from attacker %s', name);
    ns.killall(name);
  }
}
