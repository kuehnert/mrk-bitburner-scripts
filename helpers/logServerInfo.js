import { formatMoney, formatDuration } from '/helpers/formatters';

export const hasMaxMoney = server =>
  server.moneyAvailable >= 0.98 * server.moneyMax;

export const hasMinSecurity = (ns, server) =>
  server.hackDifficulty <= 1.05 * ns.getServerMinSecurityLevel(server.hostname);

export const isServerPrimed = (ns, server) =>
  hasMaxMoney(server) && hasMinSecurity(ns, server);

/** @type import("..").NS */
let ns = null;
export default (_ns, serverName) => {
  ns = _ns;
  const server = ns.getServer(serverName);
  const weakenTime = ns.getWeakenTime(serverName);
  const growTime = ns.getGrowTime(serverName);

  ns.printf(
    'Money: %s/%s (%s) %s; Security: %.1f/%.1f (%s) %s',
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
