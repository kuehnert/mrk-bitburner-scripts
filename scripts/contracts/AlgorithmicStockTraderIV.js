/*
    Algorithmic Stock Trader IV;

    You are attempting to solve a Coding Contract.You have 10 tries remaining, after which the contract will self - destruct.

    You are given the following array with two elements:

    [2, [37,175,73,115,50,40]]

    The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.

    Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.

    If no profit can be made, then the answer should be 0.
*/
// find all possible profitable transactions
const algorithmicStockTrader = data => {
  let buyPoint = 0;
  let sellPoint = 1;
  let profit = 0;
  let transactions = [];

  while (sellPoint < data.length && buyPoint < data.length - 1) {
    if (data[sellPoint] < data[buyPoint]) {
      buyPoint = sellPoint;
    }

    if (data[sellPoint + 1] > data[sellPoint]) {
      sellPoint++;
    } else {
      profit = data[sellPoint] - data[buyPoint];
      transactions.push({ buyPoint, sellPoint, profit });
      buyPoint = sellPoint + 1;
      sellPoint = buyPoint + 1;
    }
  }

  return transactions;
};

// calculate summed up profit across all transactions
const totalProfit = transactions =>
  transactions.reduce((profit, t) => profit + t.profit, 0);

const findMergers = (data, transactions) => {
  let bestProfit = Number.MIN_SAFE_INTEGER;
  let best;

  // merge all possible transaction pairs one by one and select the most profitable one
  for (let i = 0; i < transactions.length - 1; i++) {
    const current = transactions[i];
    const next = transactions[i + 1];

    let newTransactions = transactions.slice(0, i);
    const buyPoint = data[current.buyPoint] < data[next.buyPoint] ? current.buyPoint : next.buyPoint;
    const sellPoint =
      buyPoint === current.buyPoint && data[current.sellPoint] > data[next.sellPoint]
        ? current.sellPoint
        : next.sellPoint;

    newTransactions.push({ buyPoint, sellPoint, profit: data[sellPoint] - data[buyPoint] });

    newTransactions = newTransactions.concat(
      transactions.slice(i + 2, transactions.length)
    );

    const newProfit = totalProfit(newTransactions);
    if (newProfit > bestProfit) {
      best = newTransactions;
      bestProfit = newProfit;
    }
  }

  return best;
};

export default input => {
  const [maxTransactions, data] = input;
  let transactions = algorithmicStockTrader(data);

  // reducers number of transactions until we hit target length
  while (transactions.length > maxTransactions) {
    transactions = findMergers(data, transactions);
  }

  return totalProfit(transactions);
};
