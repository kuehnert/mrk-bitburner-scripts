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
  // console.log('Sending', charToSend);

  try {
    await fetch(url, options);
  } catch (error) {
    console.error(error);
  }

  await ns.sleep(80);
};

/*
document.addEventListener('keydown', (e) => {
  console.log(e);
});
*/
