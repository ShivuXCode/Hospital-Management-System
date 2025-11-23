import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Pencil, Save, X, RefreshCw } from 'lucide-react';
import { API_URL } from '@/services/api';

interface Device {
  _id?: string;
  deviceId: string;
  name: string;
  type?: string;
  status?: string;
}

const AdminIoTDevices = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<Device>({ deviceId: '', name: '', type: 'heart_monitor', status: 'offline' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/iot/devices`, { headers: { Authorization: headers.Authorization as string } });
      const data = await res.json();
      setDevices(data.success ? data.devices : []);
    } catch (e) {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await fetch(`${API_URL}/iot/devices/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(form) });
      } else {
        await fetch(`${API_URL}/iot/devices`, { method: 'POST', headers, body: JSON.stringify(form) });
      }
      setForm({ deviceId: '', name: '', type: 'heart_monitor', status: 'offline' });
      setEditingId(null);
      await load();
    } catch (e) {
      // ignore errors for MVP
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (d: Device) => {
    setEditingId(d._id!);
    setForm({ deviceId: d.deviceId, name: d.name, type: d.type, status: d.status });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    const ok = window.confirm('Are you sure you want to delete this device?');
    if (!ok) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/iot/devices/${id}`, { method: 'DELETE', headers: { Authorization: headers.Authorization as string } });
      await load();
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ deviceId: '', name: '', type: 'heart_monitor', status: 'offline' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">IoT Devices</h1>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>{editingId ? 'Update Device' : 'Register Device'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-5 gap-3">
            <Input placeholder="Device ID" required value={form.deviceId} onChange={(e)=>setForm({...form, deviceId: e.target.value})} />
            <Input placeholder="Device Name" required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
              <option value="heart_monitor">Heart Monitor</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="temperature">Temperature</option>
              <option value="oxygen_saturation">Oxygen Saturation</option>
              <option value="glucose_meter">Glucose Meter</option>
              <option value="weight_scale">Weight Scale</option>
              <option value="smart_bed">Smart Bed</option>
              <option value="infusion_pump">Infusion Pump</option>
              <option value="ventilator">Ventilator</option>
              <option value="defibrillator">Defibrillator</option>
            </select>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingId ? <><Save className="h-4 w-4 mr-2" /> Save</> : <><Plus className="h-4 w-4 mr-2" /> Add</>}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : devices.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No devices found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell className="font-medium">{d.deviceId}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.type || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'online' ? 'default' : 'secondary'}>
                        {d.status || 'offline'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={()=>onEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={()=>onDelete(d._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default AdminIoTDevices;
