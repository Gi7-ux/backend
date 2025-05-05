
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Briefcase, 
  Clock,
  MessageSquare, 
  Users,
  Settings,
  FileText
} from "lucide-react";
import { Logo } from "./Logo";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return null;

  // Define navigation based on user role
  const navItems = (() => {
    const items = [
      { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> }
    ];

    if (currentUser.role === "admin") {
      items.push(
        { to: "/jobs", label: "Jobs", icon: <Briefcase size={18} /> },
        { to: "/users", label: "Users", icon: <Users size={18} /> },
        { to: "/reports", label: "Reports", icon: <FileText size={18} /> },
        { to: "/messages", label: "Messages", icon: <MessageSquare size={18} /> },
        { to: "/settings", label: "Settings", icon: <Settings size={18} /> }
      );
    } else if (currentUser.role === "architect") {
      items.push(
        { to: "/jobs", label: "My Jobs", icon: <Briefcase size={18} /> },
        { to: "/time-tracking", label: "Time Tracking", icon: <Clock size={18} /> },
        { to: "/messages", label: "Messages", icon: <MessageSquare size={18} /> },
        { to: "/profile", label: "Profile", icon: <Settings size={18} /> }
      );
    } else if (currentUser.role === "client") {
      items.push(
        { to: "/jobs", label: "My Projects", icon: <Briefcase size={18} /> },
        { to: "/messages", label: "Messages", icon: <MessageSquare size={18} /> },
        { to: "/profile", label: "Profile", icon: <Settings size={18} /> }
      );
    }

    return items;
  })();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="mb-6 flex items-center justify-center p-6 group">
        <div className="flex items-center">
          <Logo size="md" animated={true} />
          <span className="ml-3 text-xl font-semibold text-sidebar-foreground">ArchiConnect</span>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          Navigation
        </p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={location.pathname === item.to}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-architect-medium flex items-center justify-center">
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="rounded-full w-8 h-8" 
              />
            ) : (
              <span className="text-sm font-medium text-white">
                {currentUser.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
