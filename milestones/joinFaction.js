/** @type import("..").NS */
let ns = null;

const isDone = ({ faction }) => ns.getPlayer().factions.includes(faction);

const checkPreReqs = ({ faction }) =>
  ns.checkFactionInvitations().includes(faction) ? null : { factionInvitation: faction };

const perform = ({ faction }) => ns.joinFaction(faction);

export default async function main(_ns, params) {
  ns = _ns;

  if (params.getName) {
    return ns.sprintf("Join faction %s", params.faction);
  } else if (params.checkIsDone) {
    return isDone(params);
  } else if (params.checkPreReqs) {
    return checkPreReqs(params);
  } else {
    return perform(params);
  }
}
