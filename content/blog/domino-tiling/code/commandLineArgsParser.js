function __main__(args, schema) {
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

module.exports = __main__;
