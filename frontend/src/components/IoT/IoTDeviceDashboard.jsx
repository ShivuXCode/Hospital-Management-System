import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL } from '@/services/api';
import { Plus, RefreshCw, Loader2, Cpu, Battery, Wifi, Trash2, Eye, Globe } from 'lucide-react';

const statusColors = {
  online: 'bg-emerald-100 text-emerald-700',
  offline: 'bg-gray-100 text-gray-700',
  maintenance: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

const types = ['heart_monitor','blood_pressure','temperature','oxygen_saturation','glucose_meter','weight_scale','smart_bed','infusion_pump','ventilator','defibrillator'];

export default function IoTDeviceDashboard() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState(''); // retained (hidden for now but available for future)

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    deviceId: '', // generated on submit if left empty
    deviceName: '',
    deviceType: 'heart_monitor',
    manufacturer: '',
    model: '',
    serialNumber: '',
    macAddress: '',
    ipAddress: '',
    location: { ward: '', room: '', bed: '' },
    patientId: '',
    status: 'offline'
  });

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/iot/devices`, { headers: { Authorization: headers.Authorization } });
      const data = await res.json();
      if (data.success) setDevices(data.devices || []); else setDevices([]);
    } catch (e) {
      setDevices([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => devices.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesType = typeFilter === 'all' || d.deviceType === typeFilter;
    const matchesText = !search || [d.deviceId, d.deviceName, d.patientName].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesText;
  }), [devices, statusFilter, typeFilter, search]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const genId = form.deviceId && form.deviceId.trim().length > 0
        ? form.deviceId.trim()
        : `DEV${Math.random().toString(36).slice(2,6).toUpperCase()}${Date.now().toString().slice(-4)}`;
      const payload = { ...form, deviceId: genId };
      await fetch(`${API_URL}/iot/devices`, { method: 'POST', headers, body: JSON.stringify(payload) });
      setFormOpen(false);
      setForm({ ...form, deviceId: '', deviceName: '' });
      await load();
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  const remove = async (id) => {
    setLoading(true);
    try { await fetch(`${API_URL}/iot/devices/${id}`, { method: 'DELETE', headers: { Authorization: headers.Authorization } }); await load(); }
    catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  const openDetails = (d) => {
    setSelected(d);
    setEditForm({
      deviceName: d.deviceName || '',
      deviceType: d.deviceType || 'heart_monitor',
      manufacturer: d.manufacturer || '',
      model: d.model || '',
      serialNumber: d.serialNumber || '',
      macAddress: d.macAddress || '',
      ipAddress: d.ipAddress || '',
      location: { ward: d.location?.ward || '', room: d.location?.room || '', bed: d.location?.bed || '' },
      patientId: d.patientId || ''
    });
    setEditing(false);
    setDetailOpen(true);
  };

  const saveEdit = async () => {
    if (!selected?._id) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/iot/devices/${selected._id}`, { method: 'PUT', headers, body: JSON.stringify(editForm) });
      setEditing(false);
      setDetailOpen(false);
      await load();
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white p-8 shadow">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Globe className="h-8 w-8"/> IoT Device Dashboard</h1>
        <p className="mt-1 text-sm opacity-90">Real-time monitoring of connected medical devices</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl p-4 shadow flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter by Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {['all','online','offline','maintenance','error'].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter by Type</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {['all', ...types].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading?'animate-spin':''}`} />Refresh</Button>
          <Button onClick={()=>setFormOpen(true)}><Plus className="h-4 w-4 mr-2"/>Add Device</Button>
        </div>
        {/* Hidden search retained for future */}
        <div className="hidden">
          <Input placeholder="Search" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
      </div>

      {/* Device Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">No devices</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <Card key={d._id} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{d.deviceName}</CardTitle>
                <Badge className={statusColors[d.status] || 'bg-gray-100 text-gray-700'}>{d.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">Device ID: {d.deviceId}<br/>Type: {d.deviceType}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1"><Battery className="h-4 w-4" /> {d.batteryLevel ?? '-'}%</span>
                  <span className="flex items-center gap-1"><Wifi className="h-4 w-4" /> {d.connectivity?.signalStrength ?? '-'}%</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <Button size="sm" variant="outline" onClick={()=>openDetails(d)}><Eye className="h-4 w-4 mr-1"/>Details</Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={()=>setDeleteTarget(d)}><Trash2 className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Device Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add New IoT Device</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Device Name *" required value={form.deviceName} onChange={(e)=>setForm({...form, deviceName: e.target.value})} />
            <Select value={form.deviceType} onValueChange={(v)=>setForm({...form, deviceType: v})}>
              <SelectTrigger><SelectValue placeholder="Device Type *" /></SelectTrigger>
              <SelectContent>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Manufacturer" value={form.manufacturer} onChange={(e)=>setForm({...form, manufacturer: e.target.value})} />
            <Input placeholder="Model" value={form.model} onChange={(e)=>setForm({...form, model: e.target.value})} />
            <Input placeholder="Serial Number" value={form.serialNumber} onChange={(e)=>setForm({...form, serialNumber: e.target.value})} />
            <Input placeholder="MAC Address" value={form.macAddress} onChange={(e)=>setForm({...form, macAddress: e.target.value})} />
            <Input placeholder="IP Address" value={form.ipAddress} onChange={(e)=>setForm({...form, ipAddress: e.target.value})} />
            <Input placeholder="Ward" value={form.location.ward} onChange={(e)=>setForm({...form, location: {...form.location, ward: e.target.value}})} />
            <Input placeholder="Room" value={form.location.room} onChange={(e)=>setForm({...form, location: {...form.location, room: e.target.value}})} />
            <Input placeholder="Bed" value={form.location.bed} onChange={(e)=>setForm({...form, location: {...form.location, bed: e.target.value}})} />
            <Input placeholder="Patient ID" value={form.patientId} onChange={(e)=>setForm({...form, patientId: e.target.value})} />
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="submit" disabled={loading}><Cpu className="h-4 w-4 mr-2"/>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail/Edit Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Device' : 'Device Details'}</DialogTitle></DialogHeader>
          {selected && !editing && (
            <div className="space-y-3 text-sm">
              <div className="font-semibold text-base">{selected.deviceName} ({selected.deviceType})</div>
              <div>ID: {selected.deviceId} · Status: <Badge>{selected.status}</Badge></div>
              <div>Battery: {selected.batteryLevel ?? '-'}% · Signal: {selected.connectivity?.signalStrength ?? '-'}%</div>
              <div>Location: {selected.location?.ward || '-'} / {selected.location?.room || '-'} / {selected.location?.bed || '-'}</div>
              <div>Patient ID: {selected.patientId || '-'}</div>
              <div>Last Reading: {selected.lastReading?.value ?? '-'} {selected.lastReading?.unit || ''} · {selected.lastReading?.status || '-'}</div>
              <div className="pt-2 flex justify-end"><Button onClick={()=>setEditing(true)}>Edit</Button></div>
            </div>
          )}
          {selected && editing && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Device Name *" value={editForm.deviceName} onChange={(e)=>setEditForm({...editForm, deviceName: e.target.value})} />
                <Select value={editForm.deviceType} onValueChange={(v)=>setEditForm({...editForm, deviceType: v})}>
                  <SelectTrigger><SelectValue placeholder="Device Type *" /></SelectTrigger>
                  <SelectContent>{types.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Manufacturer" value={editForm.manufacturer} onChange={(e)=>setEditForm({...editForm, manufacturer: e.target.value})} />
                <Input placeholder="Model" value={editForm.model} onChange={(e)=>setEditForm({...editForm, model: e.target.value})} />
                <Input placeholder="Serial Number" value={editForm.serialNumber} onChange={(e)=>setEditForm({...editForm, serialNumber: e.target.value})} />
                <Input placeholder="MAC Address" value={editForm.macAddress} onChange={(e)=>setEditForm({...editForm, macAddress: e.target.value})} />
                <Input placeholder="IP Address" value={editForm.ipAddress} onChange={(e)=>setEditForm({...editForm, ipAddress: e.target.value})} />
                <Input placeholder="Ward" value={editForm.location.ward} onChange={(e)=>setEditForm({...editForm, location:{...editForm.location, ward: e.target.value}})} />
                <Input placeholder="Room" value={editForm.location.room} onChange={(e)=>setEditForm({...editForm, location:{...editForm.location, room: e.target.value}})} />
                <Input placeholder="Bed" value={editForm.location.bed} onChange={(e)=>setEditForm({...editForm, location:{...editForm.location, bed: e.target.value}})} />
                <Input placeholder="Patient ID" value={editForm.patientId} onChange={(e)=>setEditForm({...editForm, patientId: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button onClick={saveEdit} disabled={loading}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v)=>!v && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete Device</DialogTitle></DialogHeader>
          <div className="text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deleteTarget?.deviceName}</span>{' '}
            ({deleteTarget?.deviceId})? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={()=>setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async ()=>{ await remove(deleteTarget._id); setDeleteTarget(null); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
