import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import { fullName } from '../../lib/format';
import { useToast } from '../../Context/ToastContext';

const QUICK_REPLIES = {
  captain: ['I’m on my way', 'I’ve arrived', 'Stuck in traffic, 5 min', 'Where exactly are you?'],
  user: ['I’m coming out', 'I’m at the pickup point', 'Please wait 2 minutes', 'Okay, thanks!'],
};

const timeOf = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

/** Button that opens the chat and shows an unread badge. */
export const ChatButton = ({ chat, className = 'btn-secondary' }) => (
  <button type="button" onClick={chat.openChat} className={`relative ${className}`}>
    <i className="ri-chat-3-line" /> Message
    {chat.unread > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
        {chat.unread}
      </span>
    )}
  </button>
);

/** Full-screen sheet on phones, a docked panel on desktop. */
const ChatSheet = ({ chat, role, other }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!chat.open) return undefined;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && chat.closeChat();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chat, chat.open, chat.messages.length]);

  if (!chat.open) return null;

  const submit = async (value) => {
    if (!value.trim() || sending) return;
    setSending(true);
    const error = await chat.send(value);
    setSending(false);
    if (error) toast.error(error);
    else setText('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[1500] flex justify-end bg-black/30 lg:items-end lg:p-6" onClick={chat.closeChat}>
      <section
        role="dialog"
        aria-label="Chat"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full animate-slide-up flex-col bg-white lg:h-[560px] lg:max-w-sm lg:rounded-2xl lg:shadow-2xl"
      >
        <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <Avatar person={other} size="h-10 w-10 text-sm" dark={role === 'user'} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold capitalize">{fullName(other)}</p>
            <p className="text-xs text-neutral-500">{role === 'user' ? 'Your driver' : 'Your rider'}</p>
          </div>
          <button type="button" onClick={chat.closeChat} aria-label="Close chat" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
            <i className="ri-close-line text-xl" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-neutral-50 px-4 py-4">
          {chat.messages.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-500">
              No messages yet. Say hi or use a quick reply below.
            </p>
          )}
          {chat.messages.map((m) => {
            const mine = m.from === role;
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? 'rounded-br-md bg-neutral-900 text-white' : 'rounded-bl-md bg-white text-neutral-900 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${mine ? 'text-neutral-400' : 'text-neutral-500'}`}>{timeOf(m.at)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-neutral-200 px-3 py-2">
          {QUICK_REPLIES[role].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => submit(q)}
              disabled={sending}
              className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-2 px-3 pb-3 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <input
            ref={inputRef}
            className="input py-2.5"
            placeholder="Type a message"
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Message"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!text.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-40"
          >
            <i className="ri-send-plane-2-fill" />
          </button>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default ChatSheet;
