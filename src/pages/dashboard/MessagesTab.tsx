import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_broadcast: boolean;
  read_at: string | null;
  created_at: string;
}

export default function MessagesTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`receiver_id.eq.${user.id},is_broadcast.eq.true,sender_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
    // Mark as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("read_at", null);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!reply.trim() || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      content: reply.trim(),
      is_broadcast: false,
    });
    setReply("");
    setSending(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto flex flex-col h-screen">
        <div className="mb-4 sm:mb-8 flex-shrink-0">
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Support & Updates</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">Direct communication with your program lead and team.</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Your admin will send updates and announcements here.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm border-t",
                    isOwn
                      ? "bg-accent text-white border-accent/20 rounded-tr-sm"
                      : "premium-card border-white/5 rounded-tl-sm"
                  )}>
                    {!isOwn && msg.is_broadcast && (
                      <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-accent animate-ping" />
                        Broadcast
                      </p>
                    )}
                    <p className="text-[13px] font-medium leading-relaxed tracking-tight">{msg.content}</p>
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest mt-2",
                      isOwn ? "text-white/60" : "text-muted-foreground/60"
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {msg.read_at && isOwn && <span className="ml-2 text-white/40">· READ</span>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div className="flex-shrink-0 pt-4 border-t border-border/40">
          <div className="flex gap-3">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 h-14 rounded-2xl bg-muted/20 border-t border-white/5 font-medium text-sm px-6"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!reply.trim() || sending}
              className="btn-gold h-14 w-14 rounded-2xl flex items-center justify-center disabled:opacity-50 flex-shrink-0 shadow-gold"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
