import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api/client';
import type { ChatMessage } from '../api/types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const isClient = msg.role === 'user';
  return (
    <div className={`chat-row${isClient ? ' chat-row--client' : ''}`}>
      <div className={`chat-bubble${isClient ? ' chat-bubble--client' : ' chat-bubble--assistant'}`}>
        <p className="chat-bubble-text">{msg.content}</p>
        <p className="chat-bubble-time">{formatTime(msg.created_at)}</p>
      </div>
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getChatMessages()
      .then((res) => {
        if (!cancelled) setMessages(res.messages);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Не вдалося завантажити чат');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    setSendError(null);
    setSending(true);
    setMessages((prev) => [...(prev ?? []), { role: 'user', content: text, created_at: new Date().toISOString() }]);
    try {
      const res = await api.sendChatMessage(text);
      setMessages((prev) => [...(prev ?? []), { role: 'assistant', content: res.reply, created_at: new Date().toISOString() }]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Не вдалося надіслати повідомлення');
    } finally {
      setSending(false);
    }
  };

  if (loadError) {
    return (
      <div className="placeholder-block">
        <p className="placeholder-title">Не вдалося завантажити чат</p>
        <p className="placeholder-description">{loadError}</p>
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="screen-center">
        <span>Завантаження…</span>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <span className="chat-avatar">ЗВ</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="chat-header-name">Асистент Звільнимо</p>
          <p className="chat-header-status">
            <span className="chat-online-dot" aria-hidden="true" />
            онлайн · відповідає цілодобово
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="placeholder-block">
            <p className="placeholder-title">Запитайте що завгодно</p>
            <p className="placeholder-description">
              Про вашу справу, документи, оплату чи процедуру банкрутства загалом — відповімо в будь-яку годину.
            </p>
          </div>
        ) : (
          <>
            <p className="chat-date-pill">Сьогодні</p>
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
          </>
        )}
        {sending && (
          <div className="chat-row">
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-composer">
        {sendError && <p className="form-error" style={{ padding: '0 12px' }}>{sendError}</p>}
        <textarea
          className="chat-input"
          placeholder="Повідомлення…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        <button type="button" className="chat-send-btn" onClick={send} disabled={!draft.trim() || sending} aria-label="Надіслати">
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
