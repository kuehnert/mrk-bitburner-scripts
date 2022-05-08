/** @type import(".").NS */
let ns = null;
const DEBUG = true;

import { formatMoney } from '/helpers/formatters';
import { doneJobsFile, MILLION } from '/helpers/globals';
import milestones from '/milestones/milestones';
import deleteStaleDataFiles from '/milestones/deleteStaleDataFiles';
import gymWorkout from '/milestones/gymWorkout';
import installBackdoor from '/milestones/installBackdoor';
import joinFaction from '/milestones/joinFaction';
// import purchaseAugmentations from '/milestones/purchaseAugmentations';
import purchaseProgram from '/milestones/purchaseProgram';
import purchaseTor from '/milestones/purchaseTor';
import runScript from '/milestones/runScript';
import universityCourse from '/milestones/universityCourse';
import { hprint } from './helpers/hprint';

const runCommand = async ({ action, params = {} }, debug) => {
  const command = ns.sprintf('%s(ns, %s)', action, JSON.stringify(params));
  if (debug) {
    ns.printf('eval: %s', command);
  }

  return eval(command);
};

const checkIsDone = async ({ action, params }, debug) => {
  return runCommand({ action, params: { ...params, checkIsDone: true } }, debug);
};

const checkPreReqs = async ({ action, params }, debug) => {
  return runCommand({ action, params: { ...params, checkPreReqs: true } }, debug);
};

const logJob = async ({ id, action, params, done, prereq }, debug) => {
  const description = await runCommand({ action, params: { ...params, getName: true } }, debug);
  ns.printf('JOB #%d %s', id, description, done ? '✓' : ' ');
};

// const checkPreReq = () => {
//   // check prerequisites
//   if (prereq) {
//     if (prereq.hacking > hacking) {
//       ns.printf('WARNING Hacking skill too low (have: %d/req: %d). Aborting.', hacking, prereq.hacking);
//       ns.exit();
//     }

//     if (prereq.money > money) {
//       ns.printf('WARNING Too little money (%s / %s). Exiting.', formatMoney(ns, prereq.money), formatMoney(ns, money));
//       ns.exit();
//     }

//     if (prereq.faction) {
//       if (!factions.includes(prereq.faction)) {
//         // try to join
//         const success = ns.joinFaction(prereq.faction);
//         if (!success) {
//           ns.printf('WARNING: Unable to join faction %s. Exiting.', prereq.faction);
//           ns.exit();
//         }
//       }
//     }
//   }
// };

const loadJobs = () => {
  let jobsRemaining = JSON.parse(JSON.stringify(milestones));

  try {
    const ids = JSON.parse(ns.read(doneJobsFile));
    const jobsDone = jobsRemaining.filter(j => ids.includes(j.id));
    jobsRemaining = jobsRemaining.filter(j => !ids.includes(j.id));
    ns.printf('SUCCESS Loaded done jobs. %d done, %d to go!', jobsDone.length, jobsRemaining.length);
    return { jobsRemaining, jobsDone };
  } catch {
    ns.printf('WARN Did not find file %s, starting anew.', doneJobsFile);
    return { jobsRemaining, jobsDone: [] };
  }
};

const saveDoneJobs = async jobsDone => {
  const ids = jobsDone.map(j => j.id);
  const data = JSON.stringify(ids);
  ns.write(doneJobsFile, data, 'w');
};

const doJobs = async (jobsRemaining, jobsDone, flags) => {
  ns.run('scanServers.js', 1, '--forceRefresh', '--quiet');
  let toDoList = {};

  while (jobsRemaining.length > 0) {
    for (const job of jobsRemaining) {
      await logJob(job);

      // check if it's already done
      // if so, mark it as such and continue with next job
      job.done = await checkIsDone(job, flags.debug);
      if (job.done) {
        ns.printf("INFO Job job. ")
        continue;
      }

      // check if some requirements are unmet
      const preReqs = await checkPreReqs(job, flags.debug);
      ns.printf('preReqs: %s', JSON.stringify(preReqs, null, 4));

      if (preReqs) {
        // if so, put them on the to-do list
        // TODO we need something cleverer here
        ns.printf('preReqs: %s', JSON.stringify(preReqs, null, 4));
        toDoList = { ...toDoList, ...preReqs };
        ns.printf('toDoList: %s', JSON.stringify(toDoList, null, 4));
      } else {
        // do the job that has no further requirements
        // if it was done successfully, mark it as such
        ns.print("I'm doing this now!");
        job.done = await runCommand(job, flags.debug);
        if (job.done) {
          ns.printf('job: %s', JSON.stringify(job, null, 4));
          continue;
        }
      }

      // work on the prereqs one by one: we need more money, more rep, more what?
      // TODO

      // remove all completed jobs from jobsRemaining
      jobsDone = jobsDone.concat(jobsRemaining.filter(j => j.done));
      jobsRemaining = jobsRemaining.filter(j => j.done == null || j.done === false);
      await saveDoneJobs(jobsDone);
      // ns.printf('jobsDone: %s', JSON.stringify(jobsDone, null, 4));
      // ns.printf('jobsRemaining: %s', JSON.stringify(jobsRemaining, null, 4));

      if (jobsRemaining.length > 0) {
        await ns.sleep(10000);
      }
    }
  }
};

export async function main(_ns) {
  ns = _ns;
  const flags = ns.flags([
    ['debug', false],
    ['list', false],
  ]);

  ns.clearLog();
  if (!flags.debug) {
    ns.disableLog('ALL');
    ns.tail();
  }

  let { jobsRemaining, jobsDone } = loadJobs();
  if (flags.list) {
    ns.print('INFO Done Jobs');
    for (const job of jobsDone) {
      await logJob(job);
    }

    ns.print('INFO Remaining Jobs');
    for (const job of jobsRemaining) {
      await logJob(job);
    }
  } else {
    await doJobs(jobsRemaining, jobsDone, flags);
  }
}
