/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';
import { hprint } from 'helpers/hprint';
import { typeChar } from 'helpers/infiltrationHelper';

const CLICK_SLEEP_TIME = null;
const CITY = 'New Tokyo';
const LOCATION = 'Noodle Bar';
const GAMES = ['Type it backward'];

const playCutthewires = async () => {
  console.log('INFO Cut the wires with the following properties! (keyboard 1 to 9)!');
  // const tTargets = find('//h5[text() = "Targets:"');
};

const playEnterthecode = async () => {
  console.log('INFO Enter the code!');

  while (document.querySelector('div.MuiPaper-root > h4:nth-child(1)').innerText === 'Enter the Code!') {
    const direction = document.querySelector('div.MuiPaper-root > h4:nth-child(2)').innerText;

    switch (direction) {
      case '↑':
        await typeChar(ns, 'w');
        break;

      case '↓':
        await typeChar(ns, 's');
        break;

      case '←':
        await typeChar(ns, 'a');
        break;

      case '→':
        await typeChar(ns, 'd');
        break;

      default:
        break;
    }

    await ns.sleep(100);
  }
};

const playMatchthesymbols = async () => {
  console.log('INFO Match the symbols!');
  const targetsEl = document.querySelector('.css-1xsuhln-MuiPaper-root > h5').children;

  // get symbols
  const symbols = [];
  for (let i = 0; i < targetsEl.length; i++) {
    symbols.push(targetsEl[i].innerText.substring(0, 2));
  }
  console.log(symbols);

  // get grid
  const gridEl = document.querySelector('.MuiBox-root > div > div > div.MuiPaper-root > div');
  const grid = Array.from(gridEl.children);
  const cols = Math.floor(Math.sqrt(gridEl.children.length));
  let x = 0;
  let y = 0;

  // go through symbols one by one
  for (const target of symbols) {
    // find target in grid
    const tEl = grid.find(e => e.innerText === target);
    const tIn = grid.indexOf(tEl);
    const tx = tIn % cols;
    const ty = Math.floor(tIn / cols);

    while (tx > x) {
      await typeChar(ns, 'd');
      x++;
      await ns.sleep(60);
    }

    while (tx < x) {
      await typeChar(ns, 'a');
      x--;
      await ns.sleep(60);
    }

    while (ty > y) {
      await typeChar(ns, 's');
      y++;
      await ns.sleep(60);
    }

    while (ty < y) {
      await typeChar(ns, 'w');
      y--;
      await ns.sleep(60);
    }

    await typeChar(ns, 'Space');
    await ns.sleep(200);
  }
};

const playSlashwhenhisguardisdown = async () => {
  console.log('INFO Slash when his guard is down!');
  let statusEl;

  do {
    await ns.sleep(100);
    statusEl = document.querySelector(
      '#root > div > div.makeStyles-root-3.MuiBox-root.css-0 > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.css-1gbocki-MuiPaper-root > h4:nth-child(2)'
    );

    // console.log('INLOOP statusEl.textContent', statusEl.textContent);
  } while (statusEl.textContent === 'Guarding ...');

  // console.log('AFTER statusEl.textContent', statusEl.textContent);
  await ns.sleep(250);
  await typeChar(ns, 'Space');
};

const playClosethebrackets = async () => {
  console.log('INFO Close the brackets');
  const brackets = document.querySelector('div.MuiPaper-root > p').innerText;
  // console.log(brackets);

  for (let i = brackets.length - 1; i >= 0; i--) {
    await ns.sleep(100);
    const char = brackets[i];
    switch (char) {
      case '<':
        await typeChar(ns, '>');
        break;

      case '[':
        await typeChar(ns, ']');
        break;

      case '{':
        await typeChar(ns, '}');
        break;

      case '(':
        await typeChar(ns, ')');
        break;

      default:
        break;
    }
  }
};

const playTypeitbackward = async () => {
  console.log('INFO Type it backward');
  let wordsEl = document.querySelector('div.MuiPaper-root > p:nth-child(2)');
  const words = wordsEl.innerText.replace(/\s/g, '_');
  console.log('words', JSON.stringify(words));

  for (let i = 0; i < words.length; i++) {
    const char = words[i];
    await typeChar(ns, char);
    // await ns.sleep(50);

    wordsEl = document.querySelector('div.MuiPaper-root > p:nth-child(2)');
    if (!wordsEl) {
      break;
    }
  }
};

const playSaysomethingniceabouttheguard = async () => {
  console.log('INFO Say something nice about the guard.');
  const NICE_WORDS = [
    'affectionate',
    'agreeable',
    'based',
    'bright',
    'charming',
    'creative',
    'determined',
    'diplomatic',
    'dynamic',
    'energetic',
    'friendly',
    'funny',
    'generous',
    'giving',
    'hardworking',
    'helpful',
    'kind',
    'likable',
    'loyal',
    'nice',
    'patient',
    'polite',
  ];

  let headerEl = document.querySelector('div.MuiPaper-root > h5');

  while (headerEl != null) {
    while (document.querySelector('div.MuiPaper-root > h4:nth-child(1)').innerText === 'Get Ready!') {
      await ns.sleep(100);
    }

    const wordEl = document.querySelector('div.MuiPaper-root > h5:nth-child(3)');
    // console.log('wordEl', wordEl);
    const word = wordEl.innerText;
    console.log('word', word);

    if (NICE_WORDS.includes(word)) {
      await typeChar(ns, '_'); // Space
      await ns.sleep(500);
      headerEl = document.querySelector('div.MuiPaper-root > h5');
    } else {
      await typeChar(ns, 's'); // Down
      // await ns.sleep(50);
    }
  }
};

