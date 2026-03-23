export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <div className="mx-auto max-w-[390px] min-h-screen relative">
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
