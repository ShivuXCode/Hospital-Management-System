import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { API_URL } from '@/services/api';

const AdminQueriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<any[]>([]);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/get-contacts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setQueries(data.contacts || []);
      else setQueries([]);
    } catch (e) {
      // Endpoint may not exist yet; keep UI safe
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/delete-contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchQueries();
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { fetchQueries(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contact Queries</h1>
        <Button variant="outline" size="sm" onClick={fetchQueries} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : queries.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No queries found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((q:any) => (
                  <TableRow key={q._id}>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>{q.email || '-'}</TableCell>
                    <TableCell>{q.phone || '-'}</TableCell>
                    <TableCell className="max-w-[400px] truncate">{q.message || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteQuery(q._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQueriesPage;
