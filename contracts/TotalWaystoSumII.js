/*
    Total Ways to Sum II

    How many different distinct ways can the number 71 be written as a sum of integers contained in the set:
    [1,2,5,7,8,10,11,12,13,15]?
    You may use each integer in the set zero or more times.
*/
const sumUp = (target, sum, numbers) => {
  if (sum === target) {
    return 1;
  } else if (sum > target || numbers.length === 0) {
    return 0;
  } else {
    let ways = 0;
    const maxI = Math.floor((target - sum) / numbers[0]);

    for (let i = 0; i <= maxI; i++) {
      const isum = sum + i * numbers[0];
      const newNumbers = numbers.slice(1);
      ways += sumUp(target, isum, newNumbers);
    }

    return ways; //?
  }
};

export default function TotalWaysToSumII(input) {
  const [target, numbers] = input;
  return sumUp(target, 0, numbers);
}
