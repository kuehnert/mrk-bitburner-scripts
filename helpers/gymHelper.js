let ns;
let _gyms;

export const getGyms = async (_ns, forceReload = false) => {
  ns = _ns;

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

export const fastestGym = async (_ns) => {
  ns = _ns;

  const gyms = await getGyms(_ns);
  // ns.printf('gyms: %s', JSON.stringify(gyms, null, 4));
  return gyms.reduce((best, g) => (g.gain > best.gain ? g : best), gyms[0]);
};

export const valueGym = async (_ns) => {
  ns = _ns;

  const gyms = await getGyms(_ns);
  // ns.printf('gyms: %s', JSON.stringify(gyms, null, 4));
  return gyms.reduce((best, g) => (g.costGain > best.costGain ? g : best), gyms[0]);
};
