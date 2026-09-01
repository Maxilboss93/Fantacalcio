import { spawn } from "node:child_process";
import path from "node:path";

const isWindows = process.platform === "win32";

const processes = [
  spawn(process.execPath, ["server/coachServer.mjs"], {
    stdio: "inherit",
    env: process.env
  }),

  spawn(
    isWindows ? "cmd.exe" : "npm",
    isWindows
      ? ["/d", "/s", "/c", "npm run dev"]
      : ["run", "dev"],
    {
      stdio: "inherit",
      env: process.env
    }
  )
];

function stopAll(signal) {
  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopAll(signal);
    process.exit(0);
  });
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll("SIGTERM");
      process.exit(code);
    }
  });

  child.on("error", (error) => {
    console.error("Errore avvio processo:", error);
    stopAll("SIGTERM");
    process.exit(1);
  });
}

process.title = `fantacalcio-dev-ai:${path.basename(process.cwd())}`;