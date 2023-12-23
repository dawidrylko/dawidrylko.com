const fs = require('fs');
const parseArgs = require('./commandLineArgsParser');
const exec = require('./scriptExecutor');
const { files, testCases } = require('./dominoTilingTests.json');

function calculateAverageTime(executionTimes) {
  return (
    executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
  );
}

function ensureDirectoryExists(directory) {
  if (fs.existsSync(directory)) {
    return;
  }

  fs.mkdirSync(directory);
}

function generateFileName(options) {
  const { directory, fileName, rowCount, colCount } = options;

  return `${directory}/${fileName}_${rowCount}x${colCount}.txt`;
}

function generateContent(averageTime, executionTimes) {
  return [
    `Average Execution Time: ${averageTime} ms`,
    '---',
    ...executionTimes.map((time, i) => `${i + 1}. Execution Time: ${time} ms`),
  ].join('\n');
}

function saveExecutionResults(options) {
  const { executionTimes, averageTime } = options;
  const directory = 'benchmark';

  ensureDirectoryExists(directory);

  const resultFileName = generateFileName({ directory, ...options });
  const content = generateContent(averageTime, executionTimes);

  fs.writeFileSync(resultFileName, content);
  console.log(`File saved: ${resultFileName}`);
}

function runBenchmarkTest(testCase) {
  const { fileName, numberOfExecutions } = testCase;
  const executionTimes = [];

  for (let i = 0; i < numberOfExecutions; i++) {
    const startTime = Date.now();

    try {
      exec(fileName, testCase);
    } catch (error) {
      console.error(
        `Error running program in file ${fileName}: ${error.message}`,
      );

      return false;
    }

    executionTimes.push(Date.now() - startTime);
  }

  const averageTime = calculateAverageTime(executionTimes);
  saveExecutionResults({ ...testCase, averageTime, executionTimes });

  return true;
}

function __main__() {
  try {
    const argsSchema = { '-n': 'numberOfExecutions' };
    const options = parseArgs(process.argv.slice(2), argsSchema);

    if (!options.numberOfExecutions) {
      throw new Error('Usage: node benchmarkRunner.js -n <numberOfExecutions>');
    }

    console.log(
      `Starting benchmark execution with ${options.numberOfExecutions} executions each...`,
    );

    const pairs = files.flatMap(fileName =>
      testCases.map(testCase => ({ ...options, fileName, ...testCase })),
    );
    const allPassed = pairs.every((testCase, index) => {
      process.stdout.write(
        `Executing benchmark ${index + 1} of ${pairs.length} for ${
          testCase.fileName
        }... `,
      );

      return runBenchmarkTest(testCase);
    });

    if (allPassed) {
      console.log('All benchmarks completed successfully.');
      process.exit(0);
    } else {
      console.error('Some benchmarks failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

__main__();
