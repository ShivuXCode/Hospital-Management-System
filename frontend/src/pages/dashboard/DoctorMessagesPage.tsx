import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, Loader2, Phone, Video, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/services/api';

const DoctorMessagesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<{ nurses: any[]; admins: any[] }>({ nurses: [], admins: [] });
  const [activeRoleFilter, setActiveRoleFilter] = useState<'nurses' | 'admins'>('nurses');
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorInfo, setDoctorInfo] = useState<{ id?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching participants from:', `${API_URL}/messages/participants?t=${Date.now()}`);
      const res = await fetch(`${API_URL}/messages/participants?t=${Date.now()}`, { 
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('📥 Participants response:', data);
      console.log('👩‍⚕️ Assigned Nurses:', data.participants?.nurses);
      console.log('👨‍💼 Admins:', data.participants?.admins);
      
      if (data.success) {
        setParticipants(data.participants || { nurses: [], admins: [] });
        if (!selectedParticipant) {
          const first = data.participants.nurses[0] || data.participants.admins[0];
          if (first) {
            setSelectedParticipant(first);
            fetchConversation(first._id);
          }
        }
      } else {
        console.error('❌ API returned error:', data.message);
        toast({
          title: 'Error',
          description: data.message || 'Failed to load participants',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error('❌ Failed to load participants', e);
      toast({
        title: 'Error',
        description: 'Failed to load messaging participants. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  const fetchConversation = async (userId: string) => {
    setConversationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/messages/conversation/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setConversation(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setConversationLoading(false);
    }
  };

  const fetchDoctorInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success && data.doctor) {
        setDoctorInfo({ id: data.doctor._id || data.doctor.id });
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchDoctorInfo();
    
    // Poll for participants updates every 30 seconds
    const participantsInterval = setInterval(() => {
      fetchParticipants();
    }, 30000);
    
    return () => clearInterval(participantsInterval);
  }, []);

  useEffect(() => {
    if (!selectedParticipant) return;
    const interval = setInterval(() => {
      fetchConversation(selectedParticipant._id);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedParticipant]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedParticipant) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientId: selectedParticipant._id,
          subject: 'Chat Message',
          message: messageText,
          priority: 'normal',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessageText('');
        fetchConversation(selectedParticipant._id);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to send message', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredParticipants = participants[activeRoleFilter].filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-12 h-full border rounded-lg overflow-hidden bg-background shadow-lg">
        {/* Sidebar - Conversations List */}
        <div className="col-span-4 border-r flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold mb-3">Messages</h2>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex gap-2">
              {(['nurses', 'admins'] as const).map(role => (
                <Button
                  key={role}
                  size="sm"
                  variant={activeRoleFilter === role ? 'default' : 'ghost'}
                  onClick={() => setActiveRoleFilter(role)}
                  className="flex-1"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                  <Badge variant="secondary" className="ml-2">
                    {participants[role].length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No {activeRoleFilter} found</p>
              </div>
            ) : (
              filteredParticipants.map(p => (
                <button
                  key={p._id}
                  onClick={() => { setSelectedParticipant(p); fetchConversation(p._id); }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b ${
                    selectedParticipant?._id === p._id ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{p.name}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {p.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-span-8 flex flex-col bg-background">
          {!selectedParticipant ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Send className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your contacts to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-background">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(selectedParticipant.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedParticipant.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedParticipant.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {conversationLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : conversation.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation with {selectedParticipant.name}</p>
                  </div>
                ) : (
                  <>
                    {conversation.map((m, idx) => {
                      const isMe = m.sender?._id !== selectedParticipant._id;
                      const showDate = idx === 0 || new Date(conversation[idx - 1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                      
                      return (
                        <div key={m._id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                                {new Date(m.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(m.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isMe && (
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="bg-muted text-xs">
                                    {getInitials(selectedParticipant.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isMe
                                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                                      : 'bg-background border rounded-bl-sm'
                                  }`}
                                >
                                  {m.subject && m.subject !== 'Chat Message' && (
                                    <p className="text-xs font-semibold mb-1 opacity-70">{m.subject}</p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                                  {m.priority !== 'normal' && (
                                    <Badge
                                      variant={m.priority === 'emergency' ? 'destructive' : 'default'}
                                      className="mt-2 text-xs"
                                    >
                                      {m.priority}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                  {formatTime(m.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || loading}
                    size="icon"
                    className="rounded-full shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagesPage;
