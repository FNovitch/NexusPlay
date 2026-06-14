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
    <div style="font-family:Arial,sans-serif;background:#e8e9f3;padding:32px;color:#272635">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #cecece;border-radius:12px;padding:28px">
        <p style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#272635;margin:0 0 12px">NexusPlay</p>
        <h1 style="font-size:24px;margin:0 0 12px">Redefina sua senha</h1>
        <p style="line-height:1.6;margin:0 0 18px">Olá, ${name}. Recebemos uma solicitação para recuperar o acesso da sua conta de cliente.</p>
        <p style="line-height:1.6;margin:0 0 24px">Este link expira em 15 minutos e pode ser usado apenas uma vez.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#272635;color:#fff;text-decoration:none;border-radius:8px;padding:13px 20px;font-weight:700">Criar nova senha</a>
        <p style="font-size:13px;line-height:1.6;color:#73737a;margin:24px 0 0">Se você não pediu essa alteração, ignore este email.</p>
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
    subject: "Redefinição de senha NexusPlay",
    html: passwordResetTemplate(name, resetUrl),
    text: `Olá, ${name}. Acesse o link para redefinir sua senha: ${resetUrl}`
  });
}
