/** @type import(".").NS */
let ns = null;

import { hprint } from 'helpers/hprint';
import { typeChar } from 'helpers/infiltrationHelper';
import { findFaction } from './helpers/factionHelper';
import { amountFromString, formatDuration, formatMoney, formatNumber, formatTime } from './helpers/formatters';
import { findLocation, getCityForLocation } from './helpers/locationHelper';

const doc = eval('document');
const win = eval('window');
const CLICK_SLEEP_TIME = null;
const INFILTRATION_SUCCESS_FILE = '/data/infiltrations.txt';

const prepare = async ({ location, city, sell, faction }) => {
  const { location: myLocation, city: myCity } = ns.getPlayer();
  ns.printf('INFO %s Infiltrating %s in %s for %s', formatTime(ns), location, city, sell ? 'money' : faction);

  if (myCity !== city) {
    hprint(ns, 'You are at location S~%s~ in city S~%s~', myLocation, myCity);
    hprint(ns, 'W~We are travelling to %s!~', city);
    const success = ns.travelToCity(city);

    if (!success) {
      hprint(ns, 'E~ERROR~ going to %s. Exiting', city);
      ns.exit();
    }
  }

  if (!ns.goToLocation(location)) {
    hprint(ns, 'E~ERROR~ going to %s. Exiting', location);
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
};

const playCutthewires = async () => {
  console.log('INFO Cut the wires');

  const gridEl = doc.querySelector('.MuiBox-root.css-0 > div > div > div.MuiPaper-root > div');
  const gridComputedStyle = win.getComputedStyle(gridEl);
  const cols = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
  const colourMap = {
    blue: [],
    red: [],
    white: [],
    yellow: [],
  };

  const boxes = Array.from(gridEl.children);
  for (let i = cols; i < boxes.length; i++) {
    const box = boxes[i];
    const col = (i % cols) + 1;
    let colour = box.style.color;

    if (colour === 'rgb(255, 193, 7)') {
      colour = 'yellow';
    }

    if (!colourMap[colour].includes(col)) {
      colourMap[colour].push(col);
    }
  }

  const instructionsEls = doc.querySelectorAll('div.MuiPaper-root > p');
  const instructions = Array.from(instructionsEls).map(e => e.innerText);

  for (const instruction of instructions) {
    const numberM = instruction.match(/\d/);
    if (numberM) {
      // deal with a number to press
      const number = numberM[0];
      await typeChar(ns, number);
    } else {
      // deal with a colour
      const colourM = instruction.match(/\bred|blue|white|yellow\b/);
      const colour = colourM[0];

      // find all cols with this colour
      const colsToCut = colourMap[colour];
      for (const col of colsToCut) {
        await typeChar(ns, '' + col);
      }
    }
  }
};

const playEnterthecode = async () => {
  console.log('INFO Enter the code!');

  while (doc.querySelector('div.MuiPaper-root > h4:nth-child(1)').innerText === 'Enter the Code!') {
    const direction = doc.querySelector('div.MuiPaper-root > h4:nth-child(2)').innerText;

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

    await ns.sleep(80);
  }
};

const playMatchthesymbols = async () => {
  console.log('INFO Match the symbols!');
  const targetsEl = doc.querySelector('.MuiBox-root > div > div > div.MuiPaper-root:nth-child(3) > h5').children;

  // get symbols
  const symbols = [];
  for (let i = 0; i < targetsEl.length; i++) {
    symbols.push(targetsEl[i].innerText.substring(0, 2));
  }
  console.log(symbols);

  // get grid
  const gridEl = doc.querySelector('.MuiBox-root > div > div > div.MuiPaper-root > div');
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
    }

    while (tx < x) {
      await typeChar(ns, 'a');
      x--;
    }

    while (ty > y) {
      await typeChar(ns, 's');
      y++;
    }

    while (ty < y) {
      await typeChar(ns, 'w');
      y--;
    }

    await typeChar(ns, 'Space');
    await ns.sleep(80);
  }
};

