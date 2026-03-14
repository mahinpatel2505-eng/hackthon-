import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@coreinventory.com" },
    update: {},
    create: {
      email: "admin@coreinventory.com",
      name: "Admin User",
      passwordHash: "demo-password-hash", // In a real app, hash this
      role: "ADMIN",
    },
  });

  // 2. Create Warehouses
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { name: "Main Warehouse" },
    update: {},
    create: {
      name: "Main Warehouse",
      address: "123 Inventory Blvd, Silicon Valley",
    },
  });

  const secondaryWarehouse = await prisma.warehouse.upsert({
    where: { name: "Distribution Center" },
    update: {},
    create: {
      name: "Distribution Center",
      address: "456 Logistics Way, New York",
    },
  });

  // 3. Create Locations
  const locations = [
    { name: "Rack A1", type: "RACK", warehouseId: mainWarehouse.id },
    { name: "Rack B2", type: "RACK", warehouseId: mainWarehouse.id },
    { name: "Staging Area", type: "STAGING", warehouseId: mainWarehouse.id },
    { name: "Cold Storage", type: "WAREHOUSE", warehouseId: mainWarehouse.id },
    { name: "Bulk Storage", type: "WAREHOUSE", warehouseId: secondaryWarehouse.id },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { warehouseId_name: { warehouseId: loc.warehouseId, name: loc.name } },
      update: {},
      create: loc as any,
    });
  }

  const allLocations = await prisma.location.findMany();
  const rackA1 = allLocations.find(l => l.name === "Rack A1")!;
  const staging = allLocations.find(l => l.name === "Staging Area")!;

  // 4. Create Products
  const products = [
    { name: "Steel Rods", sku: "SR-100", category: "Construction", reorderLevel: 50 },
    { name: "Aluminum Sheets", sku: "AL-200", category: "Construction", reorderLevel: 20 },
    { name: "Office Chair", sku: "OC-400", category: "Furniture", reorderLevel: 10 },
    { name: "Desk Lamp", sku: "DL-500", category: "Office Supplies", reorderLevel: 5 },
    { name: "Monitor Arm", sku: "MA-600", category: "Electronics", reorderLevel: 15 },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  const allProducts = await prisma.product.findMany();
  const steelRods = allProducts.find(p => p.sku === "SR-100")!;
  const chair = allProducts.find(p => p.sku === "OC-400")!;

  // 5. Create Initial Stock (StockQuants)
  await prisma.stockQuant.upsert({
    where: { productId_locationId: { productId: steelRods.id, locationId: rackA1.id } },
    update: { quantity: 150 },
    create: {
      productId: steelRods.id,
      locationId: rackA1.id,
      quantity: 150,
    },
  });

  await prisma.stockQuant.upsert({
    where: { productId_locationId: { productId: chair.id, locationId: staging.id } },
    update: { quantity: 5 },
    create: {
      productId: chair.id,
      locationId: staging.id,
      quantity: 5, // Below reorder level (10)
    },
  });

  // 6. Create some sample operations (Documents)
  await prisma.document.create({
    data: {
      type: "RECEIPT",
      status: "VALIDATED",
      reference: "REC-2024-001",
      supplier: "Global Steel Co.",
      userId: admin.id,
      validatedAt: new Date(),
      lines: {
        create: [
          { productId: steelRods.id, quantity: 100, destLocationId: rackA1.id }
        ]
      }
    }
  });

  await prisma.document.create({
    data: {
      type: "DELIVERY",
      status: "DRAFT",
      reference: "DEL-2024-001",
      customer: "Build It Ltd",
      userId: admin.id,
      lines: {
        create: [
          { productId: steelRods.id, quantity: 20, sourceLocationId: rackA1.id }
        ]
      }
    }
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
