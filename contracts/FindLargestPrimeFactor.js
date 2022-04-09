/*
    Find Largest Prime Factor
    You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

    A prime factor is a factor that is a prime number. What is the largest prime factor of 873839808?
    * 873839808
    * 841220296
    * 127721415
*/
export default function FindLargestPrimeFactor(data) {
  for (let i = 2; i < data / 2; i++) {
    while (data % i === 0) {
      data /= i;
    }
  }

  return data;
}
