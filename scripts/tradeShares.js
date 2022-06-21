/** @type import(".").NS */
let ns = null;

import { formatMoney, formatTime } from 'helpers/formatters';

const BUY_FORECAST_LIMIT = 0.6;
const SELL_FORECAST_LIMIT = 0.4;
const SELL_PROFIT_PERCENTAGE = 0.2; // sell at 20% profit
const COMMISSION = 100000;
const SLEEPTIME = 6 * 1000;
let totalProfit = 0;

const prerequisites = () => {
  const { money, hasWseAccount, hasTixApiAccess, has4SData, has4SDataTixApi } = ns.getPlayer();

  let requiredMoney = hasWseAccount ? 0 : 200e6;
  requiredMoney += hasTixApiAccess ? 0 : 5e9;
  requiredMoney += has4SData ? 0 : 1e9;
  requiredMoney += has4SDataTixApi ? 0 : 25e9;

  if (money < requiredMoney) {
    ns.tprintf(
      'ERROR Not enough money to trade stocks (%s/%s). Exiting.',
      formatMoney(ns, money),
      formatMoney(ns, requiredMoney)
    );
    ns.exit();
  }

  ns.stock.purchaseWseAccount();
  ns.stock.purchaseTixApi();
  ns.stock.purchase4SMarketData();
  ns.stock.purchase4SMarketDataTixApi();
};

const buyShares = (orderSize, totalStockValue, portfolioMaxSize) => {
  const profitable = ns.stock.getSymbols().filter(s => ns.stock.getForecast(s) > BUY_FORECAST_LIMIT);
  const purchased = [];

  for (const p of profitable) {
    const pps = ns.stock.getBidPrice(p);
    const shares = Math.floor(orderSize / pps);
    const realPrice = ns.stock.buy(p, shares);

    if (realPrice > 0) {
      purchased.push(p);
    }
  }

  ns.printf(
    '%s Portfolio size (%s/%s). Bought %s.',
    formatTime(ns),
    formatMoney(ns, totalStockValue),
    formatMoney(ns, portfolioMaxSize),
    purchased.join(', ')
  );
};

const getTotalStockValue = () => {
  return ns.stock.getSymbols().reduce((total, symbol) => {
    const [shares] = ns.stock.getPosition(symbol);
    return total + shares * ns.stock.getBidPrice(symbol);
  }, 0);
};

const sellShares = () => {
  for (const symbol of ns.stock.getSymbols()) {
    const [shares, avgPrice] = ns.stock.getPosition(symbol);
    if (shares === 0) continue;

    const forecast = ns.stock.getForecast(symbol);
    const bidPrice = ns.stock.getBidPrice(symbol);
    const profitPerc = bidPrice / avgPrice - 1;

    if (profitPerc > SELL_PROFIT_PERCENTAGE || (forecast <= SELL_FORECAST_LIMIT && bidPrice > avgPrice)) {
      const realPrice = ns.stock.sell(symbol, shares);
      const realProfit = shares * (realPrice - avgPrice) - 2 * COMMISSION;
      totalProfit += realProfit;

      if (realPrice > 0) {
        ns.printf(
          'INFO %s SOLD %s %d shares netting %s (%s total)',
          formatTime(ns),
          symbol,
          shares,
          formatMoney(ns, realProfit),
          formatMoney(ns, totalProfit)
        );
      }
    }
  }
};

const tradeShares = async () => {
  let myMoney = ns.getServerMoneyAvailable('home');
  let portfolioMaxSize = Math.floor(myMoney / 4.0);
  let orderSize = portfolioMaxSize / 100;

  while (true) {
    // SELLING
    sellShares();
    const totalStockValue = getTotalStockValue();

    // BUYING
    if (totalStockValue <= portfolioMaxSize) {
      buyShares(orderSize, totalStockValue, portfolioMaxSize);
    }

    await ns.sleep(SLEEPTIME);
    myMoney = ns.getServerMoneyAvailable('home');
    portfolioMaxSize = Math.floor(myMoney / 4.0);
    orderSize = portfolioMaxSize / 100;
  }
};

const sellAll = () => {
  for (const symbol of ns.stock.getSymbols()) {
    const [shares] = ns.stock.getPosition(symbol);
    if (shares > 0) {
      ns.stock.sell(symbol, shares);
    }
  }

  ns.tprintf('WARN Sold all shares.');
};

const printStock = ({ forecast, symbol, shares, profitPerc, avgPrice, value }) => {
  let warningStage = '    ';
  if (forecast <= SELL_FORECAST_LIMIT) {
    warningStage = 'WARN';
  } else if (forecast >= BUY_FORECAST_LIMIT) {
    warningStage = 'INFO';
  }

  ns.printf(
    '%s stock %-5s, %5d shares @ %5s, totalling %5s, forecast %.0f%%, profit %.1f%%',
    warningStage,
    symbol,
    shares,
    formatMoney(ns, avgPrice),
    formatMoney(ns, value),
    forecast * 100.0,
    profitPerc * 100.0
  );
};

export const autocomplete = () => ['sellAll'];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('stock.buy');
  ns.disableLog('stock.sell');
  ns.disableLog('stock.purchaseWseAccount');
  ns.disableLog('stock.purchaseTixApi');
  ns.disableLog('stock.purchase4SMarketDataTixApi');

  if (ns.args[0] && ns.args[0].toLowerCase() === 'sellall') {
    ns.kill('tradeShares.js', 'home');
    sellAll();
  } else {
    prerequisites();
    await tradeShares();
  }
}
