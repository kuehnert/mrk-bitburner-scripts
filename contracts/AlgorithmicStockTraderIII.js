/*
    Algorithmic Stock Trader III;

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

    * 115,66,71,32,164,64,15,186,55,20,185,49,35,158,55,44,17,193,43,57,147,124,35,192,60,83,176,137,97,92,14,86,195

    Determine the maximum possible profit you can earn using at most two transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.
    If no profit can be made, then the answer should be 0
*/
export default function AlgorithmicStockTraderIII(data) {
  let max = 0;

  for (let i = 0; i < data.length - 3; i++) {
    for (let j = i + 1; j < data.length - 2; j++) {
      for (let k = j + 1; k < data.length - 1; k++) {
        for (let l = k + 1; l < data.length; l++) {
          const tmp =
            Math.max(data[l] - data[k], 0) + Math.max(data[j] - data[i], 0);
          if (tmp > max) {
            max = tmp;
          }
        }
      }
    }
  }

  return max;
}
