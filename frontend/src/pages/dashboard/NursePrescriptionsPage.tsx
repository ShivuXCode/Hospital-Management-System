import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, RefreshCcw, Eye, FileText, User, Calendar } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const NursePrescriptionsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPrescriptions();
      if (res.success) {
        setPrescriptions(res.prescriptions || []);
        toast({ 
          title: 'Prescriptions Loaded', 
          description: `${res.prescriptions?.length || 0} prescription(s) from your assigned doctors`,
        });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load prescriptions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription);
    setDetailDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">
            View prescriptions from your assigned doctors • Read-only access
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(prescriptions.map(p => p.patient?._id)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (Valid)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter(p => new Date(p.validUntil) >= new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No prescriptions found from your assigned doctors.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((p) => {
                  const isExpired = new Date(p.validUntil) < new Date();
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.patient?.name || 'Unknown'}</TableCell>
                      <TableCell>{p.doctorName || p.doctor?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? 'destructive' : 'outline'}>
                          {p.validUntil ? formatDate(p.validUntil) : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {p.diagnosis || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {Array.isArray(p.medicines) && p.medicines.length > 0
                          ? p.medicines.map((m: any) => m.name).join(', ')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(p)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Read-only view of prescription information
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6 py-4">
              {/* Patient & Doctor Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedPrescription.patient?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedPrescription.patient?.email || '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Doctor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedPrescription.doctorName || selectedPrescription.doctor?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specialization:</span>
                      <span className="font-medium">
                        {selectedPrescription.doctor?.specialization || '-'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Prescription Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Prescription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date Issued:</span>
                    <p className="font-medium mt-1">
                      {selectedPrescription.dateIssued ? formatDate(selectedPrescription.dateIssued) : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until:</span>
                    <p className="font-medium mt-1">
                      {selectedPrescription.validUntil ? formatDate(selectedPrescription.validUntil) : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diagnosis:</span>
                    <p className="font-medium mt-1 whitespace-pre-wrap">
                      {selectedPrescription.diagnosis || 'Not specified'}
                    </p>
                  </div>
                  {selectedPrescription.notes && (
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="font-medium mt-1 whitespace-pre-wrap">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medicines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(selectedPrescription.medicines) && selectedPrescription.medicines.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPrescription.medicines.map((med: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{med.name}</h4>
                            <Badge variant="outline">#{idx + 1}</Badge>
                          </div>
                          {med.dosage && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Dosage:</span>{' '}
                              <span className="font-medium">{med.dosage}</span>
                            </div>
                          )}
                          {med.duration && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Duration:</span>{' '}
                              <span className="font-medium">{med.duration}</span>
                            </div>
                          )}
                          {med.instructions && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Instructions:</span>{' '}
                              <span className="font-medium">{med.instructions}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No medicines listed</p>
                  )}
                </CardContent>
              </Card>

              {/* Last Updated */}
              {selectedPrescription.updatedAt && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Last updated: {new Date(selectedPrescription.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NursePrescriptionsPage;
