/** @type import(".").NS */
let ns = null;

const doc = eval('document');
const win = eval('window');

import { formatMoney } from './helpers/formatters';
import { hprint } from './helpers/hprint';
import { casinoFlag } from './helpers/globals';

const MAX_WAGER = 100000000;
const CLICK_SLEEP_TIME = null;
const SAVE_SLEEP_TIME = 20;

export async function main(_ns) {
  ns = _ns;
  // ns.disableLog('sleep');
  // ns.clearLog();
  // ns.tail();

  if (ns.fileExists(casinoFlag)) {
    ns.print('Already been to the casino. Exiting.');
    ns.exit();
  }

  const { location, city } = ns.getPlayer();

  if (city !== 'Aevum') {
    hprint(ns, 'You are in location S~%s~ in city S~%s~', location, city);
    hprint(ns, 'W~We are travelling to Aevum!~');
    const success = ns.travelToCity('Aevum');

    if (!success) {
      hprint(ns, 'E~ERROR~ going to Aevum. Exiting');
      ns.exit();
    }
  }

  const bSave = find("//button[@aria-label = 'save game']");
  await click(bSave); // save if we won
  await ns.asleep(SAVE_SLEEP_TIME);

  if (location !== 'Iker Molina Casino') {
    const success = ns.goToLocation('Iker Molina Casino');

    if (!success) {
      hprint(ns, 'E~ERROR~ going to Iker Molina Casino. Exiting');
      ns.exit();
    }
  }

  const bStopPlaying = find("//button[text() = 'Stop playing']");
  if (bStopPlaying) {
    await click(bStopPlaying);
  }

  const bBlackjack = find("//button[contains(text(), 'Play blackjack')]");
  if (bBlackjack) {
    await click(bBlackjack);
  }

  const tfWager = find('//input[@value = 1000000]');
  const myMoney = ns.getServerMoneyAvailable('home');
  const wager = Math.floor(Math.min(MAX_WAGER, myMoney));
  ns.printf('Wagering %s/%s money', formatMoney(ns, wager), formatMoney(ns, MAX_WAGER));
  setText(tfWager, '' + wager);
  let winCounter = 0;

  while (true) {
    const bStart = find("//button[text() = 'Start']");
    if (!bStart) {
      ns.print('Sumting wong. Exiting.');
    }
    await click(bStart); // start new round

    const pCount = find("//p[contains(text(), 'Count:')]");
    // await click(bSave); // save if we won

    let won = null;
    while (won === null) {
      if (winCounter > 15) {
        await ns.write(casinoFlag, 'We rock!', 'w');
        ns.print('We seem to have been kicked out. Exiting.');
        ns.exit();
      }

      const bHit = find("//button[text() = 'Hit']");
      let allCounts = pCount.querySelectorAll('span');
      let total = Number(allCounts[allCounts.length - 1].innerText);
      ns.printf('INFO Starting new round with total: %d', total);
      // await ns.sleep(4000);

      while (bHit && total < 17) {
        await click(bHit);
        allCounts = pCount.querySelectorAll('span');
        total = Number(allCounts[allCounts.length - 1].innerText);
        ns.printf('Got one more card, total: %s', total);
        // await ns.sleep(4000);
      }

      const bStay = find("//button[text() = 'Stay']");
      if (bStay && total <= 21) {
        await click(bStay);
      }

      if (find("//p[contains(text(), 'You lost')]")) {
        ns.print('WARN LOST game, loading last save...');
        win.onbeforeunload = null; // disable unsaved warning
        await ns.sleep(SAVE_SLEEP_TIME);
        win.location.reload(); // force refresh
        return ns.asleep(10000); // keep script alive to be safe
      }

      if (find("//p[contains(text(), 'You won')]") || find("//p[contains(text(), 'You Won')]")) {
        ns.print('SUCCESS WON game.');
        won = true;
        winCounter += 1;
      }

      if (find("//p[contains(text(), 'Tie')]")) {
        ns.print('INFO TIED game.');
        break;
      }
    }

    await click(bSave); // save if we won
    await ns.asleep(SAVE_SLEEP_TIME);
  }
}

const find = xpath =>
  doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const click = async elem => {
  await elem[Object.keys(elem)[1]].onClick({ isTrusted: true });
  if (CLICK_SLEEP_TIME) await ns.asleep(CLICK_SLEEP_TIME);
};

const setText = async (input, text) => {
  await input[Object.keys(input)[1]].onChange({ isTrusted: true, target: { value: text } });
  if (CLICK_SLEEP_TIME) await _ns.asleep(CLICK_SLEEP_TIME);
};
