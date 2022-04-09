/** @type import(".").NS */
let ns = null;

const getTargets = () => {
  return JSON.parse(ns.read('/data/targets.txt')).slice(0, 4);
};

export async function main(_ns) {
  ns = _ns;

  ns.disableLog('ALL');
  ns.clearLog();

  const targets = getTargets();
  ns.tprintf('targets: %s', targets);

  for (const target of targets) {
    ns.exec('minihack.js', 'home', 1, target);
    let earnedMoney = await ns.hack(target);
    ns.tprintf('attacked %s, earned $%.3fk', target, earnedMoney / 1000.0);
    await ns.sleep(300);
  }
}
