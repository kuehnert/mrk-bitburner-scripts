/** @type import("..").NS */
let ns = null;

const isDone = () => ns.getPlayer().tor;

const checkPreReqs = () => {
  const cost = 200000;

  if (ns.getServerMoneyAvailable('home') < cost) {
    return { money: cost };
  } else {
    return null;
  }
};

const perform = () => ns.purchaseTor();

export default async function main(_ns, params) {
  ns = _ns;

  if (params.getName) {
    return ns.sprintf("Purchase TOR Server");
  } else if (params.checkIsDone) {
    return isDone();
  } else if (params.checkPreReqs) {
    return checkPreReqs();
  } else {
    return perform();
  }
}
