'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Package,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  Leaf,
  Upload,
  X,
  Brain,
  ShieldCheck,
  AlertTriangle,
  ImagePlus,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { createDonation, getCurrentUser } from '@/lib/demo-store';
import { FoodCategory } from '@/lib/types';
import { toast } from 'sonner';
import { AiAnalysis, analyseDescription, analyseImage, fileToDataUrl } from '@/lib/ai';

interface DonationFormProps {
  onBack: () => void;
}

const FOOD_OPTIONS: { value: FoodCategory; label: string; emoji: string }[] = [
  { value: 'cooked-meals', label: 'Cooked meals', emoji: '🍛' },
  { value: 'fresh-produce', label: 'Fresh produce', emoji: '🥬' },
  { value: 'baked-goods', label: 'Baked goods', emoji: '🥖' },
  { value: 'dairy-products', label: 'Dairy', emoji: '🥛' },
  { value: 'packaged-food', label: 'Packaged', emoji: '📦' },
  { value: 'desserts', label: 'Desserts', emoji: '🍰' },
  { value: 'beverages', label: 'Beverages', emoji: '🥤' },
  { value: 'grains-cereals', label: 'Grains', emoji: '🌾' },
];

const CUISINES = ['Indian', 'Chinese', 'Italian', 'Continental', 'Mexican', 'Thai', 'Other'];

const ALLERGEN_OPTIONS = ['dairy', 'gluten', 'eggs', 'nuts', 'soy', 'shellfish'];

