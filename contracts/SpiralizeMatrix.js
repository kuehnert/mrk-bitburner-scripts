/*
    Spiralize Matrix

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    Given the following array of arrays of numbers representing a 2D matrix, return the elements of the matrix as an array in spiral order:
        [
            [43,20,34,21,21,13,29,22]
            [ 2,45,42, 7,34,13,13,36]
            [33,11,15,39,11,23,24,45]
            [41, 1,35,38,12,24,31, 5]
            [27, 5,25,38,35,50, 5,28]
            [43,38,48,41,36,37, 7, 4]
            [11,13,41,36,26,23,26, 2]
        ]

    Here is an example of what spiral order should be:
        [
            [1, 2, 3]
            [4, 5, 6]
            [7, 8, 9]
        ]
    Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]

    Note that the matrix will not always be square:
        [
            [1,  2,  3,  4]
            [5,  6,  7,  8]
            [9, 10, 11, 12]
        ]
    Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
*/
const directions = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

export default function SpiralizeMatrix(data) {
  const width = data[0].length;
  const height = data.length;

  const padded = Array(height + 2)
    .fill(null)
    .map(() => Array(width + 2).fill(-1));

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      padded[i + 1][j + 1] = data[i][j];
    }
  }

  let pos = { x: 1, y: 1 };
  let dir = 0;
  let output = [];
  let counter = 0;

  while (counter < width * height) {
    output.push(padded[pos.y][pos.x]);
    padded[pos.y][pos.x] = -1;

    let newPos = { x: pos.x + directions[dir].x, y: pos.y + directions[dir].y };
    if (padded[newPos.y][newPos.x] === -1) {
      dir = (dir + 1) % 4;
      newPos = { x: pos.x + directions[dir].x, y: pos.y + directions[dir].y };
    }
    pos = newPos;
    counter++;
  }

  return output;
}
