import Link from "next/link";
import { Home, LogOut, Settings } from "lucide-react";
import { adminLogout } from "@/app/actions";
export function AdminNav() { return <aside className="admin-sidebar print:hidden"><Link className="brand-lockup" href="/admin"><span className="brand-mark">MJ</span><span><strong>MJ Family Chore</strong><small>Daily home reset</small></span></Link><nav className="admin-links"><Link href="/admin"><Settings size={18}/>Admin dashboard</Link><Link href="/"><Home size={18}/>Family chore board</Link></nav><div className="mt-auto border-t border-white/10 pt-5"><form action={adminLogout}><button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><LogOut size={16}/>Sign out</button></form></div></aside>; }
