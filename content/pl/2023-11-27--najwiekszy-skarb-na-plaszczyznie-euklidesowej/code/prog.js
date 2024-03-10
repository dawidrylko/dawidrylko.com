const fs = require('fs');
const process = require('process');

function calculateDistance(point1, point2) {
  return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
}

function findLargestDistanceSubset(points, k) {
  const n = points.length;
  const Q = [];
  const distances = new Array(n);

  for (let i = 0; i < n; i++) {
    let distanceSum = 0;
    for (let j = 0; j < n; j++) {
      distanceSum += calculateDistance(points[i], points[j]);
    }
    distances[i] = distanceSum;
  }

  while (Q.length < k) {
    let maxIncrease = -1;
    let bestPoint = null;

    for (let i = 0; i < n; i++) {
      if (!Q.includes(i)) {
        let increase = 0;
        for (let j = 0; j < Q.length; j++) {
          increase += distances[i] - calculateDistance(points[i], points[Q[j]]);
        }

        if (increase > maxIncrease) {
          maxIncrease = increase;
          bestPoint = i;
        }
      }
    }

    if (bestPoint !== null) {
      Q.push(bestPoint);
    } else {
      break;
    }
  }

  let distanceSum = 0;
  for (let i = 0; i < Q.length; i++) {
    for (let j = i + 1; j < Q.length; j++) {
      distanceSum += calculateDistance(points[Q[i]], points[Q[j]]);
    }
  }

  return { distanceSum, selectedIndexes: Q };
}

function main() {
  const args = process.argv.slice(2);
  let options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-f' && i + 1 < args.length) {
      options.file = args[i + 1];
      i++;
    } else if (args[i] === '-k' && i + 1 < args.length) {
      options.k = parseInt(args[i + 1]);
      i++;
    }
  }

  if (!options.file || !options.k) {
    console.log('Usage: node prog.js -f <file> -k <k>');
    return;
  }

  const data = fs.readFileSync(options.file, 'utf-8');
  const points = data
    .trim()
    .split('\n')
    .map(line => {
      const [x, y] = line.split(',').map(Number);
      return [x, y];
    });

  if (points.length < options.k) {
    console.log('The value of k is larger than the number of points.');
    return;
  }

  const result = findLargestDistanceSubset(points, options.k);

  console.log(result.distanceSum.toFixed(2));
  console.log(result.selectedIndexes.join(', '));
}

main();
