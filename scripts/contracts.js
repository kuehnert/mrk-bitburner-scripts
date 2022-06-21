/** @type import(".").NS */
let ns = null;

import { formatTime } from 'helpers/formatters';
import { MINUTE } from 'helpers/globals';
import loadServers from 'helpers/loadServers';

import AlgorithmicStockTraderI from '/contracts/AlgorithmicStockTraderI';
import AlgorithmicStockTraderII from '/contracts/AlgorithmicStockTraderII';
import AlgorithmicStockTraderIII from '/contracts/AlgorithmicStockTraderIII';
import AlgorithmicStockTraderIV from '/contracts/AlgorithmicStockTraderIV';
import ArrayJumpingGame from '/contracts/ArrayJumpingGame';
import ArrayJumpingGameII from '/contracts/ArrayJumpingGameII';
import FindAllValidMathExpressions from '/contracts/FindAllValidMathExpressions';
import FindLargestPrimeFactor from '/contracts/FindLargestPrimeFactor';
import GenerateIPAddresses from '/contracts/GenerateIPAddresses';
import MergeOverlappingIntervals from '/contracts/MergeOverlappingIntervals';
import MinimumPathSuminaTriangle from '/contracts/MinimumPathSuminaTriangle';
import SanitizeParenthesesinExpression from '/contracts/SanitizeParenthesesinExpression';
// import ShortestPathinaGrid from '/contracts/ShortestPathinaGrid';
import SpiralizeMatrix from '/contracts/SpiralizeMatrix';
import SubarraywithMaximumSum from '/contracts/SubarraywithMaximumSum';
import TotalWaystoSum from '/contracts/TotalWaystoSum';
// import TotalWaystoSumII from '/contracts/TotalWaystoSumII';
import UniquePathsinaGridI from '/contracts/UniquePathsinaGridI';
import UniquePathsinaGridII from '/contracts/UniquePathsinaGridII';

const SLEEP_TIME = 20 * MINUTE;
const unknownFile = '/data/unknown_contracts.txt';

const getContractsOnServer = server => {
  const files = ns.ls(server, '.cct');
  return files.map(file => ({
    server,
    file,
    type: ns.codingcontract.getContractType(file, server),
  }));
};

const solveContract = async (contract, impossible) => {
  const { file, server } = contract;
  const type = ns.codingcontract.getContractType(file, server);
  contract.input = ns.codingcontract.getData(file, server);
  const scriptName = '/contracts/' + type.replaceAll(' ', '') + '.js';

  if (ns.fileExists(scriptName)) {
    ns.print('INFO Solving contract of type ' + type);
    const call = ns.sprintf('%s(%s)', type.replaceAll(' ', ''), JSON.stringify(contract.input));

    ns.printf('Executing: %s', call);
    const solution = eval(call);
    ns.printf('Solution: %s', solution);
    const result = ns.codingcontract.attempt(solution, file, server, {
      returnReward: true,
    });
    ns.printf('Coding Contract: %s', JSON.stringify(result, null, 4));
    ns.tprintf('Coding Contract: %s', JSON.stringify(result, null, 4));
    await ns.sleep(1000);
  } else {
    ns.printf(
      "WARN Don't know how to solve problem '%s' yet. Saving it in /data/unknown_contracts.txt.",
      type.toUpperCase()
    );
    // contract.description = ns.codingcontract.getDescription(file, server);
    contract.type = type;

    ns.printf('contract: %s', JSON.stringify(contract, null, 4));
    impossible.push(contract);
    await ns.write(unknownFile, JSON.stringify(impossible), 'w');
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('scan');
  ns.disableLog('sleep');
  ns.disableLog('exec');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerNumPortsRequired');
  ns.clearLog();

  ns.tprint('INFO Looking for hacking contracts');
  const servers = await loadServers(ns);
  let contracts;
  let impossible = [];
  if (ns.fileExists(unknownFile)) {
    impossible = JSON.parse(ns.read(unknownFile));
  }

  while (true) {
    contracts = [];

    for (const server of servers) {
      contracts = contracts.concat(getContractsOnServer(server.hostname));
    }

    // remove known unsolvable contracts
    contracts = contracts.filter(c => !impossible.find(e => e.file === c.file));

    // ns.printf('contracts: %s', JSON.stringify(contracts, null, 4));
    // ns.printf('impossible: %s', JSON.stringify(impossible, null, 4));

    if (ns.args[0] === 'noop') {
      ns.tprintf('%s Found %d contracts:\n%s', formatTime(ns), contracts.length, JSON.stringify(contracts, null, 4));
      ns.exit();
    } else if (contracts.length === 0) {
      ns.printf(
        '%s No contracts (%d unkown), sleeping %d minutes...',
        formatTime(ns),
        impossible.length,
        SLEEP_TIME / MINUTE
      );

      if (impossible.length > 0) {
        ns.printf("WARN Unknown contracts on servers: %s", impossible.map(c => c.server).join(", "));
      }
      await ns.sleep(SLEEP_TIME);
    } else {
      ns.printf('%s Found %d contracts: ', formatTime(ns), contracts.length);
      // ns.printf('contracts: %s', JSON.stringify(contracts, null, 4));

      for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        await solveContract(contract, impossible);
        await ns.sleep(1000);
      }
    }

    await ns.sleep(1000);
  }
}
