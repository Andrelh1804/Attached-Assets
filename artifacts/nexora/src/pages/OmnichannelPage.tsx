import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Mail, Phone, Hash } from "lucide-react";
import { useGetConversations, useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const CHANNEL_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  whatsapp: { icon: MessageSquare, color: "#25D366", label: "WhatsApp" },
  email: { icon: Mail, color: "#2563EB", label: "E-mail" },
  phone: { icon: Phone, color: "#8B5CF6", label: "Telefone" },
  chat: { icon: Hash, color: "#06B6D4", label: "Chat" },
};

export default function OmnichannelPage() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [channelFilter, setChannelFilter] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const { data: conversations } = useGetConversations({ channel: channelFilter || undefined });
  const { data: messages } = useGetMessages(selectedConvId ?? 0, { query: { enabled: !!selectedConvId } });
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();

  const selectedConv = conversations?.find(c => c.id === selectedConvId);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    const content = messageInput;
    setMessageInput("");
    sendMessage.mutate({ id: selectedConvId, data: { content } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedConvId) })
    });
  };

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Omnicanal</h1>
        <p className="text-slate-500 text-sm">Central unificada de atendimento</p>
      </div>

      {/* Channel filters */}
      <div className="flex items-center gap-2">
        <button onClick={() => setChannelFilter("")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: !channelFilter ? "rgba(37,99,235,0.2)" : "hsl(217 33% 20%)", color: !channelFilter ? "#60a5fa" : "#94a3b8", border: `1px solid ${!channelFilter ? "rgba(37,99,235,0.4)" : "hsl(217 33% 26%)"}` }}>
          Todos
        </button>
        {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
          <button key={k} onClick={() => setChannelFilter(k)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: channelFilter === k ? `${v.color}20` : "hsl(217 33% 20%)", color: channelFilter === k ? v.color : "#94a3b8", border: `1px solid ${channelFilter === k ? `${v.color}40` : "hsl(217 33% 26%)"}` }}>
            <v.icon size={11} /> {v.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Conversations List */}
        <div className="nexora-card overflow-hidden flex flex-col">
          <div className="p-3 border-b" style={{ borderColor: "hsl(217 33% 22%)" }}>
            <p className="text-slate-300 text-sm font-medium">{conversations?.length ?? 0} conversas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {(conversations ?? []).map(conv => {
              const ch = CHANNEL_CONFIG[conv.channel] ?? CHANNEL_CONFIG.chat;
              const initials = conv.customerName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <motion.div key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className="p-4 cursor-pointer transition-colors border-b flex items-start gap-3"
                  style={{ borderColor: "hsl(217 33% 18%)", background: selectedConvId === conv.id ? "rgba(37,99,235,0.1)" : "transparent" }}
                  whileHover={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: ch.color + "80" }}>{initials}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-slate-900" style={{ background: ch.color }}>
                      <ch.icon size={8} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-medium truncate">{conv.customerName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#2563EB" }}>{conv.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{conv.lastMessage}</p>
                    <p className="text-slate-700 text-xs mt-0.5">{new Date(conv.lastMessageAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </motion.div>
              );
            })}
            {(conversations ?? []).length === 0 && <p className="p-6 text-slate-600 text-sm text-center">Sem conversas</p>}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 nexora-card flex flex-col min-h-0">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "hsl(217 33% 22%)" }}>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {selectedConv.customerName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{selectedConv.customerName}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: CHANNEL_CONFIG[selectedConv.channel]?.color ?? "#06B6D4" }}>
                    {(() => { const Ch = CHANNEL_CONFIG[selectedConv.channel]?.icon ?? MessageSquare; return <Ch size={10} />; })()}
                    {CHANNEL_CONFIG[selectedConv.channel]?.label ?? selectedConv.channel}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-0.5 rounded text-xs" style={{ background: selectedConv.status === "open" ? "rgba(37,99,235,0.2)" : "rgba(16,185,129,0.2)", color: selectedConv.status === "open" ? "#60a5fa" : "#34d399" }}>
                    {selectedConv.status === "open" ? "Aberto" : "Resolvido"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {(messages ?? []).map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-xs px-3 py-2 rounded-xl text-sm"
                        style={msg.direction === "outbound"
                          ? { background: "rgba(37,99,235,0.6)", color: "white", borderRadius: "12px 12px 2px 12px" }
                          : { background: "hsl(217 33% 21%)", color: "#e2e8f0", borderRadius: "12px 12px 12px 2px" }}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(messages ?? []).length === 0 && (
                  <p className="text-center text-slate-600 text-sm py-8">Sem mensagens nesta conversa</p>
                )}
              </div>

              {/* Send Bar */}
              <div className="p-4 border-t" style={{ borderColor: "hsl(217 33% 22%)" }}>
                <div className="flex items-center gap-3">
                  <input value={messageInput} onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Digite sua resposta..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                    style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
                  <button onClick={handleSend} disabled={!messageInput.trim() || sendMessage.isPending}
                    className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-all"
                    style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Selecione uma conversa para comecar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
