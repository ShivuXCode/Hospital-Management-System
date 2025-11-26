import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, Loader2, Calendar, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const PatientReviewsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [reviewableAppointments, setReviewableAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviewableAppointments = useCallback(async () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = apiService.getUser();
    if (!user || user.role !== 'Patient') {
      toast({
        title: t('patientReviews.toast.accessDeniedTitle'),
        description: t('patientReviews.toast.accessDeniedDesc'),
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/doctors/reviewable-appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setReviewableAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Failed to load reviewable appointments:', error);
      toast({
        title: t('patientBilling.toast.errorTitle'),
        description: t('patientBilling.toast.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    loadReviewableAppointments();
  }, [loadReviewableAppointments]);

  const handleOpenReviewModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    if (appointment.review) {
      setReviewForm({ rating: appointment.review.rating, comment: appointment.review.comment || '' });
    } else {
      setReviewForm({ rating: 0, comment: '' });
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || reviewForm.rating === 0) {
      toast({
        title: t('patientReviews.toast.invalidRatingTitle'),
        description: t('patientReviews.toast.invalidRatingDesc'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const doctorId = selectedAppointment.doctor?._id || selectedAppointment.doctor;
      
      const response = await fetch(`/api/doctors/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          appointmentId: selectedAppointment._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: selectedAppointment.hasReview
            ? t('patientReviews.toast.successUpdate')
            : t('patientReviews.toast.successNew'),
        });
        setShowReviewModal(false);
        setReviewForm({ rating: 0, comment: '' });
        loadReviewableAppointments();
      } else {
        toast({
          title: t('patientBilling.toast.errorTitle'),
          description: data.message || t('patientReviews.toast.error'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('patientBilling.toast.errorTitle'),
        description: t('patientReviews.toast.error'),
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('patientReviews.title')}</h1>
        <p className="text-muted-foreground">{t('patientReviews.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviewableAppointments.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('patientReviews.empty.title')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t('patientReviews.empty.desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviewableAppointments.map((apt) => (
            <Card key={apt._id} className="shadow-soft hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Dr. {apt.doctor?.name || apt.doctorName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {apt.doctor?.specialization && (
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Badge variant="outline">{apt.doctor.specialization}</Badge>
                        </span>
                      )}
                      {apt.doctor?.department && (
                        <span className="text-sm text-muted-foreground">{apt.doctor.department}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant={apt.hasReview ? 'outline' : 'default'}
                    onClick={() => handleOpenReviewModal(apt)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {apt.hasReview ? t('patientReviews.button.edit') : t('patientReviews.button.write')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(apt.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <span>•</span>
                  <span>{apt.time}</span>
                </div>

                {apt.hasReview && apt.review && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">{t('patientReviews.review.label')}</Label>
                      <Badge variant="secondary">{t('patientReviews.review.badge')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= apt.review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{apt.review.rating} / 5</span>
                    </div>
                    {apt.review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">{apt.review.comment}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.hasReview ? t('patientReviews.modal.editTitle') : t('patientReviews.modal.newTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('patientReviews.modal.subtitle')}{' '}
              {t('patientPrescriptions.doctorPrefix')} {selectedAppointment?.doctor?.name || selectedAppointment?.doctorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('patientReviews.modal.ratingLabel')}</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer ${
                        star <= reviewForm.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                {reviewForm.rating > 0 && (
                  <span className="ml-2 text-sm font-medium">{reviewForm.rating} / 5</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">{t('patientReviews.modal.reviewLabel')}</Label>
              <Textarea
                id="review-comment"
                placeholder={t('patientReviews.modal.reviewPlaceholder')}
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {reviewForm.comment.length} / 1000
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewModal(false);
                setReviewForm({ rating: 0, comment: '' });
              }}
              disabled={submittingReview}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview || reviewForm.rating === 0}>
              {submittingReview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                selectedAppointment?.hasReview ? t('patientReviews.modal.updateButton') : t('patientReviews.modal.submitButton')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientReviewsPage;
