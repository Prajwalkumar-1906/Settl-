import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './db';
import { generateGroupSummary } from './modules/settlements/algorithm';
import { parseReceiptImage } from './modules/ocr/receiptParser';
import { estimateExpenseCarbonFootprint } from './modules/carbon/calculator';
import { Currency, ExpenseCategory, SplitType } from 'shared-types';
import { authRouter } from './routes/auth';
import { authenticateJWT, AuthenticatedRequest } from './middleware/auth';
import { verifyAccessToken } from './utils/auth';
import {
  validateRequestBody,
  createGroupSchema,
  createExpenseSchema,
  createSettlementSchema,
} from './middleware/validate';

const app = express();
const httpServer = createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Security & Base Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate Limiting for Auth Routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many auth requests from this IP, please try again after 15 minutes.' } },
});

app.use('/api/auth', authRateLimiter, authRouter);

// Socket.IO Handshake Authentication & Real-Time Presence
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // Allow fallback for dev if unauthenticated
    return next();
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(new Error('Authentication error: Token invalid or expired'));
  }
  (socket as any).userId = payload.userId;
  next();
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;

  socket.on('join_group', (groupId: string) => {
    socket.join(`group:${groupId}`);
    if (userId) {
      io.to(`group:${groupId}`).emit('member:joined', { userId, timestamp: new Date().toISOString() });
    }
  });

  socket.on('leave_group', (groupId: string) => {
    socket.leave(`group:${groupId}`);
  });
});

// --- PUBLIC IMPACT ENDPOINT ---
app.get('/api/impact/summary', async (req, res) => {
  try {
    const totalDonationsObj = await prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalExpensesObj = await prisma.expense.aggregate({
      _sum: { carbonEstimateKg: true, amount: true },
      _count: { id: true },
    });

    const recentDonations = await prisma.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
        group: {
          select: { name: true },
        },
      },
    });

    res.json({
      totalDonationsAmount: totalDonationsObj._sum.amount || 0,
      totalDonationsCount: totalDonationsObj._count.id || 0,
      totalCarbonKg: totalExpensesObj._sum.carbonEstimateKg || 0,
      totalExpensesCount: totalExpensesObj._count.id || 0,
      charityPartner: 'Clean Oceans & Reforestation Fund',
      recentDonations,
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch impact summary' } });
  }
});

// --- PROTECTED API ENDPOINTS ---

app.get('/api/users', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch users' } });
  }
});

app.get('/api/groups', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user.id;
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                isEmailVerified: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch user groups' } });
  }
});

app.post('/api/groups', authenticateJWT, validateRequestBody(createGroupSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, type, currency } = req.body;
    const currentUserId = req.user.id;

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newGroup = await prisma.group.create({
      data: {
        name,
        description: description || '',
        type: type || 'trip',
        currency: currency || 'INR',
        inviteCode,
        createdById: currentUserId,
        members: {
          create: {
            userId: currentUserId,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                isEmailVerified: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create group' } });
  }
});

app.get('/api/groups/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                isEmailVerified: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    if (!group) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found' } });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch group' } });
  }
});

app.post('/api/groups/join/code', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { inviteCode } = req.body;
    const currentUserId = req.user.id;

    const group = await prisma.group.findFirst({
      where: { inviteCode: inviteCode?.toUpperCase() },
      include: { members: true },
    });
    if (!group) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invalid invite code' } });

    const existingMember = group.members.find((m) => m.userId === currentUserId);
    if (!existingMember) {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: currentUserId,
          role: 'member',
        },
      });

      await prisma.activityLog.create({
        data: {
          groupId: group.id,
          actorId: currentUserId,
          actorName: req.user.name,
          actionType: 'MEMBER_JOINED',
          details: `joined the group`,
        },
      });

      io.to(`group:${group.id}`).emit('member:joined', { userId: currentUserId, name: req.user.name });
    }

    const updatedGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                isEmailVerified: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to join group' } });
  }
});

app.get('/api/groups/:id/summary', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = req.params.id;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                isEmailVerified: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    if (!group) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found' } });

    const groupMembers = group.members.map((m) => m.user);

    const rawExpenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true },
    });

    const groupExpenses: any[] = rawExpenses.map((exp) => ({
      id: exp.id,
      groupId: exp.groupId,
      paidById: exp.paidById,
      paidBy: exp.paidById,
      amount: exp.amount,
      currency: exp.currency as Currency,
      category: exp.category as ExpenseCategory,
      description: exp.description,
      splitType: exp.splitType as SplitType,
      receiptUrl: exp.receiptUrl,
      createdAt: exp.createdAt.toISOString(),
      status: exp.status as any,
      carbonEstimateKg: exp.carbonEstimateKg,
      splits: exp.splits.map((s) => ({
        id: s.id,
        expenseId: s.expenseId,
        userId: s.userId,
        amount: s.amount,
      })),
    }));

    const rawSettlements = await prisma.settlement.findMany({
      where: { groupId },
    });

    const groupSettlements: any[] = rawSettlements.map((s) => ({
      id: s.id,
      groupId: s.groupId,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      amount: s.amount,
      currency: s.currency as Currency,
      status: s.status as any,
      settledAt: s.settledAt.toISOString(),
      roundUpDonation: s.roundUpDonation,
    }));

    const rawDonations = await prisma.donation.findMany({
      where: { groupId },
    });

    const groupDonations: any[] = rawDonations.map((d) => ({
      id: d.id,
      groupId: d.groupId,
      userId: d.userId,
      amount: d.amount,
      charityName: d.charityName,
      status: d.status as any,
      createdAt: d.createdAt.toISOString(),
    }));

    const summary = generateGroupSummary(
      groupMembers as any,
      groupExpenses,
      groupSettlements,
      groupDonations,
      group.currency as Currency,
      groupId
    );

    res.json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to compute group summary' } });
  }
});

