'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, MessageCircle, Bot, Send, X, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

type Recommendation = {
  itemId: string;
  itemName: string;
  score?: number;
  image?: string | null;
  price?: number | null;
  slug?: string | null;
};

type ChatMessage = {
  id: string;
  author: 'bot' | 'user';
  content: string;
  recommendations?: Recommendation[];
};

const zaloUrl = 'https://zalo.me/19001234';
const facebookUrl = 'https://www.facebook.com/profile.php?id=61569785816152';

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`;
};

const FloatingSupportButtons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId] = useState<string>(() => createSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init',
      author: 'bot',
      content: 'Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm hoặc đơn hàng?',
    },
  ]);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'liked' | 'disliked'>>({});

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'user',
      content: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: value,
          userId: user?.id,
          sessionId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fallback =
          typeof data?.message === 'string'
            ? data.message
            : 'Chatbot hiện chưa phản hồi được yêu cầu này. Bạn có thể thử lại sau nhé.';
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now() + 1}`,
            author: 'bot',
            content: fallback,
          },
        ]);
        return;
      }

      const recommendations: Recommendation[] | undefined = Array.isArray(data?.recommendations)
        ? data.recommendations
            .map((item: any) => ({
              itemId: String(item.product_id ?? item.item_id ?? item.itemId ?? ''),
              itemName: String(item.item_name ?? item.itemName ?? ''),
              score: typeof item.score === 'number' ? item.score : undefined,
              image: item.image ?? null,
              price:
                typeof item.price === 'number'
                  ? item.price
                  : typeof item.price === 'string'
                    ? Number(item.price.replace(/[^0-9.-]/g, ''))
                    : null,
              slug: item.slug ?? null,
            }))
            .filter((item: Recommendation) => item.itemId && item.itemName)
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now() + 1}`,
          author: 'bot',
          content:
            typeof data?.reply === 'string'
              ? data.reply
              : 'Mình đang ghi nhận yêu cầu của bạn. Vui lòng thử lại trong giây lát nhé.',
          recommendations,
        },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now() + 1}`,
          author: 'bot',
          content: 'Không thể kết nối tới chatbot. Vui lòng thử lại sau ít phút.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickHints = useMemo(
    () => [
      { label: 'Thời gian giao hàng', hint: 'Thời gian giao hàng bao lâu?' },
      { label: 'Phương thức thanh toán', hint: 'Thanh toán có những hình thức nào?' },
      { label: 'Bảo hành', hint: 'Sản phẩm có bảo hành không?' },
      { label: 'Gợi ý sản phẩm', hint: 'Gợi ý sản phẩm phù hợp giúp tôi nhé!' },
    ],
    [],
  );

  const applyHint = (hint: string) => {
    setInput(hint);
    setChatOpen(true);
  };

  const handleFeedback = async (
    recommendation: Recommendation,
    reaction: 'liked' | 'disliked',
  ) => {
    const key = `${recommendation.itemId}`;
    setFeedbackState((prev) => ({ ...prev, [key]: reaction }));

    try {
      await fetch('/api/chatbot/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          sessionId,
          productId: recommendation.itemId,
          reaction,
        }),
      });

      toast({
        title: reaction === 'liked' ? 'Đã ghi nhận quan tâm' : 'Đã ghi nhận phản hồi',
        description:
          reaction === 'liked'
            ? 'Cảm ơn bạn! Chúng tôi sẽ ưu tiên các gợi ý tương tự.'
            : 'Cảm ơn phản hồi! Chúng tôi sẽ điều chỉnh gợi ý phù hợp hơn.',
      });
    } catch (error) {
      console.error('Feedback error:', error);
      toast({
        title: 'Không thể ghi nhận phản hồi',
        description: 'Vui lòng thử lại trong giây lát.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price?: number | null) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return undefined;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
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
            <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1 text-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.author === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'inline-block max-w-full whitespace-pre-line rounded-2xl px-3 py-2 leading-relaxed shadow-sm',
                      message.author === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 text-slate-700',
                    )}
                  >
                    <p>{message.content}</p>
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Gợi ý dành cho bạn
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {message.recommendations.map((item: Recommendation) => {
                            const detailHref = item.slug
                              ? `/products/${item.slug}`
                              : `/products/${item.itemId}`;
                            const feedback = feedbackState[item.itemId];
                            const priceLabel = formatPrice(item.price);

                            return (
                              <div
                                key={`${message.id}-${item.itemId}`}
                                className="w-52 flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm"
                              >
                                <div className="relative mb-2 h-28 w-full overflow-hidden rounded-xl bg-slate-100">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.itemName}
                                      fill
                                      className="object-cover"
                                      sizes="208px"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                      Không có ảnh
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="line-clamp-2 text-sm font-semibold">
                                    {item.itemName}
                                  </div>
                                  {priceLabel && (
                                    <div className="text-sm font-medium text-primary">{priceLabel}</div>
                                  )}
                                  {typeof item.score === 'number' && (
                                    <div className="text-xs text-slate-400">
                                      Điểm gợi ý: {item.score.toFixed(3)}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={feedback === 'liked' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => handleFeedback(item, 'liked')}
                                    disabled={isLoading}
                                  >
                                    <ThumbsUp className="mr-1 h-3 w-3" />
                                    {feedback === 'liked' ? 'Đã thích' : 'Hứng thú'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={feedback === 'disliked' ? 'destructive' : 'outline'}
                                    className="flex-1"
                                    onClick={() => handleFeedback(item, 'disliked')}
                                    disabled={isLoading}
                                  >
                                    <ThumbsDown className="mr-1 h-3 w-3" />
                                    {feedback === 'disliked' ? 'Đã ẩn' : 'Không'}
                                  </Button>
                                </div>
                                <Link
                                  href={detailHref}
                                  className="mt-2 block text-center text-xs font-medium text-primary hover:underline"
                                >
                                  Xem chi tiết
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Chatbot đang phản hồi...</span>
                  </div>
                </div>
              )}
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
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-9 w-9" aria-label="Gửi" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
