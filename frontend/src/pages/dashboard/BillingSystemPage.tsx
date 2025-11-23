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
import { DollarSign, Calendar, User, FileText, CreditCard, Plus, Trash2, Search, Filter, Eye, Edit } from 'lucide-react';
import { API_URL } from '@/services/api';

interface BillItem {
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'consultation' | 'medication' | 'procedure' | 'lab_test' | 'imaging' | 'room_charge' | 'other';
}

interface Payment {
  paymentMethod: string;
  amount: number;
  transactionId?: string;
  paymentDate: Date;
  status: string;
  notes?: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  billDate: Date;
  dueDate: Date;
  items: BillItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountReason?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  payments: Payment[];
  status: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    coverageAmount?: number;
    claimNumber?: string;
    status?: string;
  };
  notes?: string;
}

const BillingSystemPage = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Bill Form State
  const [billForm, setBillForm] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    doctorName: '',
    discount: 0,
    discountReason: '',
    taxRate: 0.18,
    notes: '',
  });

  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'cash',
    amount: 0,
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = statusFilter === 'all' 
        ? `${API_URL}/billing/list`
        : `${API_URL}/billing/list?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBills(data.bills);
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

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      {
        itemCode: '',
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        category: 'other',
      },
    ]);
  };

  const updateBillItem = (index: number, field: keyof BillItem, value: any) => {
    const updated = [...billItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate totalPrice
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    }
    
    setBillItems(updated);
  };

  const removeBillItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * billForm.taxRate;
    const totalAmount = subtotal + taxAmount - billForm.discount;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleCreateBill = async () => {
    if (!billForm.patientName || billItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Patient name and at least one item are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { subtotal, taxAmount, totalAmount } = calculateTotals();
      
      const response = await fetch(`${API_URL}/billing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...billForm,
          items: billItems,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bill created successfully',
        });
        setCreateDialogOpen(false);
        resetCreateForm();
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

  const handleProcessPayment = async () => {
    if (!selectedBill || !paymentForm.paymentMethod || paymentForm.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Payment method and valid amount are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/billing/${selectedBill._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Payment processed successfully',
        });
        setPaymentDialogOpen(false);
        resetPaymentForm();
        fetchBills();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to process payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBill = async (billId: string) => {
    if (!confirm('Are you sure you want to cancel this bill?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/billing/${billId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Bill cancelled successfully',
        });
        fetchBills();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to cancel bill',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setBillForm({
      patientId: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      doctorId: '',
      doctorName: '',
      discount: 0,
      discountReason: '',
      taxRate: 0.18,
      notes: '',
    });
    setBillItems([]);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentMethod: 'cash',
      amount: 0,
      transactionId: '',
      notes: '',
    });
  };

  const openPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentForm({ ...paymentForm, amount: bill.balanceAmount });
    setPaymentDialogOpen(true);
  };

  const openViewDialog = async (bill: Bill) => {
    setSelectedBill(bill);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBills = bills.filter((bill) =>
    bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.doctorName && bill.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === 'pending').length,
    paid: bills.filter((b) => b.status === 'paid').length,
    overdue: bills.filter((b) => b.status === 'overdue').length,
    totalRevenue: bills.reduce((sum, b) => sum + b.paidAmount, 0),
    outstanding: bills.reduce((sum, b) => sum + b.balanceAmount, 0),
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing System</h1>
          <p className="text-muted-foreground">Manage bills and payments</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Bill
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${stats.outstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, bill number, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bills found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Bill #</th>
                    <th className="text-left p-3 font-semibold">Patient</th>
                    <th className="text-left p-3 font-semibold">Doctor</th>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-right p-3 font-semibold">Total</th>
                    <th className="text-right p-3 font-semibold">Paid</th>
                    <th className="text-right p-3 font-semibold">Balance</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{bill.billNumber}</td>
                      <td className="p-3">
                        <div>{bill.patientName}</div>
                        {bill.patientEmail && (
                          <div className="text-xs text-muted-foreground">{bill.patientEmail}</div>
                        )}
                      </td>
                      <td className="p-3">{bill.doctorName || '-'}</td>
                      <td className="p-3">{new Date(bill.billDate).toLocaleDateString()}</td>
                      <td className="p-3 text-right font-semibold">${bill.totalAmount.toFixed(2)}</td>
                      <td className="p-3 text-right text-green-600">${bill.paidAmount.toFixed(2)}</td>
                      <td className="p-3 text-right text-orange-600">${bill.balanceAmount.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPaymentDialog(bill)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBill(bill._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Bill Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>Enter patient and bill details</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={billForm.patientName}
                    onChange={(e) => setBillForm({ ...billForm, patientName: e.target.value })}
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <Label htmlFor="patientEmail">Email</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={billForm.patientEmail}
                    onChange={(e) => setBillForm({ ...billForm, patientEmail: e.target.value })}
                    placeholder="patient@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Phone</Label>
                  <Input
                    id="patientPhone"
                    value={billForm.patientPhone}
                    onChange={(e) => setBillForm({ ...billForm, patientPhone: e.target.value })}
                    placeholder="555-0123"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input
                    id="doctorName"
                    value={billForm.doctorName}
                    onChange={(e) => setBillForm({ ...billForm, doctorName: e.target.value })}
                    placeholder="Enter doctor name"
                  />
                </div>
              </div>
            </div>

            {/* Bill Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Bill Items *</h3>
                <Button type="button" size="sm" onClick={addBillItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {billItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div>
                      <Label>Item Code</Label>
                      <Input
                        value={item.itemCode}
                        onChange={(e) => updateBillItem(index, 'itemCode', e.target.value)}
                        placeholder="Code"
                      />
                    </div>
                    <div>
                      <Label>Item Name *</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateBillItem(index, 'itemName', e.target.value)}
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateBillItem(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="lab_test">Lab Test</SelectItem>
                          <SelectItem value="imaging">Imaging</SelectItem>
                          <SelectItem value="room_charge">Room Charge</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateBillItem(index, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateBillItem(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Total</Label>
                        <Input
                          value={item.totalPrice.toFixed(2)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => removeBillItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateBillItem(index, 'description', e.target.value)}
                      placeholder="Item description..."
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Totals and Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discount">Discount Amount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={billForm.discount}
                    onChange={(e) => setBillForm({ ...billForm, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="discountReason">Discount Reason</Label>
                  <Input
                    id="discountReason"
                    value={billForm.discountReason}
                    onChange={(e) => setBillForm({ ...billForm, discountReason: e.target.value })}
                    placeholder="e.g., Senior citizen discount"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={billForm.taxRate}
                    onChange={(e) => setBillForm({ ...billForm, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={billForm.notes}
                    onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Bill Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(billForm.taxRate * 100).toFixed(0)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-red-600">-${billForm.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              resetCreateForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} disabled={loading}>
              {loading ? 'Creating...' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Bill: {selectedBill?.billNumber} | Balance: ${selectedBill?.balanceAmount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentAmount">Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                max={selectedBill?.balanceAmount}
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Payment notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPaymentDialogOpen(false);
              resetPaymentForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={loading}>
              {loading ? 'Processing...' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bill Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
            <DialogDescription>
              {selectedBill?.patientName} | {selectedBill && new Date(selectedBill.billDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedBill.patientName}</div>
                    {selectedBill.patientEmail && <div><strong>Email:</strong> {selectedBill.patientEmail}</div>}
                    {selectedBill.patientPhone && <div><strong>Phone:</strong> {selectedBill.patientPhone}</div>}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Bill Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Bill Date:</strong> {new Date(selectedBill.billDate).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> {new Date(selectedBill.dueDate).toLocaleDateString()}</div>
                    {selectedBill.doctorName && <div><strong>Doctor:</strong> {selectedBill.doctorName}</div>}
                    <div><strong>Status:</strong> <Badge className={getStatusColor(selectedBill.status)}>{selectedBill.status}</Badge></div>
                  </div>
                </Card>
              </div>

              {/* Bill Items */}
              <div>
                <h3 className="font-semibold mb-2">Bill Items</h3>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Item</th>
                      <th className="text-center p-2">Category</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div>{item.itemName}</div>
                          {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline">{item.category}</Badge>
                        </td>
                        <td className="text-center p-2">{item.quantity}</td>
                        <td className="text-right p-2">${item.unitPrice.toFixed(2)}</td>
                        <td className="text-right p-2 font-semibold">${item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedBill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(selectedBill.taxRate * 100).toFixed(0)}%):</span>
                    <span>${selectedBill.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount {selectedBill.discountReason && `(${selectedBill.discountReason})`}:</span>
                      <span className="text-red-600">-${selectedBill.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${selectedBill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount:</span>
                    <span>${selectedBill.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Balance Due:</span>
                    <span>${selectedBill.balanceAmount.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Payment History */}
              {selectedBill.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Payment History</h3>
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Method</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">Transaction ID</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.payments.map((payment, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="p-2 capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                          <td className="p-2 text-right font-semibold">${payment.amount.toFixed(2)}</td>
                          <td className="p-2">{payment.transactionId || '-'}</td>
                          <td className="p-2 text-center">
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notes */}
              {selectedBill.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingSystemPage;
