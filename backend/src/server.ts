import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`KRIAR API rodando na porta ${env.PORT}`);
});
