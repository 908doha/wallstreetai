export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-[390px] min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
