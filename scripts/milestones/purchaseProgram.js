/** @type import("..").NS */
let ns = null;

import { MILLION, THOUSAND } from '/helpers/globals';
// const UNWANTED = ['ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe', 'Formulas.exe'];

const PRICES = {
  'BruteSSH.exe': 200 * THOUSAND,
  'FTPCrack.exe': 1.5 * MILLION,
  'RelaySMTP.exe': 5 * MILLION,
  'HTTPWorm.exe': 30 * MILLION,
  'SQLInject.exe': 250 * MILLION,
};

const isDone = ({ program }) => ns.fileExists(program, 'home');

const checkPreReqs = ({ program }) =>
  PRICES[program] <= ns.getServerMoneyAvailable('home') ? null : { money: PRICES[program] };

const perform = ({ program }) => ns.purchaseProgram(program);

export default async function main(_ns, params) {
  ns = _ns;

  if (params.getName) {
    return ns.sprintf('Purchase program %s', params.program);
  } else if (params.checkIsDone) {
    return isDone(params);
  } else if (params.checkPreReqs) {
    return checkPreReqs(params);
  } else {
    return perform(params);
  }
}
