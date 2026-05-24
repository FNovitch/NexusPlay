import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AdminPermissionLevel, UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { passwordSchema } from "../src/modules/users/user.schema.js";

function emailIsValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function promptHidden(question: string) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  let value = "";

  stdout.write(question);
  stdin.setRawMode?.(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return await new Promise<string>((resolve) => {
    const onData = (char: string) => {
      if (char === "\u0003") process.exit(130);
      if (char === "\r" || char === "\n") {
        stdout.write("\n");
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        resolve(value);
        return;
      }
      if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const name = (await rl.question("Enter admin name: ")).trim();
    const email = (await rl.question("Enter admin email: ")).trim().toLowerCase();
    rl.close();

    const password = await promptHidden("Enter admin password: ");
    const confirmPassword = await promptHidden("Confirm admin password: ");

    if (name.length < 2) throw new Error("Nome deve ter pelo menos 2 caracteres.");
    if (!emailIsValid(email)) throw new Error("E-mail invalido.");
    if (password !== confirmPassword) throw new Error("A confirmacao da senha nao confere.");
    passwordSchema.parse(password);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Ja existe um usuario com este e-mail.");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        adminProfile: {
          create: {
            name,
            permissionLevel: AdminPermissionLevel.SUPER_ADMIN,
            active: true
          }
        }
      },
      include: { adminProfile: true }
    });

    console.log(`Administrador criado com sucesso: ${user.email}`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Nao foi possivel criar o administrador.");
  process.exit(1);
});
