/** @type import(".").NS */
// requires Source-File 4 to run
let ns = null;

export async function main(_ns) {
  ns = _ns;

  const factions = ns.checkFactionInvitations();
  ns.tprint(factions);
}
