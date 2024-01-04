/**
 * Parses command line arguments based on a provided schema.
 * @param {string[]} args The command line arguments.
 * @param {Object} schema The schema defining argument mappings.
 * @returns {Object} Parsed options with their corresponding values.
 */
function parseCommandLineArguments(args, schema) {
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    const nextArg = args[i + 1];

    if (schema[currentArg] && nextArg !== void 0) {
      options[schema[currentArg]] = parseInt(nextArg, 10);
      i++;
    }
  }

  return options;
}

module.exports = parseCommandLineArguments;
