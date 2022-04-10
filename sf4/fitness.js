/** @type import("..").NS */
let ns = null;

const findBestGym = async (forceReload = false) => {
  if (!forceReload && ns.fileExists('/data/gyms.txt')) {
    return JSON.parse(ns.read('/data/gyms.txt'));
  } else {
    let gyms = [
      { name: 'Millenium Fitness Gym', city: 'Volhaven' },
      { name: 'Crush Fitness Gym', city: 'Aevum' },
      { name: 'Snap Fitness Gym', city: 'Aevum' },
      { name: 'Iron Gym', city: 'Sector-12' },
      { name: 'Powerhouse Gym', city: 'Sector-12' },
    ];

    for (const gym of gyms) {
      const currentCity = ns.getPlayer().city;
      if (currentCity !== gym.city) {
        ns.printf('Travelling to %s...', gym.city);
        ns.travelToCity(gym.city);
      }

      ns.gymWorkout(gym.name, 'strength');
      await ns.sleep(2000);
      const stats = ns.getPlayer();
      gym.gain = stats.workStrExpGainRate;
      gym.cost = stats.workMoneyLossRate;
      gym.costGain = (gym.gain / gym.cost) * 100.0;

      ns.stopAction();
    }

    gyms = gyms.sort((a, b) => b.costGain - a.costGain);
    await ns.write('/data/gyms.txt', JSON.stringify(gyms), 'w');

    return gyms;
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('sleep');
  ns.disableLog('travelToCity');
  ns.disableLog('gymWorkout');
  ns.disableLog('stopAction');
  ns.clearLog();
  ns.tail();

  const gyms = await findBestGym(ns.args[0] === 'reload');
  ns.printf('gyms: %s', JSON.stringify(gyms, null, 4));
}
