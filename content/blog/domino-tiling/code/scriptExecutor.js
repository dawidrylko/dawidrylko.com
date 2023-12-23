const { execSync } = require('child_process');

function generateCommand(options) {
  const { fileName, rowCount, colCount } = options;

  return `node ${fileName} -r ${rowCount} -c ${colCount}`;
}

function __main__(fileName, options) {
  const { rowCount, colCount } = options;

  try {
    const command = generateCommand({ fileName, ...options });
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    return output.trim();
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
}

module.exports = __main__;