const playSlashwhenhisguardisdown = async () => {
  console.log('INFO Slash when his guard is down!');
  let statusEl;

  do {
    await ns.sleep(100);
    statusEl = doc.querySelector('.MuiPaper-root > h4:nth-child(2)');
  } while (statusEl.textContent === 'Guarding ...');

  await ns.sleep(250);
  await typeChar(ns, 'Space');
};

const playClosethebrackets = async () => {
  console.log('INFO Close the brackets');
  const brackets = doc.querySelector('div.MuiPaper-root > p').innerText;
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
  let wordsEl = doc.querySelector('div.MuiPaper-root > p:nth-child(2)');
  const words = wordsEl.innerText.replace(/\s/g, '_');
  console.log('words', JSON.stringify(words));

  for (let i = 0; i < words.length; i++) {
    const char = words[i];
    await typeChar(ns, char);
    // await ns.sleep(20);

    wordsEl = doc.querySelector('div.MuiPaper-root > p:nth-child(2)');
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

  let headerEl = doc.querySelector('div.MuiPaper-root > h4:nth-child(1)');

  while (headerEl != null && headerEl.innerText === 'Say something nice about the guard') {
    while (doc.querySelector('div.MuiPaper-root > h4:nth-child(1)').innerText === 'Get Ready!') {
      await ns.sleep(100);
    }

    const wordEl = doc.querySelector('div.MuiPaper-root > h5:nth-child(3)');
    console.log('wordEl', wordEl);
    const word = wordEl.innerText;
    console.log('word', word);

    if (NICE_WORDS.includes(word)) {
      await typeChar(ns, '_'); // Space
      await ns.sleep(200);
      headerEl = doc.querySelector('div.MuiPaper-root > h4:nth-child(1)');
    } else {
      await typeChar(ns, 's'); // Down
      // await ns.sleep(50);
    }
  }
};

const playMinesweeper = async () => {
  console.log('INFO Minesweeper.');

  // Step 1: Remember where the mines are
  const gridEl = doc.querySelector('.MuiBox-root > div > div > div.MuiPaper-root > div');
  const gridComputedStyle = win.getComputedStyle(gridEl);
  const cols = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
  const rows = gridComputedStyle.getPropertyValue('grid-template-rows').split(' ').length;

  const grid = Array.from(gridEl.children);
  const mines = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].children.length > 0) {
      // mine inside
      mines.push(i);
    }
  }

  console.log('mines', mines);

  // Step 2: Wait for the prompt to place the mines
  let headEl = doc.querySelector('div.MuiPaper-root > h4:nth-child(1)');
  while (headEl.innerText === 'Remember all the mines!') {
    await ns.sleep(100);
  }

  // Step 3: Place the mines
  // Go through line by line, and if there is a mine, place it
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      if (mines.includes(index)) {
        await typeChar(ns, 'Space');
      }

      await typeChar(ns, 'd');
    }

    // go down one
    await typeChar(ns, 's');
  }
};

