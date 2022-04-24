/** @type import("..").NS */
let ns = null;
let _gyms = null;

const skills = ['strength', 'defense', 'dexterity', 'agility'];

const getGyms = async (forceReload = false) => {
  if (!forceReload && ns.fileExists('/data/gyms.txt')) {
    _gyms ??= JSON.parse(ns.read('/data/gyms.txt'));
    return _gyms;
  } else {
    let gyms = [
      { name: 'Millenium Fitness Gym', city: 'Volhaven' },
      { name: 'Crush Fitness Gym', city: 'Aevum' },
      { name: 'Snap Fitness Gym', city: 'Aevum' },
      { name: 'Iron Gym', city: 'Sector-12' },
      { name: 'Powerhouse Gym', city: 'Sector-12' },
    ];

    for (const g of gyms) {
      const currentCity = ns.getPlayer().city;
      if (currentCity !== g.city) {
        ns.printf('Travelling to %s...', g.city);
        ns.travelToCity(g.city);
      }

      ns.gymWorkout(g.name, 'strength');
      await ns.sleep(2000);
      const stats = ns.getPlayer();
      g.gain = stats.workStrExpGainRate;
      g.cost = stats.workMoneyLossRate;
      g.costGain = (g.gain / g.cost) * 100.0;

      ns.stopAction();
    }

    _gyms = gyms.sort((a, b) => b.costGain - a.costGain);
    await ns.write('/data/gyms.txt', JSON.stringify(gyms), 'w');

    return _gyms;
  }
};

const fastestGym = async () => {
  const gyms = await getGyms();
  return gyms.reduce((best, g) => (g.gain > best.gain ? g : best), gyms[0]);
};

const valueGym = async () => {
  const gyms = await getGyms();
  return gyms.reduce((best, g) => (g.costGain > best.costGain ? g : best), gyms[0]);
};

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
    // ns.printf(
    //   'Already at %s level %d (desired: %d)',
    //   skill,
    //   stats[skill],
    //   level
    // );

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
