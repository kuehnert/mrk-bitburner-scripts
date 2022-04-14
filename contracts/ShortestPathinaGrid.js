/*
    Shortest Path in a Grid

    You are located in the top-left corner of the following grid:
      [[0,0,0,0,1,0,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,1,0,1,1,1],
      [1,0,0,1,0,0,1,0,0,0,1,0],
      [0,1,0,0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,1,0],
      [1,0,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,1,0,1,1,0,1,0,0,0],
      [0,0,1,1,0,0,0,0,0,1,0,0],
      [0,0,1,1,0,0,0,0,0,0,0,0]]
    You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.
    Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path
    NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
    NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

    Examples:
        [[0,1,0,0,0],
        [0,0,0,1,0]]

    Answer: 'DRRURRD'
        [[0,1],
        [1,0]]

    Answer: '';
*/
const directions = [
  { name: 'R', x: 1, y: 0 },
  { name: 'D', x: 0, y: 1 },
  { name: 'L', x: -1, y: 0 },
  { name: 'U', x: 0, y: -1 },
];

const invalidX = (grid, x) => {
  return x < 0 || x >= grid[0].length;
};

const invalidY = (grid, y) => {
  return y < 0 || y >= grid.length;
};

// Tiefensuche. Breitensuche wäre wesentlich intelligenter/schneller
const findShortestPath = (grid, x = 0, y = 0, path = '') => {
  if (y === grid.length - 1 && x === grid[0].length - 1) {
    // we've reached our destination
    // console.log('path', path);
    return path;
  } else if (invalidY(grid, y) || invalidX(grid, x) || grid[y][x] > 0) {
    // invalid location, wall, or been there already
    return null;
  } else {
    grid[y][x] = 2;
    let best = null;

    for (const direction of directions) {
      const newSolution = findShortestPath(
        grid,
        x + direction.x,
        y + direction.y,
        path + direction.name
      );

      if (!best || (newSolution && newSolution.length < best.length)) {
        best = newSolution;
      }
    }

    grid[y][x] = 0;
    return best;
  }
};

export default function ShortestPathinaGrid(grid) {
  const result = findShortestPath(grid);
  return result ? result : '';
}
