import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChoreBoard } from "@/components/chore-board";

export const dynamic = "force-dynamic";

const zones = [
  ["A", "Kitchen + Dishes", "Counters, dishes, sink, table, quick kitchen sweep.", "#EAB528", ["Clear counters + kitchen table", "Load or unload dishwasher", "Wash or soak large pans", "Wipe counters, stove, sink", "Sweep kitchen floor", "Check kitchen trash"]],
  ["B", "Main Floor Reset", "Family room, gathering/dining space, entry/drop zone.", "#4B8E68", ["Reset seating and pillows", "Clear dining/gathering table", "Return shoes, bags, toys, books", "Wipe visible surfaces", "Straighten entry/drop zone", "Final walk-through"]],
  ["C", "Floors + Stairs", "High-traffic floors, stairs, halls, spot mop as needed.", "#3975B5", ["Sweep/vacuum traffic areas", "Vacuum stairs or rugs", "Spot mop sticky spots", "Return misplaced items", "Check halls on all 3 floors", "Put tools away"]],
  ["D", "Bathrooms + Trash", "Sinks, mirrors, bathroom trash, restock supplies.", "#EF6546", ["Wipe sinks and counters", "Clean mirrors and spots", "Restock TP and soap", "Empty bathroom trash", "Toilet/tub check as assigned", "Straighten towels/supplies"]],
  ["E", "Laundry + Plants", "One laundry move, towels, plants, small organizing task.", "#725FAE", ["Move one laundry load", "Fold/sort assigned laundry", "Return laundry baskets", "Water plants", "Organize one shelf/cabinet", "Help Mom 10 minutes"]],
] as const;
const people = ["Makaela", "Mykael", "Madisen", "Mia", "Myles"];
const isoDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

async function ensureCrew(date: string) {
  for (let i = 0; i < zones.length; i++) {
    const [code, name, description, color, taskList] = zones[i];
    await prisma.choreZone.upsert({ where: { code }, update: {}, create: { code, name, description, color, tasks: { create: taskList.map((title, position) => ({ title, position })) } } });
  }
  for (const [i, name] of people.entries()) await prisma.crewMember.upsert({ where: { name }, update: {}, create: { name, color: zones[i]?.[3] || "#3B82C4" } });
  const [allMembers, allZones] = await Promise.all([prisma.crewMember.findMany({ orderBy: { name: "asc" } }), prisma.choreZone.findMany({ orderBy: { code: "asc" } })]);
  const day = new Date(`${date}T12:00:00`).getDay();
  for (const [i, member] of allMembers.entries()) await prisma.choreAssignment.upsert({ where: { date_memberId: { date, memberId: member.id } }, update: {}, create: { date, memberId: member.id, zoneId: allZones[(i + day + 6) % allZones.length].id } });
}

export default async function Home({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const date = isoDate(); await ensureCrew(date);
  const { member: selectedId } = await searchParams;
  const members = await prisma.crewMember.findMany({ orderBy: { name: "asc" } });
  const activeMember = members.find(m => m.id === selectedId) || members[0];
  const assignment = await prisma.choreAssignment.findUnique({ where: { date_memberId: { date, memberId: activeMember.id } }, include: { zone: { include: { tasks: { orderBy: { position: "asc" } } } }, completions: true } });
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" }).format(new Date());
  return <main className="min-h-screen bg-[#f8f5ed] text-[#183f40]"><header className="mx-auto max-w-5xl px-4 pt-4 sm:px-6"><div className="rounded-[28px] bg-[#145353] px-5 py-5 text-white shadow-sm sm:px-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold tracking-[.2em] text-[#f5be22]">MJ CREW</p><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Home Reset</h1></div><Link className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold" href="/admin">Admin</Link></div><p className="mt-3 text-sm text-white/75">Everyone owns their space, serves their zone, and gets checked off.</p></div></header><section className="mx-auto max-w-5xl px-4 py-6 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-[#607070]">{dayName}</p><h2 className="text-2xl font-black">Who is checking in?</h2></div><div className="flex flex-wrap gap-2">{members.map(m => <Link key={m.id} href={`/?member=${m.id}`} className={`rounded-full px-4 py-2 text-sm font-bold ${m.id === activeMember.id ? "bg-[#145353] text-white" : "bg-white text-[#355] ring-1 ring-[#d9dfda]"}`}>{m.name}</Link>)}</div></div><ChoreBoard member={activeMember} assignment={assignment!} /></section></main>;
}
