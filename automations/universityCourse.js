/** @type import("..").NS */
let ns = null;
const SECOND = 1000;

export default async function universityCourse(_ns, params) {
  ns = _ns;
  const { skill, level, university, course } = params;

  const success = ns.universityCourse(university, course, true);

  if (!success) {
    return false;
  } else {
    while (ns.getPlayer()[skill] < level) {
      // study at least x seconds
      await ns.sleep(5 * SECOND);
    }

    ns.stopAction();
    return true;
  }
}
