import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Settl Database Seeding...');

  // Clean existing tables
  await prisma.activityLog.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  // Create Admins
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@settl.app',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG', // "admin123"
      name: 'Super Admin',
      role: 'superadmin',
    },
  });

  const supportAdmin = await prisma.admin.create({
    data: {
      email: 'support@settl.app',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'Support Agent',
      role: 'support',
    },
  });

  console.log(`✅ Created Admins: ${superAdmin.email}, ${supportAdmin.email}`);

  // Create Demo Users
  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+919876543210',
      isEmailVerified: true,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      phone: '+919876543211',
      isEmailVerified: true,
    },
  });

  const michael = await prisma.user.create({
    data: {
      email: 'michael@example.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'Michael Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+919876543212',
      isEmailVerified: true,
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'Priya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phone: '+919876543213',
      isEmailVerified: true,
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david@example.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.o92uQ4V48mQ8B8h9VlWz1f8b4o1P.qG',
      name: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      phone: '+919876543214',
      isEmailVerified: true,
    },
  });

  console.log(`✅ Created 5 Demo Users`);

  // Create Group 1: Paris Trip
  const groupParis = await prisma.group.create({
    data: {
      name: 'Paris & Swiss Alps 2026 🇫🇷✈️',
      description: 'Summer trip with the crew across Paris and Interlaken',
      type: 'trip',
      currency: 'EUR',
      inviteCode: 'PARIS2026',
      createdById: alex.id,
      members: {
        create: [
          { userId: alex.id, role: 'admin' },
          { userId: sarah.id, role: 'member' },
          { userId: michael.id, role: 'member' },
          { userId: priya.id, role: 'member' },
          { userId: david.id, role: 'member' },
        ],
      },
    },
  });

  // Create Group 2: Flat 4B
  const groupFlat = await prisma.group.create({
    data: {
      name: 'Flat 4B Apartment 🏠',
      description: 'Shared household expenses & utilities',
      type: 'flat',
      currency: 'INR',
      inviteCode: 'FLAT4B',
      createdById: sarah.id,
      members: {
        create: [
          { userId: sarah.id, role: 'admin' },
          { userId: alex.id, role: 'member' },
          { userId: michael.id, role: 'member' },
        ],
      },
    },
  });

  console.log(`✅ Created Groups: ${groupParis.name}, ${groupFlat.name}`);

  // Create Expenses for Paris Trip
  const exp1 = await prisma.expense.create({
    data: {
      groupId: groupParis.id,
      paidById: alex.id,
      amount: 750,
      currency: 'EUR',
      category: 'Housing',
      description: 'Luxury Parisian Apartment Airbnb',
      splitType: 'equal',
      carbonEstimateKg: 90.0,
      splits: {
        create: [
          { userId: alex.id, amount: 150 },
          { userId: sarah.id, amount: 150 },
          { userId: michael.id, amount: 150 },
          { userId: priya.id, amount: 150 },
          { userId: david.id, amount: 150 },
        ],
      },
    },
  });

  const exp2 = await prisma.expense.create({
    data: {
      groupId: groupParis.id,
      paidById: sarah.id,
      amount: 320,
      currency: 'EUR',
      category: 'Food',
      description: 'Michelin Star Bistro Dinner & Wine',
      splitType: 'equal',
      carbonEstimateKg: 44.8,
      splits: {
        create: [
          { userId: alex.id, amount: 80 },
          { userId: sarah.id, amount: 80 },
          { userId: michael.id, amount: 80 },
          { userId: priya.id, amount: 80 },
        ],
      },
    },
  });

  const exp3 = await prisma.expense.create({
    data: {
      groupId: groupParis.id,
      paidById: michael.id,
      amount: 180,
      currency: 'EUR',
      category: 'Travel',
      description: 'SUV Car Rental for Swiss Drive',
      splitType: 'equal',
      carbonEstimateKg: 117.0,
      splits: {
        create: [
          { userId: alex.id, amount: 36 },
          { userId: sarah.id, amount: 36 },
          { userId: michael.id, amount: 36 },
          { userId: priya.id, amount: 36 },
          { userId: david.id, amount: 36 },
        ],
      },
    },
  });

  console.log(`✅ Created Sample Expenses`);

  // Seed Donations
  await prisma.donation.create({
    data: {
      groupId: groupParis.id,
      userId: david.id,
      amount: 4.20,
      charityName: 'Clean Ocean Alliance & Reforestation Fund',
      status: 'pledged',
    },
  });

  // Seed Activity Log
  await prisma.activityLog.create({
    data: {
      groupId: groupParis.id,
      actorId: alex.id,
      actorName: alex.name,
      actionType: 'EXPENSE_ADDED',
      details: 'added expense "Luxury Parisian Apartment Airbnb" (€750.00)',
    },
  });

  console.log('🎉 Settl Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
