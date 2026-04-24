const logger = {
  info: (...args) => console.log("[INFO]:", ...args),
  warn: (...args) => console.warn("[WARN]:", ...args),
  error: (...args) => console.error("[ERROR]:", ...args),
  debug: (...args) => console.debug("[DEBUG]:", ...args),
};

const logEvent = (level, message) => {
  switch (level) {
    case "INFO":
      logger.info(message);
      break;
    case "WARN":
      logger.warn(message);
      break;
    case "ERROR":
      logger.error(message);
      break;
    default:
      console.log("[LOG]:", message);
  }
};

module.exports = { logger, logEvent };