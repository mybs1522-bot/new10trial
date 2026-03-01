import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/LoginForm";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

export function Navbar({ onJoinClick }: { onJoinClick?: () => void } = {}) {
  const { user, signOut, isAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDashboard = () => {
    if (isAdmin) navigate("/admin");
    else navigate("/dashboard");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 sm:h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a href="#curriculum" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Courses</a>
            <a href="#books" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Books</a>
            <a href="#enroll" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => { e.preventDefault(); onJoinClick?.(); }}>Enroll</a>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleDashboard} className="rounded-full text-[13px] font-medium">
                  Dashboard
                </Button>
                <Button size="sm" variant="outline" onClick={signOut} className="rounded-full border-border/50 text-[13px]">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)} className="rounded-full text-[13px] font-medium">
                  Login
                </Button>
                <Button
                  size="sm"
                  className="rounded-full btn-primary border-0 font-semibold px-5 text-[12px] flex items-center gap-1.5 shadow-green"
                  onClick={() => onJoinClick?.()}
                >
                  Join Now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/30 bg-white">
            <div className="container px-4 py-4 flex flex-col gap-1">
              <a href="#curriculum" className="text-[14px] font-medium py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>Courses</a>
              <a href="#books" className="text-[14px] font-medium py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>Books</a>
              <a href="#enroll" className="text-[14px] font-medium py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={() => { onJoinClick?.(); setMobileOpen(false); }}>Enroll</a>
              <hr className="border-border/20 my-2" />
              {user ? (
                <Button onClick={handleDashboard} className="rounded-full btn-primary border-0 h-12 text-[13px] font-semibold">Dashboard</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setLoginOpen(true); setMobileOpen(false); }} className="rounded-full h-12 text-[13px] font-medium border-border/40">Login</Button>
                  <Button className="rounded-full btn-primary border-0 h-12 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-green" onClick={() => { onJoinClick?.(); setMobileOpen(false); }}>
                    Join Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl mx-4 border-border/40 shadow-lift bg-white p-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-display font-bold">Welcome Back</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue your learning journey</p>
            </DialogHeader>
            <LoginForm onClose={() => setLoginOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
