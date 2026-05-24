import type { Request, Response } from "express";
import { calcularFrete } from "../services/melhorEnvio.service.js";

export async function calculateFreight(req: Request, res: Response) {
  const data = await calcularFrete({
    cepDestino: req.body.cepDestino,
    itens: req.body.itens
  });

  res.json({
    success: true,
    message: "Frete calculado com sucesso.",
    data
  });
}
