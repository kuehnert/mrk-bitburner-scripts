/*
    Generate IP Addresses;

    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
    Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:

    25319529186
    19724549160

    Note that an octet cannot begin with a '0' unless the number itself is actually 0. For example, '192.168.010.1' is not a valid IP.

    Examples:
    25525511135 -> [255.255.11.135, 255.255.111.35]
    1938718066 -> [193.87.180.66];
*/
export default function GenerateIPAddresses(rest, dotCount = 3, out = '') {
  if (dotCount === 0) {
    if (rest.length < 4) {
      const candidate = out + rest;
      const valid = candidate
        .split('.')
        .every(
          octet =>
            (+octet > 0 && +octet < 256 && octet[0] !== '0') || +octet === 0
        );
      if (valid) {
        return [candidate];
      }
    }
    return [];
  } else {
    let solutions = [];
    for (let i = 1; i < Math.min(rest.length, 4); i++) {
      const bit = rest.substring(0, i);
      const newRest = rest.substring(i);
      solutions = solutions.concat(
        GenerateIPAddresses(newRest, dotCount - 1, out + bit + '.')
      );
    }

    return solutions;
  }
}
