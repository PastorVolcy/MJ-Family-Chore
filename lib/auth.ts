import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const KEY = "lakay-admin";
export async function isAdmin() { return (await cookies()).get(KEY)?.value === process.env.SESSION_SECRET; }
export async function requireAdmin() { if (!(await isAdmin())) redirect("/admin/login"); }
export async function login(pin: string) { if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) return false; (await cookies()).set(KEY, process.env.SESSION_SECRET || "local-admin", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 }); return true; }
export async function logout() { (await cookies()).delete(KEY); }
