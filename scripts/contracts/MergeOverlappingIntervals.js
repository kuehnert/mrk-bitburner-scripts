/*
    Merge Overlapping Intervals;

    You are attempting to solve a Coding Contract. You have 15 tries remaining, after which the contract will self-destruct.
    Given the following array of array of numbers representing a list of intervals, merge all overlapping intervals.

    [[9,19],[23,32],[14,23],[11,18],[22,26],[20,29],[20,26],[17,22],[13,17],[2,9],[13,19],[22,24],[13,21],[25,29],[12,20],[10,14],[7,10],[13,18],[2,10]]

    Example:
    [[1, 3], [8, 10], [2, 6], [10, 16]] would merge into [[1, 6], [8, 16]].

    The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.
*/
export default function MergeOverlappingIntervals(data) {
  let intervals = data.sort((a, b) => a[0] - b[0]);
  let merges;

  do {
    let pred = intervals[0];
    merges = false;

    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      if (!current) {
        break;
      }

      if (intervals[i - 1]) {
        pred = intervals[i - 1];
      }

      if (pred[0] <= current[0] && current[1] <= pred[1]) {
        // current ist vollständig in pred enthalten
        intervals[i] = null;
      } else if (pred[0] <= current[0] && current[0] <= pred[1]) {
        // erweitere rechte Grenze
        pred[1] = current[1];
        intervals[i] = null;
        merges = true;
      }
    }

    intervals = intervals.filter(e => e != null);
  } while (merges);

  return intervals;
}
