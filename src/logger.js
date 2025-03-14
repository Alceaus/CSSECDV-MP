const winston = require("winston");
const path = require("path");
require("winston-syslog");

const logPath = path.join(__dirname, "logs");

const logger = (logFile, syslogApp) => {
    const transports = [
        new winston.transports.File({ filename: logFile, level: "info" }),
        new winston.transports.Console(),
    ];

    try {
        const syslogTransport = new winston.transports.Syslog({
            host: "192.168.68.142", // replace with the system's IP address
            port: 514, // 514 for udp, 601 for tcp
            protocol: "udp4", // either udp4 or tcp4
            app_name: syslogApp,
            facility: "local0",
        });

        syslogTransport.on("error", (err) => {
            console.error("Syslog transport error:", err);
        });
        transports.push(syslogTransport);
    } catch (error) {
        console.error("Failed to initialize Syslog transport:", error);
    }

    return winston.createLogger({
        level: "info",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message}`;
            })
        ),
        transports,
    });
};

const authLogger = logger(path.join(logPath, "auth.log"), "AUTH_LOGS");
const transactionLogger = logger(path.join(logPath, "transactions.log"), "TRANSACTION_LOGS");
const adminLogger = logger(path.join(logPath, "admin.log"), "ADMIN_LOGS");

module.exports = {
    logAuth: (message) => authLogger.info(`[AUTH] ${message}`),
    logUser: (message) => transactionLogger.info(`[USER] ${message}`),
    logAdmin: (message) => adminLogger.info(`[ADMIN] ${message}`),
};
