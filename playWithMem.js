/** @type import(".").NS */
let ns = null;

export default async function main(_ns) {
  ns = _ns;

  // const number = ns.getPurchasedServerMaxRam();
  const number = eval('ns.getPurchasedServerMaxRam();');
  ns.tprintf('number: %d', number);
}
