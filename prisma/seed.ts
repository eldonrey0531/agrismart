import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Create admin user
    const adminPassword = await hashPassword("Admin123!");
    const admin = await prisma.user.create({
      data: {
        email: "admin@agrismart.com",
        name: "Admin User",
        password: adminPassword,
        role: "admin",
        isVerified: true,
        status: "active",
        accountLevel: "premium",
        mobile: "+1234567890",
      },
    });
    console.log("👤 Created admin user:", admin.email);

    // Create test user
    const userPassword = await hashPassword("User123!");
    const testUser = await prisma.user.create({
      data: {
        email: "user@agrismart.com",
        name: "Test User",
        password: userPassword,
        role: "user",
        isVerified: true,
        status: "active",
        accountLevel: "basic",
        mobile: "+1987654321",
      },
    });
    console.log("👤 Created test user:", testUser.email);

    // Create marketplace products for test user
    const products = [
      {
        name: "Organic Rice",
        description: "Freshly harvested organic rice from local farms",
        price: 25.99,
        seller: { connect: { id: testUser.id } },
        status: "active",
      },
      {
        name: "Fresh Vegetables Bundle",
        description: "Assorted fresh vegetables including tomatoes, lettuce, and carrots",
        price: 15.99,
        seller: { connect: { id: testUser.id } },
        status: "active",
      },
      {
        name: "Farm Tools Set",
        description: "Complete set of essential farming tools",
        price: 89.99,
        seller: { connect: { id: testUser.id } },
        status: "active",
      },
      {
        name: "Organic Fertilizer",
        description: "100% organic fertilizer for better crop yield",
        price: 35.50,
        seller: { connect: { id: testUser.id } },
        status: "active",
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }
    console.log("📦 Created marketplace products:", products.length);

    // Create locked user
    const lockedPassword = await hashPassword("Locked123!");
    const lockedUser = await prisma.user.create({
      data: {
        email: "locked@agrismart.com",
        name: "Locked User",
        password: lockedPassword,
        role: "user",
        isVerified: true,
        status: "locked",
        accountLevel: "basic",
        mobile: "+1122334455",
        statusReason: "Too many failed login attempts",
        statusUpdatedAt: new Date(),
      },
    });
    console.log("👤 Created locked user:", lockedUser.email);

    // Create pending user
    const pendingPassword = await hashPassword("Pending123!");
    const pendingUser = await prisma.user.create({
      data: {
        email: "pending@agrismart.com",
        name: "Pending User",
        password: pendingPassword,
        role: "user",
        isVerified: false,
        status: "pending",
        accountLevel: "basic",
        mobile: "+9988776655",
      },
    });
    console.log("👤 Created pending user:", pendingUser.email);

    console.log("\n📊 Seed Statistics:");
    console.log("Total users created:", 4);
    console.log("Admin users:", 1);
    console.log("Regular users:", 1);
    console.log("Locked users:", 1);
    console.log("Pending users:", 1);
    console.log("Marketplace products:", products.length);

    console.log("\n✅ Database seed completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });