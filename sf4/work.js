/** @type import("..").NS */
let ns = null;
const MINUTE = 60 * 1000;

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

const findOrganisations = async (force = false) => {
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

    await ns.write(
      '/data/organisations.txt',
      JSON.stringify(organisations),
      'w'
    );

    return organisations;
  }
};

const findCompanies = async (force = false) => {
  if (!force && ns.fileExists('/data/companies.txt')) {
    ns.printf('Loading Companies...');
    return JSON.parse(ns.read('/data/companies.txt'));
  } else {
    const organisations = await findOrganisations(force);

    const companies = [];

    for (const organisation of organisations) {
      try {
        ns.applyToCompany(organisation, fields[0]);
        companies.push(organisation);
      } catch (error) {
        // Company does not exist, don't add it
      }
    }

    ns.printf('companies: %s', JSON.stringify(companies, null, 4));
    await ns.write('/data/companies.txt', JSON.stringify(companies), 'w');
    return companies;
  }
};

const findJobs = async (force = false) => {
  if (!force && ns.fileExists('/data/jobs.txt')) {
    ns.printf('Loading Jobs...');
    return JSON.parse(ns.read('/data/jobs.txt'));
  } else {
    const companies = await findCompanies(force);
    let jobs = [];

    for (const company of companies) {
      for (const field of fields) {
        const success = ns.applyToCompany(company, field);
        if (success) {
          jobs.push({ company, field });
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
const findBestJob = async (force = false) => {
  let jobs = await findJobs(force);

  if (jobs[0].workMoneyGainRate == null) {
    for (const job of jobs) {
      const { company, field } = job;
      ns.printf(
        'Working at %s as %s...',
        company.toUpperCase(),
        field.toUpperCase()
      );
      ns.applyToCompany(company, field);
      ns.workForCompany(company);
      // await ns.sleep(100);
      const player = ns.getPlayer();

      ns.stopAction();
      job.workMoneyGainRate = player.workMoneyGainRate * 5;
      job.workRepGainRate = player.workRepGainRate * 5;
    }

    jobs = jobs.sort((a, b) => b.workMoneyGainRate - a.workMoneyGainRate);
    await ns.write('/data/jobs.txt', JSON.stringify(jobs), 'w');
  }

  return jobs.reduce(
    (best, j) => (j.workMoneyGainRate > best.workMoneyGainRate ? j : best),
    jobs[0]
  );
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('applyToCompany');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('sleep');
  ns.disableLog('stopAction');
  ns.disableLog('workForCompany');
  ns.clearLog();
  ns.tail();

  const { company, field, workMoneyGainRate, workRepGainRate } =
    await findBestJob(false);
  ns.printf(
    'Best job: %s at %s, $%.1f/min, %.0f Rep/min',
    field.toUpperCase(),
    company.toUpperCase(),
    workMoneyGainRate * 60,
    workRepGainRate * 60
  );
  ns.applyToCompany(company, field);
  ns.workForCompany(company);
}
