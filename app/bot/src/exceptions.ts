import { log, error } from "@siamese/log";

process.on("beforeExit", code => {
  log(`Process will exit with code: ${code}`);
});

process.on("exit", code => {
  log(`Process exited with code: ${code}`);
});

process.on("SIGTERM", () => {
  log(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", () => {
  log(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});

process.on("uncaughtException", err => {
  error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", reason => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(`Unhandled rejection at ${(reason && (reason as any).stack) || reason}`);
  process.exit(1);
});
