"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Mic, Paperclip, MoreVertical, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

export default function Coach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! 💪 I'm your AI Fitness Coach. Ask me anything about workouts, nutrition, form, or recovery — I'm here to help you crush your goals!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Append user message
    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send full conversation history to maintain context via backend API
      const { data } = await api.post('/coach', {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message || "Sorry, I couldn't process that. Try again!" }
      ]);
    } catch (err) {
      console.error("Coach Chat Error:", err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having a quick breather 😅 Check your connection and try again!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-2 md:px-0">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 relative">
            <Bot className="text-primary w-5 h-5 md:w-6 md:h-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">AI Fitness Coach</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Online & Analyzing
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-white/5 transition-colors text-muted-foreground">
            <Maximize2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </button>
          <button className="p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-white/5 transition-colors text-muted-foreground">
            <MoreVertical className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 glass rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 p-4 md:p-6 overflow-y-auto mb-4 md:mb-6 space-y-4 md:space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse text-right" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border border-white/10"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <div className={cn(
                "p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'user'
                  ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                  : "bg-white/5 border border-white/5 text-foreground rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-muted border border-white/10">
                <Bot className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                <Loader2 className="animate-spin text-primary w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="glass p-2 rounded-3xl border border-white/10 focus-within:border-primary/50 transition-all flex items-center gap-2">
          <button className="p-3 text-muted-foreground hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask your coach anything about fitness..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none disabled:opacity-50"
          />
          <div className="flex items-center gap-1 pr-2">
            <button className="p-3 text-muted-foreground hover:text-primary transition-colors">
              <Mic size={20} />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(245, 158, 11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            "Best protein sources",
            "How to fix squat form",
            "Am I overtraining?",
            "Best chest exercises",
            "How to lose fat fast"
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isLoading) {
                  setInput(action);
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20 whitespace-nowrap transition-all disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}