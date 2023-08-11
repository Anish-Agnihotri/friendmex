import * as winston from "winston"; // Logging

// Setup winston logger
const logger = winston.createLogger({
  level: "info",
  // Simple line-by-line output
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `[${info.timestamp} (${info.level})] ${info.message}`
    )
  ),
  transports: [
    // Output to console
    new winston.transports.Console(),
    // Output to logfile
    new winston.transports.File({ filename: "indexer.log", level: "debug" }),
  ],
});

// Export as default
export default logger;
