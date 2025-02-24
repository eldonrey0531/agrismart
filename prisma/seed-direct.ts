import { MongoClient } from 'mongodb';
import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017/agrismart";
  const client = new MongoClient(url);

  try {
    console.log("🌱 Starting database seed...");
    await client.connect();
    const db = client.db();

    // Drop collections to start fresh
    try {
      await db.dropCollection('User');
      await db.dropCollection('Product');
    } catch (error) {
      // Collections might not exist, that's okay
    }

    // Create admin user
    const adminPassword = await hashPassword("Admin123!");
    const adminUser = await db.collection('User').insertOne({
      email: "admin@agrismart.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      isVerified: true,
      status: "active",
      accountLevel: "premium",
      mobile: "+1234567890",
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: null
    });
    console.log("👤 Created admin user:", "admin@agrismart.com");

    // Create test user
    const userPassword = await hashPassword("User123!");
    const testUser = await db.collection('User').insertOne({
      email: "user@agrismart.com",
      name: "Test User",
      password: userPassword,
      role: "user",
      isVerified: true,
      status: "active",
      accountLevel: "basic",
      mobile: "+1987654321",
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: undefined // Using undefined instead of null for unique constraint
    });
    console.log("👤 Created test user:", "user@agrismart.com");

    // Create marketplace products for test user
    const products = [
      {
        name: "Organic Rice",
        description: "Freshly harvested organic rice from local farms",
        price: 25.99,
        sellerId: testUser.insertedId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Fresh Vegetables Bundle",
        description: "Assorted fresh vegetables including tomatoes, lettuce, and carrots",
        price: 15.99,
        sellerId: testUser.insertedId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Farm Tools Set",
        description: "Complete set of essential farming tools",
        price: 89.99,
        sellerId: testUser.insertedId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Organic Fertilizer",
        description: "100% organic fertilizer for better crop yield",
        price: 35.50,
        sellerId: testUser.insertedId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('Product').insertMany(products);
    console.log("📦 Created marketplace products:", products.length);

    // Create locked user
    const lockedPassword = await hashPassword("Locked123!");
    await db.collection('User').insertOne({
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
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: undefined // Using undefined instead of null
    });
    console.log("👤 Created locked user:", "locked@agrismart.com");

    // Create pending user
    const pendingPassword = await hashPassword("Pending123!");
    await db.collection('User').insertOne({
      email: "pending@agrismart.com",
      name: "Pending User",
      password: pendingPassword,
      role: "user",
      isVerified: false,
      status: "pending",
      accountLevel: "basic",
      mobile: "+9988776655",
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordResetToken: undefined // Using undefined instead of null
    });
    console.log("👤 Created pending user:", "pending@agrismart.com");

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
    await client.close();
  }
}

// Run seed
seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });