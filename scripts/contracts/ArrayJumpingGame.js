/*
    Array Jumping Game

    You are attempting to solve a Coding Contract. You have 1 tries remaining, after which the contract will self-destruct.
    You are given the following array of integers:

    2,4,1

    Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.

    Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.
    Your answer should be submitted as 1 or 0, representing true and false respectively
*/
export default function ArrayJumpingGame(data, pos = 0) {
  if (pos > data.length) {
    return 0;
  } else if (pos === data.length - 1) {
    return 1;
  } else if (data[pos] === 0) {
    return 0;
  } else {
    for (let i = data[pos]; i > 0; i--) {
      if (ArrayJumpingGame(data, pos + i)) {
        return 1;
      }
    }

    return 0;
  }
}
