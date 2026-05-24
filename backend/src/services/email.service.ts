import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type PasswordResetEmail = {
  to: string;
  name: string;
  resetUrl: string;
};

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function passwordResetTemplate(name: string, resetUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f7f2ec;padding:32px;color:#2d241d">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:28px">
        <p style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9b6a3b;margin:0 0 12px">Kriar</p>
        <h1 style="font-size:24px;margin:0 0 12px">Redefina sua senha</h1>
        <p style="line-height:1.6;margin:0 0 18px">Ola, ${name}. Recebemos uma solicitacao para recuperar o acesso da sua conta de cliente.</p>
        <p style="line-height:1.6;margin:0 0 24px">Este link expira em 15 minutos e pode ser usado apenas uma vez.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#7a4f2a;color:#fff;text-decoration:none;border-radius:999px;padding:13px 20px;font-weight:700">Criar nova senha</a>
        <p style="font-size:13px;line-height:1.6;color:#6f6258;margin:24px 0 0">Se voce nao pediu essa alteracao, ignore este email.</p>
      </div>
    </div>
  `;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: PasswordResetEmail) {
  if (!hasSmtpConfig()) {
    if (env.NODE_ENV !== "production" && process.env.EMAIL_DEBUG === "true") {
      console.info("[email:password-reset]", { to, resetUrl });
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: env.SMTP_FROM ?? env.SMTP_USER,
    to,
    subject: "Redefinicao de senha Kriar",
    html: passwordResetTemplate(name, resetUrl),
    text: `Ola, ${name}. Acesse o link para redefinir sua senha: ${resetUrl}`
  });
}
