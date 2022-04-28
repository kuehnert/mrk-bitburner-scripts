/** @type import("..").NS */
let ns = null;

const workoutSkillToLevel = async (level = 10, skill = 'strength', preferSpeed = false) => {
  let stats = ns.getPlayer();
  const gym = await (preferSpeed ? fastestGym() : valueGym());

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

const workoutAllToLevel = async (level = 10, preferSpeed = false) => {
  for (const skill of skills) {
    const success = await workoutSkillToLevel(level, skill, preferSpeed);
    if (!success) {
      // return false;
    }
  }

  return true;
};

export async function main(_ns, { skill = 'ALL', level = 10, speed = true }) {
  ns = _ns;

  if (skill.toUpperCase() === 'ALL') {
    return workoutAllToLevel(level, speed);
  } else {
    return workoutSkillToLevel(level, skill, speed);
  }
}

export default main;
