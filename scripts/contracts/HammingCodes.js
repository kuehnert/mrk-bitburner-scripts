/*
    HammingCodes: Integer to encoded Binary

    You are given the following decimal Value:
    135732079970
    Convert it into a binary string and encode it as a 'Hamming-Code'. eg:
    Value 8 will result into binary '1000', which will be encoded with the pattern 'pppdpddd', where p is a paritybit and d a databit,
    or '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
    NOTE: You need an parity Bit on Index 0 as an 'overall'-paritybit.
    NOTE 2: You should watch the HammingCode-video from 3Blue1Brown, which explains the 'rule' of encoding, including the first Index parity-bit mentioned on the first note.
    Now the only one rule for this encoding:
    It's not allowed to add additional leading '0's to the binary value
    That means, the binary value has to be encoded as it is
*/
/*
10101

ppp1
p010
p1

1001
1010
11

=> 1001101011

input: 1111110011010010000110010110101100010
pppppppp1
p11111001
p10100100
p00110010
p11010110
p0010

*/
input = 135732079970;
const binary = Number(input).toString(2); //?
console.log('binary', binary);
