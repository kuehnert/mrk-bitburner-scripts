/** @type import("..").NS */
let ns = null;

export default async function purchaseTor(_ns) {
  ns = _ns;

  const success = ns.purchaseTor();

  if (!success) {
    ns.printf(
      "You don't own the TOR router and can't afford it right now (%.0f < 200,000k). Exiting.",
      ns.getServerMoneyAvailable('home')
    );
  // } else {
    // ns.printf('TOR Router installed.');
  }

  return success;
}
