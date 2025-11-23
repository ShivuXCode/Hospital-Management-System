import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL } from '@/services/api';

const AdminGamification = () => {
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/gamification/achievements`, { headers: { Authorization: `Bearer ${token}` } }).catch(()=>null);
      const data = res ? await res.json() : { success:false };
      setAchievements(data?.achievements || []);
    } catch { setAchievements([]); } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchData(); },[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gamification</h1>
        <Button variant="outline" onClick={fetchData} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading?'animate-spin':''}`} />Refresh</Button>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No achievements</TableCell></TableRow>
              ) : achievements.map((a:any)=> (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>{a.points ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGamification;
