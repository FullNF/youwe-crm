const NODE_ENV = process.env.NODE_ENV || 'development';
function ts() { return new Date().toISOString(); }
module.exports = {
  info: (...args) => console.log(`[INFO ${ts()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${ts()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${ts()}]`, ...args),
  debug: (...args) => { if (NODE_ENV !== 'production') console.log(`[DEBUG ${ts()}]`, ...args); },
};
