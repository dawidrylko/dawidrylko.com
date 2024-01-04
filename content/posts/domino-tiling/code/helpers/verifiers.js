/**
 * Verifies the result for integer tests.
 * @param {string} expected The expected result as a base 36 string representation of an integer.
/**
 * Verifies the result for integer tests.
 * @param {number|string} expected The expected result as a base 36 string representation of an integer.
 * @param {number|string} actual The actual result as a base 36 string representation of an integer.
 * @returns {boolean} True if the results match, false otherwise.
 */
function verifyInt(expected, actual) {
  const expectedInt = typeof expected === 'string' ? parseInt(expected, 10) : expected;
  const actualInt = typeof actual === 'string' ? parseInt(actual, 10) : actual;

  return expectedInt === actualInt;
}

/**
 * Verifies the result for BigInt tests.
 * @param {string} expected The expected result string representation of a BigInteger.
 * @param {string} actual The actual result string representation of a BigInteger.
 * @returns {boolean} True if the results match, false otherwise.
 */
function verifyBigInt(expected, actual) {
  return BigInt(expected) === BigInt(actual);
}

module.exports = {
  verifyInt,
  verifyBigInt,
};
