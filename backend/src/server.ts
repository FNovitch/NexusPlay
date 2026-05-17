import "./config/env.js";
import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`KRIAR API rodando na porta ${env.PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Porta ${env.PORT} ja esta em uso. Encerre o processo atual ou ajuste PORT no backend/.env.`);
    process.exit(1);
  }

  console.error("Erro ao iniciar a API KRIAR:", error);
  process.exit(1);
});
