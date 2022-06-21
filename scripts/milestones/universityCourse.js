/** @type import("..").NS */
let ns = null;

import { SECOND } from '/helpers/globals';

const COURSES = {
  hacking: ['Computer Science', 'Data Structure', 'Networks', 'Algorithms'],
  charisma: ['Management', 'Leadership'],
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
    university = 'Summit University';
  } else {
    if (player.city !== 'Sector-12') {
      ns.travelToCity('Sector-12');
    }

    university = 'Rothman University';
  }

  const newParams = { university, ...params };
  const skill = newParams.skill; // hacking, charisma
  const courses = COURSES[skill];
  newParams.course = courses[courses.length - 1];

  return newParams;
};

export default async function main(_ns, params) {
  ns = _ns;
  const newParams = prepareParams(params);

  if (params.getName) {
    const { course, university, skill, level } = newParams;
    const strs = [course, university, skill, '' + level].map(s => s.toUpperCase());
    return ns.sprintf('Take %s course at %s to get %s to level %d', ...strs);
  } else if (params.checkIsDone) {
    return isDone(newParams);
  } else if (params.checkPreReqs) {
    return checkPreReqs();
  } else {
    return perform(newParams);
  }
}
