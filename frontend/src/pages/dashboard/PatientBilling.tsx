import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bill {
  _id: string;
  billNumber: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  paidDate?: string;
}

const PatientBilling = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      // TODO: Implement getBills API endpoint
      // const response = await apiService.getBills();
      // For now, use empty array until backend implements this endpoint
      const response = { success: true, bills: [] };

      if (response && response.success && response.bills) {
        setBills(response.bills);
      }
    } catch (error) {
      console.error('Failed to load bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalPending = bills
    .filter((bill) => bill.status === 'pending' || bill.status === 'overdue')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalPaid = bills
    .filter((bill) => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your medical bills and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <p className="text-2xl font-bold text-red-600">
                ₹{totalPending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{bills.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : bills.length > 0 ? (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <Card key={bill._id} className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Bill #{bill.billNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bill.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-bold text-lg flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-primary" />
                      ₹{bill.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {bill.status === 'paid' ? 'Paid On' : 'Due Date'}
                    </p>
                    <p className="font-medium">
                      {bill.status === 'paid' && bill.paidDate
                        ? new Date(bill.paidDate).toLocaleDateString()
                        : bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  {bill.status !== 'paid' && (
                    <Button size="sm" className="gradient-primary">
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Bills Found</h3>
            <p className="text-muted-foreground">You have no billing records yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientBilling;
