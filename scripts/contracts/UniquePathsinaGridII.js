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
export default function UniquePathsinaGridII(data, x = 0, y = 0) {
  const rows = data.length;
  const cols = data[0].length;

  if (y === rows || x === cols || data[y][x] === 1) {
    return 0;
  } else if (y === rows - 1 && x === cols - 1) {
    return 1;
  } else {
    const waysRight = UniquePathsinaGridII(data, x + 1, y);
    const waysDown = UniquePathsinaGridII(data, x, y + 1);

    return waysRight + waysDown;
  }
}
