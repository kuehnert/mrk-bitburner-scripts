const replacements = [
  [/I~([^~]+)~/g, '!$1!'],
  [/S~([^~]+)~/g, '!$1!'],
  [/W~([^~]+)~/g, '!$1!'],
  [/E~([^~]+)~/g, '!$1!'],
];

export const hprint = (ns, text, ...args) => {
  args && (text = ns.sprintf(text, ...args)); // format string
  const out = replacements.reduce((out, [regex, repl]) => out.replace(regex, repl), text);
  ns.tprint(out);
};
