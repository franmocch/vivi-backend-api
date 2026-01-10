module.exports = function cloneError(err) {
  const cloned = Object.create(Object.getPrototypeOf(err));

  // Copy all owned properties
  Object.getOwnPropertyNames(err).forEach((key) => {
    cloned[key] = err[key];
  });

  //Copy symbols in case there are
  Object.getOwnPropertySymbols(err).forEach((sym) => {
    cloned[sym] = err[sym];
  });

  return cloned;
};
