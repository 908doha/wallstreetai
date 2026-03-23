import { BottomNav } from "@/components/layout/BottomNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <div className="mx-auto max-w-[390px] min-h-screen relative">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
