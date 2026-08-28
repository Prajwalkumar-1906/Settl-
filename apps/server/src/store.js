"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.SettlStore = void 0;
class SettlStore {
    users = [];
    groups = [];
    expenses = [];
    settlements = [];
    donations = [];
    activities = [];
    constructor() {
        this.seedDemoData();
    }
    seedDemoData() {
        // Demo Users
        const alex = {
            id: 'usr_alex',
            name: 'Alex Rivera',
            email: 'alex@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };
        const sarah = {
            id: 'usr_sarah',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };
        const michael = {
            id: 'usr_michael',
            name: 'Michael Vance',
            email: 'michael@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };
        const priya = {
            id: 'usr_priya',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };
        const david = {
            id: 'usr_david',
            name: 'David Kim',
            email: 'david@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };
        this.users = [alex, sarah, michael, priya, david];
        // Group 1: EuroTrip Paris 2026
        const groupParis = {
            id: 'grp_paris',
            name: 'Paris & Swiss Alps 2026 🇫🇷✈️',
            description: 'Summer trip with the crew across Paris and Interlaken',
            type: 'trip',
            currency: 'EUR',
            inviteCode: 'PARIS2026',
            createdById: 'usr_alex',
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            members: [
                { id: 'm1', groupId: 'grp_paris', userId: 'usr_alex', role: 'admin', user: alex, joinedAt: new Date().toISOString() },
                { id: 'm2', groupId: 'grp_paris', userId: 'usr_sarah', role: 'member', user: sarah, joinedAt: new Date().toISOString() },
                { id: 'm3', groupId: 'grp_paris', userId: 'usr_michael', role: 'member', user: michael, joinedAt: new Date().toISOString() },
                { id: 'm4', groupId: 'grp_paris', userId: 'usr_priya', role: 'member', user: priya, joinedAt: new Date().toISOString() },
                { id: 'm5', groupId: 'grp_paris', userId: 'usr_david', role: 'member', user: david, joinedAt: new Date().toISOString() },
            ],
        };
        // Group 2: Flat 4B Roommates
        const groupFlat = {
            id: 'grp_flat',
            name: 'Flat 4B Apartment 🏠',
            description: 'Shared household expenses & utilities',
            type: 'flat',
            currency: 'USD',
            inviteCode: 'FLAT4B',
            createdById: 'usr_sarah',
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            members: [
                { id: 'm6', groupId: 'grp_flat', userId: 'usr_alex', role: 'member', user: alex, joinedAt: new Date().toISOString() },
                { id: 'm7', groupId: 'grp_flat', userId: 'usr_sarah', role: 'admin', user: sarah, joinedAt: new Date().toISOString() },
                { id: 'm8', groupId: 'grp_flat', userId: 'usr_michael', role: 'member', user: michael, joinedAt: new Date().toISOString() },
            ],
        };
        this.groups = [groupParis, groupFlat];
        // Expenses for Paris Trip
        const e1 = {
            id: 'exp_1',
            groupId: 'grp_paris',
            paidById: 'usr_alex', // Alex paid 750 EUR for Airbnb
            amount: 750,
            currency: 'EUR',
            category: 'Housing',
            description: 'Luxury Parisian Apartment Airbnb',
            splitType: 'equal',
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            status: 'confirmed',
            carbonEstimateKg: 90.0,
            splits: [
                { id: 'sp_1', expenseId: 'exp_1', userId: 'usr_alex', amount: 150 },
                { id: 'sp_2', expenseId: 'exp_1', userId: 'usr_sarah', amount: 150 },
                { id: 'sp_3', expenseId: 'exp_1', userId: 'usr_michael', amount: 150 },
                { id: 'sp_4', expenseId: 'exp_1', userId: 'usr_priya', amount: 150 },
                { id: 'sp_5', expenseId: 'exp_1', userId: 'usr_david', amount: 150 },
            ],
        };
        const e2 = {
            id: 'exp_2',
            groupId: 'grp_paris',
            paidById: 'usr_sarah', // Sarah paid 320 EUR for Michelin Dinner
            amount: 320,
            currency: 'EUR',
            category: 'Food',
            description: 'Michelin Star Bistro Dinner & Wine',
            splitType: 'equal',
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            status: 'confirmed',
            carbonEstimateKg: 44.8,
            splits: [
                { id: 'sp_6', expenseId: 'exp_2', userId: 'usr_alex', amount: 80 },
                { id: 'sp_7', expenseId: 'exp_2', userId: 'usr_sarah', amount: 80 },
                { id: 'sp_8', expenseId: 'exp_2', userId: 'usr_michael', amount: 80 },
                { id: 'sp_9', expenseId: 'exp_2', userId: 'usr_priya', amount: 80 },
            ],
        };
        const e3 = {
            id: 'exp_3',
            groupId: 'grp_paris',
            paidById: 'usr_michael', // Michael paid 180 EUR for Car Rental
            amount: 180,
            currency: 'EUR',
            category: 'Travel',
            description: 'SUV Car Rental for Swiss Drive',
            splitType: 'equal',
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: 'confirmed',
            carbonEstimateKg: 117.0,
            splits: [
                { id: 'sp_10', expenseId: 'exp_3', userId: 'usr_alex', amount: 36 },
                { id: 'sp_11', expenseId: 'exp_3', userId: 'usr_sarah', amount: 36 },
                { id: 'sp_12', expenseId: 'exp_3', userId: 'usr_michael', amount: 36 },
                { id: 'sp_13', expenseId: 'exp_3', userId: 'usr_priya', amount: 36 },
                { id: 'sp_14', expenseId: 'exp_3', userId: 'usr_david', amount: 36 },
            ],
        };
        const e4 = {
            id: 'exp_4',
            groupId: 'grp_paris',
            paidById: 'usr_priya', // Priya paid 120 EUR for Louvre Tickets
            amount: 120,
            currency: 'EUR',
            category: 'Entertainment',
            description: 'Louvre & Musée d\'Orsay Museum Pass',
            splitType: 'equal',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            status: 'confirmed',
            carbonEstimateKg: 6.0,
            splits: [
                { id: 'sp_15', expenseId: 'exp_4', userId: 'usr_alex', amount: 30 },
                { id: 'sp_16', expenseId: 'exp_4', userId: 'usr_sarah', amount: 30 },
                { id: 'sp_17', expenseId: 'exp_4', userId: 'usr_priya', amount: 30 },
                { id: 'sp_18', expenseId: 'exp_4', userId: 'usr_david', amount: 30 },
            ],
        };
        // Flatmate Expense
        const e5 = {
            id: 'exp_5',
            groupId: 'grp_flat',
            paidById: 'usr_sarah',
            amount: 120,
            currency: 'USD',
            category: 'Utilities',
            description: 'High-speed Fiber WiFi & Electricity',
            splitType: 'equal',
            createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
            status: 'confirmed',
            carbonEstimateKg: 42.0,
            splits: [
                { id: 'sp_19', expenseId: 'exp_5', userId: 'usr_alex', amount: 40 },
                { id: 'sp_20', expenseId: 'exp_5', userId: 'usr_sarah', amount: 40 },
                { id: 'sp_21', expenseId: 'exp_5', userId: 'usr_michael', amount: 40 },
            ],
        };
        this.expenses = [e1, e2, e3, e4, e5];
        // Seed Round-Up Donations
        this.donations = [
            {
                id: 'don_1',
                groupId: 'grp_paris',
                userId: 'usr_david',
                amount: 4.20,
                charityName: 'Clean Ocean Alliance & Reforestation',
                status: 'pledged',
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
            {
                id: 'don_2',
                groupId: 'grp_paris',
                userId: 'usr_sarah',
                amount: 8.50,
                charityName: 'Global Hunger Relief Fund',
                status: 'pledged',
                createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            },
        ];
        // Seed Activity Log
        this.activities = [
            {
                id: 'act_1',
                groupId: 'grp_paris',
                actorId: 'usr_alex',
                actorName: 'Alex Rivera',
                actionType: 'EXPENSE_ADDED',
                details: 'added expense "Luxury Parisian Apartment Airbnb" (€750.00)',
                timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
            {
                id: 'act_2',
                groupId: 'grp_paris',
                actorId: 'usr_sarah',
                actorName: 'Sarah Chen',
                actionType: 'EXPENSE_ADDED',
                details: 'added expense "Michelin Star Bistro Dinner & Wine" (€320.00)',
                timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
            {
                id: 'act_3',
                groupId: 'grp_paris',
                actorId: 'usr_david',
                actorName: 'David Kim',
                actionType: 'DONATION_MADE',
                details: 'rounded up settlement and donated €4.20 to Clean Ocean Alliance',
                timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
        ];
    }
}
exports.SettlStore = SettlStore;
exports.store = new SettlStore();
