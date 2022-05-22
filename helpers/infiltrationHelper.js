export const typeChar = async (ns, char) => {
  let charToSend = char.toLowerCase();

  if (char === '{') {
    charToSend = '→';
  } else if (char === '}') {
    charToSend = '←';
  } else if (char === 'Space') {
    charToSend = '_';
  } else if (char === 'Enter') {
    charToSend = '§';
  }

  // ns.printf('charToSend: %s', JSON.stringify(charToSend, null, 4));
  const options = {
    method: 'GET',
    mode: 'no-cors'
  };
  const url = 'http://localhost:42800/send/SendKeyToBitburner' + charToSend;

  try {
    console.log('Sending', charToSend);
    const res = await fetch(url, options);
    // ns.tprintf('res: %s', JSON.stringify(res, null, 4));
    await ns.sleep(80);
  } catch (error) {
    ns.tprintf('error: %s', JSON.stringify(error, null, 4));
  }
};

/*
document.addEventListener('keydown', (e) => {
  console.log(e);
});
*/
