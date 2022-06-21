/*
    Find All Valid Math Expressions

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    You are given the following string which contains only digits between 0 and 9:
        364767
    You are also given a target number of 32. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

    The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

        ["364767", 32]
        ['30901264532', -66]
        ["29953729204", 46]
        ['123', 6]

    NOTE: The order of evaluation expects script operator precedence
    NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

        Input: digits = "123", target = 6
        Output: [1+2+3, 1*2*3]

        Input: digits = "105", target = 5
        Output: [1*0+5, 10-5]
*/
const operators = ['', '+', '-', '*'];
let solutions;

const possibilities = (targetSum, finished, remaining) => {
  if (remaining.length === 0) {
    // check there are no numbers starting with 0
    if (!finished.split(/[\+\-\*]/).some(v => v.match(/^0\d/))) {
      const result = eval(finished);
      if (result === targetSum) {
        solutions.push(finished);
      }
    }
  } else {
    const nextDigit = remaining[0];
    const newRemaining = remaining.substring(1);

    for (const op of operators) {
      possibilities(targetSum, finished + op + nextDigit, newRemaining);
    }
  }
};

export default function FindAllValidMathExpressions(data) {
  const digits = data[0];
  const targetSum = data[1];
  solutions = [];
  possibilities(targetSum, digits[0], digits.substring(1));
  return solutions;
}
