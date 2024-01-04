const { parseArgs } = require('./helpers');

function canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit) {
  return (
    colIndex + 1 < colCount &&
    !(currentMask & currentBit) &&
    !(currentMask & nextBit)
  );
}

function searchTileArrangements(params) {
  const {
    tilingMatrix,
    rowCount,
    colCount,
    rowIndex,
    colIndex,
    currentMask,
    nextMask,
  } = params;

  if (rowIndex === rowCount) {
    return;
  }

  if (colIndex >= colCount) {
    tilingMatrix[rowIndex + 1][nextMask] += tilingMatrix[rowIndex][currentMask];
    return;
  }

  const currentBit = 1 << colIndex;
  const nextBit = 1 << (colIndex + 1);

  currentMask & currentBit
    ? searchTileArrangements({ ...params, colIndex: colIndex + 1 })
    : searchTileArrangements({
        ...params,
        colIndex: colIndex + 1,
        nextMask: nextMask | currentBit,
      });

  if (canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit)) {
    searchTileArrangements({ ...params, colIndex: colIndex + 2 });
  }
}

function createInitialTilingMatrix(rowCount, colCount) {
  return Array.from({ length: rowCount + 1 }, () =>
    new Array(1 << colCount).fill(0),
  );
}

function calculateTotalTilingCombinations({ rowCount, colCount }) {
  const tilingMatrix = createInitialTilingMatrix(rowCount, colCount);
  tilingMatrix[0][0] = 1;

  for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
    for (let currentMask = 0; currentMask < 1 << colCount; ++currentMask) {
      searchTileArrangements({
        tilingMatrix,
        rowCount,
        colCount,
        rowIndex,
        colIndex: 0,
        currentMask,
        nextMask: 0,
      });
    }
  }

  return tilingMatrix[rowCount][0];
}

function __main__() {
  const argsSchema = { '-r': 'rowCount', '-c': 'colCount' };
  const options = parseArgs(process.argv.slice(2), argsSchema);

  if (!options.rowCount || !options.colCount) {
    console.error(
      'Usage: node dominoTilingSolver.js -r <rowCount> -c <colCount>',
    );
    process.exit(1);
  }

  const result = calculateTotalTilingCombinations(options);
  console.log(result);
  process.exit(0);
}

__main__();
