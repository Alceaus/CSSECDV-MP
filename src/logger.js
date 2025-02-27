const winston = require("winston");
const path = require("path");

const logPath = path.join(__dirname, "logs");
const authLogFile = path.join(logPath, "auth.log");
const transactionLogFile = path.join(logPath, "transactions.log");
const adminLogFile = path.join(logPath, "admin.log");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: authLogFile, level: "info" }),
    new winston.transports.File({ filename: transactionLogFile, level: "info" }),
    new winston.transports.File({ filename: adminLogFile, level: "info" }),
    new winston.transports.Console(),
  ],
});

module.exports = {
  logAuth: (message) => logger.log("info", `[AUTH] ${message}`),
  logTransaction: (message) => logger.log("info", `[TRANSACTION] ${message}`),
  logAdmin: (message) => logger.log("info", `[ADMIN] ${message}`),
};
