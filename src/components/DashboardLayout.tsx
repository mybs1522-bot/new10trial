import { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, MessageSquare, Award, Briefcase,
  GraduationCap, Home, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Shield, PlayCircle, UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home, end: true },
  { to: "/dashboard/start", label: "Start Course", icon: PlayCircle },
  { to: "/dashboard/courses", label: "My Courses", icon: GraduationCap },
  { to: "/dashboard/books", label: "Books", icon: BookOpen },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/certificates", label: "Certificates", icon: Award },
  { to: "/dashboard/freelance", label: "Freelance", icon: Briefcase },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, isAdmin, profile } = useAuth();

  const filteredNavItems = useMemo(() => {
    if (profile?.has_paid) {
      return navItems.filter(item => item.to !== "/dashboard" && item.to !== "/dashboard/start");
    }
    return navItems;
  }, [profile?.has_paid]);

  // Force scroll to top on mount (after login)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (document.getElementById("tawk-script")) return;
    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/699724d2698c3c1c3a3a142a/1jhr6fmh0";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or(`receiver_id.eq.${user.id},is_broadcast.eq.true`)
        .is("read_at", null);
      setUnreadCount(count || 0);
    };
    fetchUnread();
  }, []);

  const activeLink = "bg-accent/10 text-accent";
  const inactiveLink = "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile mini sidebar — always visible, icon-only */}
      <aside className="fixed left-0 top-0 h-full z-40 w-14 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden">
        {/* Logo */}
        <div className="flex items-center justify-center h-14 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-accent flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">ID</span>
          </div>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center justify-center w-full h-10 rounded-xl transition-all duration-200 relative",
                isActive ? activeLink : inactiveLink
              )}
              title={item.label}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label === "Messages" && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[8px] font-bold bg-accent text-white rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className="flex items-center justify-center w-full h-10 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all mt-1"
              title="Admin Panel"
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
            </NavLink>
          )}
        </nav>

        {/* Footer icons */}
        <div className="p-1.5 border-t border-sidebar-border space-y-0.5">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => cn(
              "flex items-center justify-center w-full h-10 rounded-xl transition-all duration-200",
              isActive ? activeLink : inactiveLink
            )}
            title="My Profile"
          >
            <UserCircle className="h-4 w-4" />
          </NavLink>
          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center justify-center h-10 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all"
            title={dark ? "Light Mode" : "Dark Mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 hidden md:flex",
        collapsed ? "w-16" : "w-56"
      )}>
        {/* Logo */}
        <div className={cn("flex items-center gap-3 p-4 border-b border-sidebar-border h-14", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-lg bg-accent flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">ID</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-sidebar-foreground leading-tight tracking-tight truncate">Design & AI</p>
              <p className="text-[9px] font-medium text-muted-foreground truncate">Courses & Books</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200",
                isActive ? activeLink : inactiveLink,
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">
                  {item.label}
                  {item.label === "Messages" && unreadCount > 0 && (
                    <span className="ml-2 text-[10px] bg-accent text-white rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
                  )}
                </span>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 mt-2",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Admin Panel" : undefined}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2.5 border-t border-sidebar-border space-y-0.5">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200",
              isActive ? activeLink : "text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center"
            )}
            title={collapsed ? "My Profile" : undefined}
          >
            <UserCircle className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>My Profile</span>}
          </NavLink>
          <button
            onClick={() => setDark(!dark)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all",
              collapsed && "justify-center"
            )}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button
            onClick={signOut}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        "ml-14 md:ml-0",
        collapsed ? "md:ml-16" : "md:ml-56"
      )}>
        {children}
      </main>

    </div>
  );
}