const playMinesweeper = async () => {
  console.log('INFO Minesweeper.');

  // Step 1: Remember where the mines are
  const gridEl = document.querySelector('.MuiBox-root > div > div > div.MuiPaper-root > div');
  const gridComputedStyle = window.getComputedStyle(gridEl);
  const cols = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
  const rows = gridComputedStyle.getPropertyValue('grid-template-rows').split(' ').length;
  // console.log('cols', cols);
  // console.log('rows', rows);

  const grid = Array.from(gridEl.children);
  // console.log('grid', grid);
  const mines = [];
  for (let i = 0; i < grid.length; i++) {
    // console.log('i', i);
    if (grid[i].children.length > 0) {
      // mine inside
      mines.push(i);
    }
  }

  console.log('mines', mines);

  // Step 2: Wait for the prompt to place the mines
  let headEl = document.querySelector('div.MuiPaper-root > h4:nth-child(1)');
  while (headEl.innerText === 'Remember all the mines!') {
    await ns.sleep(100);
  }

  // Step 3: Place the mines
  // Go through line by line, and if there is a mine, place it
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      if (mines.includes(index)) {
        // console.log('Woohoo! Placing mine at index', index);
        await typeChar(ns, 'Space');
        // await ns.sleep(100);
      }

      await typeChar(ns, 'd');
      // await ns.sleep(100);
    }

    // one more to get back to first column
    // await typeChar(ns, 'd');
    // await ns.sleep(100);
    // go down one
    await typeChar(ns, 's');
    // await ns.sleep(100);
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('sleep');
  ns.clearLog();
  ns.tail();
  const { location, city } = ns.getPlayer();

  if (city !== CITY) {
    hprint(ns, 'You are at location S~%s~ in city S~%s~', location, city);
    hprint(ns, 'W~We are travelling to %s!~', CITY);
    const success = ns.travelToCity(CITY);

    if (!success) {
      hprint(ns, 'E~ERROR~ going to %s. Exiting', CITY);
      ns.exit();
    }
  }

  if (!ns.goToLocation(LOCATION)) {
    hprint(ns, 'E~ERROR~ going to %s. Exiting', LOCATION);
    ns.exit();
  }

  const bInfiltrate = find("//button[text() = 'Infiltrate Company']");
  if (bInfiltrate) {
    await click(bInfiltrate);
  }

  const bStart = find("//button[contains(text(), 'Start')]");
  if (bStart) {
    await click(bStart);
  }

  while (true) {
    ns.print('Looking for game...');
    const gameHeaderEl = document.querySelector('div.MuiPaper-root > h4:nth-child(1)');

    if (!gameHeaderEl || gameHeaderEl.textContent === 'Infiltration successful!') {
      break;
    }

    console.log('gameHeaderEl.textContent', gameHeaderEl.textContent);
    // typeChar(ns, 'w');

    if (find('//h4[text() = "Close the brackets"]')) {
      await playClosethebrackets();
    } else if (find('//h4[text() = "Cut the wires with the following properties! (keyboard 1 to 9)"]')) {
      await playCutthewires();
    } else if (gameHeaderEl.textContent === 'Enter the Code!') {
      await playEnterthecode();
    } else if (gameHeaderEl.textContent === 'Type it backward') {
      await playTypeitbackward();
    } else if (find('//h4[text() = "Match the symbols!"]')) {
      await playMatchthesymbols();
    } else if (find('//h4[text() = "Say something nice about the guard"]')) {
      await playSaysomethingniceabouttheguard();
    } else if (gameHeaderEl.textContent === 'Slash when his guard is down!') {
      await playSlashwhenhisguardisdown();
    } else if (gameHeaderEl.textContent === 'Remember all the mines!') {
      await playMinesweeper();
    } else {
      console.log('No game found...', gameHeaderEl.textContent);
    }

    await ns.sleep(1000);
  }
}

const find = xpath =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const click = async elem => {
  await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
  if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME);
};

// const setText = async (input, text) => {
//   await input[Object.keys(input)[1]].onChange({ isTrusted: true, target: { value: text } });
//   if (CLICK_SLEEP_TIME) await _ns.sleep(CLICK_SLEEP_TIME);
// };

// const typeChar = async char => {
//   // const elem = document.querySelector('#root > div');
//   ns.printf('document: %s', JSON.stringify(document, null, 4));
//   // await elem[Object.keys(elem)[1]].onKeyDown({ isTrusted: true, key: char });
// };
// await terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
// document.body.dispatchEvent(new KeyboardEvent('
