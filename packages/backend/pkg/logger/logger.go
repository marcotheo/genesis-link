// logger/logger.go
package clog

import (
	"fmt"
	"log"
	"os"
)

// ANSI color codes
const (
    Reset  = "\033[0m"
    Red    = "\033[31m"
    Green  = "\033[32m"
    Yellow = "\033[33m"
    Blue   = "\033[34m"
    Purple = "\033[35m"
    Cyan   = "\033[36m"
    White  = "\033[37m"
)

// CustomLogger defines a logger with additional methods
type CustomLogger struct {
    logger *log.Logger
}

// Global instance of CustomLogger
var Logger *CustomLogger

// init initializes the global logger instance
func init() {
    Logger = &CustomLogger{
        logger: log.New(os.Stdout, "", log.LstdFlags),
    }
}

// Info logs an informational message with an "INFO" prefix
func (cl *CustomLogger) Info(message string) {
    cl.logWithPrefix("INFO", Blue, message)
}

// Error logs an error message with an "ERROR" prefix
func (cl *CustomLogger) Error(message string) {
    cl.logWithPrefix("ERROR", Red, message)
}

// Success logs an success message with an "SUCCESS" prefix
func (cl *CustomLogger) Success(message string) {
    cl.logWithPrefix("SUCCESS", Green, message)
}

// logWithPrefix logs a message with a given prefix and color
func (cl *CustomLogger) logWithPrefix(prefix, color, message string) {
    formattedPrefix := fmt.Sprintf(" [%s%s%s] ", color, prefix, Reset)
    logMessage := fmt.Sprintf("%s%s", formattedPrefix, message)
    cl.logger.Println(logMessage)
}

// logWithPrefix logs a message with a green prefix
func (cl *CustomLogger) GreenPrefix(prefix, message string) {
    formattedPrefix := fmt.Sprintf(" [%s%s%s] ", Green, prefix, Reset)
    logMessage := fmt.Sprintf("%s%s", formattedPrefix, message)
    cl.logger.Println(logMessage)
}