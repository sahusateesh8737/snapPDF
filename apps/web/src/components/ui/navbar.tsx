import Link from 'next/link';
import { Button } from './button';
import { FileText, User, LogOut } from 'lucide-react';
import { auth, signOut } from "@/auth";
import { handleSignOut } from '@/app/actions';

export const Navbar = async () => {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              {/* <div className="w-8 h-8 flex items-center justify-center text-brand-600">
                <FileText size={28} />
              </div> */}
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-brand-500 transition-colors">
                snapPDF
              </span>
            </Link>

            <nav className="hidden md:flex gap-8">
                <Link href="/merge-pdf" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Merge PDF</Link>
                <Link href="/split-pdf" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Split PDF</Link>
                <Link href="/compress-pdf" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Compress PDF</Link>
                <Link href="/tools" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">All PDF Tools</Link>
            </nav>
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                {session.user.image ? (
                   <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-zinc-700" />
                ) : (
                   <User size={20} />
                )}
                <span className="text-sm font-medium hidden sm:block">{session.user.name?.split(' ')[0]}</span>
              </div>
              <form action={handleSignOut}>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-zinc-800" type="submit">
                  <LogOut size={18} />
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white hidden sm:block">Log In</Link>
              <Link href="/login">
                <Button size="sm" className="bg-white hover:bg-slate-200 text-black font-semibold shadow-none rounded-lg transition-colors duration-300">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
