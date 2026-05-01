import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />
        
        {children}
      </main>
    </div>
  );
}
