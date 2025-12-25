import { Link, useLocation } from "wouter";
import { LayoutDashboard, LineChart, Calendar } from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";

export function Navigation() {
  const [location] = useLocation();
  const today = format(new Date(), "yyyy-MM-dd");

  const isActive = (path: string) => {
    if (path === `/day/${today}` && location.startsWith('/day/')) return true;
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-border/60 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        <NavLink 
          href={`/day/${today}`} 
          active={location.startsWith('/day/')} 
          icon={<LayoutDashboard size={24} />} 
          label="Today" 
        />
        <NavLink 
          href="/trends" 
          active={location === '/trends'} 
          icon={<LineChart size={24} />} 
          label="Trends" 
        />
      </div>
    </nav>
  );
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className={clsx(
      "flex flex-col items-center justify-center w-full h-full transition-all duration-200",
      active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
    )}>
      <div className={clsx(
        "p-1 rounded-xl transition-colors",
        active && "bg-primary/10"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </Link>
  );
}
