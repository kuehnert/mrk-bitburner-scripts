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
}
