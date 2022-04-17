/** @type import(".").NS */
let ns = null;

import { formatMoney, formatTime } from 'helpers/formatters';

const BUY_FORECAST_LIMIT = 0.6;
const SELL_FORECAST_LIMIT = 0.4;
const SELL_PROFIT_PERCENTAGE = 0.05; // sell at 20% profit
const COMMISSION = 100000;
const SLEEPTIME = 6 * 1000;

const prerequisites = () => {
  let result = ns.stock.purchaseWseAccount();
  // ns.printf('WseAccount: %s', result);
  if (!result) {
    ns.print("Cannot do nuthin'. Stoppin'.");
    ns.exit();
  }

  result = ns.stock.purchaseTixApi();
  // ns.printf('TixApi: %s', result);
  if (!result) {
    ns.print("Cannot do nuthin'. Stoppin'.");
    ns.exit();
  }

  result = ns.stock.purchase4SMarketDataTixApi();
  // ns.printf('4SMarketDataTixApi: %s', result);
  if (!result) {
    ns.print("Cannot do nuthin'. Stoppin'.");
    ns.exit();
  }
};

const printStock = ({
  forecast,
  symbol,
  shares,
  profitPerc,
  avgPrice,
  value,
}) => {
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

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('stock.buy');
  ns.disableLog('stock.sell');
  prerequisites();

  let myMoney = ns.getServerMoneyAvailable('home');
  let PORTFOLIO_MAX = Math.floor(myMoney / 4.0);
  let ORDER_SIZE = PORTFOLIO_MAX / 100;

  ns.printf('My money: %s', formatMoney(ns, myMoney));
  ns.printf('Max. portfolio size: %s', formatMoney(ns, PORTFOLIO_MAX));
  ns.printf('Max. order size: %s', formatMoney(ns, ORDER_SIZE));

  const symbols = ns.stock.getSymbols();
  let totalProfit = 0;

  while (true) {
    // SELLING
    let totalStockValue = 0;
    for (const symbol of symbols) {
      const [shares, avgPrice] = ns.stock.getPosition(symbol);
      if (shares === 0) continue;

      const forecast = ns.stock.getForecast(symbol);
      const bidPrice = ns.stock.getBidPrice(symbol);
      const profitPerc = bidPrice / avgPrice - 1;
      const value = shares * avgPrice;
      totalStockValue += value;

      // printStock({ symbol, forecast, shares, profitPerc, avgPrice, value });

      if (
        profitPerc > SELL_PROFIT_PERCENTAGE ||
        forecast <= SELL_FORECAST_LIMIT && bidPrice > avgPrice
      ) {
        const realPrice = ns.stock.sell(symbol, shares);
        const realProfit = shares * (realPrice - avgPrice) - 2 * COMMISSION;
        totalProfit += realProfit;

        if (realPrice > 0) {
          ns.printf(
            'INFO %s SOLD   %-5s %d shares for %s, netting %s, profitting %s, totalling %s',
            formatTime(),
            symbol,
            shares,
            formatMoney(ns, realPrice),
            formatMoney(ns, realPrice * shares),
            formatMoney(ns, realProfit),
            formatMoney(ns, totalProfit)
          );
        }
      }
    }

    // BUYING
    if (totalStockValue > PORTFOLIO_MAX) {
      // ns.printf(
      //   '%s Portfolio size exceeded (%s/%s). Not buying.',
      //   formatTime(),
      //   formatMoney(totalStockValue),
      //   formatMoney(PORTFOLIO_MAX)
      // );
    } else {
      ns.printf(
        '%s Portfolio size (%s/%s). Buying more shares.',
        formatTime(),
        formatMoney(ns, totalStockValue),
        formatMoney(ns, PORTFOLIO_MAX)
      );

      const profitable = symbols.filter(
        s => ns.stock.getForecast(s) > BUY_FORECAST_LIMIT
      );

      for (const p of profitable) {
        const pps = ns.stock.getBidPrice(p);
        const shares = Math.floor(ORDER_SIZE / pps);
        const realPrice = ns.stock.buy(p, shares);
        if (shares > 0) {
          ns.printf(
            '     %s BOUGHT %-5s %6d shares @ %s for %s',
            formatTime(),
            p,
            shares,
            formatMoney(ns, realPrice),
            formatMoney(ns, realPrice * shares)
          );
        }
      }
    }

    await ns.sleep(SLEEPTIME);
    myMoney = ns.getServerMoneyAvailable('home');
    PORTFOLIO_MAX = Math.floor(myMoney / 4.0);
    ORDER_SIZE = PORTFOLIO_MAX / 100;
    }
}
