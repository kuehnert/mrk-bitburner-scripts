/*
    Unique Paths in a Grid I

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    You are in a grid with 9 rows and 14 columns, and you are positioned in the top-left corner of that grid. You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Determine how many unique paths there are from start to finish.
    NOTE: The data returned for this contract is an array with the number of rows and columns:
    [9, 14]
*/
import UniquePathsinaGridII from '/contracts/UniquePathsinaGridII';

const makeGrid = (rows, cols) => {
  return Array(rows).fill(Array(cols).fill(0));
};

export default function UniquePathsinaGridI([rows, cols]) {
  return UniquePathsinaGridII(makeGrid(rows, cols));
}