const onSuccess = async ({ sell, faction, location }, duration, maxLevel) => {
  let successStr = ns.sprintf('%s Infiltrated %s at %d levels in %s: ', formatTime(ns), location, maxLevel, formatDuration(ns, duration));

  if (sell) {
    // selling
    const bSell = find('//button[contains(text(), "Sell for")]');
    // const priceStr = bSell.innerText.match(/(?<=\$)[0-9\.]+\w?/)[0];
    const priceStr = bSell.children[0].innerText.substring(1);
    // ns.printf("priceStr: %s", priceStr)
    const price = amountFromString(priceStr);
    // ns.printf("price: %d", price)
    await click(bSell);
    const moneyPerSecond = price / (duration / 1000);
    successStr += ns.sprintf('Sold money for %s (%s/s)\n', formatMoney(ns, price), formatMoney(ns, moneyPerSecond));
  } else {
    // trading
    const dFaction = find('//div[contains(text(), "none")]');
    dFaction.focus();
    // await ns.sleep(100);
    await typeChar(ns, 'Down');
    await ns.sleep(50);

    // find faction on list
    const ulEl = doc.querySelector('.MuiPopover-paper > ul');
    const factionEls = Array.from(ulEl.children);
    const factionEl = factionEls.find(fe => fe.innerText === faction);

    if (!factionEl) {
      ns.printf('Faction %s not on list. Exited.', faction);
      return;
    }

    const factionIndex = factionEls.indexOf(factionEl);
    for (let i = 0; i < factionIndex; i++) {
      await typeChar(ns, 'Down');
      // await ns.sleep(60);
    }

    await typeChar(ns, 'Enter');
    // await ns.sleep(60);

    const bTrade = find('//button[contains(text(), "Trade for")]');
    const repStr = bTrade.innerText.match(/[\d\.]+[kmbtq]?/)[0];
    // const repStr = '123.456m';
    const rep = amountFromString(repStr);
    await click(bTrade);
    const repPerSecond = rep / (duration / 1000);

    successStr += ns.sprintf('Traded for %s faction rep for %s (%s rep/s)\n', formatNumber(ns, rep), faction, formatNumber(ns, repPerSecond));
  }

  await ns.write(INFILTRATION_SUCCESS_FILE, successStr, 'a');
  ns.printf('SUCCESS ' + successStr);
};

export const autocomplete = () => ['--sell', '--city', '--location', '--faction'];

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('sleep');
  // ns.clearLog();
  ns.tail();

  const flags = ns.flags([
    ['city', null],
    ['location', "Joe's Guns"],
    ['faction', null],
    ['sell', false],
  ]);

  flags.location = findLocation(ns, flags.location);

  if (!flags.city) {
    const city = getCityForLocation(ns, flags.location);
    if (!city) {
      ns.tprintf("ERROR Don't know the city for location %s. Exiting.", flags.location);
      ns.exit();
    } else {
      flags.city = city;
    }
  }


  if (!flags.sell) {
    const faction = findFaction(flags.faction || '');

    if (!faction) {
      ns.tprintf('ERROR Unknown faction “%s”. Exiting.', flags.faction);
      ns.exit();
    }

    if (!ns.getPlayer().factions.includes(faction)) {
      ns.tprintf("ERROR You're not a member of faction %s. Exiting.", faction);
      ns.exit();
    }

    flags.faction = faction;
  }

  await prepare(flags);
  const startTime = new Date();

  while (true) {
    await ns.sleep(200);
    const gameHeaderEl = doc.querySelector('div.MuiPaper-root > h4:nth-child(1)');

    if (!gameHeaderEl) {
      break;
    }

    const header = gameHeaderEl.textContent;
    const levelEl = find('//h5[contains(text(), "Level")]');
    const [_, level, maxLevel] = levelEl.innerText.match(/Level (\d+)\s*\/\s*(\d+)/);

    if (header === 'Get Ready!') {
      continue;
    } else if (header === 'Infiltration successful!') {
      const finishTime = new Date();
      await onSuccess(flags, finishTime - startTime, maxLevel);
      break;
    }

    ns.printf('Level %2d/%2d %s...', level, maxLevel, header);
    if (header === 'Close the brackets') {
      await playClosethebrackets();
    } else if (header === 'Cut the wires with the following properties! (keyboard 1 to 9)') {
      await playCutthewires();
    } else if (header === 'Enter the Code!') {
      await playEnterthecode();
    } else if (header === 'Type it backward') {
      await playTypeitbackward();
    } else if (header === 'Match the symbols!') {
      await playMatchthesymbols();
    } else if (header === 'Say something nice about the guard') {
      await playSaysomethingniceabouttheguard();
    } else if (header === 'Slash when his guard is down!') {
      await playSlashwhenhisguardisdown();
    } else if (header === 'Remember all the mines!') {
      await playMinesweeper();
    } else if (header !== 'Get Ready!') {
      console.log('No game found...', header);
    }
  }

  // ns.printf('SUCCESS %s infiltration finished: Infiltrating %s in %s', formatTime(ns), flags.location, flags.city);
}

const find = xpath => doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const click = async elem => {
  await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
  if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME);
};
