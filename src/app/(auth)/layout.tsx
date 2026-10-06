import Link from "next/link";
import { PrismaLogo } from "@/components/layout/PrismaLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center justify-center">
            <PrismaLogo height={48} />
          </Link>
          <div className="rounded-xl border border-line bg-surface p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
