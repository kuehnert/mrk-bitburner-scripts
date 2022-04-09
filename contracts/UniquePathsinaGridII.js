/*
    Unique Paths in a Grid II

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    You are located in the top-left corner of the following grid:
        0,0,1,0,0,1,0,0,0,1,0,
        0,0,0,1,0,0,0,0,0,0,0,
        0,0,1,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,1,0,0,0,0,
        1,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,1,0,0,0,0,0,
        0,0,1,0,0,0,0,0,0,1,0,
        0,1,0,0,0,0,1,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,1,1,
        0,1,1,0,0,0,0,0,0,0,0,
    You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

    Determine how many unique paths there are from start to finish.
    NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
*/
export default function UniquePathsinaGridII(data, cols, pos = 0) {
  if (data[pos] === 1) {
    return 0;
  } else if (pos === data.length - 1) {
    return 1;
  } else {
    const waysRight =
      (pos + 1) % cols !== 0 && pos + 1 < data.length
        ? UniquePathsinaGridII(data, cols, pos + 1)
        : 0;

    const waysDown =
      pos + cols < data.length
        ? UniquePathsinaGridII(data, cols, pos + cols)
        : 0;

    return waysRight + waysDown;
  }
}
