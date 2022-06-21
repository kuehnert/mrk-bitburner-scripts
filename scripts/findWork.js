/** @type import(".").NS */
let ns = null;

import { formatMoney } from '/helpers/formatters';

const fields = [
  'software',
  'software consultant',
  'it',
  'security engineer',
  'network engineer',
  'business',
  'business consultant',
  'security',
  'agent',
  'employee',
  'part-time employee',
  'waiter',
  'part-time waiter  ',
];

const logJob = ({ company, field, workMoneyGainRate, workRepGainRate, hackGainRate }) => {
  ns.tprintf(
    '%-25s\t%-20s\t%s/s\t%.1f/s\t%.1f/s',
    company,
    field,
    formatMoney(ns, workMoneyGainRate),
    workRepGainRate,
    hackGainRate
  );
};

export const findOrganisations = async (force = false) => {
  if (!force && ns.fileExists('/data/organisations.txt')) {
    ns.printf('Loading Organisations...');
    return JSON.parse(ns.read('/data/organisations.txt'));
  } else {
    if (!ns.fileExists('/data/servers.txt')) {
      ns.printf('File servers.txt does not exist. Please run ScanServers.js');
      ns.exit();
    }

    const organisations = JSON.parse(ns.read('/data/servers.txt'))
      .map(s => s.organizationName)
      .filter(o => o !== '');
    // ns.printf('organisations: %s', JSON.stringify(organisations, null, 4));

    await ns.write('/data/organisations.txt', JSON.stringify(organisations), 'w');

    return organisations;
  }
};

const findCompanies = async ({ refreshCompanies }) => {
  if (!refreshCompanies && ns.fileExists('/data/companies.txt')) {
    ns.printf('Loading Companies...');
    return JSON.parse(ns.read('/data/companies.txt'));
  } else {
    const organisations = await findOrganisations(refreshCompanies);

    const companies = [];

    for (const organisation of organisations) {
      try {
        ns.applyToCompany(organisation, fields[0]);
        companies.push(organisation);
      } catch (error) {
        // Company does not exist, don't add it, don't complain
      }
    }

    // ns.printf('companies: %s', JSON.stringify(companies, null, 4));
    await ns.write('/data/companies.txt', JSON.stringify(companies), 'w');
    return companies;
  }
};

const findJobs = async ({ refreshJobs, refreshCompanies }) => {
  if (!refreshJobs && !refreshCompanies && ns.fileExists('/data/jobs.txt')) {
    ns.printf('Loading Jobs...');
    return JSON.parse(ns.read('/data/jobs.txt'));
  } else {
    const companies = await findCompanies(refreshCompanies);
    let jobs = [];

    for (const company of companies) {
      for (const field of fields) {
        const success = ns.applyToCompany(company, field);
        if (success) {
          jobs.push({ company, field });
          await ns.sleep(50);
        }
      }
    }

    jobs = jobs.sort((a, b) => a.company.localeCompare(b.company));

    await ns.write('/data/jobs.txt', JSON.stringify(jobs), 'w');
    return jobs;
  }
};

/**
 * work for each available job for a certain amoung of time to determine income
 * @param {*} force force redetermination of available jobs
 */
const findBestJobs = async ({ refreshRates, refreshJobs, refreshCompanies }) => {
  let jobs = await findJobs({ refreshJobs, refreshCompanies });

  if (refreshRates || refreshJobs || refreshCompanies || jobs[0].workMoneyGainRate == null) {
    for (const job of jobs) {
      const { company, field } = job;
      ns.applyToCompany(company, field);
      ns.workForCompany(company);
      await ns.sleep(50);
      const player = ns.getPlayer();

      ns.stopAction();
      job.workMoneyGainRate = player.workMoneyGainRate * 5;
      job.workRepGainRate = player.workRepGainRate * 5;
      job.hackGainRate = player.workHackExpGainRate * 5;
    }

    jobs = jobs.sort((a, b) => b.workMoneyGainRate - a.workMoneyGainRate);
    await ns.write('/data/jobs.txt', JSON.stringify(jobs), 'w');
  }

  return jobs;
};

const findBestJob = async flags => {
  const jobs = await findBestJobs(flags);
  return jobs[0];
};

export const autocomplete = () => [
  'list',
  '--hackGain',
  '--repGain',
  '--refreshJobs',
  '--refreshRates',
  '--refreshCompanies',
];

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('disableLog');
  ns.disableLog('sleep');

  const flags = ns.flags([
    ['refreshCompanies', false],
    ['refreshJobs', false],
    ['refreshRates', false],
    ['hackGain', false],
    ['repGain', false],
  ]);

  if (ns.args[0] === 'list') {
    const jobs = await findBestJobs(flags);
    for (const job of jobs) {
      logJob(job);
    }
  } else {
    const job = await findBestJob(flags);
    const { company, field } = job;
    logJob(job);

    ns.applyToCompany(company, field);
    ns.workForCompany(company);
  }
}
