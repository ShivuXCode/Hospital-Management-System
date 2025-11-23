import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { API_URL } from '@/services/api';
import { Plus, RefreshCw, Loader2, Trash2, Save, X } from 'lucide-react';

const categories = ['medication','equipment','supplies','consumables','instruments'];
const units = ['pieces','boxes','bottles','vials','tubes','packs','liters','grams','milliliters'];
const statuses = ['available','low_stock','out_of_stock','expired','damaged'];

export default function InventoryManager() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState({
    itemCode: '', itemName: '', category: 'medication', unit: 'pieces',
    currentStock: 0, minimumStock: 0, maximumStock: 100, unitPrice: 0,
    supplier: { name: '', contact: '', email: '', phone: '' },
    location: { ward: '', shelf: '', position: '' },
    status: 'available', reorderLevel: 10, isCritical: false,
  });

  const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/inventory`, { headers: { Authorization: getHeaders().Authorization } });
      const data = await res.json();
      setItems(data.success ? data.items : []);
    } catch (e) { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter(i => {
    const matchesSearch = !search || [i.itemCode, i.itemName, i.category].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || i.category === catFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  }), [items, search, catFilter, statusFilter]);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      let response;
      const headers = getHeaders();
      if (editingId) {
        response = await fetch(`${API_URL}/inventory/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(form) });
      } else {
        response = await fetch(`${API_URL}/inventory`, { method: 'POST', headers, body: JSON.stringify(form) });
      }
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('Inventory operation failed:', result);
        alert(`Failed to ${editingId ? 'update' : 'create'} item: ${result.message || 'Unknown error'}`);
        return;
      }
      
      setEditingId(null);
      setShowAddModal(false);
      setForm({ itemCode: '', itemName: '', category: 'medication', unit: 'pieces', currentStock: 0, minimumStock: 0, maximumStock: 100, unitPrice: 0, supplier: { name: '', contact: '', email: '', phone: '' }, location: { ward: '', shelf: '', position: '' }, status: 'available', reorderLevel: 10, isCritical: false });
      await load();
    } catch (e) { 
      console.error('Inventory submit error:', e);
      alert(`Error: ${e.message}`);
    } finally { setLoading(false); }
  };

  const onEdit = (it) => {
    setEditingId(it._id);
    setShowAddModal(true);
    setForm({
      itemCode: it.itemCode || '', itemName: it.itemName || '', category: it.category || 'medication', unit: it.unit || 'pieces',
      currentStock: it.currentStock ?? 0, minimumStock: it.minimumStock ?? 0, maximumStock: it.maximumStock ?? 100, unitPrice: it.unitPrice ?? 0,
      supplier: it.supplier || { name: '', contact: '', email: '', phone: '' },
      location: it.location || { ward: '', shelf: '', position: '' },
      status: it.status || 'available', reorderLevel: it.reorderLevel ?? 10, isCritical: it.isCritical ?? false,
    });
  };

  const onView = (it) => setViewItem(it);
  const onRestock = (it) => { setRestockItem(it); setRestockQty(0); };
  const confirmRestock = async () => {
    if (!restockItem || restockQty <= 0) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/inventory/${restockItem._id}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ transactionType: 'restock', quantity: restockQty, unitPrice: restockItem.unitPrice || 0 })
      });
      setRestockItem(null);
      await load();
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  const onDelete = async (id) => { setLoading(true); try { await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE', headers: { Authorization: getHeaders().Authorization } }); await load(); } catch (e) {} finally { setLoading(false); } };

  const outOfStockItems = useMemo(()=>items.filter(i => (i.currentStock ?? 0) === 0), [items]);
  const lowStockItems = useMemo(()=>items.filter(i => (i.currentStock ?? 0) > 0 && (i.currentStock ?? 0) <= (i.minimumStock ?? 0)), [items]);

  return (
    <div className="space-y-5">
      {/* Alert bars */}
      {outOfStockItems.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          <strong>Out of Stock:</strong> {outOfStockItems.length} {outOfStockItems.length === 1 ? 'item' : 'items'} need immediate restocking
        </div>
      )}
      {lowStockItems.length > 0 && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <strong>Low Stock:</strong> {lowStockItems.length} {lowStockItems.length === 1 ? 'item is' : 'items are'} below minimum stock level
        </div>
      )}

      {/* Filters & actions row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search by item name or code..." value={search} onChange={(e)=>setSearch(e.target.value)} className="flex-1 min-w-[240px]" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{['all', ...categories].map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{['all', ...statuses].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={()=>{ 
          setEditingId(null); 
          setForm({ 
            itemCode: '', 
            itemName: '', 
            category: 'medication', 
            unit: 'pieces', 
            currentStock: 0, 
            minimumStock: 0, 
            maximumStock: 100, 
            unitPrice: 0, 
            supplier: { name: '', contact: '', email: '', phone: '' }, 
            location: { ward: '', shelf: '', position: '' }, 
            status: 'available', 
            reorderLevel: 10, 
            isCritical: false 
          }); 
          setShowAddModal(true); 
        }} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
        <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading?'animate-spin':''}`} />Refresh</Button>
      </div>

      {/* Inventory table */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No items found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(it => {
                  const low = (it.currentStock ?? 0) <= (it.minimumStock ?? 0) && (it.currentStock ?? 0) > 0;
                  const out = (it.currentStock ?? 0) === 0;
                  const badgeClass = out ? 'bg-red-100 text-red-700' : low ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700';
                  return (
                    <TableRow key={it._id}>
                      <TableCell className="font-medium">
                        <div>{it.itemName}</div>
                        <div className="text-xs text-muted-foreground">{it.itemCode}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className="capitalize" variant="outline">{it.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{it.currentStock}</div>
                        <div className="text-xs text-muted-foreground">Min: {it.minimumStock}</div>
                      </TableCell>
                      <TableCell>
                        {it.unitPrice ? `$${Number(it.unitPrice).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div>{it.location?.ward || '-'}</div>
                        <div className="text-xs text-muted-foreground">{it.location?.shelf || ''}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${badgeClass}`}>{it.status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3 text-sm">
                          <button className="text-blue-600 hover:underline" onClick={()=>onView(it)}>View</button>
                          <button className="text-red-600 hover:underline" onClick={()=>setDeleteItem(it)}>Delete</button>
                          <button className="text-purple-600 hover:underline" onClick={()=>onEdit(it)}>Edit</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-6">
          <Card className="w-full max-w-4xl animate-in fade-in slide-in-from-top">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? 'Update Item' : 'Add New Item'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={()=>{ setShowAddModal(false); setEditingId(null); }}><X className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid md:grid-cols-4 gap-4">
                <Input placeholder="Item Code *" required value={form.itemCode} onChange={(e)=>setForm({...form, itemCode: e.target.value})} />
                <Input placeholder="Item Name *" required value={form.itemName} onChange={(e)=>setForm({...form, itemName: e.target.value})} />
                <Select value={form.category} onValueChange={(v)=>setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                  <SelectContent>{categories.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.unit} onValueChange={(v)=>setForm({...form, unit: v})}>
                  <SelectTrigger><SelectValue placeholder="Unit *" /></SelectTrigger>
                  <SelectContent>{units.map(u=> <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Current Stock *" value={form.currentStock} onChange={(e)=>setForm({...form, currentStock: Number(e.target.value)})} />
                <Input type="number" placeholder="Min Stock *" value={form.minimumStock} onChange={(e)=>setForm({...form, minimumStock: Number(e.target.value)})} />
                <Input type="number" placeholder="Max Stock *" value={form.maximumStock} onChange={(e)=>setForm({...form, maximumStock: Number(e.target.value)})} />
                <Input type="number" placeholder="Unit Price *" value={form.unitPrice} onChange={(e)=>setForm({...form, unitPrice: Number(e.target.value)})} />
                <Input placeholder="Supplier Name" value={form.supplier.name} onChange={(e)=>setForm({...form, supplier: {...form.supplier, name: e.target.value}})} />
                <Input placeholder="Supplier Phone" value={form.supplier.phone} onChange={(e)=>setForm({...form, supplier: {...form.supplier, phone: e.target.value}})} />
                <Input placeholder="Supplier Email" value={form.supplier.email} onChange={(e)=>setForm({...form, supplier: {...form.supplier, email: e.target.value}})} />
                <Input placeholder="Location Ward" value={form.location.ward} onChange={(e)=>setForm({...form, location: {...form.location, ward: e.target.value}})} />
                <Input placeholder="Location Shelf" value={form.location.shelf} onChange={(e)=>setForm({...form, location: {...form.location, shelf: e.target.value}})} />
                <Input placeholder="Location Position" value={form.location.position} onChange={(e)=>setForm({...form, location: {...form.location, position: e.target.value}})} />
                <Select value={form.status} onValueChange={(v)=>setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>{statuses.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <div className="md:col-span-4 flex gap-3 mt-2">
                  <Button type="submit" disabled={loading}>{editingId ? <><Save className="h-4 w-4 mr-2"/>Save</> : <><Plus className="h-4 w-4 mr-2"/>Create</>}</Button>
                  <Button type="button" variant="secondary" onClick={()=>{ setShowAddModal(false); setEditingId(null); }}><X className="h-4 w-4 mr-2"/>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
          <Card className="w-full max-w-xl">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{viewItem.itemName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={()=>setViewItem(null)}><X className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Code:</strong> {viewItem.itemCode}</div>
              <div><strong>Category:</strong> {viewItem.category}</div>
              <div><strong>Stock:</strong> {viewItem.currentStock} (Min: {viewItem.minimumStock})</div>
              <div><strong>Price:</strong> {viewItem.unitPrice ? `$${viewItem.unitPrice}` : '-'}</div>
              <div><strong>Location:</strong> {viewItem.location?.ward || '-'} {viewItem.location?.shelf || ''}</div>
              <div><strong>Status:</strong> {viewItem.status}</div>
              <div><strong>Supplier:</strong> {viewItem.supplier?.name || '-'} {viewItem.supplier?.email ? `(${viewItem.supplier.email})` : ''}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Restock {restockItem.itemName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={()=>setRestockItem(null)}><X className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">Current Stock: <strong>{restockItem.currentStock}</strong></div>
                <Input type="number" placeholder="Add quantity" value={restockQty} onChange={(e)=>setRestockQty(Number(e.target.value))} />
                <div className="flex gap-3">
                  <Button disabled={loading || restockQty<=0} onClick={confirmRestock}>{loading ? 'Saving...' : 'Confirm'}</Button>
                  <Button variant="secondary" onClick={()=>setRestockItem(null)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Delete Item</CardTitle>
              <Button variant="ghost" size="sm" onClick={()=>setDeleteItem(null)}><X className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Are you sure you want to delete <span className="font-semibold">{deleteItem.itemName}</span> ({deleteItem.itemCode})? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={async ()=>{ await onDelete(deleteItem._id); setDeleteItem(null); }}>Delete</Button>
                <Button variant="secondary" onClick={()=>setDeleteItem(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
