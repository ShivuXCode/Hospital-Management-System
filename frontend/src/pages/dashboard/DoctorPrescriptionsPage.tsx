import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Plus, Loader2, User, Pill, Calendar, X, Edit2, Trash2, Eye } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const DoctorPrescriptionsPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);

  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    diagnosis: '',
    validUntil: '',
    notes: '',
  });
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', duration: '', instructions: '' }
  ]);
  const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([]);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState<number | null>(null);
  const [searchingMedicine, setSearchingMedicine] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  // Handle autofill from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (!state || patients.length === 0) return;

    const { patientId, patientName } = state;
    console.log('🔍 Auto-fill triggered with state:', state);
    console.log('📋 Loaded patients:', patients.map(p => ({ id: p._id, name: p.name })));

    let matchedPatient = null;

    if (patientId) {
      matchedPatient = patients.find((p) => String(p._id) === String(patientId));
      if (!matchedPatient) {
        console.warn('⚠️ Patient ID not found in list:', patientId);
      }
    }

    if (!matchedPatient && patientName) {
      matchedPatient = patients.find(
        (p) => p.name?.toLowerCase().trim() === patientName?.toLowerCase().trim()
      );
      if (!matchedPatient) {
        console.warn('⚠️ Patient name not found in list:', patientName);
      }
    }

    if (matchedPatient) {
      console.log('✅ Auto-filled patient:', matchedPatient);
      setPrescriptionForm((prev) => ({ ...prev, patientId: matchedPatient._id }));
    } else {
      setPrescriptionForm((prev) => ({ ...prev, patientId: '' }));
    }

    setTimeout(() => {
      setIsAddPrescriptionOpen(true);
    }, 50);

    window.history.replaceState({}, document.title);
  }, [location.state, patients]);

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPrescriptions();
      if (!data.success) throw new Error(data.message || 'Failed to fetch prescriptions');
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prescriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = async (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);

    // Fetch medicine suggestions when name field is updated and has 2+ characters
    if (field === 'name' && value.length >= 2) {
      setActiveMedicineIndex(index);
      setSearchingMedicine(true);
      try {
        // Using RxNav API (NIH) - more flexible search
        const searchTerm = encodeURIComponent(value);
        const response = await fetch(
          `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${searchTerm}`
        );
        const data = await response.json();
        
        if (data.suggestionGroup?.suggestionList?.suggestion) {
          const suggestions = data.suggestionGroup.suggestionList.suggestion
            .slice(0, 10)
            .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
          setMedicineSuggestions(suggestions);
        } else {
          // Fallback: try approximate match search
          const approxResponse = await fetch(
            `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${searchTerm}&maxEntries=10`
          );
          const approxData = await approxResponse.json();
          
          if (approxData.approximateGroup?.candidate) {
            const candidates = Array.isArray(approxData.approximateGroup.candidate)
              ? approxData.approximateGroup.candidate
              : [approxData.approximateGroup.candidate];
            
            const suggestions = candidates
              .map((c: any) => c.name)
              .filter((name: string) => name)
              .slice(0, 10);
            
            setMedicineSuggestions(suggestions);
          } else {
            setMedicineSuggestions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching medicine suggestions:', error);
        setMedicineSuggestions([]);
      } finally {
        setSearchingMedicine(false);
      }
    } else if (field === 'name') {
      setMedicineSuggestions([]);
      setActiveMedicineIndex(null);
    }
  };

  const detectMedicineType = (medicineName: string): string => {
    const name = medicineName.toLowerCase();
    
    // Syrup/Liquid patterns
    if (name.includes('syrup') || name.includes('suspension') || name.includes('solution') || 
        name.includes('liquid') || name.includes('drops') || name.includes('elixir')) {
      return 'syrup';
    }
    
    // Powder patterns
    if (name.includes('powder') || name.includes('sachet') || name.includes('granules')) {
      return 'powder';
    }
    
    // Injection patterns
    if (name.includes('injection') || name.includes('vial') || name.includes('ampoule')) {
      return 'injection';
    }
    
    // Cream/Ointment patterns
    if (name.includes('cream') || name.includes('ointment') || name.includes('gel') || 
        name.includes('lotion') || name.includes('topical')) {
      return 'topical';
    }
    
    // Inhaler patterns
    if (name.includes('inhaler') || name.includes('nebulizer') || name.includes('spray')) {
      return 'inhaler';
    }
    
    // Capsule patterns
    if (name.includes('capsule') || name.includes('cap')) {
      return 'capsule';
    }
    
    // Default to tablet
    return 'tablet';
  };

  const getDosageOptions = (medicineType: string): string[] => {
    switch (medicineType) {
      case 'syrup':
        return [
          '2.5ml once daily',
          '2.5ml twice daily',
          '2.5ml three times daily',
          '5ml once daily',
          '5ml twice daily',
          '5ml three times daily',
          '10ml once daily',
          '10ml twice daily',
          '15ml twice daily',
          '1 teaspoon once daily',
          '1 teaspoon twice daily',
          '1 teaspoon three times daily',
          '2 teaspoons twice daily',
          'As needed',
        ];
      case 'powder':
        return [
          '1 sachet once daily',
          '1 sachet twice daily',
          '1 sachet three times daily',
          '1 scoop once daily',
          '1 scoop twice daily',
          '2 scoops once daily',
          'Mix 1 sachet in water once daily',
          'Mix 1 sachet in water twice daily',
          'As directed',
        ];
      case 'injection':
        return [
          '1ml once daily',
          '2ml once daily',
          '1ml twice daily',
          '5ml once daily',
          'As prescribed',
          'As directed by physician',
        ];
      case 'topical':
        return [
          'Apply thin layer once daily',
          'Apply thin layer twice daily',
          'Apply thin layer three times daily',
          'Apply to affected area once daily',
          'Apply to affected area twice daily',
          'Apply to affected area as needed',
          'Apply and massage gently twice daily',
        ];
      case 'inhaler':
        return [
          '1 puff once daily',
          '1 puff twice daily',
          '2 puffs once daily',
          '2 puffs twice daily',
          '2 puffs three times daily',
          '1-2 puffs as needed',
          'As needed for symptoms',
        ];
      case 'capsule':
      case 'tablet':
      default:
        return [
          '1 tablet once daily',
          '1 tablet twice daily',
          '1 tablet three times daily',
          '2 tablets once daily',
          '2 tablets twice daily',
          '1 tablet every 6 hours',
          '1 tablet every 8 hours',
          '1 tablet every 12 hours',
          '1 tablet at bedtime',
          'As needed',
        ];
    }
  };

  const getInstructionOptions = (medicineType: string): string[] => {
    switch (medicineType) {
      case 'syrup':
        return [
          'Shake well before use',
          'Take after meals',
          'Take before meals',
          'Take with water',
          'Measure with provided cup/spoon',
          'Store in refrigerator',
          'Do not refrigerate',
          'As directed',
        ];
      case 'powder':
        return [
          'Mix in water before drinking',
          'Mix in milk before drinking',
          'Take on empty stomach',
          'Take after meals',
          'Dissolve completely before consuming',
          'Mix with cold water only',
          'As directed',
        ];
      case 'injection':
        return [
          'To be given by healthcare professional',
          'Intramuscular injection',
          'Intravenous injection',
          'Subcutaneous injection',
          'Rotate injection sites',
          'As directed by physician',
        ];
      case 'topical':
        return [
          'Apply to clean, dry skin',
          'Apply to affected area only',
          'Wash hands before and after application',
          'Do not apply on broken skin',
          'Avoid contact with eyes',
          'For external use only',
          'Massage gently until absorbed',
          'Do not cover with bandage',
        ];
      case 'inhaler':
        return [
          'Shake before use',
          'Rinse mouth after use',
          'Breathe in deeply while pressing',
          'Hold breath for 10 seconds',
          'Wait 1 minute between puffs',
          'Use spacer if available',
          'As directed',
        ];
      case 'capsule':
      case 'tablet':
      default:
        return [
          'Take with water',
          'Take after meals',
          'Take before meals',
          'Take with meals',
          'Take on empty stomach',
          'Take before bedtime',
          'Take in the morning',
          'Do not crush or chew',
          'Swallow whole',
          'Can be taken with or without food',
          'Take with plenty of fluids',
          'Avoid alcohol',
          'As directed',
        ];
    }
  };

  const selectMedicine = (index: number, medicineName: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], name: medicineName };
    setMedicines(updated);
    setMedicineSuggestions([]);
    setActiveMedicineIndex(null);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setMedicineSuggestions([]);
        setActiveMedicineIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorName = user.name || 'Doctor';

      // Validate at least one medicine has a name
      const validMedicines = medicines.filter(m => m.name.trim());
      if (validMedicines.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one medicine',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const data = await apiService.createPrescription({
        patientId: prescriptionForm.patientId,
        doctorName,
        diagnosis: prescriptionForm.diagnosis,
        validUntil: prescriptionForm.validUntil,
        notes: prescriptionForm.notes,
        medicines: validMedicines,
      });

      if (!data.success) throw new Error(data.message || 'Failed to create prescription');

      toast({
        title: 'Success',
        description: 'Prescription created successfully',
      });
      
      setIsAddPrescriptionOpen(false);
      setPrescriptionForm({
        patientId: '',
        diagnosis: '',
        validUntil: '',
        notes: '',
      });
      setMedicines([{ name: '', dosage: '', duration: '', instructions: '' }]);
      
      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create prescription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrescription = (prescription: any) => {
    setIsEditMode(true);
    setEditingPrescriptionId(prescription._id);
    
    // Populate form with existing data
    setPrescriptionForm({
      patientId: prescription.patient?._id || '',
      diagnosis: prescription.diagnosis || '',
      validUntil: prescription.validUntil ? new Date(prescription.validUntil).toISOString().split('T')[0] : '',
      notes: prescription.notes || '',
    });
    
    // Populate medicines
    if (Array.isArray(prescription.medicines) && prescription.medicines.length > 0) {
      setMedicines(prescription.medicines.map((m: any) => ({
        name: m.name || '',
        dosage: m.dosage || '',
        duration: m.duration || '',
        instructions: m.instructions || ''
      })));
    } else {
      setMedicines([{ name: '', dosage: '', duration: '', instructions: '' }]);
    }
    
    setIsAddPrescriptionOpen(true);
  };

  const handleUpdatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescriptionId) return;
    
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorName = user.name || 'Doctor';

      const validMedicines = medicines.filter(m => m.name.trim());
      if (validMedicines.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one medicine',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const data = await apiService.updatePrescription(editingPrescriptionId, {
        doctorName,
        diagnosis: prescriptionForm.diagnosis,
        validUntil: prescriptionForm.validUntil,
        notes: prescriptionForm.notes,
        medicines: validMedicines,
      });

      if (!data.success) throw new Error(data.message || 'Failed to update prescription');

      toast({
        title: 'Success',
        description: 'Prescription updated successfully. Changes are now visible to assigned nurses and the patient.',
      });
      
      setIsAddPrescriptionOpen(false);
      setIsEditMode(false);
      setEditingPrescriptionId(null);
      setPrescriptionForm({
        patientId: '',
        diagnosis: '',
        validUntil: '',
        notes: '',
      });
      setMedicines([{ name: '', dosage: '', duration: '', instructions: '' }]);
      
      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update prescription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription? This will remove it for assigned nurses and the patient.')) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.deletePrescription(prescriptionId);
      
      if (!data.success) throw new Error(data.message || 'Failed to delete prescription');

      toast({
        title: 'Success',
        description: 'Prescription deleted successfully. Changes are now visible to assigned nurses and the patient.',
      });
      
      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete prescription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsAddPrescriptionOpen(false);
    setIsEditMode(false);
    setEditingPrescriptionId(null);
    setPrescriptionForm({
      patientId: '',
      diagnosis: '',
      validUntil: '',
      notes: '',
    });
    setMedicines([{ name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const getStatusBadge = (validUntil?: string) => {
    if (!validUntil) return <Badge className="bg-gray-100 text-gray-700">-</Badge>;
    const d = new Date(validUntil);
    const active = !isNaN(d.getTime()) && d.getTime() >= Date.now();
    return active ? (
      <Badge className="bg-green-100 text-green-700">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700">Expired</Badge>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">Create and manage patient prescriptions</p>
        </div>
        <Dialog open={isAddPrescriptionOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Prescription' : 'Create New Prescription'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update prescription details. Changes will be visible to assigned nurses and the patient.'
                  : 'Fill in the details to create a new prescription for your patient'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={isEditMode ? handleUpdatePrescription : handleAddPrescription} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Select
                  value={prescriptionForm.patientId}
                  onValueChange={(value) =>
                    setPrescriptionForm({ ...prescriptionForm, patientId: value })
                  }
                  required
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditMode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Patient cannot be changed when editing
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={prescriptionForm.diagnosis}
                    onChange={(e) =>
                      setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })
                    }
                    placeholder="e.g., Common Cold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <DateInput
                    id="validUntil"
                    required
                    value={prescriptionForm.validUntil}
                    onChange={(e) =>
                      setPrescriptionForm({ ...prescriptionForm, validUntil: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Select expiry date"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Medicines</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addMedicine}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Medicine
                  </Button>
                </div>

                {medicines.map((medicine, index) => {
                  const medicineType = detectMedicineType(medicine.name);
                  const dosageOptions = getDosageOptions(medicineType);
                  const instructionOptions = getInstructionOptions(medicineType);
                  
                  return (
                  <Card key={index} className="p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Label className="text-sm font-medium">
                          Medicine {index + 1}
                          {medicine.name && (
                            <Badge variant="outline" className="ml-2 text-xs capitalize">
                              {medicineType}
                            </Badge>
                          )}
                        </Label>
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 text-destructive hover:text-destructive"
                            onClick={() => removeMedicine(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5 relative">
                          <Label htmlFor={`medicine-name-${index}`} className="text-xs">
                            Medicine Name *
                          </Label>
                          <Input
                            id={`medicine-name-${index}`}
                            required
                            value={medicine.name}
                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                            placeholder="Type at least 2 characters..."
                            autoComplete="off"
                          />
                          {activeMedicineIndex === index && (searchingMedicine || medicineSuggestions.length > 0) && (
                            <div 
                              ref={suggestionsRef}
                              className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto"
                            >
                              {searchingMedicine ? (
                                <div className="p-3 text-sm text-center text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                  Searching medicines...
                                </div>
                              ) : medicineSuggestions.length > 0 ? (
                                medicineSuggestions.map((suggestion, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0 transition-colors flex items-center gap-2"
                                    onClick={() => selectMedicine(index, suggestion)}
                                  >
                                    <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="font-medium">{suggestion}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-sm text-center text-muted-foreground">
                                  No medicines found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`medicine-dosage-${index}`} className="text-xs">
                            Dosage *
                          </Label>
                          <Select
                            value={medicine.dosage}
                            onValueChange={(value) => updateMedicine(index, 'dosage', value)}
                            required
                          >
                            <SelectTrigger id={`medicine-dosage-${index}`}>
                              <SelectValue placeholder="Select dosage" />
                            </SelectTrigger>
                            <SelectContent>
                              {dosageOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`medicine-duration-${index}`} className="text-xs">
                            Duration
                          </Label>
                          <Select
                            value={medicine.duration}
                            onValueChange={(value) => updateMedicine(index, 'duration', value)}
                          >
                            <SelectTrigger id={`medicine-duration-${index}`}>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3 days">3 days</SelectItem>
                              <SelectItem value="5 days">5 days</SelectItem>
                              <SelectItem value="7 days">7 days</SelectItem>
                              <SelectItem value="10 days">10 days</SelectItem>
                              <SelectItem value="14 days">14 days</SelectItem>
                              <SelectItem value="21 days">21 days</SelectItem>
                              <SelectItem value="1 month">1 month</SelectItem>
                              <SelectItem value="2 months">2 months</SelectItem>
                              <SelectItem value="3 months">3 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="Until review">Until review</SelectItem>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`medicine-instructions-${index}`} className="text-xs">
                            Instructions
                          </Label>
                          <Select
                            value={medicine.instructions}
                            onValueChange={(value) => updateMedicine(index, 'instructions', value)}
                          >
                            <SelectTrigger id={`medicine-instructions-${index}`}>
                              <SelectValue placeholder="Select instructions" />
                            </SelectTrigger>
                            <SelectContent>
                              {instructionOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                )})}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={prescriptionForm.notes}
                  onChange={(e) =>
                    setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })
                  }
                  placeholder="Special instructions for the patient..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {isEditMode ? 'Update Prescription' : 'Create Prescription'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No prescriptions found</p>
              <p className="text-sm mt-1">Create your first prescription</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription: any) => {
                    const firstMed = Array.isArray(prescription.medicines) ? prescription.medicines[0] : undefined;
                    const issued = prescription.dateIssued || prescription.createdAt;
                    return (
                    <TableRow key={prescription._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{prescription.patient?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {firstMed?.name || '-'}
                            {Array.isArray(prescription.medicines) && prescription.medicines.length > 1
                              ? ` (+${prescription.medicines.length - 1})`
                              : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{firstMed?.dosage || '-'}</TableCell>
                      <TableCell>{firstMed?.duration || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {issued ? new Date(issued).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }) : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(prescription.validUntil)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {prescription.notes || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrescription(prescription)}
                            disabled={loading}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrescription(prescription._id)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPrescriptionsPage;
