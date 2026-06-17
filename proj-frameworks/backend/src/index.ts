import cors from 'cors';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, SummaryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 3030);
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const resetTokenMinutes = Number(process.env.PASSWORD_RESET_TOKEN_MINUTES || 30);
const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3031';
const mailtrapApiKey = process.env.MAILTRAP_API_KEY || '';
const mailtrapUseSandbox = process.env.MAILTRAP_USE_SANDBOX === 'true';
const mailtrapInboxId = process.env.MAILTRAP_INBOX_ID || '';
const mailtrapFromEmail = process.env.MAILTRAP_FROM_EMAIL || (mailtrapUseSandbox ? 'sandbox@example.com' : '');
const mailtrapFromName = process.env.MAILTRAP_FROM_NAME || 'BrainLog';
let didWarnMailtrapConfig = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, '..', uploadDir);

const upload = multer({
  dest: uploadsPath,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 8,
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

type AuthUser = {
  id: number;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const userSchema = z.object({
  name: z.string({ required_error: 'Informe seu nome.' }).trim().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
  email: z.string({ required_error: 'Informe seu e-mail.' }).trim().email('Informe um e-mail válido.').transform((value) => value.toLowerCase()),
  password: z.string({ required_error: 'Informe sua senha.' }).min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
  goal: z.string().trim().min(2, 'Informe seu objetivo de estudos.').default('Vestibular'),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Informe seu e-mail.' }).trim().email('Informe um e-mail válido.').transform((value) => value.toLowerCase()),
  password: z.string({ required_error: 'Informe sua senha.' }).min(1, 'Informe sua senha.'),
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Informe seu e-mail.' }).trim().email('Informe um e-mail válido.').transform((value) => value.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Informe o token de recuperação.' }).trim().min(20, 'Token de recuperação inválido.'),
  password: z.string({ required_error: 'Informe sua nova senha.' }).min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

const summarySchema = z.object({
  ownerId: z.coerce.number().int().positive(),
  title: z.string().trim().min(2),
  subject: z.string().trim().min(2),
  description: z.string().trim().optional().default(''),
  status: z.string().optional().default('Novo'),
  reviewReminderAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  fileNames: z.array(z.string().trim().min(1)).optional().default([]),
});

const summaryUpdateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  subject: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  status: z.string().optional(),
  reviewReminderAt: z.string().datetime().nullable().optional(),
});

const statusLabels: Record<SummaryStatus, string> = {
  NOVO: 'Novo',
  EM_REVISAO: 'Em revisão',
  REVISADO: 'Revisado',
};

function toStatus(value: string): SummaryStatus {
  const normalized = value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

  if (normalized === 'em revisao') return SummaryStatus.EM_REVISAO;
  if (normalized === 'revisado') return SummaryStatus.REVISADO;
  return SummaryStatus.NOVO;
}

function signToken(user: AuthUser) {
  return jwt.sign(user, jwtSecret, { expiresIn: '7d' });
}

function createPasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPasswordResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function passwordResetUrl(token: string) {
  const url = new URL('/reset-password', appBaseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendPasswordResetEmail(user: { name: string; email: string }, token: string) {
  if (!mailtrapApiKey || !mailtrapFromEmail || (mailtrapUseSandbox && !mailtrapInboxId)) {
    if (!didWarnMailtrapConfig) {
      console.warn('Mailtrap não configurado. Defina MAILTRAP_API_KEY, MAILTRAP_FROM_EMAIL e, no sandbox, MAILTRAP_INBOX_ID.');
      didWarnMailtrapConfig = true;
    }
    return false;
  }

  const resetUrl = passwordResetUrl(token);
  const endpoint = mailtrapUseSandbox
    ? `https://sandbox.api.mailtrap.io/api/send/${mailtrapInboxId}`
    : 'https://send.api.mailtrap.io/api/send';

  const firstName = user.name.split(' ')[0] || 'Estudante';
  const htmlResetUrl = escapeHtml(resetUrl);
  const htmlFirstName = escapeHtml(firstName);
  const expiresIn = `${resetTokenMinutes} minutos`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailtrapApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        email: mailtrapFromEmail,
        name: mailtrapFromName,
      },
      to: [
        {
          email: user.email,
          name: user.name,
        },
      ],
      subject: 'Redefinição de senha - BrainLog',
      category: 'password_reset',
      text: [
        `Olá, ${firstName}.`,
        '',
        'Recebemos uma solicitação para redefinir sua senha no BrainLog.',
        `Use este link para criar uma nova senha: ${resetUrl}`,
        '',
        `Este link expira em ${expiresIn}. Se você não solicitou a alteração, ignore este e-mail.`,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <p>Olá, ${htmlFirstName}.</p>
          <p>Recebemos uma solicitação para redefinir sua senha no BrainLog.</p>
          <p>
            <a href="${htmlResetUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 999px; background: #0f766e; color: #ffffff; text-decoration: none; font-weight: 700;">
              Redefinir senha
            </a>
          </p>
          <p>Este link expira em ${escapeHtml(expiresIn)}. Se você não solicitou a alteração, ignore este e-mail.</p>
          <p style="font-size: 12px; color: #64748b;">Se o botão não funcionar, copie e cole este link no navegador:<br>${htmlResetUrl}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mailtrap retornou ${response.status}: ${details}`);
  }

  return true;
}

function validationMessage(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message || fallback;
}

function publicUser(user: { id: number; name: string; email: string; goal: string; createdAt?: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    goal: user.goal,
    createdAt: user.createdAt,
  };
}

function publicSummary(summary: {
  id: number;
  ownerId: number;
  title: string;
  subject: string;
  description: string | null;
  status: SummaryStatus;
  reviewReminderAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  files?: { id: number; fileName: string; storedName: string | null; mimeType: string | null; size: number | null }[];
}) {
  return {
    id: summary.id,
    ownerId: summary.ownerId,
    title: summary.title,
    subject: summary.subject,
    description: summary.description || '',
    status: statusLabels[summary.status],
    reviewReminderAt: summary.reviewReminderAt ? summary.reviewReminderAt.toISOString() : null,
    createdAt: summary.createdAt.toISOString(),
    updatedAt: summary.updatedAt?.toISOString(),
    fileNames: summary.files?.map((file) => file.fileName) || [],
    files:
      summary.files?.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.storedName ? `/uploads/${encodeURIComponent(file.storedName)}` : null,
      })) || [],
  };
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret) as AuthUser;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

function assertOwner(req: express.Request, res: express.Response, ownerId: number) {
  if (req.user?.id !== ownerId) {
    res.status(403).json({ message: 'Você não tem acesso a este recurso.' });
    return false;
  }

  return true;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'brainlog-api' });
});

app.post('/users', async (req, res, next) => {
  try {
    const payload = userSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        goal: payload.goal,
      },
    });

    const safeUser = publicUser(user);
    res.status(201).json({ user: safeUser, token: signToken({ id: user.id, email: user.email }) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: validationMessage(error, 'Dados de usuário inválidos.'), issues: error.issues });
    }

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    return next(error);
  }
});

app.get('/users', async (req, res, next) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : undefined;
    const users = await prisma.user.findMany({
      where: email ? { email } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json(users.map(publicUser));
  } catch (error) {
    next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    const passwordMatches = user ? await bcrypt.compare(payload.password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    res.json({
      user: publicUser(user),
      token: signToken({ id: user.id, email: user.email }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: validationMessage(error, 'Credenciais inválidas.'), issues: error.issues });
    }

    return next(error);
  }
});

app.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    let resetToken: string | null = null;
    if (user) {
      resetToken = createPasswordResetToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashPasswordResetToken(resetToken),
          resetTokenExpiresAt: new Date(Date.now() + resetTokenMinutes * 60 * 1000),
        },
      });

      try {
        await sendPasswordResetEmail({ name: user.name, email: user.email }, resetToken);
      } catch (emailError) {
        console.error('Falha ao enviar e-mail de recuperação pela Mailtrap.', emailError);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.info(`Token de recuperação gerado para ${payload.email}: ${resetToken}`);
      }
    }

    res.json({
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: validationMessage(error, 'E-mail inválido.'), issues: error.issues });
    }

    return next(error);
  }
});

app.post('/auth/reset-password', async (req, res, next) => {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const resetTokenHash = hashPasswordResetToken(payload.token);
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado. Solicite uma nova recuperação de senha.' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    res.json({ message: 'Senha atualizada com sucesso. Faça login com sua nova senha.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: validationMessage(error, 'Dados de recuperação inválidos.'), issues: error.issues });
    }

    return next(error);
  }
});

app.post('/auth/logout', authenticate, (_req, res) => {
  res.status(204).send();
});

app.get('/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

app.get('/summaries', authenticate, async (req, res, next) => {
  try {
    const ownerId = z.coerce.number().int().positive().parse(req.query.ownerId);

    if (!assertOwner(req, res, ownerId)) return;

    const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
    const status = typeof req.query.status === 'string' && req.query.status !== 'Todos' ? toStatus(req.query.status) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

    const summaries = await prisma.summary.findMany({
      where: {
        ownerId,
        subject,
        status,
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { files: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(summaries.map(publicSummary));
  } catch (error) {
    next(error);
  }
});

app.get('/summaries/:id', authenticate, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const summary = await prisma.summary.findUniqueOrThrow({
      where: { id },
      include: { files: true },
    });

    if (!assertOwner(req, res, summary.ownerId)) return;

    res.json(publicSummary(summary));
  } catch (error) {
    next(error);
  }
});

app.post('/summaries', authenticate, async (req, res, next) => {
  try {
    const payload = summarySchema.parse(req.body);

    if (!assertOwner(req, res, payload.ownerId)) return;

    const summary = await prisma.summary.create({
      data: {
        ownerId: payload.ownerId,
        title: payload.title,
        subject: payload.subject,
        description: payload.description,
        status: toStatus(payload.status),
        reviewReminderAt: payload.reviewReminderAt ? new Date(payload.reviewReminderAt) : undefined,
        createdAt: payload.createdAt ? new Date(payload.createdAt) : undefined,
        files: {
          create: payload.fileNames.map((fileName) => ({ fileName })),
        },
      },
      include: { files: true },
    });

    res.status(201).json(publicSummary(summary));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados do resumo inválidos.', issues: error.issues });
    }

    return next(error);
  }
});

app.patch('/summaries/:id', authenticate, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const payload = summaryUpdateSchema.parse(req.body);
    const summary = await prisma.summary.findUniqueOrThrow({ where: { id } });

    if (!assertOwner(req, res, summary.ownerId)) return;

    const updated = await prisma.summary.update({
      where: { id },
      data: {
        title: payload.title,
        subject: payload.subject,
        description: payload.description,
        status: payload.status ? toStatus(payload.status) : undefined,
        reviewReminderAt:
          payload.reviewReminderAt === undefined
            ? undefined
            : payload.reviewReminderAt
              ? new Date(payload.reviewReminderAt)
              : null,
      },
      include: { files: true },
    });

    res.json(publicSummary(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados do resumo inválidos.', issues: error.issues });
    }

    return next(error);
  }
});

app.delete('/summaries/:id', authenticate, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const summary = await prisma.summary.findUniqueOrThrow({ where: { id } });

    if (!assertOwner(req, res, summary.ownerId)) return;

    await prisma.summary.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.patch('/summaries/:id/status', authenticate, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const status = toStatus(z.string().parse(req.body.status));
    const summary = await prisma.summary.findUniqueOrThrow({ where: { id } });

    if (!assertOwner(req, res, summary.ownerId)) return;

    const updated = await prisma.summary.update({
      where: { id },
      data: { status },
      include: { files: true },
    });

    res.json(publicSummary(updated));
  } catch (error) {
    next(error);
  }
});

app.post('/summaries/:id/files', authenticate, upload.array('files'), async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const summary = await prisma.summary.findUniqueOrThrow({ where: { id } });

    if (!assertOwner(req, res, summary.ownerId)) return;

    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const created = await prisma.summaryFile.createManyAndReturn({
      data: files.map((file) => ({
        summaryId: id,
        fileName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      })),
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

app.get('/dashboard/:ownerId', authenticate, async (req, res, next) => {
  try {
    const ownerId = z.coerce.number().int().positive().parse(req.params.ownerId);

    if (!assertOwner(req, res, ownerId)) return;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [total, reviewed, recent, byStatus, bySubject, monthlyRows] = await Promise.all([
      prisma.summary.count({ where: { ownerId } }),
      prisma.summary.count({ where: { ownerId, status: SummaryStatus.REVISADO } }),
      prisma.summary.count({ where: { ownerId, createdAt: { gte: weekAgo } } }),
      prisma.summary.groupBy({ by: ['status'], where: { ownerId }, _count: { _all: true } }),
      prisma.summary.groupBy({ by: ['subject'], where: { ownerId }, _count: { _all: true }, orderBy: { _count: { subject: 'desc' } } }),
      prisma.summary.findMany({
        where: { ownerId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
    ]);

    const monthly = new Map<string, number>();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly.set(`${date.getFullYear()}-${date.getMonth()}`, 0);
    }

    monthlyRows.forEach((row) => {
      const key = `${row.createdAt.getFullYear()}-${row.createdAt.getMonth()}`;
      if (monthly.has(key)) monthly.set(key, (monthly.get(key) || 0) + 1);
    });

    res.json({
      total,
      reviewed,
      reviewRate: total ? Math.round((reviewed / total) * 100) : 0,
      recentLast7Days: recent,
      byStatus: byStatus.map((item) => ({ status: statusLabels[item.status], count: item._count._all })),
      bySubject: bySubject.map((item) => ({ subject: item.subject, count: item._count._all })),
      monthlyEvolution: [...monthly.entries()].map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          key,
          label: new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'short' }),
          count,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(port, () => {
  console.log(`BrainLog API rodando em http://localhost:${port}`);
});
