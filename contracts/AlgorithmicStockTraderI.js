/*
    Algorithmic Stock Trader I

    You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.
    You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

    * 172,175,50,53,62,131,135,132,138,120,162,166,76,34,80,136,192,127,132,8,90,175,77,72,198,96

    Determine the maximum possible profit you can earn using at most one transaction (i.e.you can only buy and sell the stock once). If no profit can be made, then the answer should be 0. Note that you have to buy the stock before you can sell it
*/
const minIndex = (data, l, r) => {
  let mI = l;
  for (let i = l + 1; i <= r; i++) {
    if (data[i] < data[mI]) {
      mI = i;
    }
  }

  return mI;
};

const maxIndex = (data, l, r) => {
  let mI = l;
  for (let i = l + 1; i <= r; i++) {
    if (data[i] > data[mI]) {
      mI = i;
    }
  }

  return mI;
};

export default function AlgorithmicStockTraderI(
  data,
  l = 0,
  r = data.length - 1
) {
  if (l >= r) {
    return 0;
  } else if (l + 1 === r) {
    return Math.max(0, data[r] - data[l]);
  } else {
    const min = minIndex(data, l, r);
    const max = maxIndex(data, l, r);

    if (min < max) {
      return data[max] - data[min];
    } else {
      // Maximum liegt vor Minimum
      const maxL = AlgorithmicStockTraderI(data, l, min - 1);
      const maxR = AlgorithmicStockTraderI(data, max + 1, r);
      return Math.max(maxL, maxR);
    }
  }
}
