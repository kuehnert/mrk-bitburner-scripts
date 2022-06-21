/*
    Sanitize Parentheses in Expression;

    You are attempting to solve a Coding Contract. You have 9 tries remaining, after which the contract will self-destruct.
    Given the following string:

    * (aa)((()))a))(
    * )())())(a)))
    * ((a)a()a))a)aa(

    remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results. The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.

    IMPORTANT: The string may contain letters, not just parentheses. Examples:
    "()())()" -> [()()(), (())()]
    "(a)())()" -> [(a)()(), (a())()]
    ")(" -> [""]
*/
const isValid = term => {
  let level = 0;

  for (let i = 0; i < term.length; i++) {
    const char = term[i];
    if (char === '(') {
      level += 1;
    } else if (char === ')') {
      if (level <= 0) {
        return false;
      } else {
        level -= 1;
      }
    }
  }

  return level === 0;
};

const removeParenthesis = (term, depth = 0) => {
  let solutions = [];

  for (let i = 0; i < term.length; i++) {
    const char = term[i];

    if (char === '(' || char === ')') {
      const without = term.substring(0, i) + term.substring(i + 1);

      if (depth > 0) {
        solutions = solutions.concat(removeParenthesis(without, depth - 1));
      } else if (isValid(without)) {
        solutions.push(without);
      }
    }
  }

  return solutions;
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export default function SanitizeParenthesesinExpression(term) {
  for (let depth = 0; depth < term.length; depth++) {
    const removeResult = removeParenthesis(term, depth);

    if (removeResult.length > 0) {
      return removeResult.filter(onlyUnique).sort();
    }
  }

  return '[""]';
}
