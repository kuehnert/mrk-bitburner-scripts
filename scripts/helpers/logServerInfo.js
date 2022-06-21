import { formatMoney, formatDuration, formatTime } from './helpers/formatters';

export const hasMaxMoney = server => server.moneyAvailable >= 0.9999 * server.moneyMax;

export const hasMinSecurity = (__ns, server) =>
  server.hackDifficulty <= 1.0001 * __ns.getServerMinSecurityLevel(server.hostname);

export const isServerPrimed = (__ns, server) => hasMaxMoney(server) && hasMinSecurity(__ns, server);

/** @type import("..").NS */
let ns = null;
export default (_ns, serverName) => {
  ns = _ns;
  const server = ns.getServer(serverName);
  const weakenTime = ns.getWeakenTime(serverName);
  const growTime = ns.getGrowTime(serverName);

  ns.printf(
    '%s %s: %s/%s (%s grow time) %s\t%.2f/%.2f (%s weaken time) %s',
    formatTime(ns),
    serverName,
    formatMoney(ns, server.moneyAvailable),
    formatMoney(ns, server.moneyMax),
    formatDuration(ns, growTime),
    hasMaxMoney(server) ? '✓' : '❌',
    server.hackDifficulty,
    ns.getServerMinSecurityLevel(serverName),
    formatDuration(ns, weakenTime),
    hasMinSecurity(ns, server) ? '✓' : '❌'
  );
};
