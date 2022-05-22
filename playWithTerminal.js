/** @type import(".").NS */
let ns = null;

import { hprint, tablePrint } from '/helpers/hprint';

const demoTablePrint = () => {
  const headers = ['Name', 'Age', 'Size', 'Description'];
  const data = [
    ['Matt', 47, 'the biggest', 'Goldilocks Zone'],
    ['Joe', 42, 'the dummest', 'Goldilocks Zone'],
    ['Jens', 17, 'the by far dummest', 'Goldilocks Zone'],
  ];

  tablePrint(ns, headers, data);
};

const cmdInTerminal = (cmd) => {
  // Acquire a reference to the terminal text field
  const terminalInput = document.getElementById('terminal-input');

  // Set the value to the command you want to run.
  terminalInput.value = cmd;

  // Get a reference to the React event handler.
  const handler = Object.keys(terminalInput)[1];

  // Perform an onChange event to set some internal values.
  terminalInput[handler].onChange({ target: terminalInput });

  // Simulate an enter press
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
};

// let tcommand = x => {
//   tIn.value = x;
//   tEv.onChange({ target: tIn });
//   tEv.onKeyDown({ keyCode: '13', preventDefault: () => 0 });
// };

const fakeKeyDown = (element, key) => {
  const handler = Object.keys(element)[1];
  element[handler].onKeyDown({ isTrusted: true, key });
};

const typeChar = async char => {
  const elem = document.querySelector('#root');
  // await elem[Object.keys(elem)[1]].onKeyDown({ isTrusted: true, key: 'c', metaKey: true });
  // await elem[Object.keys(elem)[1]].onKeyDown({ isTrusted: true, code: 'KeyV' });
  await document.onKeyDown({ isTrusted: true, code: 'KeyV' });
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  hprint(ns, 'Hallo %d %s', 123, 'World');
  hprint(ns, 'Hallo I~Friend~ W~orange~ E~red~ S~what~ normal\ttab\tab	tab');
  hprint(ns, 'Click this <span class="info" onClick="cmdInTerminal(\'home\')">link</span> and you\'ll feel much better!');
  hprint(ns, 'Click [BUTTON]("home; buy -l"), and you\'ll feel like a new man!');

  // cmdInTerminal("run doGym.js --level 10");

  // const terminalInput = document.getElementById('terminal-input');
  // fakeKeyDown(terminalInput, 'w');

  // terminalInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true, isTrusted: true }));

  // typeChar('a');
  // typeChar('b');
  // typeChar('c');
  // typeChar('d');
  // typeChar('e');
  // typeChar('f');

  // var keyboardEvent = document.createEvent('KeyboardEvent');
  // var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';

  // keyboardEvent[initMethod](
  //   'keydown', // event type: keydown, keyup, keypress
  //   true, // bubbles
  //   true, // cancelable
  //   window, // view: should be window
  //   false, // ctrlKey
  //   false, // altKey
  //   false, // shiftKey
  //   false, // metaKey
  //   40, // keyCode: unsigned long - the virtual key code, else 0
  //   0 // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
  // );
  // document.dispatchEvent(keyboardEvent);
  // document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 65, which: 65 }));

  getEventListeners(document).keydown.forEach((list) => {list.listener(new KeyboardEvent('keydown', {key: 'a', isTrusted: true}))})
}
