import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, Stethoscope, UserPlus, Link2, Unlink, Trash2 } from 'lucide-react';

interface NurseType {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  userId?: { _id: string; name: string; email: string };
  assignedDoctors?: Array<{ _id: string; name: string; specialization?: string }>;
}

interface DoctorType {
  _id: string;
  name: string;
  email?: string;
  specialization?: string;
  assignedNurse?: { _id: string; name: string } | null;
}

const AdminNurseAssignmentsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [nurses, setNurses] = useState<NurseType[]>([]);
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [search, setSearch] = useState('');
  const [working, setWorking] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nursesRes, doctorsRes] = await Promise.all([
        apiService.getNurses(),
        apiService.getDoctors(),
      ]);

      if (nursesRes.success) {
        setNurses(nursesRes.nurses || []);
      }
      if (doctorsRes.success) {
        setDoctors((doctorsRes.doctors || []) as any);
      }
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // For each nurse row we will compute available doctors to (re)assign (excluding ones already on that nurse).
  // Backend allows admin to reassign; selecting a doctor already assigned to another nurse will move them.

  const filteredNurses = useMemo(() => {
    if (!search) return nurses;
    const q = search.toLowerCase();
    return nurses.filter((n) => (n.name || '').toLowerCase().includes(q) || (n.email || '').toLowerCase().includes(q));
  }, [nurses, search]);

  const hasAnyAssignments = useMemo(() => {
    const nurseSide = nurses.some((n) => (n.assignedDoctors || []).length > 0);
    const doctorSide = doctors.some((d) => !!d.assignedNurse);
    return nurseSide || doctorSide;
  }, [nurses, doctors]);

  const handleAssign = async (nurseId: string, doctorId: string) => {
    if (!doctorId) return;
    setWorking(`${nurseId}:${doctorId}`);
    try {
      const res = await apiService.assignDoctorToNurse(nurseId, doctorId);
      if (!res.success) throw new Error(res.message || 'Assign failed');
      toast({ title: 'Doctor assigned', description: 'The doctor has been assigned to the nurse.' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Assign failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setWorking(null);
    }
  };

  const handleUnassign = async (nurseId: string, doctorId: string) => {
    setWorking(`${nurseId}:${doctorId}:unassign`);
    try {
      const res = await apiService.unassignDoctorFromNurse(nurseId, doctorId);
      if (!res.success) throw new Error(res.message || 'Unassign failed');
      toast({ title: 'Doctor unassigned', description: 'The doctor has been unassigned from the nurse.' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Unassign failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setWorking(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('This will remove ALL doctor-nurse assignments. Continue?')) return;
    setWorking('clear-all');
    try {
      const res = await apiService.clearAllDoctorNurseAssignments();
      if (!res.success) throw new Error(res.message || 'Clear failed');
      toast({ title: 'Assignments cleared', description: `Doctors updated: ${res.result?.doctorsUpdated || 0}, Nurses updated: ${res.result?.nursesUpdated || 0}` });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Clear failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Assign Nurses to Doctors</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search nurses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-[220px]" />
            <Button variant="outline" onClick={loadData}>Refresh</Button>
            {hasAnyAssignments && (
              <Button variant="destructive" onClick={handleClearAll} disabled={working === 'clear-all'} className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear all assignments
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nurse</TableHead>
                    <TableHead>Assigned Doctors (max 2)</TableHead>
                    <TableHead>Assign Doctor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNurses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No nurses found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredNurses.map((nurse) => {
                      const availableDoctorsForNurse = doctors.filter(
                        (d) => !(nurse.assignedDoctors || []).some((ad) => ad._id === d._id)
                      );
                      const canAssign = availableDoctorsForNurse.length > 0 && (nurse.assignedDoctors?.length || 0) < 2;
                      return (
                        <TableRow key={nurse._id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-primary" /> {nurse.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{nurse.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {(nurse.assignedDoctors || []).map((doc) => (
                                <div key={doc._id} className="flex items-center gap-2 border rounded-md px-2 py-1">
                                  <Stethoscope className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-medium">{doc.name}</span>
                                  <Badge variant="outline" className="text-[10px]">{doc.specialization || 'Doctor'}</Badge>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="Unassign"
                                    onClick={() => handleUnassign(nurse._id, doc._id)}
                                    disabled={working === `${nurse._id}:${doc._id}:unassign`}
                                  >
                                    <Unlink className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {(nurse.assignedDoctors?.length || 0) === 0 && (
                                <span className="text-sm text-muted-foreground">No doctors assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {canAssign ? (
                              <div className="flex items-center gap-2">
                                <Select onValueChange={(doctorId) => handleAssign(nurse._id, doctorId)}>
                                  <SelectTrigger className="w-[260px]">
                                    <Link2 className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Select a doctor to assign or reassign" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableDoctorsForNurse.map((doc) => (
                                      <SelectItem key={doc._id} value={doc._id}>
                                        {doc.name} — {doc.specialization || 'Specialist'}
                                        {doc.assignedNurse && (doc.assignedNurse as any).name
                                          ? ` (currently: ${(doc.assignedNurse as any).name})`
                                          : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {(nurse.assignedDoctors?.length || 0) >= 2 ? 'Unassign one to free a slot' : 'No doctors available'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNurseAssignmentsPage;
