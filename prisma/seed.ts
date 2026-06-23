import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus, PickupDay } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.activity.deleteMany(); await prisma.order.deleteMany();
  await prisma.order.create({ data: { firstName: "Mireille", lastName: "Joseph", phone: "973-555-0147", dinners: 2, empanadaBeef: 2, lemonadeClassic: 1, pickupDay: PickupDay.THURSDAY, paymentMethod: PaymentMethod.ZELLE, paymentStatus: PaymentStatus.PAID, status: OrderStatus.CONFIRMED, totalCents: 4300, activities: { create: [{ message: "Order received" }, { message: "Payment marked paid" }] } } });
  await prisma.order.create({ data: { firstName: "Jean", lastName: "Pierre", phone: "973-555-0192", dinners: 1, empanadaGriot: 1, lemonadeFlavored: 2, pickupDay: PickupDay.FRIDAY, paymentMethod: PaymentMethod.CASH_AT_PICKUP, paymentStatus: PaymentStatus.CASH_AT_PICKUP, status: OrderStatus.NEW, totalCents: 2800, activities: { create: { message: "Order received" } } } });
}
main().finally(() => prisma.$disconnect());