app.post('/api/groups/:id/expenses', authenticateJWT, validateRequestBody(createExpenseSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = req.params.id;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found' } });

    const { paidBy, amount, category, description, splitType, customSplits, receiptUrl } = req.body;
    const actualPayerId = paidBy || req.user.id;

    const carbonEstimateKg = estimateExpenseCarbonFootprint(category, Number(amount), description);

    let computedSplits: { userId: string; amount: number }[] = [];
    const members = group.members;

    if (splitType === 'exact' && Array.isArray(customSplits)) {
      computedSplits = customSplits.map((cs: any) => ({
        userId: cs.userId,
        amount: Number(cs.amount),
      }));
    } else {
      const perPerson = Math.round((Number(amount) / members.length) * 100) / 100;
      computedSplits = members.map((m) => ({
        userId: m.userId,
        amount: perPerson,
      }));
    }

    const newExpense = await prisma.expense.create({
      data: {
        groupId,
        paidById: actualPayerId,
        amount: Number(amount),
        currency: group.currency,
        category: category || 'Other',
        description,
        splitType: splitType || 'equal',
        receiptUrl,
        status: 'confirmed',
        carbonEstimateKg,
        splits: {
          create: computedSplits,
        },
      },
      include: {
        splits: true,
      },
    });

    const activity = await prisma.activityLog.create({
      data: {
        groupId,
        actorId: req.user.id,
        actorName: req.user.name,
        actionType: 'EXPENSE_ADDED',
        details: `added expense "${description}" (${group.currency === 'EUR' ? '€' : '$'}${amount})`,
      },
    });

    io.to(`group:${groupId}`).emit('expense:added', { expense: newExpense, activity });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Expense error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create expense' } });
  }
});

app.post('/api/groups/:id/settlements', authenticateJWT, validateRequestBody(createSettlementSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = req.params.id;
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found' } });

    const { fromUserId, toUserId, amount, enableRoundUp } = req.body;
    const actualFromUserId = fromUserId || req.user.id;

    let roundUpDonation = 0;
    if (enableRoundUp) {
      const rounded = Math.ceil(amount / 10) * 10;
      roundUpDonation = Math.round((rounded - amount) * 100) / 100;
      if (roundUpDonation === 0) roundUpDonation = 2.0;
    }

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId: actualFromUserId,
        toUserId,
        amount: Number(amount),
        currency: group.currency,
        status: 'completed',
        roundUpDonation,
      },
    });

    const fromUser = await prisma.user.findUnique({ where: { id: actualFromUserId } });
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } });

    if (roundUpDonation > 0 && fromUser) {
      await prisma.donation.create({
        data: {
          groupId,
          userId: actualFromUserId,
          amount: roundUpDonation,
          charityName: 'Clean Oceans & Reforestation Fund',
          status: 'pledged',
        },
      });
    }

    const activity = await prisma.activityLog.create({
      data: {
        groupId,
        actorId: req.user.id,
        actorName: req.user.name,
        actionType: 'SETTLEMENT_COMPLETED',
        details: `settled debt of ${group.currency === 'EUR' ? '€' : '$'}${amount} with ${toUser ? toUser.name : 'Recipient'}${
          roundUpDonation > 0 ? ` (+${group.currency === 'EUR' ? '€' : '$'}${roundUpDonation} donated)` : ''
        }`,
      },
    });

    io.to(`group:${groupId}`).emit('settlement:completed', { settlement, activity });

    res.status(201).json(settlement);
  } catch (error) {
    console.error('Settlement error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to process settlement' } });
  }
});

app.post('/api/ocr/parse', authenticateJWT, (req, res) => {
  const { imageName } = req.body;
  const parsed = parseReceiptImage(imageName || 'restaurant');
  res.json(parsed);
});

app.get('/api/groups/:id/activity', authenticateJWT, async (req, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { groupId: req.params.id },
      orderBy: { timestamp: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch activity log' } });
  }
});

app.get('/api/groups/:id/expenses', authenticateJWT, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { groupId: req.params.id },
      include: { splits: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch expenses' } });
  }
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Settl Express Server running on http://localhost:${PORT}`);
});
