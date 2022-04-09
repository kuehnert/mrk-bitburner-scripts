/*
    Minimum Path Sum in a Triangle

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:

    [
                [4],
              [1,1],
              [7,3,5],
            [1,8,9,6],
            [9,9,9,3,6],
          [7,2,7,6,2,3],
          [8,9,3,1,4,4,1],
        [1,3,4,5,7,8,7,9],
        [4,7,9,6,4,2,1,5,2],
      [1,7,6,9,7,6,7,4,1,1],
      [3,9,3,2,4,7,3,5,3,5,7]
    ]

    Example: If you are given the following triangle:

    [
         [2],
        [3,4],
       [6,5,7],
      [4,1,8,3]
    ]

    The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
*/
export default function MinimumPathSuminaTriangle(input, row = 0, col = 0) {
  if (row === input.length) {
    return 0;
  } else {
    const sumLeft = MinimumPathSuminaTriangle(input, row + 1, col);
    const sumRight = MinimumPathSuminaTriangle(input, row + 1, col + 1);

    return input[row][col] + Math.min(sumLeft, sumRight);
  }
}
