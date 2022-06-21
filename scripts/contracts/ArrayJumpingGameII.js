/*
    Array Jumping Game II

    You are given the following array of integers:
    6,3,0,5,2,3,1,5,8,1,2,2,1,2,4,4,2,3,5
    Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
    Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
    If it's impossible to reach the end, then the answer should be 0.
*/
export default function ArrayJumpingGameII(data, pos = 0, jumps = 0) {
  if (pos > data.length) {
    return Number.MAX_SAFE_INTEGER;
  } else if (pos === data.length - 1) {
    return jumps;
  } else if (data[pos] === 0) {
    return Number.MAX_SAFE_INTEGER;
  } else {
    let minJumps = Number.MAX_SAFE_INTEGER;

    for (let i = data[pos]; i > 0; i--) {
      const successJumps = ArrayJumpingGameII(data, pos + i, jumps + 1);
      minJumps = Math.min(minJumps, successJumps);
    }

    return minJumps;
  }
}
