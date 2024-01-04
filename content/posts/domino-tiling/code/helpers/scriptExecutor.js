const { execSync } = require('child_process');

/**
 * Generates a command string for executing a node script with given options.
 * @param {string} fileName The file name of the node script.
 * @param {Object} options Options including row and column counts.
 * @property {number} options.rowCount The number of rows.
 * @property {number} options.colCount The number of columns.
 * @returns {string} The generated command string.
 */
function generateNodeCommand(fileName, { rowCount, colCount }) {
  return `node ${fileName} -r ${rowCount} -c ${colCount}`;
}

/**
 * Executes a node script with the provided options and returns the output.
 * @param {string} fileName The file name of the node script.
 * @param {Object} options Options to pass to the script.
 * @property {number} options.rowCount The number of rows.
 * @property {number} options.colCount The number of columns.
 * @returns {string} The trimmed output of the script execution.
 */
function executeNodeScript(fileName, options) {
  try {
    const command = generateNodeCommand(fileName, options);
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    return output.trim();
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
}

module.exports = executeNodeScript;
