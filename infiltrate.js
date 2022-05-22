/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';
import { hprint } from 'helpers/hprint';

const MAX_WAGER = 100000000;
const CLICK_SLEEP_TIME = null;
const SAVE_SLEEP_TIME = 500;
const CITY = 'New Tokyo';
const LOCATION = 'Noodle Bar';
const GAMES = ['Type it backward'];

const playCutthewires = async () => {
  ns.print('INFO Cut the wires with the following properties! (keyboard 1 to 9)!');
  // const tTargets = find('//h5[text() = "Targets:"');
};

const playEnterthecode = async () => {
  ns.print('INFO Enter the code!');

  while (
    document.querySelector(
      '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(2) > h4:nth-child(1)'
    ).innerText === 'Enter the Code!'
  ) {
    const target = document.querySelector(
      '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(2) > h4:nth-child(2)'
    );
    switch (target.innerText) {
      case '↑':
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        break;

      case '↓':
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
        break;

      case '←':
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        break;

      case '→':
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
        break;

      default:
        break;
    }

    await ns.sleep(100);
  }
};

const playMatchthesymbols = async () => {
  ns.print('INFO Match the symbols!');
  const tTargets = document.querySelector(
    '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(2) > h5'
  );

  // get symbols
  const symbols = [];
  for (let i = 0; i < tTargets.children.length; i++) {
    symbols.push(tTargets.children[i].innerText.substring(0, 2));
  }
  ns.print(symbols);

  // get grid
  const firstLine = document.querySelector("#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(2) > div:nth-child(4) > p");
  const grid = [];
  for (let i = 0; i < firstLine.children.length; i++) {
    grid.push(firstLine.children[i].innerText.substring(0, 2));
  }
  ns.print(grid);

  await ns.sleep(1000);
};

const playSlashwhenhisguardisdown = async () => {
  ns.print('INFO Slash when his guard is down!');
};

const playClosethebrackets = async () => {
  ns.print('INFO Close the brackets');
  const brackets = document.querySelector(
    '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(2) > p'
  ).innerText;

  ns.print(brackets);

  for (let i = 0; i < brackets.length; i++) {
    const char = brackets[i];
    document.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
    await ns.sleep(100);
  }
};

const playTypeitbackward = async () => {
  ns.print('INFO Type it backward');
  const words = document.querySelector(
    '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div:nth-child(3) > p'
  ).innerText;
  ns.print(words);

  for (let i = 0; i < words.length; i++) {
    const char = words[i];
    typeChar(char);
    await ns.sleep(100);
  }
};

const playSaysomethingniceabouttheguard = async () => {
  ns.print('INFO Say something nice about the guard.');
  const tWord = document.querySelector(
    '#root > div > div.jss3.MuiBox-root.css-0 > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1cwz49y > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-6.css-qqlytg > h5:nth-child(1)'
  );
  ns.print(tWord);

  for (let i = 0; i < 5; i++) {
    typeChar('w');
    await ns.sleep(100);
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

  /*
  // const bSave = find("//button[@aria-label = 'save game']");
  const tfWager = find('//input[@value = 1000000]');
  const myMoney = ns.getServerMoneyAvailable('home');
  const wager = Math.min(MAX_WAGER, myMoney);
  ns.printf('Wagering %s/%s money', formatMoney(ns, wager), formatMoney(ns, MAX_WAGER));
  setText(tfWager, '' + wager);
  */

  while (true) {
    ns.print("Looking for game...")
    typeChar("w");

    if (find('//h4[text() = "Close the brackets"]')) {
      await playClosethebrackets();
    } else if (find('//h4[text() = "Cut the wires with the following properties! (keyboard 1 to 9)"]')) {
      await playCutthewires();
    } else if (find('//h4[text() = "Enter the Code!"]')) {
      await playEnterthecode();
    } else if (find('//h4[text() = "Type it backward"]')) {
      await playTypeitbackward();
    } else if (find('//h4[text() = "Match the symbols!"]')) {
      await playMatchthesymbols();
    } else if (find('//h4[text() = "Say something nice about the guard."]')) {
      await playSaysomethingniceabouttheguard();
    } else if (find('//h4[text() = "Slash when his guard is down!"]')) {
      await playSlashwhenhisguardisdown();
    } else {
      // ns.print('No game found...');
    }

    await ns.sleep(500);
  }
}

const find = xpath =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const click = async elem => {
  await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
  if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME);
};

const setText = async (input, text) => {
  await input[Object.keys(input)[1]].onChange({ isTrusted: true, target: { value: text } });
  if (CLICK_SLEEP_TIME) await _ns.sleep(CLICK_SLEEP_TIME);
};

const typeChar = async char => {
  // const elem = document.querySelector('#root > div');
  ns.printf('document: %s', JSON.stringify(document, null, 4));
  // await elem[Object.keys(elem)[1]].onKeyDown({ isTrusted: true, key: char });
};
// await terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
// document.body.dispatchEvent(new KeyboardEvent('
