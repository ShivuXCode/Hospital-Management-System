import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, User, FileText, Download, Eye } from 'lucide-react';
import { API_URL } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

const PatientBillingPage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMyBills();
  }, []);

  const fetchMyBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/patient/my-bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setBills(data.bills || []);
      } else {
        toast({
          title: t('patientBilling.toast.errorTitle'),
          description: data.message || t('patientBilling.toast.errorDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: t('patientBilling.toast.errorTitle'),
        description: t('patientBilling.toast.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDetails = async (billId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/integrated-billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedBill(data.bill);
        setDialogOpen(true);
      } else {
        toast({
          title: t('patientBilling.toast.errorTitle'),
          description: data.message || t('patientBilling.toast.detailsErrorDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast({
        title: t('patientBilling.toast.errorTitle'),
        description: t('patientBilling.toast.detailsErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; className: string }> = {
      draft: { label: t('patientBilling.status.draft'), variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      pending: { label: t('patientBilling.status.pending'), variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
      finalized: { label: t('patientBilling.status.finalized'), variant: 'default', className: 'bg-blue-100 text-blue-800' },
      paid: { label: t('patientBilling.status.paid'), variant: 'default', className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      unpaid: { label: t('patientBilling.paymentStatus.unpaid'), className: 'bg-red-100 text-red-800' },
      partial: { label: t('patientBilling.paymentStatus.partial'), className: 'bg-orange-100 text-orange-800' },
      paid: { label: t('patientBilling.paymentStatus.paid'), className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status] || statusConfig.unpaid;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = () => {
    toast({
      title: t('patientBilling.toast.comingSoonTitle'),
      description: t('patientBilling.toast.comingSoonDesc'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('patientBilling.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('patientBilling.subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('patientBilling.stats.total')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('patientBilling.stats.pending')}</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bills.filter(b => b.status === 'pending' || b.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('patientBilling.stats.unpaid')}</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bills.filter(b => b.paymentStatus === 'unpaid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('patientBilling.stats.amountDue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bills.reduce((sum, b) => sum + ((b.totals?.grandTotal || 0) - (b.paidAmount || 0)), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('patientBilling.card.allBills')}</CardTitle>
          <CardDescription>
            {t('patientBilling.card.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('patientBilling.loading')}</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('patientBilling.empty')}
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
                      <p className="font-medium">{t('patientPrescriptions.doctorPrefix')} {bill.doctorName}</p>
                      {getStatusBadge(bill.status)}
                      {getPaymentStatusBadge(bill.paymentStatus)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(bill.appointmentDate)} {t('patientAppointments.toast.at')} {bill.appointmentTime}</span>
                    </div>
                    {bill.appointment?.reason && (
                      <p className="text-sm text-muted-foreground ml-7">
                        {t('patientAppointments.reasonLabel')} {bill.appointment.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-4 ml-7 mt-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          {t('patientBilling.summary.consultation')} ${bill.consultationFee?.amount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          {t('patientBilling.summary.hospital')} ${bill.totals?.hospitalTotal || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {t('patientBilling.summary.grandTotal')} ${bill.totals?.grandTotal || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => fetchBillDetails(bill._id)} size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('patientBilling.details.view')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('patientBilling.details.title')}</DialogTitle>
            <DialogDescription>
              {t('patientBilling.details.subtitle')}
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6 py-4">
              {/* Bill Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('patientBilling.details.info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('profile.doctorName')}:</span>
                    <span className="font-medium">{t('patientPrescriptions.doctorPrefix')} {selectedBill.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('profile.date')}:</span>
                    <span>{formatDate(selectedBill.appointmentDate)} {t('patientAppointments.toast.at')} {selectedBill.appointmentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('profile.status')}:</span>
                    <div>{getStatusBadge(selectedBill.status)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('patientBilling.details.paymentStatus')}:</span>
                    <div>{getPaymentStatusBadge(selectedBill.paymentStatus)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Fee */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('patientBilling.details.consultation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{t('patientBilling.details.consultation')}</p>
                      {selectedBill.consultationFee?.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedBill.consultationFee.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-bold">${selectedBill.consultationFee?.amount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Hospital Charges */}
              {selectedBill.hospitalCharges && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('patientBilling.details.hospital')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Lab Tests */}
                    {selectedBill.hospitalCharges.labTests?.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">{t('patientBilling.details.labTests')}</p>
                        <div className="space-y-1">
                          {selectedBill.hospitalCharges.labTests.map((test: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{test.testName}</span>
                              <span>${test.amount}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                          <span>{t('patientBilling.details.labSubtotal')}</span>
                          <span>${selectedBill.totals?.labTotal || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Scans */}
                    {selectedBill.hospitalCharges.scans?.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">{t('patientBilling.details.scans')}</p>
                        <div className="space-y-1">
                          {selectedBill.hospitalCharges.scans.map((scan: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{scan.scanType}</span>
                              <span>${scan.amount}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                          <span>{t('patientBilling.details.scanSubtotal')}</span>
                          <span>${selectedBill.totals?.scanTotal || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Medicines */}
                    {selectedBill.hospitalCharges.medicines?.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">{t('patientBilling.details.medicines')}</p>
                        <div className="space-y-1">
                          {selectedBill.hospitalCharges.medicines.map((med: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {med.medicineName} (Qty: {med.quantity} × ${med.unitPrice})
                              </span>
                              <span>${med.amount}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                          <span>{t('patientBilling.details.medicineSubtotal')}</span>
                          <span>${selectedBill.totals?.medicineTotal || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Bed Charges */}
                    {selectedBill.hospitalCharges.bedCharges?.days > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">{t('patientBilling.details.bedCharges')}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {selectedBill.hospitalCharges.bedCharges.days} days × ${selectedBill.hospitalCharges.bedCharges.ratePerDay}/day
                          </span>
                          <span>${selectedBill.totals?.bedTotal || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Service Fees */}
                    {selectedBill.hospitalCharges.serviceFees?.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">{t('patientBilling.details.serviceFees')}</p>
                        <div className="space-y-1">
                          {selectedBill.hospitalCharges.serviceFees.map((fee: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{fee.serviceType}</span>
                              <span>${fee.amount}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                          <span>{t('patientBilling.details.serviceSubtotal')}</span>
                          <span>${selectedBill.totals?.serviceTotal || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Total Summary */}
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('patientBilling.summary.consultation')}</span>
                      <span>${selectedBill.consultationFee?.amount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('patientBilling.summary.hospital')}</span>
                      <span>${selectedBill.totals?.hospitalTotal || 0}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>{t('patientBilling.summary.grandTotal')}</span>
                      <span>${selectedBill.totals?.grandTotal || 0}</span>
                    </div>
                    {selectedBill.paidAmount > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>{t('patientBilling.summary.amountPaid')}</span>
                          <span>-${selectedBill.paidAmount}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg text-red-600">
                          <span>{t('patientBilling.summary.amountDue')}</span>
                          <span>${(selectedBill.totals?.grandTotal - selectedBill.paidAmount).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('patientBilling.button.download')}
                </Button>
                <Button onClick={() => setDialogOpen(false)}>
                  {t('patientBilling.button.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientBillingPage;
