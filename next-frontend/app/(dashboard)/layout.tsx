import BottomNav from "@/app/components/ui/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="p-6">
      {children}
      <BottomNav />
    </main>
  );
}
