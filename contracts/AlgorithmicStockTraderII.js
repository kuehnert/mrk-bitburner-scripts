/*
    Algorithmic Stock Trader II

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

    * 165,104,71,190,40,169,123,172,161,157,113,97,180,192,102,96,57,81,25,185,101,76,97,112,94,145,138,195,133,34,92,58,133,36,95,172
    * 64,75,173,58,26,163

    Determine the maximum possible profit you can earn using as many transactions as you'd like. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.

    If no profit can be made, then the answer should be 0
*/
export default function AlgorithmicStockTraderII(data) {
  let buy = 0;
  let sell = 1;
  let profit = 0;

  while (sell < data.length && buy < data.length) {
    if (data[sell] < data[buy]) {
      buy = sell;
    }
    if (data[sell + 1] > data[sell]) {
      sell++;
    } else {
      profit += data[sell] - data[buy];
      buy = sell + 1;
      sell = buy + 1;
    }
  }

  return profit;
}
