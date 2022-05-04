/** @type import(".").NS */
let ns = null;

import { hprint, tablePrint } from '/helpers/hprint';

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  hprint(ns, 'Hallo %d %s', 123, 'World');
  hprint(ns, 'Hallo I~Friend~ W~orange~ E~red~ S~what~ normal\ttab\tab	tab');

  const headers = ['Name', 'Age', 'Size', 'Description'];
  const data = [
    ['Matt', 47, 'the biggest', 'Goldilocks Zone'],
    ['Joe', 42, 'the dummest', 'Goldilocks Zone'],
    ['Jens', 17, 'the by far dummest', 'Goldilocks Zone'],
  ];

  tablePrint(ns, headers, data);
  tablePrint(ns, headers, data);

  // Acquire a reference to the terminal text field
  const terminalInput = ns['document'].getElementById('terminal-input');

  // Set the value to the command you want to run.
  terminalInput.value = 'home;connect n00dles;home;connect n00dles;home;';

  // Get a reference to the React event handler.
  const handler = Object.keys(terminalInput)[1];

  // Perform an onChange event to set some internal values.
  terminalInput[handler].onChange({ target: terminalInput });

  // Simulate an enter press
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}
