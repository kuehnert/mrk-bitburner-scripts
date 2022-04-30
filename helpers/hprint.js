const css = `<style id="mkCSS">
.mk_li {
  padding: 0px;
}

.mk_p {
  margin: 0px;
  overflow-wrap: anywhere;
}

.mk_th {
  color: #00ff00;
  padding: 0 1em;
}

.mk_td {
  padding: 0 1em;
}

.info {color: #3399CC; }
.success {color: #00ff00; }
.warn {color: #C3C32A; }
.error {color: #f44; }
</style>`;

const liPrint = html =>
  document
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
  // [/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'],
];

export const hprint = (ns, text, ...args) => {
  let oldCSS = document.getElementById('mkCSS');
  if (oldCSS) oldCSS.parentNode.removeChild(oldCSS); // Remove old CSS to facilitate tweaking css above
  document.head.insertAdjacentHTML('beforeend', css); // Place my CSS in doc head

  args && (text = ns.sprintf(text, ...args)); // format string
  const html = replacements.reduce((out, [regex, repl]) => out.replace(regex, repl), text);

  pPrint(html);
};

export const tablePrint = (ns, headers, data) => {
  const htmlData = data.map(row => '<tr>' + row.map(c => '<td class="mk_td">' + c + '</td>').join('') + '</tr>').join('');

  const html = `<table class="MuiTypography-root MuiTypography-body1 css-dw2kmf">
    <tr>${headers.map(t => '<th class="mk_th">' + t + '</th>').join('')}</tr>
    ${htmlData}
  </table>`;

  liPrint(html);
};

export default hprint;
