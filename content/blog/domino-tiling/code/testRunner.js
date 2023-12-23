const exec = require('./scriptExecutor');
const { files, testCases } = require('./dominoTilingTests.json');

function verifyResult(expected, actual) {
  return parseInt(expected, 36) === parseInt(actual, 36);
}

function runTest(testCase) {
  const { fileName, expectedResult } = testCase;

  try {
    const result = exec(fileName, testCase);

    if (verifyResult(expectedResult, result)) {
      console.log('Passed!');
    } else {
      console.error(`Failed! Expected: ${expectedResult}, Actual: ${result}`);

      return false;
    }
  } catch (error) {
    console.error(`Failed! Error: ${error.message}`);

    return false;
  }

  return true;
}

function __main__() {
  try {
    console.log('Starting test execution...');

    const pairs = files.flatMap(fileName =>
      testCases.map((testCase, index) => ({ index, fileName, ...testCase })),
    );
    const allPassed = pairs.every((testCase, index) => {
      process.stdout.write(
        `Executing test ${index + 1} of ${pairs.length} for ${
          testCase.fileName
        }... `,
      );

      return runTest(testCase);
    });

    if (allPassed) {
      console.log('All tests completed successfully.');
      process.exit(0);
    } else {
      console.error('Some tests failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

__main__();
