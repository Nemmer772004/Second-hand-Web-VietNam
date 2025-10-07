'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Facebook, MessageCircle, Bot, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChatMessage = {
  id: string;
  author: 'bot' | 'user';
  content: string;
};

const zaloUrl = 'https://zalo.me/19001234';
const facebookUrl = 'https://www.facebook.com/profile.php?id=61569785816152';

const BOT_PRESETS: Record<string, string> = {
  giao: 'Đơn hàng của bạn thường được giao trong 1-3 ngày làm việc tùy khu vực.',
  ship: 'Phí vận chuyển miễn phí với đơn từ 2 triệu. Đơn nhỏ hơn có phí 50.000đ.',
  bảo: 'Mọi sản phẩm đều được bảo hành tối thiểu 3 tháng. Chi tiết vui lòng cung cấp mã đơn.',
  order: 'Bạn có thể theo dõi đơn tại trang Tài khoản > Đơn hàng hoặc cung cấp mã đơn để được hỗ trợ nhanh.',
  thanh: 'Hệ thống hiện hỗ trợ thanh toán tiền mặt, chuyển khoản và COD. Chọn phương thức tại bước đặt hàng nhé!',
};

const getBotReply = (message: string): string => {
  const normalized = message.toLowerCase();
  for (const [keyword, reply] of Object.entries(BOT_PRESETS)) {
    if (normalized.includes(keyword)) {
      return reply;
    }
  }
  return 'Cảm ơn bạn! Nhân viên sẽ liên hệ trong ít phút. Bạn có thể để lại số điện thoại hoặc mô tả chi tiết hơn nhé.';
};

const FloatingSupportButtons = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init',
      author: 'bot',
      content: 'Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm hoặc đơn hàng?',
    },
  ]);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'user',
      content: value,
    };

    const botMessage: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      author: 'bot',
      content: getBotReply(value),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  const quickHints = useMemo(
    () => [
      { label: 'Thời gian giao hàng', hint: 'Thời gian giao hàng bao lâu?' },
      { label: 'Phương thức thanh toán', hint: 'Thanh toán có những hình thức nào?' },
      { label: 'Bảo hành', hint: 'Sản phẩm có bảo hành không?' },
    ],
    [],
  );

  const applyHint = (hint: string) => {
    setInput(hint);
    setChatOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {chatOpen && (
        <div className="mb-2 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Chatbot hỗ trợ</span>
            </div>
            <button onClick={toggleChat} className="rounded-full p-1 transition hover:bg-white/15" aria-label="Đóng chatbot">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 px-4 py-3">
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1 text-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.author === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block rounded-2xl px-3 py-2 leading-relaxed shadow-sm',
                      message.author === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {message.content}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {quickHints.map((hint) => (
                <button
                  key={hint.label}
                  type="button"
                  onClick={() => applyHint(hint.hint)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  {hint.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <Button type="submit" size="icon" className="h-9 w-9" aria-label="Gửi">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-2">
        <Link
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 rounded-full bg-[#0068FF] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-2px]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Zalo</span>
        </Link>
        <Link
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-2px]"
        >
          <Facebook className="h-4 w-4" />
          <span>Messenger</span>
        </Link>
        <button
          type="button"
          onClick={toggleChat}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:translate-y-[-2px]"
        >
          <Bot className="h-4 w-4" />
          <span>Chatbot</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingSupportButtons;
