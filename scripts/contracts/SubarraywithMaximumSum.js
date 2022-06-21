/*
    Subarray with Maximum Sum

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
    5,1,-3,-1,-5,-2,-7,-4,6,10
*/
const makeSubarrays = input => {
  let subs = [];

  for (let i = 0; i < input.length; i++) {
    for (let j = i + 1; j < input.length + 1; j++) {
      subs.push(input.slice(i, j));
    }
  }

  return subs;
};

export default function SubarraywithMaximumSum(input) {
  const subArrays = makeSubarrays(input);
  let max = Number.MIN_SAFE_INTEGER;

  for (const array of subArrays) {
    const sum = array.reduce((s, el) => s + el, 0);
    max = Math.max(max, sum);
  }

  return max;
}