const PRESET_IMAGES = [
  'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const CITIES: Record<string, { lat: number; lng: number; state: string }> = {
  Jaipur: { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  Delhi: { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  Pune: { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  Hyderabad: { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  Chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  Kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
};

export function DonationForm({ onBack }: DonationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('Wedding buffet — veg curries & rice');
  const [description, setDescription] = useState(
    'Sealed insulated containers, freshly cooked, prepared this evening for 200 guests. Stored at safe temperature.',
  );
  const [category, setCategory] = useState<FoodCategory>('cooked-meals');
  const [cuisine, setCuisine] = useState('Indian');
  const [quantityKg, setQuantityKg] = useState('25');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [allergens, setAllergens] = useState<string[]>(['dairy', 'gluten']);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pickupArea, setPickupArea] = useState('Mansarovar');
  const [pickupCity, setPickupCity] = useState<keyof typeof CITIES>('Jaipur');
  const [pickupNote, setPickupNote] = useState('Service entrance at the back. Ask for the F&B desk.');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 ');
  const [pickupHours, setPickupHours] = useState('2');

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<AiAnalysis | null>(null);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large — keep it under 5 MB');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setImageUrl(dataUrl);
    setUploadedFile(file);

    // Run AI analysis
    setAiLoading(true);
    try {
      const result = await analyseImage(file, title);
      setAi(result);
      // Auto-fill suggested values
      setCategory(result.detectedCategory);
      setCuisine(result.detectedCuisine);
      toast.success('AI analysis complete', {
        description: `Detected ${result.detectedCategory.replace('-', ' ')} · ${result.confidence}% confidence`,
      });
    } catch {
      toast.error('AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const runQuickAnalyse = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = analyseDescription(`${title} ${description}`, Number(quantityKg) || 0);
    setAi(result);
    setAiLoading(false);
    toast.success('AI re-analysed your donation');
  };

  const toggleAllergen = (a: string) => {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const user = getCurrentUser();
    const donorId = user?.id || 'user_donor_4';
    const cityCoords = CITIES[pickupCity];
    const now = Date.now();

    createDonation({
      donorId,
      title,
      description,
      category,
      cuisine,
      quantityKg: Number(quantityKg) || 5,
      isVegetarian,
      allergens,
      imageUrl,
      notes: `${pickupNote}${contactName ? ` · Contact: ${contactName} (${contactPhone})` : ''}`,
      pickupAddress: {
        street: '—',
        area: pickupArea,
        city: pickupCity,
        state: cityCoords.state,
        postalCode: '400001',
      },
      pickupLocation: {
        // Add small jitter so multiple donations from the same city don't stack
        lat: cityCoords.lat + (Math.random() - 0.5) * 0.04,
        lng: cityCoords.lng + (Math.random() - 0.5) * 0.04,
      },
      pickupWindowStart: new Date(now + 30 * 60_000).toISOString(),
      pickupWindowEnd: new Date(now + Number(pickupHours) * 60 * 60_000).toISOString(),
      expiresAt: new Date(now + 4 * 3_600_000).toISOString(),
      priority: ai && ai.spoilageRisk === 'high' ? 'urgent' : 'high',
    });

    toast.success('Donation listed!', {
      description: ai?.matchedNgo
        ? `Auto-matched with ${ai.matchedNgo.name} · ${ai.matchedNgo.distanceKm} km away`
        : "We're matching you with the closest verified NGO right now.",
    });
    setStep(4);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top bar */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="text-sm font-semibold">New donation</div>
          <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
            Step {Math.min(step, 3)} / 3
          </Badge>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {step === 1 && (
          <Card className="border-2">
            <CardContent className="pt-8 space-y-6">
              <Header
                title="Add a photo + describe the food"
                description="Upload a real photo and our AI will detect category, freshness and shelf life."
              />

              {/* Image upload area */}
              <div className="space-y-3">
                <Label>Photo</Label>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                  <div
                    onClick={triggerFilePicker}
                    className={cn(
                      'relative aspect-square rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer hover:border-emerald-400 transition-all group',
                      imageUrl && 'border-solid border-emerald-300',
                    )}
                  >
                    {imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="donation"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors grid place-items-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold flex items-center gap-1">
                            <ImagePlus className="w-4 h-4" />
                            Replace
                          </div>
                        </div>
                        {uploadedFile && (
                          <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px]">
                            Uploaded
                          </Badge>
                        )}
                      </>
                    ) : (
                      <div className="h-full grid place-items-center text-center p-4 text-muted-foreground">
                        <div>
                          <Upload className="w-7 h-7 mx-auto mb-2" />
                          <div className="text-xs font-semibold">Upload photo</div>
                          <div className="text-[10px] mt-1">JPG / PNG up to 5 MB</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={triggerFilePicker}
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        Upload photo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={runQuickAnalyse}
                        disabled={aiLoading}
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3 mr-1" />
                        )}
                        AI analyse
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Or pick a sample photo for the demo:
                    </div>
                    <div className="flex gap-2">
                      {PRESET_IMAGES.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => {
                            setImageUrl(url);
                            setUploadedFile(null);
                          }}
                          className={cn(
                            'relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                            imageUrl === url
                              ? 'border-emerald-500'
                              : 'border-transparent hover:border-emerald-300',
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI panel */}
                {(aiLoading || ai) && (
                  <Card className="border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white">
                          <Brain className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-sm">AI freshness analysis</div>
                        {ai && (
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            {ai.confidence}% confident
                          </Badge>
                        )}
                      </div>

                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analysing image and predicting shelf life…
                        </div>
                      ) : ai ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <Metric
                              label="Freshness"
                              value={`${ai.freshness}%`}
                              tone={ai.freshness > 90 ? 'good' : ai.freshness > 80 ? 'ok' : 'bad'}
                            />
                            <Metric
                              label="Shelf life"
                              value={`${ai.shelfLifeHours}h`}
                              tone="ok"
                            />
                            <Metric
                              label="Spoilage risk"
                              value={ai.spoilageRisk}
                              tone={
                                ai.spoilageRisk === 'low'
                                  ? 'good'
                                  : ai.spoilageRisk === 'medium'
                                  ? 'ok'
                                  : 'bad'
                              }
                            />
                          </div>
                          <ul className="space-y-1.5">
                            {ai.insights.map((line, i) => (
                              <li
                                key={i}
                                className="text-xs text-emerald-900/80 dark:text-emerald-100/80 flex items-start gap-1.5"
                              >
                                <Sparkles className="w-3 h-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                                {line}
                              </li>
                            ))}
                          </ul>
                          {ai.matchedNgo && (
                            <div className="rounded-lg bg-background border border-emerald-200 p-2.5 flex items-center gap-2 text-xs">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>
                                Best match:{' '}
                                <span className="font-semibold">{ai.matchedNgo.name}</span> ·{' '}
                                {ai.matchedNgo.distanceKm} km · capacity{' '}
                                {ai.matchedNgo.capacity.toLocaleString('en-IN')} meals/day
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Title / description */}
              <div className="space-y-2">
                <Label>What are you donating?</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wedding buffet — veg curries & rice"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="A few words about freshness, packaging, and how it was prepared"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value)}
                      className={cn(
                        'rounded-xl border-2 p-3 text-left transition-all',
                        category === opt.value
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'border-muted hover:border-emerald-300',
                      )}
                    >
                      <div className="text-2xl">{opt.emoji}</div>
                      <div className="text-xs font-semibold mt-1">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cuisine</Label>
                  <Select value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Approx. quantity (kg)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    ≈ {Math.round((Number(quantityKg) || 0) * 3)} servings · 3 meals/kg
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allergens present</Label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((a) => {
                    const active = allergens.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAllergen(a)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all capitalize',
                          active
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : 'border-muted hover:border-amber-300 text-muted-foreground',
                        )}
                      >
                        {active && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="text-sm font-semibold">Vegetarian</div>
                  <div className="text-xs text-muted-foreground">
                    Helps NGOs match dietary requirements faster
                  </div>
                </div>
                <Switch checked={isVegetarian} onCheckedChange={setIsVegetarian} />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!title || !quantityKg}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-2">
            <CardContent className="pt-8 space-y-6">
              <Header
                title="Pickup details"
                description="Where should our volunteer collect from?"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={pickupCity} onValueChange={(v) => setPickupCity(v as keyof typeof CITIES)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CITIES).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Area / locality</Label>
                  <Input value={pickupArea} onChange={(e) => setPickupArea(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pickup notes</Label>
                <Textarea
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-1">
                  <Label>Pickup window</Label>
                  <Select value={pickupHours} onValueChange={setPickupHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Within 1 hour</SelectItem>
                      <SelectItem value="2">Within 2 hours</SelectItem>
                      <SelectItem value="4">Within 4 hours</SelectItem>
                      <SelectItem value="8">Within 8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact name</Label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact phone</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Smart match preview
                    </div>
                    <div className="text-emerald-800/80 dark:text-emerald-100/80 mt-1">
                      Your donation looks like a great fit for{' '}
                      <span className="font-semibold">
                        {ai?.matchedNgo?.name || 'Jaipur Food Bank'}
                      </span>{' '}
                      — {ai?.matchedNgo?.distanceKm || 1.4} km away with capacity for{' '}
                      {(ai?.matchedNgo?.capacity || 1200).toLocaleString('en-IN')} meals
                      today.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-2">
            <CardContent className="pt-8 space-y-6">
              <Header title="Review & publish" description="Last check before we list it." />

              <div className="rounded-2xl border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Package className="w-3 h-3 mr-1" />
                      {quantityKg} kg
                    </Badge>
                    <Badge variant="secondary">
                      <Leaf className="w-3 h-3 mr-1" />
                      {Math.round((Number(quantityKg) || 0) * 3)} servings
                    </Badge>
                    <Badge variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {pickupArea}, {pickupCity}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Within {pickupHours} hr
                    </Badge>
                    {ai && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <Brain className="w-3 h-3 mr-1" />
                        AI: {ai.freshness}% fresh
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      Publish donation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-2 border-emerald-200">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 grid place-items-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">Your donation is live</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {ai?.matchedNgo
                  ? `We've smart-matched you with ${ai.matchedNgo.name} (${ai.matchedNgo.distanceKm} km). A volunteer will be on the way shortly.`
                  : "We're matching you with the closest verified NGO right now."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push('/dashboard')}
                >
                  Open dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/map')}>
                  View on map
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'ok' | 'bad';
}) {
  const tones = {
    good: 'bg-emerald-100 text-emerald-800',
    ok: 'bg-amber-100 text-amber-800',
    bad: 'bg-rose-100 text-rose-800',
  };
  return (
    <div className="rounded-lg border bg-background p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className={cn(
          'inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold capitalize',
          tones[tone],
        )}
      >
        {value}
      </div>
    </div>
  );
}
