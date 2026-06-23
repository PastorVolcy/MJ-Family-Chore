"use server";
import { OrderStatus, PaymentStatus, PickupDay } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { totalCents } from "@/lib/orders";
import { orderSchema } from "@/lib/validation";
import { login, logout, requireAdmin } from "@/lib/auth";

export async function createOrder(formData: FormData) {
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { acknowledge, email, notes, ...data } = parsed.data;
  const order = await prisma.order.create({ data: { ...data, email: email || null, notes: notes || null, totalCents: totalCents(data), paymentStatus: data.paymentMethod === "CASH_AT_PICKUP" ? PaymentStatus.CASH_AT_PICKUP : PaymentStatus.UNPAID, activities: { create: { message: "Order received" } } } });
  redirect(`/confirmation/${order.id}`);
}
export async function adminLogin(formData: FormData) { if (!(await login(String(formData.get("pin") || "")))) redirect("/admin/login?error=Invalid+PIN"); redirect("/admin"); }
export async function adminLogout() { await logout(); redirect("/admin/login"); }
export async function quickUpdate(id: string, field: "status" | "paymentStatus" | "pickupDay", value: string) { await requireAdmin(); const messages: Record<string, string> = { PAID: "Payment marked paid", UNPAID: "Payment marked unpaid", THURSDAY: "Pickup assigned Thursday", FRIDAY: "Pickup assigned Friday", CONFIRMED: "Order confirmed", READY: "Order marked ready", PICKED_UP: "Order marked picked up", CANCELLED: "Order cancelled" }; await prisma.order.update({ where: { id }, data: { [field]: value, activities: { create: { message: messages[value] || `Updated ${field}` } } } as any }); revalidatePath("/admin"); revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/production"); }
export async function updateOrder(id: string, formData: FormData) { await requireAdmin(); const quantities = { dinners: Number(formData.get("dinners")), empanadaGriot: Number(formData.get("empanadaGriot")), empanadaBeef: Number(formData.get("empanadaBeef")), empanadaChicken: Number(formData.get("empanadaChicken")), lemonadeClassic: Number(formData.get("lemonadeClassic")), lemonadeFlavored: Number(formData.get("lemonadeFlavored")), lemonadeBottle: Number(formData.get("lemonadeBottle")) }; await prisma.order.update({ where: { id }, data: { ...quantities, pickupDay: String(formData.get("pickupDay")) as PickupDay, pickupWindow: String(formData.get("pickupWindow") || "") || null, paymentStatus: String(formData.get("paymentStatus")) as PaymentStatus, status: String(formData.get("status")) as OrderStatus, adminNotes: String(formData.get("adminNotes") || "") || null, totalCents: totalCents(quantities), activities: { create: { message: "Order details updated" } } } }); revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin"); revalidatePath("/admin/production"); }
export async function addAdminNote(id: string, formData: FormData) { await requireAdmin(); const note = String(formData.get("note") || "").trim(); if (note) await prisma.order.update({ where: { id }, data: { activities: { create: { message: `Admin note: ${note}` } } } }); revalidatePath(`/admin/orders/${id}`); }

const homePaths = () => { revalidatePath("/"); revalidatePath("/admin"); };
export async function toggleChore(assignmentId: string, field: "ownSpace" | "zoneDone", value: boolean) {
  await prisma.choreAssignment.update({ where: { id: assignmentId }, data: { [field]: value } }); homePaths();
}
export async function toggleTask(assignmentId: string, memberId: string, taskId: string, done: boolean) {
  await prisma.choreCompletion.upsert({ where: { assignmentId_taskId: { assignmentId, taskId } }, update: { done }, create: { assignmentId, memberId, taskId, done } }); homePaths();
}
export async function parentSignoff(assignmentId: string, value: boolean) { await requireAdmin(); await prisma.choreAssignment.update({ where: { id: assignmentId }, data: { parentOk: value } }); homePaths(); }
export async function addCrewMember(formData: FormData) { await requireAdmin(); const name = String(formData.get("name") || "").trim(); const color = String(formData.get("color") || "#3B82C4"); if (name) await prisma.crewMember.create({ data: { name, color } }); homePaths(); }
export async function addZoneTask(formData: FormData) { await requireAdmin(); const zoneId = String(formData.get("zoneId") || ""); const title = String(formData.get("title") || "").trim(); if (zoneId && title) { const count = await prisma.zoneTask.count({ where: { zoneId } }); await prisma.zoneTask.create({ data: { zoneId, title, position: count } }); } homePaths(); }
export async function assignZone(formData: FormData) { await requireAdmin(); const memberId = String(formData.get("memberId")); const zoneId = String(formData.get("zoneId")); const date = String(formData.get("date")); if (memberId && zoneId && date) await prisma.choreAssignment.upsert({ where: { date_memberId: { date, memberId } }, update: { zoneId, ownSpace: false, zoneDone: false, parentOk: false }, create: { date, memberId, zoneId } }); homePaths(); }
