import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL, apiService } from '@/services/api';

interface ReviewDoc {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  patient?: { name?: string };
  appointment?: { date?: string; time?: string };
}

const DoctorReviewsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<{ id?: string; averageRating?: number; reviewCount?: number }>({});

  const loadDoctorAndReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const meRes = await fetch(`${API_URL}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } });
      const meData = await meRes.json();
      if (meData.success && meData.doctor) {
        const info = {
          id: meData.doctor._id || meData.doctor.id,
          averageRating: typeof meData.doctor.averageRating === 'number' ? meData.doctor.averageRating : 0,
          reviewCount: typeof meData.doctor.reviewCount === 'number' ? meData.doctor.reviewCount : 0,
        };
        setDoctorInfo(info);
        if (info.id) {
          const revRes = await apiService.getDoctorReviews(info.id);
          if (revRes.success) {
            setReviews(revRes.reviews || []);
          } else {
            setReviews([]);
          }
        }
      } else {
        toast({ title: 'Error', description: 'Doctor profile not found', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Failed to load reviews', e);
      toast({ title: 'Error', description: 'Failed to load reviews', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDoctorAndReviews(); }, []);

  const totalReviews = reviews.length;
  const averageRating = doctorInfo.averageRating ?? (totalReviews ? reviews.reduce((a,r)=>a + (r.rating||0),0)/ totalReviews : 0);
  const ratingDistribution = [5,4,3,2,1].map(r => {
    const count = reviews.filter(rv => rv.rating === r).length;
    return { rating: r, count, percentage: totalReviews ? (count / totalReviews) * 100 : 0 };
  });

  const filteredReviews = reviews
    .filter(r => {
      const name = r.patient?.name || '';
      const comment = r.comment || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === 'all' || r.rating === parseInt(filterRating);
      return matchesSearch && matchesRating;
    })
    .sort((a,b) => {
      if (sortBy === 'recent') return new Date(b.createdAt || b.appointment?.date || 0).getTime() - new Date(a.createdAt || a.appointment?.date || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || a.appointment?.date || 0).getTime() - new Date(b.createdAt || b.appointment?.date || 0).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  const getInitials = (name?: string) => {
    if (!name) return 'PT';
    return name.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Patient Reviews & Ratings</h1>
        <p className="text-muted-foreground">View and manage patient feedback</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100"><Star className="h-4 w-4 text-yellow-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(st => (
                <Star key={st} className={`h-4 w-4 ${st <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{doctorInfo.reviewCount || totalReviews} total</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">5★ Reviews</CardTitle>
            <div className="p-2 rounded-lg bg-green-100"><Star className="h-4 w-4 text-green-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.filter(r=>r.rating===5).length}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalReviews ? ((reviews.filter(r=>r.rating===5).length/ totalReviews)*100).toFixed(0) : 0}% of total</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating Distribution</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100"><Star className="h-4 w-4 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingDistribution.map(d => (
                <div key={d.rating} className="flex items-center gap-2">
                  <span className="text-xs w-6">{d.rating}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-yellow-400" style={{width:`${d.percentage}%`}} /></div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        {/* Reviews List */}
        <Card className="shadow-md lg:col-span-3">
          <CardHeader>
            <CardTitle>All Reviews ({filteredReviews.length})</CardTitle>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No reviews</p>
                <p className="text-sm mt-1">Patients have not submitted reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(review.patient?.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{review.patient?.name || 'Patient'}</p>
                              <Badge variant="secondary" className="text-xs">Verified Patient</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt || review.appointment?.date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Review Comment */}
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {review.comment || 'No comment'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorReviewsPage;
