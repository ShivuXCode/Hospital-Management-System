import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, User, FileText, Lock, Plus, Trash2, Save, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { API_URL } from '@/services/api';

interface LabTest {
  testName: string;
  amount: number;
}

interface Scan {
  scanType: string;
  amount: number;
}

interface Medicine {
  medicineName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface ServiceFee {
  serviceType: string;
  amount: number;
}

const AdminBillingPage = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createBillDialogOpen, setCreateBillDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'finalized'>('pending');
  
  // Create Bill State
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newConsultationFee, setNewConsultationFee] = useState('');
  const [newBillNotes, setNewBillNotes] = useState('');
  
  // Hospital Charges State
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bedCharges, setBedCharges] = useState<{ days: number; ratePerDay: number; amount: number }>({
    days: 0,
    ratePerDay: 0,
    amount: 0
  });
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);

  useEffect(() => {
    fetchBills();
  }, [activeTab]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'pending' 
        ? `${API_URL}/integrated-billing/admin/pending`
        : `${API_URL}/integrated-billing/admin/all?status=finalized`;
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const filteredBills = activeTab === 'finalized'
          ? (data.bills || []).filter((b: any) => b.status === 'finalized' || b.status === 'paid')
          : data.bills || [];
        setBills(filteredBills);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load bills',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (bill: any) => {
    setSelectedBill(bill);
    
    // Load existing hospital charges if any
    const charges = bill.hospitalCharges;
    setLabTests(charges?.labTests || []);
    setScans(charges?.scans || []);
    setMedicines(charges?.medicines || []);
    setBedCharges(charges?.bedCharges || { days: 0, ratePerDay: 0, amount: 0 });
    setServiceFees(charges?.serviceFees || []);
    
    setDialogOpen(true);
  };

  // Lab Tests
  const addLabTest = () => {
    setLabTests([...labTests, { testName: '', amount: 0 }]);
  };

  const updateLabTest = (index: number, field: keyof LabTest, value: string | number) => {
    const updated = [...labTests];
    updated[index] = { ...updated[index], [field]: value };
    setLabTests(updated);
  };

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  // Scans
  const addScan = () => {
    setScans([...scans, { scanType: '', amount: 0 }]);
  };

  const updateScan = (index: number, field: keyof Scan, value: string | number) => {
    const updated = [...scans];
    updated[index] = { ...updated[index], [field]: value };
    setScans(updated);
  };

  const removeScan = (index: number) => {
    setScans(scans.filter((_, i) => i !== index));
  };

  // Medicines
  const addMedicine = () => {
    setMedicines([...medicines, { medicineName: '', quantity: 0, unitPrice: 0, amount: 0 }]);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = updated[index].quantity * updated[index].unitPrice;
    }
    
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Bed Charges
  const updateBedCharges = (field: keyof typeof bedCharges, value: number) => {
    const updated = { ...bedCharges, [field]: value };
    if (field === 'days' || field === 'ratePerDay') {
      updated.amount = updated.days * updated.ratePerDay;
    }
    setBedCharges(updated);
  };

  // Service Fees
  const addServiceFee = () => {
    setServiceFees([...serviceFees, { serviceType: '', amount: 0 }]);
  };

  const updateServiceFee = (index: number, field: keyof ServiceFee, value: string | number) => {
    const updated = [...serviceFees];
    updated[index] = { ...updated[index], [field]: value };
    setServiceFees(updated);
  };

  const removeServiceFee = (index: number) => {
    setServiceFees(serviceFees.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const labTotal = labTests.reduce((sum, test) => sum + (Number(test.amount) || 0), 0);
    const scanTotal = scans.reduce((sum, scan) => sum + (Number(scan.amount) || 0), 0);
    const medicineTotal = medicines.reduce((sum, med) => sum + (Number(med.amount) || 0), 0);
    const bedTotal = bedCharges.amount || 0;
    const serviceTotal = serviceFees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    
    return {
      lab: labTotal,
      scan: scanTotal,
      medicine: medicineTotal,
      bed: bedTotal,
      service: serviceTotal,
      hospital: labTotal + scanTotal + medicineTotal + bedTotal + serviceTotal,
      consultation: selectedBill?.consultationFee?.amount || 0,
      grand: (selectedBill?.consultationFee?.amount || 0) + labTotal + scanTotal + medicineTotal + bedTotal + serviceTotal
    };
  };

  const handleSaveCharges = async () => {
    if (!selectedBill) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/hospital-charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          billId: selectedBill._id,
          labTests: labTests.filter(t => t.testName && t.amount > 0),
          scans: scans.filter(s => s.scanType && s.amount > 0),
          medicines: medicines.filter(m => m.medicineName && m.quantity > 0),
          bedCharges: bedCharges.days > 0 ? bedCharges : undefined,
          serviceFees: serviceFees.filter(f => f.serviceType && f.amount > 0)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Hospital charges saved successfully',
        });
        fetchBills();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save charges',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving charges:', error);
      toast({
        title: 'Error',
        description: 'Failed to save charges',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeBill = async () => {
    if (!selectedBill) return;

    if (!window.confirm('Are you sure you want to finalize this bill? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/${selectedBill._id}/finalize`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bill finalized successfully',
        });
        setDialogOpen(false);
        fetchBills();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to finalize bill',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error finalizing bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to finalize bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'default' },
      finalized: { label: 'Finalized', variant: 'default' },
      paid: { label: 'Paid', variant: 'default' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchAvailablePatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/available-patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailablePatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleOpenCreateBillDialog = () => {
    fetchAvailablePatients();
    setSelectedPatientId('');
    setNewConsultationFee('');
    setNewBillNotes('');
    setCreateBillDialogOpen(true);
  };

  const handleCreateBill = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Error',
        description: 'Please select a patient',
        variant: 'destructive',
      });
      return;
    }

    const selectedPatient = availablePatients.find(p => p._id === selectedPatientId);
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/create-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          patientName: selectedPatient.name,
          patientEmail: selectedPatient.email,
          consultationFee: Number(newConsultationFee) || 0,
          notes: newBillNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bill created successfully',
        });
        setCreateBillDialogOpen(false);
        fetchBills();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create bill',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = dialogOpen ? calculateTotal() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Billing</h1>
          <p className="text-muted-foreground mt-2">
            Manage hospital charges and finalize bills
          </p>
        </div>
        <Button onClick={handleOpenCreateBillDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.filter(b => b.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Finalize</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bills.filter(b => b.consultationFee?.amount > 0 && b.status !== 'finalized').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Bills
        </button>
        <button
          onClick={() => setActiveTab('finalized')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'finalized'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Finalized Bills
        </button>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'pending' ? 'Pending Bills' : 'Finalized Bills'}</CardTitle>
          <CardDescription>
            {activeTab === 'pending'
              ? 'Add hospital charges and finalize bills for completed appointments'
              : 'View completed and finalized bills'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activeTab === 'pending' ? 'No pending bills found' : 'No finalized bills found'}
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{bill.patientName}</p>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(bill.appointmentDate)} at {bill.appointmentTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      Doctor: {bill.doctorName}
                    </p>
                    <div className="flex items-center gap-4 ml-7 mt-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Consultation: ${bill.consultationFee?.amount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Hospital: ${bill.totals?.hospitalTotal || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Grand Total: ${bill.totals?.grandTotal || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bill.status !== 'finalized' ? (
                      <Button onClick={() => handleOpenDialog(bill)} size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Manage Charges
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Finalized</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Charges Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Hospital Charges</DialogTitle>
            <DialogDescription>
              Patient: {selectedBill?.patientName} | Date: {selectedBill && formatDate(selectedBill.appointmentDate)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Consultation Fee (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Consultation Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Added by Dr. {selectedBill?.doctorName}
                  </span>
                  <span className="text-lg font-bold">${selectedBill?.consultationFee?.amount || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Lab Tests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Lab Tests</CardTitle>
                <Button onClick={addLabTest} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Test
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {labTests.map((test, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Test name"
                      value={test.testName}
                      onChange={(e) => updateLabTest(index, 'testName', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={test.amount || ''}
                      onChange={(e) => updateLabTest(index, 'amount', Number(e.target.value))}
                      className="w-32"
                    />
                    <Button onClick={() => removeLabTest(index)} size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {labTests.length > 0 && (
                  <div className="text-right text-sm font-medium pt-2">
                    Subtotal: ${totals?.lab || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scans */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Scans/Imaging</CardTitle>
                <Button onClick={addScan} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Scan
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {scans.map((scan, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Scan type"
                      value={scan.scanType}
                      onChange={(e) => updateScan(index, 'scanType', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={scan.amount || ''}
                      onChange={(e) => updateScan(index, 'amount', Number(e.target.value))}
                      className="w-32"
                    />
                    <Button onClick={() => removeScan(index)} size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {scans.length > 0 && (
                  <div className="text-right text-sm font-medium pt-2">
                    Subtotal: ${totals?.scan || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medicines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Medicines</CardTitle>
                <Button onClick={addMedicine} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Medicine
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {medicines.map((med, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Medicine name"
                      value={med.medicineName}
                      onChange={(e) => updateMedicine(index, 'medicineName', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={med.quantity || ''}
                      onChange={(e) => updateMedicine(index, 'quantity', Number(e.target.value))}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={med.unitPrice || ''}
                      onChange={(e) => updateMedicine(index, 'unitPrice', Number(e.target.value))}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={med.amount || 0}
                      readOnly
                      className="w-24"
                    />
                    <Button onClick={() => removeMedicine(index)} size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {medicines.length > 0 && (
                  <div className="text-right text-sm font-medium pt-2">
                    Subtotal: ${totals?.medicine || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bed Charges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bed Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Days</Label>
                    <Input
                      type="number"
                      value={bedCharges.days || ''}
                      onChange={(e) => updateBedCharges('days', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Rate/Day</Label>
                    <Input
                      type="number"
                      value={bedCharges.ratePerDay || ''}
                      onChange={(e) => updateBedCharges('ratePerDay', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      value={bedCharges.amount || 0}
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Fees */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Service Fees</CardTitle>
                <Button onClick={addServiceFee} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Service
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {serviceFees.map((fee, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Service type"
                      value={fee.serviceType}
                      onChange={(e) => updateServiceFee(index, 'serviceType', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={fee.amount || ''}
                      onChange={(e) => updateServiceFee(index, 'amount', Number(e.target.value))}
                      className="w-32"
                    />
                    <Button onClick={() => removeServiceFee(index)} size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {serviceFees.length > 0 && (
                  <div className="text-right text-sm font-medium pt-2">
                    Subtotal: ${totals?.service || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Summary */}
            {totals && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Consultation Fee:</span>
                      <span>${totals.consultation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Hospital Charges:</span>
                      <span>${totals.hospital}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Grand Total:</span>
                      <span>${totals.grand}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCharges} disabled={loading} variant="secondary">
              <Save className="h-4 w-4 mr-2" />
              Save Charges
            </Button>
            <Button onClick={handleFinalizeBill} disabled={loading}>
              <Lock className="h-4 w-4 mr-2" />
              Finalize Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bill Dialog */}
      <Dialog open={createBillDialogOpen} onOpenChange={setCreateBillDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Create a manual bill for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultation-fee">Consultation Fee ($)</Label>
              <Input
                id="consultation-fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount (optional)"
                value={newConsultationFee}
                onChange={(e) => setNewConsultationFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-notes">Notes (Optional)</Label>
              <Textarea
                id="bill-notes"
                placeholder="Add any notes about this bill"
                value={newBillNotes}
                onChange={(e) => setNewBillNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} disabled={loading || !selectedPatientId}>
              {loading ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBillingPage;
