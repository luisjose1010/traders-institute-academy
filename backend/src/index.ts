import "dotenv/config";
import { createApp } from "./app";

const app = createApp();
const basePort = parseInt(process.env.PORT || "3000", 10);

function tryListen(port: number) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && port < basePort + 10) {
      console.log(`Port ${port} busy, trying ${port + 1}...`);
      tryListen(port + 1);
    } else {
      console.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    }
  });
}

tryListen(basePort);
