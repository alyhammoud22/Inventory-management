import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // USERS
  await prisma.users.create({
    data: {
      userId: 1, // manually assigned
      name: "Ali Hammoud",
      email: "ali@example.com",
      password: "123456",
      role: "admin",
      createdAt: new Date("2024-01-01T10:00:00Z"), // custom creation date
      updatedAt: new Date("2024-01-02T10:00:00Z"), // custom last update
    },
  });
  console.log("✅ One user seeded successfully with manual ID");

  // PRODUCT UNITS
  const [grams, ml, piece] = await Promise.all([
    prisma.productUnit.create({ data: { name: "gr" } }),
    prisma.productUnit.create({ data: { name: "ml" } }),
    prisma.productUnit.create({ data: { name: "piece" } }),
  ]);

  // PRODUCT CATEGORIES AND SUBCATEGORIES
  const drinks = await prisma.productCategory.create({
    data: {
      name: "Drinks",
      subcategories: { create: [{ name: "Soda" }, { name: "Juice" }] },
    },
  });

  const chocolate = await prisma.productCategory.create({
    data: {
      name: "Chocolate",
      subcategories: { create: [{ name: "Snickers" }, { name: "Hershey's" }] },
    },
  });

  const biscuits = await prisma.productCategory.create({
    data: {
      name: "Biscuits",
      subcategories: { create: [{ name: "Digestive" }, { name: "Oreo" }] },
    },
  });

  // PRODUCTS
  const products = [
    {
      name: "Coca Cola 330ml",
      price: 1.2,
      stockQuantity: 120,
      barcode: "1234567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/cocacola.jpg",
    },
    {
      name: "Pepsi 500ml",
      price: 1.3,
      stockQuantity: 90,
      barcode: "2234567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/pepsi.jpg",
    },
    {
      name: "Orange Juice 1L",
      price: 2.5,
      stockQuantity: 40,
      barcode: "3234567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/juice.jpg",
    },
    {
      name: "Snickers Bar",
      price: 0.8,
      stockQuantity: 150,
      barcode: "4234567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/snickers.jpg",
    },
    {
      name: "Hershey’s Milk Chocolate",
      price: 1.5,
      stockQuantity: 100,
      barcode: "5234567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/hersheys.jpg",
    },
    {
      name: "KitKat 4 Finger",
      price: 1.2,
      stockQuantity: 80,
      barcode: "6234567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/kitkat.jpg",
    },
    {
      name: "Oreo Original",
      price: 1.0,
      stockQuantity: 200,
      barcode: "7234567890123",
      categoryId: biscuits.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/oreo.jpg",
    },
    {
      name: "Digestive Biscuits",
      price: 1.8,
      stockQuantity: 60,
      barcode: "8234567890123",
      categoryId: biscuits.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/digestive.jpg",
    },
    {
      name: "Sprite 500ml",
      price: 1.3,
      stockQuantity: 70,
      barcode: "9234567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/sprite.jpg",
    },
    {
      name: "Mountain Dew 330ml",
      price: 1.2,
      stockQuantity: 85,
      barcode: "1034567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/mountaindew.jpg",
    },
    {
      name: "Bounty Bar",
      price: 1.1,
      stockQuantity: 95,
      barcode: "1134567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/bounty.jpg",
    },
    {
      name: "Twix Bar",
      price: 1.0,
      stockQuantity: 130,
      barcode: "1234567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/twix.jpg",
    },
    {
      name: "Apple Juice 1L",
      price: 2.3,
      stockQuantity: 45,
      barcode: "1334567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/applejuice.jpg",
    },
    {
      name: "Fanta Orange 500ml",
      price: 1.4,
      stockQuantity: 100,
      barcode: "1434567890123",
      categoryId: drinks.categoryId,
      unitId: ml.unitId,
      imageUrl: "/uploads/fanta.jpg",
    },
    {
      name: "Milka Chocolate",
      price: 2.0,
      stockQuantity: 75,
      barcode: "1534567890123",
      categoryId: chocolate.categoryId,
      unitId: piece.unitId,
      imageUrl: "/uploads/milka.jpg",
    },
  ];

  await prisma.products.createMany({ data: products });
}

main()
  .then(() => console.log("✅ Database seeded successfully"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
