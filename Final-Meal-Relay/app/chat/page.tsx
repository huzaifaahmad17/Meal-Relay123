'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Pin,
  CheckCheck,
  ImageIcon,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardShell } from '@/components/dashboard-shell';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import {
  getMessagesForRoom,
  getRoomById,
  getRoomsForUser,
  getUserById,
  markRoomRead,
  sendMessage,
} from '@/lib/demo-store';
import { ChatRoom, DemoUser } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  return (
    <DashboardShell
      pageTitle="Messages"
      pageDescription="Real-time chat with NGOs, donors and volunteers."
    >
      <ChatBody />
    </DashboardShell>
  );
}

function ChatBody() {
  const { user } = useCurrentUser();
  const rooms = useDemoStore(() => (user ? getRoomsForUser(user.id) : []), []);
  const allRooms = useDemoStore(() => (user ? getRoomsForUser(user.id) : []), []);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Auto-select first room
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  // Mark read when switching
  useEffect(() => {
    if (activeRoomId) markRoomRead(activeRoomId);
  }, [activeRoomId]);

  if (!user) return null;

  const filteredRooms = allRooms.filter((r) =>
    search ? r.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-12rem)]">
      {/* Rooms list */}
      <Card className="border overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Conversations</h3>
            <Badge variant="outline" className="text-[10px]">
              {rooms.length}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-transparent"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredRooms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No conversations yet.
              </p>
            ) : (
              filteredRooms.map((r) => (
                <RoomTile
                  key={r.id}
                  room={r}
                  active={r.id === activeRoomId}
                  onClick={() => setActiveRoomId(r.id)}
                  currentUserId={user.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Message panel */}
      <Card className="border overflow-hidden flex flex-col">
        {activeRoomId ? (
          <ConversationPanel roomId={activeRoomId} currentUser={user} />
        ) : (
          <div className="flex-1 grid place-items-center text-center p-6">
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-bold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pick a thread on the left to start chatting.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function RoomTile({
  room,
  active,
  onClick,
  currentUserId,
}: {
  room: ChatRoom;
  active: boolean;
  onClick: () => void;
  currentUserId: string;
}) {
  // Find a representative participant (not the current user)
  const otherIds = room.participantIds.filter((id) => id !== currentUserId);
  const other = otherIds.length > 0 ? getUserById(otherIds[0]) : undefined;
  const last = room.lastMessage;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
        active ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-muted/60',
      )}
    >
      <div className="relative">
        {other ? (
          <div
            className={cn(
              'w-10 h-10 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold',
              other.avatarColor,
            )}
          >
            {other.initials}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted grid place-items-center">
            <MessageSquare className="w-4 h-4" />
          </div>
        )}
        {other?.online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-sm truncate">{room.name}</div>
          {last && (
            <div className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatTime(last.createdAt)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="text-xs text-muted-foreground truncate">
            {last?.senderName.split(' ')[0] || ''}: {last?.content || 'No messages yet'}
          </div>
          {room.unreadCount > 0 && (
            <Badge className="bg-emerald-600 text-white h-5 px-1.5 text-[10px] flex-shrink-0">
              {room.unreadCount}
            </Badge>
          )}
        </div>
      </div>
      {room.pinned && <Pin className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
    </button>
  );
}

function ConversationPanel({
  roomId,
  currentUser,
}: {
  roomId: string;
  currentUser: DemoUser;
}) {
  const room = useDemoStore(() => getRoomById(roomId), undefined as ChatRoom | undefined);
  const messages = useDemoStore(() => getMessagesForRoom(roomId), []);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const otherParticipants = useMemo(() => {
    if (!room) return [];
    return room.participantIds
      .filter((id) => id !== currentUser.id)
      .map((id) => getUserById(id))
      .filter((u): u is DemoUser => Boolean(u));
  }, [room, currentUser.id]);

  if (!room) {
    return null;
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(roomId, currentUser, draft);
    setDraft('');
    // Simulated reply from other party for demo realism
    setTimeout(() => {
      const replier = otherParticipants[0];
      if (!replier) return;
      const samples = [
        '✅ Got it, thanks for the update!',
        'Perfect — keep me posted.',
        'On my way, ETA 10 mins.',
        'Beautiful, the team is ready to receive.',
        '🙏 Much appreciated.',
      ];
      sendMessage(
        roomId,
        { id: replier.id, name: replier.name, role: replier.role },
        samples[Math.floor(Math.random() * samples.length)],
      );
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {otherParticipants.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className={cn(
                  'w-9 h-9 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold ring-2 ring-background',
                  p.avatarColor,
                )}
              >
                {p.initials}
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold text-sm">{room.name}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {otherParticipants.filter((p) => p.online).length} online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/20"
      >
        {messages.map((m, idx) => {
          const isMine = m.senderId === currentUser.id;
          const showAvatar =
            !isMine &&
            (idx === 0 || messages[idx - 1].senderId !== m.senderId);
          const sender = getUserById(m.senderId);
          return (
            <div
              key={m.id}
              className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}
            >
              {!isMine && (
                <div className="w-7">
                  {showAvatar && sender && (
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full bg-gradient-to-br grid place-items-center text-white text-[10px] font-semibold',
                        sender.avatarColor,
                      )}
                    >
                      {sender.initials}
                    </div>
                  )}
                </div>
              )}
              <div
                className={cn(
                  'max-w-sm rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                  isMine
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-background border rounded-bl-md',
                )}
              >
                {!isMine && showAvatar && (
                  <div className="text-[10px] font-semibold text-emerald-700 mb-0.5">
                    {m.senderName}
                  </div>
                )}
                <div className="leading-relaxed">{m.content}</div>
                <div
                  className={cn(
                    'flex items-center justify-end gap-1 mt-1 text-[10px]',
                    isMine ? 'text-emerald-100' : 'text-muted-foreground',
                  )}
                >
                  {formatTime(m.createdAt)}
                  {isMine && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
            Start the conversation!
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3 bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </Button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            className="h-10 bg-muted/50 border-transparent"
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="h-10 bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
