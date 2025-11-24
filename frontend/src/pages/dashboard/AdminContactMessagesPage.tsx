import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle, Clock, Trash2, MessageSquare } from 'lucide-react';

interface ContactMessage {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'resolved';
  adminNote?: string;
  createdAt: string;
}

const AdminContactMessagesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId: string, status: 'pending' | 'resolved') => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, adminNote }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Message updated successfully',
        });
        fetchMessages();
        setSelectedMessage(null);
        setAdminNote('');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update message',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        });
        fetchMessages();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const pendingMessages = messages.filter(m => m.status === 'pending');
  const resolvedMessages = messages.filter(m => m.status === 'resolved');

  const MessageTable = ({ messageList }: { messageList: ContactMessage[] }) => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messageList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No messages found
              </TableCell>
            </TableRow>
          ) : (
            messageList.map((message) => (
              <TableRow key={message._id}>
                <TableCell className="font-medium">{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>{message.phone}</TableCell>
                <TableCell>
                  {new Date(message.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={message.status === 'pending' ? 'secondary' : 'default'}>
                    {message.status === 'pending' ? (
                      <><Clock className="h-3 w-3 mr-1" /> Pending</>
                    ) : (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Resolved</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMessage(message);
                        setAdminNote(message.adminNote || '');
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(message._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
          <p className="text-muted-foreground">Manage patient inquiries and messages</p>
        </div>
        <Button onClick={fetchMessages} variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingMessages.length})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({resolvedMessages.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <MessageTable messageList={pendingMessages} />
              </TabsContent>
              <TabsContent value="resolved">
                <MessageTable messageList={resolvedMessages} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.name} - {new Date(selectedMessage?.createdAt || '').toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Patient Information</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {selectedMessage.name}</p>
                  <p><strong>Email:</strong> {selectedMessage.email}</p>
                  <p><strong>Phone:</strong> {selectedMessage.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Message</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedMessage.message}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Admin Note</h3>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note about this message..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                {selectedMessage.status === 'pending' ? (
                  <Button
                    onClick={() => handleStatusUpdate(selectedMessage._id, 'resolved')}
                    disabled={updating}
                  >
                    {updating ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved</>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedMessage._id, 'pending')}
                    disabled={updating}
                  >
                    {updating ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      <><Clock className="h-4 w-4 mr-2" /> Mark as Pending</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactMessagesPage;
