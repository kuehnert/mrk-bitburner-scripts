const doc = eval('document');

doc.cmdInTerminal = function (cmd) {
  const terminalInput = doc.getElementById('terminal-input');
  terminalInput.value = cmd;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
};

const css = `<style id="mkCSS">
.mk_li {
  padding: 0px;
}

.mk_p {
  margin: 0px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.mk_th {
  color: #00ff00;
  padding: 0 1em;
}

.mk_td {
  padding: 0 1em;
}

.mk_click {
  cursor: pointer;
}

.info {color: #3399CC; }
.success {color: #00ff00; }
.warn {color: #C3C32A; }
.error {color: #f44; }
.dark {color: #444; }
</style>`;

const liPrint = html =>
  doc
    .getElementById('terminal')
    .insertAdjacentHTML(
      'beforeend',
      `<li class="mk_li MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1a4zesh">${html}</li>`
    );

const pPrint = html => liPrint(`<p class="mk_p MuiTypography-root MuiTypography-body1 css-dw2kmf">${html}</p>`);

const replacements = [
  [/I~([^~]+)~/g, "<span class='info'>$1</span>"],
  [/S~([^~]+)~/g, "<span class='success'>$1</span>"],
  [/W~([^~]+)~/g, "<span class='warn'>$1</span>"],
  [/E~([^~]+)~/g, "<span class='error'>$1</span>"],
  [/G~([^~]+)~/g, "<span class='dark'>$1</span>"],
  [/\[([^\]]+)\]!([^!]+)!/g, `<span class='mk_click info' onClick="cmdInTerminal(\'$2\')">$1</span>`],
];

export const hprint = (ns, text, ...args) => {
  let oldCSS = doc.getElementById('mkCSS');
  if (oldCSS) oldCSS.parentNode.removeChild(oldCSS); // Remove old CSS to facilitate tweaking css above
  doc.head.insertAdjacentHTML('beforeend', css); // Place my CSS in doc head

  args && (text = ns.sprintf(text, ...args)); // format string
  const html = replacements.reduce((out, [regex, repl]) => out.replace(regex, repl), text);

  pPrint(html);
};

export const tablePrint = (headers, data) => {
  const htmlData = data
    .map(row => '<tr>' + row.map(c => '<td class="mk_td">' + c + '</td>').join('') + '</tr>')
    .join('');

  const html = `<table class="MuiTypography-root MuiTypography-body1 css-dw2kmf">
    <tr>${headers.map(t => '<th class="mk_th">' + t + '</th>').join('')}</tr>
    ${htmlData}
  </table>`;

  liPrint(html);
};

export default hprint;
