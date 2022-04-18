/** @type import(".").NS */
let ns = null;

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
import ShortestPathinaGrid from '/contracts/ShortestPathinaGrid';
import SpiralizeMatrix from '/contracts/SpiralizeMatrix';
import SubarraywithMaximumSum from '/contracts/SubarraywithMaximumSum';
import TotalWaystoSum from '/contracts/TotalWaystoSum';
import UniquePathsinaGridI from '/contracts/UniquePathsinaGridI';
import UniquePathsinaGridII from '/contracts/UniquePathsinaGridII';

const ONE_MINUTE = 60000;
const SLEEP_TIME = 10 * ONE_MINUTE;
let doneServers;
let contracts;
const impossible = [];

async function scanContractServers(server, path = []) {
  if (server.match('Attack')) {
    return;
  }

  // ns.printf('looking at server %s', server);
  const files = ns.ls(server, '.cct');

  for (const file of files) {
    contracts.push({
      server,
      file,
      type: ns.codingcontract.getContractType(file, server),
      path: path
        .concat(server)
        .map(el => 'connect ' + el)
        .join('; '),
    });
  }

  // scan for connected servers
  let servers = ns.scan(server);
  for (const remote of servers) {
    if (!doneServers.includes(remote)) {
      doneServers.push(remote);
      path.push(server);
      await scanContractServers(remote, path);
      path.pop();
    }
  }
}

const solveContract = async contract => {
  const { file, server } = contract;
  const type = ns.codingcontract.getContractType(file, server);
  contract.input = ns.codingcontract.getData(file, server);
  const scriptName = '/contracts/' + type.replaceAll(' ', '') + '.js';

  if (impossible.find(c => c.type === type)) {
    ns.print('.');
  } else if (ns.fileExists(scriptName)) {
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
  } else {
    ns.printf(
      "WARN Don't know how to solve %s yet. Saving it in /data/unknown_contracts.txt.",
      type.toUpperCase()
    );
    // contract.description = ns.codingcontract.getDescription(file, server);
    contract.type = type;

    ns.printf('contract: %s', JSON.stringify(contract, null, 4));
    impossible.push(contract);
    await ns.write('/data/unknown_contracts.txt', JSON.stringify(impossible), 'w');
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('scan');
  ns.disableLog('sleep');
  ns.disableLog('exec');
  ns.clearLog();

  let servers = ns.scan('home');

  while (true) {
    doneServers = ['home'];
    contracts = [];

    for (const remote of servers) {
      doneServers.push(remote);
      await scanContractServers(remote, []);
    }

    // remove known unsolvable contracts
    contracts = contracts.filter(c => impossible.find(e => e.file === c.file));

    if (ns.args[0] === 'noop') {
      ns.tprintf('Found %d contracts:\n%s', contracts.length, JSON.stringify(contracts, null, 4));
      ns.exit();
    } else if (contracts.length === 0) {
      ns.printf('No contracts, sleeping %d minutes...', SLEEP_TIME / ONE_MINUTE);
      await ns.sleep(SLEEP_TIME);
    } else {
      ns.printf('Found ' + contracts.length + ' contracts: ');
      for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        await solveContract(contract);
      }
    }
  }
}
