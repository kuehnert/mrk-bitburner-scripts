/** @type import(".").NS */
let ns = null;

export async function main(_ns) {
  ns = _ns;

  ns.tprintf('Hallo');

  // Acquire a reference to the terminal list of lines.
  const list = document.getElementById('terminal');

  // // Inject some HTML.
  list.insertAdjacentHTML('beforeend', `<li><p color=lime>whatever custom html</p></li>`);
}
