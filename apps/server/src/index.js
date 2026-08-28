"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const store_1 = require("./store");
const algorithm_1 = require("./modules/settlements/algorithm");
const receiptParser_1 = require("./modules/ocr/receiptParser");
const calculator_1 = require("./modules/carbon/calculator");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Socket.IO connection handling
io.on('connection', (socket) => {
    socket.on('join_group', (groupId) => {
        socket.join(`group:${groupId}`);
    });
    socket.on('leave_group', (groupId) => {
        socket.leave(`group:${groupId}`);
    });
});
// --- REST API ENDPOINTS ---
// Auth / User profiles
app.get('/api/users', (req, res) => {
    res.json(store_1.store.users);
});
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = store_1.store.users.find(u => u.email === email) || store_1.store.users[0];
    res.json({ token: `mock_jwt_token_${user.id}`, user });
});
// Groups
app.get('/api/groups', (req, res) => {
    res.json(store_1.store.groups);
});
app.post('/api/groups', (req, res) => {
    const { name, description, type, currency, createdBy } = req.body;
    const creator = store_1.store.users.find(u => u.id === createdBy) || store_1.store.users[0];
    const newGroup = {
        id: `grp_${Date.now()}`,
        name,
        description: description || '',
        type: type || 'trip',
        currency: currency || 'USD',
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdById: creator.id,
        createdAt: new Date().toISOString(),
        members: [
            {
                id: `m_${Date.now()}`,
                groupId: `grp_${Date.now()}`,
                userId: creator.id,
                role: 'admin',
                user: creator,
                joinedAt: new Date().toISOString(),
            },
        ],
    };
    store_1.store.groups.unshift(newGroup);
    res.status(201).json(newGroup);
});
app.get('/api/groups/:id', (req, res) => {
    const group = store_1.store.groups.find(g => g.id === req.params.id);
    if (!group)
        return res.status(404).json({ error: 'Group not found' });
    res.json(group);
});
app.post('/api/groups/:id/join', (req, res) => {
    const { inviteCode, userId } = req.body;
    const group = store_1.store.groups.find(g => g.id === req.params.id || g.inviteCode === inviteCode);
    if (!group)
        return res.status(404).json({ error: 'Invalid invite code or group not found' });
    const user = store_1.store.users.find(u => u.id === userId) || store_1.store.users[0];
    const existingMember = group.members.find((m) => m.userId === user.id);
    if (!existingMember) {
        group.members.push({
            id: `m_${Date.now()}`,
            groupId: group.id,
            userId: user.id,
            role: 'member',
            user,
            joinedAt: new Date().toISOString(),
        });
    }
    res.json(group);
});
// Group Debt Summary & Algorithm Calculation
app.get('/api/groups/:id/summary', (req, res) => {
    const groupId = req.params.id;
    const group = store_1.store.groups.find(g => g.id === groupId);
    if (!group)
        return res.status(404).json({ error: 'Group not found' });
    const groupMembers = group.members.map((m) => m.user);
    const groupExpenses = store_1.store.expenses.filter(e => e.groupId === groupId);
    const groupSettlements = store_1.store.settlements.filter(s => s.groupId === groupId);
    const groupDonations = store_1.store.donations.filter(d => d.groupId === groupId);
    const summary = (0, algorithm_1.generateGroupSummary)(groupMembers, groupExpenses, groupSettlements, groupDonations, group.currency, groupId);
    res.json(summary);
});
// Add Expense
app.post('/api/groups/:id/expenses', (req, res) => {
    const groupId = req.params.id;
    const group = store_1.store.groups.find(g => g.id === groupId);
    if (!group)
        return res.status(404).json({ error: 'Group not found' });
    const { paidBy, amount, category, description, splitType, customSplits, receiptUrl } = req.body;
    const payer = store_1.store.users.find(u => u.id === paidBy) || store_1.store.users[0];
    const carbonEstimateKg = (0, calculator_1.estimateExpenseCarbonFootprint)(category, amount, description);
    // Compute split amounts per user
    let computedSplits = [];
    const members = group.members;
    if (splitType === 'exact' && Array.isArray(customSplits)) {
        computedSplits = customSplits.map((cs, idx) => ({
            id: `sp_${Date.now()}_${idx}`,
            expenseId: '',
            userId: cs.userId,
            amount: cs.amount,
        }));
    }
    else {
        // Default Equal Split
        const perPerson = Math.round((amount / members.length) * 100) / 100;
        computedSplits = members.map((m, idx) => ({
            id: `sp_${Date.now()}_${idx}`,
            expenseId: '',
            userId: m.userId,
            amount: perPerson,
        }));
    }
    const newExpense = {
        id: `exp_${Date.now()}`,
        groupId,
        paidById: payer.id,
        amount: Number(amount),
        currency: group.currency,
        category: category || 'Other',
        description,
        splitType: splitType || 'equal',
        receiptUrl,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        carbonEstimateKg,
        splits: computedSplits,
    };
    computedSplits.forEach(s => (s.expenseId = newExpense.id));
    store_1.store.expenses.unshift(newExpense);
    // Add Activity Log
    const activity = {
        id: `act_${Date.now()}`,
        groupId,
        actorId: payer.id,
        actorName: payer.name,
        actionType: 'EXPENSE_ADDED',
        details: `added expense "${description}" (${group.currency === 'EUR' ? '€' : '$'}${amount})`,
        timestamp: new Date().toISOString(),
    };
    store_1.store.activities.unshift(activity);
    // Broadcast WebSocket event
    io.to(`group:${groupId}`).emit('expense:added', { expense: newExpense, activity });
    res.status(201).json(newExpense);
});
// Complete Settlement (Optionally with Round-Up Donation)
app.post('/api/groups/:id/settlements', (req, res) => {
    const groupId = req.params.id;
    const group = store_1.store.groups.find(g => g.id === groupId);
    if (!group)
        return res.status(404).json({ error: 'Group not found' });
    const { fromUserId, toUserId, amount, enableRoundUp } = req.body;
    let roundUpDonation = 0;
    if (enableRoundUp) {
        const rounded = Math.ceil(amount / 10) * 10;
        roundUpDonation = Math.round((rounded - amount) * 100) / 100;
        if (roundUpDonation === 0)
            roundUpDonation = 2.0; // fallback micro-donation
    }
    const settlement = {
        id: `set_${Date.now()}`,
        groupId,
        fromUserId,
        toUserId,
        amount: Number(amount),
        currency: group.currency,
        status: 'completed',
        settledAt: new Date().toISOString(),
        roundUpDonation,
    };
    store_1.store.settlements.unshift(settlement);
    const fromUser = store_1.store.users.find(u => u.id === fromUserId);
    const toUser = store_1.store.users.find(u => u.id === toUserId);
    if (roundUpDonation > 0 && fromUser) {
        const donation = {
            id: `don_${Date.now()}`,
            groupId,
            userId: fromUserId,
            amount: roundUpDonation,
            charityName: 'Clean Oceans & Reforestation Fund',
            status: 'pledged',
            createdAt: new Date().toISOString(),
        };
        store_1.store.donations.unshift(donation);
    }
    const activity = {
        id: `act_${Date.now()}`,
        groupId,
        actorId: fromUserId,
        actorName: fromUser ? fromUser.name : 'User',
        actionType: 'SETTLEMENT_COMPLETED',
        details: `settled debt of ${group.currency === 'EUR' ? '€' : '$'}${amount} with ${toUser ? toUser.name : 'Recipient'}${roundUpDonation > 0 ? ` (+${group.currency === 'EUR' ? '€' : '$'}${roundUpDonation} donated)` : ''}`,
        timestamp: new Date().toISOString(),
    };
    store_1.store.activities.unshift(activity);
    io.to(`group:${groupId}`).emit('settlement:completed', { settlement, activity });
    res.status(201).json(settlement);
});
// Receipt OCR Parsing Endpoint
app.post('/api/ocr/parse', (req, res) => {
    const { imageName } = req.body;
    const parsed = (0, receiptParser_1.parseReceiptImage)(imageName || 'restaurant');
    res.json(parsed);
});
// Group Activity Feed
app.get('/api/groups/:id/activity', (req, res) => {
    const activities = store_1.store.activities.filter(a => a.groupId === req.params.id);
    res.json(activities);
});
// Group Expenses List
app.get('/api/groups/:id/expenses', (req, res) => {
    const expenses = store_1.store.expenses.filter(e => e.groupId === req.params.id);
    res.json(expenses);
});
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Settl Express Server running on http://localhost:${PORT}`);
});
