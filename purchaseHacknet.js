/** @type import(".").NS */
let ns = null;

const ONE_MINUTE = 60 * 1000;
const SLEEP_TIME = ONE_MINUTE / 6;
const MAX_LEVEL = 200;
const MAX_RAM = 64;
const MAX_CORES = 16;
const LEVEL_SKIP = 20;

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('ALL');
  ns.clearLog();

  let MIN_MONEY = ns.hacknet.getPurchaseNodeCost();
  const myMoney = () => ns.getServerMoneyAvailable('home') - MIN_MONEY;

  const maxNodes = Math.min(ns.hacknet.maxNumNodes(), 24);
  // ns.print(JSON.stringify(ns.getPlayer(), null, 4));

  while (true) {
    let jobs = [];
    let nodeCount = ns.hacknet.numNodes();

    // ns.printf(
    //   'New round: Owning %d/%d nodes, reserving $%.0f for rainy days.',
    //   nodeCount,
    //   maxNodes,
    //   MIN_MONEY
    // );

    // Check if we can buy another node
    const costNode = ns.hacknet.getPurchaseNodeCost();
    // if (nodeCount < maxNodes && myMoney() > costNode) {
    if (nodeCount < maxNodes) {
      jobs.push({ task: 'PURCHASE_NODE', server: Number.NaN, cost: costNode });
    }

    // See what's missing for the existing nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeStats = ns.hacknet.getNodeStats(i);
      const costLevel = ns.hacknet.getLevelUpgradeCost(i, LEVEL_SKIP);
      const costRAM = ns.hacknet.getRamUpgradeCost(i, 1);
      const costCore = ns.hacknet.getCoreUpgradeCost(i, 1);

      if (nodeStats.level < MAX_LEVEL && myMoney() > costLevel) {
        jobs.push({ task: 'UPGRADE_LEVEL', server: i, cost: costLevel });
      }

      if (nodeStats.ram < MAX_RAM && myMoney() > costRAM) {
        jobs.push({ task: 'UPGRADE_RAM', server: i, cost: costRAM });
      }

      if (nodeStats.cores < MAX_CORES && myMoney() > costCore) {
        jobs.push({ task: 'UPGRADE_CORES', server: i, cost: costCore });
      }
    }

    if (jobs.length === 0) {
      ns.printf('Nought to do. Exiting');
      break;
    }

    jobs = jobs.sort((a, b) => a.cost - b.cost);
    // ns.printf('Trying to run %d jobs.', jobs.length);

    while (jobs.length > 0 && myMoney() > jobs[0].cost) {
      const current = jobs.shift();
      ns.printf(
        // '%s on #%d @ $%.f',
        '%s%s @ $%6.0fk',
        current.task,
        current.server > 0 ? ' on node #' + current.server : '',
        current.cost / 1000.0
      );

      switch (current.task) {
        case 'PURCHASE_NODE':
          ns.hacknet.purchaseNode(1);
          // await ns.sleep(10 * ONE_MINUTE);
          MIN_MONEY = ns.hacknet.getPurchaseNodeCost();
          nodeCount = ns.hacknet.numNodes();

          ns.printf(
            'New round: Owning %d/%d nodes, reserving $%.0f for rainy days.',
            nodeCount,
            maxNodes,
            MIN_MONEY
          );
          break;
        case 'UPGRADE_LEVEL':
          ns.hacknet.upgradeLevel(current.server, LEVEL_SKIP);
          break;
        case 'UPGRADE_RAM':
          ns.hacknet.upgradeRam(current.server, 1);
          break;
        case 'UPGRADE_CORES':
          ns.hacknet.upgradeCore(current.server, 1);
          break;
        default:
          ns.printf('Unknown action: %s. Exiting.', current.task);
          ns.exit();
      }
    }

    // if there is more than one job, at least one is purchasing a new node
    // ns.printf('money: %d, cost: %d', myMoney() < );
    // if (jobs.length > 1 && myMoney() < jobs[0].cost) {
    //   ns.printf(
    //     'Remaining jobs: %d; sleeping %.1f minutes to grow some bigger money.',
    //     jobs.length,
    //     SLEEP_TIME / 60000
    //   );
    //   await ns.sleep(SLEEP_TIME);
    // } else {
    //   // wait 1 second to give server some space
    // }
    await ns.sleep(5000);
  }

  ns.print('Script finished. Exiting.');
}
