/** @type import("..").NS */
let ns = null;

import { SKILLS } from '/helpers/globals';
import { fastestGym, valueGym } from '/helpers/gymHelper';

const workoutSkillToLevel = async ({ level, skill, speed }) => {
  let stats = ns.getPlayer();
  const gym = await (speed ? fastestGym(ns) : valueGym(ns));
  // ns.printf('gym: %s', JSON.stringify(gym, null, 4));

  if (stats.city !== gym.city) {
    ns.printf('Travelling to %s...', gym.city);
    const success = ns.travelToCity(gym.city);
    if (!success) {
      ns.printf('Error travelling from %s to %s. Aborting.', stats.city, gym.city);
      ns.exit();
    }
  }

  if (stats[skill] >= level) {
    return true;
  }

  ns.printf('Working out on %s from level %d to %d...', skill, stats[skill], level);

  while (stats[skill] < level) {
    const success = ns.gymWorkout(gym.name, skill, false);
    if (!success) {
      ns.printf('Unknown error occured when trying workout. Exiting');
      return false;
    }

    await ns.sleep(5 * 1000);
    stats = ns.getPlayer();
  }

  ns.stopAction();
  return stats[skill] >= level;
};

const workoutAllToLevel = async ({ level, speed }) => {
  for (const skill of SKILLS) {
    // ns.printf('skill: %s', JSON.stringify(skill, null, 4));
    const success = await workoutSkillToLevel({ level, skill, speed });
    if (!success) {
      // return false;
    }
  }

  return true;
};

const isDone = async ({ skill, level }) => {
  const player = ns.getPlayer();
  if (skill.toUpperCase() === 'ALL') {
    for (const oneSkill of SKILLS) {
      if (player[oneSkill] < level) {
        return false;
      }
    }

    return true;
  } else {
    return player[skill] >= level;
  }
};

const perform = async ({ skill, level, speed }) => {
  if (skill.toUpperCase() === 'ALL') {
    return workoutAllToLevel({ level, speed });
  } else {
    return workoutSkillToLevel({ level, skill, speed });
  }
};

const prepareParams = params => ({ skill: 'ALL', level: 10, speed: true, ...params });

export default async function main(_ns, params) {
  ns = _ns;
  const newParams = prepareParams(params);
  const { getName, checkIsDone, checkPreReqs } = newParams;

  if (getName) {
    const { skill, level } = newParams;
    const skillStr = skill === 'ALL' ? 'all skills' : skill;
    return ns.sprintf('Working out to get %s to level %d', skillStr, level);
  } else if (checkIsDone) {
    return isDone(newParams);
  } else if (checkPreReqs) {
    return checkPreReqs(newParams);
  } else {
    return perform(newParams);
  }
}
