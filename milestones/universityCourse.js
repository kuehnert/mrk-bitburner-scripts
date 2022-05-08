/** @type import("..").NS */
let ns = null;

import { SECOND } from '/helpers/globals';

const COURSES = {
  hacking: ['computer science', 'data structure', 'networks', 'algorithms'],
  charisma: ['management', 'leadership'],
};

const isDone = ({ skill, level }) => ns.getPlayer()[skill] >= level;

const checkPreReqs = () => (ns.getServerMoneyAvailable('home') > 0 ? null : { money: 1 });

const perform = async ({ university, course, skill, level }) => {
  const success = ns.universityCourse(university, course, true);

  if (!success) {
    return false;
  } else {
    while (ns.getPlayer()[skill] < level) {
      // study at least x seconds
      await ns.sleep(5 * SECOND);
    }

    ns.stopAction();
    return true;
  }
};

const prepareParams = params => {
  const player = ns.getPlayer();
  let university;

  if (player.city === 'Aevum') {
    university = 'summit university';
  } else {
    if (player.city !== 'Sector-12') {
      ns.travelToCity('Sector-12');
    }

    university = 'rothman university';
  }

  const newParams = { university, ...params };

  const skill = newParams.skill; // hacking, charisma
  const courses = COURSES[skill];
  newParams.course = courses[courses.length - 1];
  ns.printf('newParams: %s', JSON.stringify(newParams, null, 4));
  return newParams;
};

export default async function main(_ns, params) {
  ns = _ns;
  const newParams = prepareParams(params);

  if (params.checkIsDone) {
    return isDone(newParams);
  } else if (params.checkPreReqs) {
    return checkPreReqs();
  } else {
    return perform(newParams);
  }
}
