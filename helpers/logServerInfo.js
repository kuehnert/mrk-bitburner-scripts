import { formatMoney, formatNumber, formatDuration } from '/helpers/formatters';

export const hasMaxMoney = server =>
  server.moneyAvailable >= 0.98 * server.moneyMax;

export const hasMinSecurity = (ns, server) =>
  server.hackDifficulty <= 1.05 * ns.getServerMinSecurityLevel(server.hostname);

export const isServerPrimed = (ns, server) =>
  hasMaxMoney(server) && hasMinSecurity(ns, server);

export default (ns, serverName) => {
  const server = ns.getServer(serverName);
  const weakenTime = ns.getWeakenTime(serverName);
  const growTime = ns.getGrowTime(serverName);

  ns.printf(
    'Money: %s/%s (%s) %s; Security: %.1f/%.1f (%s) %s',
    formatMoney(server.moneyAvailable),
    formatMoney(server.moneyMax),
    formatDuration(ns, growTime),
    hasMaxMoney(server) ? '✓' : '❌',
    server.hackDifficulty,
    ns.getServerMinSecurityLevel(serverName),
    formatDuration(ns, weakenTime),
    hasMinSecurity(ns, server) ? '✓' : '❌'
  );
};
