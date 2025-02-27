const winston = require("winston");
const path = require("path");

const logPath = path.join(__dirname, "logs");

const createLogger = (logFile) => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.File({ filename: logFile, level: "info" }),
      new winston.transports.Console(),
    ],
  });
};

const authLogger = createLogger(path.join(logPath, "auth.log"));
const transactionLogger = createLogger(path.join(logPath, "transactions.log"));
const adminLogger = createLogger(path.join(logPath, "admin.log"));

module.exports = {
  logAuth: (message) => authLogger.info(`[AUTH] ${message}`),
  logTransaction: (message) => transactionLogger.info(`[TRANSACTION] ${message}`),
  logAdmin: (message) => adminLogger.info(`[ADMIN] ${message}`),
};
