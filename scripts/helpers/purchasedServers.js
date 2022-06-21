/** @type import("..").NS */
let ns = null;

export const getPurchasedServerCosts = _ns => {
  ns = _ns;
  const myMoney = ns.getServerMoneyAvailable('home');
  const costs = [];
  let ram = ns.getPurchasedServerMaxRam();

  while (ram >= 1) {
    const cost = ns.getPurchasedServerCost(ram);
    const affordable = Math.floor(myMoney / cost);
    costs.push({ ram, cost, affordable });
    ram /= 2;
  }

  return costs;
};

export const getAffordableMaxServerRam = (_ns, count = 1) => {
  ns = _ns;
  const myMoney = ns.getServerMoneyAvailable('home');
  const pricelist = getPurchasedServerCosts(ns);

  let counter = 0;
  while (myMoney < pricelist[counter].cost * count) {
    counter++;
  }

  return counter >= 0 ? pricelist[counter].ram : 0;
};
