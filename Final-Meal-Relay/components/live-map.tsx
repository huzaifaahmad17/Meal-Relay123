'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
// Leaflet is lazy-imported inside useEffect (see initEffect below) so the JS
// never enters Next.js's server bundle graph. Importing it at the module top
// level would cause webpack to emit a `vendor-chunks/leaflet.js` reference
// even though this component is dynamically loaded with `ssr: false`,
// which breaks `next start` at runtime.
import type * as LeafletNS from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Building2,
  Heart,
  Truck,
  Layers,
  Locate,
  Navigation,
  Clock,
  Users,
  Package,
} from 'lucide-react';
import { useDemoStore } from '@/lib/use-demo-store';
import { getDonations, getUsers } from '@/lib/demo-store';
import { Donation, DemoUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

type FilterKey = 'all' | 'donors' | 'ngos' | 'volunteers' | 'donations';

export function LiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const layerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const routeRef = useRef<LeafletNS.Polyline | null>(null);
  const animatedMarkerRef = useRef<LeafletNS.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  const [leafletReady, setLeafletReady] = useState(false);

  const users = useDemoStore(() => getUsers(), []);
  const donations = useDemoStore(() => getDonations(), []);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<{
    type: 'user' | 'donation';
    payload: DemoUser | Donation;
  } | null>(null);
  const [tileStyle, setTileStyle] = useState<keyof typeof TILE_URLS>('light');

  // Initialize map (lazy-load leaflet here so it never enters the SSR bundle).
  //
  // React 18 StrictMode runs effects twice in dev (mount → unmount → mount).
  // Leaflet stamps the container with `_leaflet_id` on init and refuses to
  // re-initialize an already-stamped container, so we have to:
  //   1. cancel any in-flight async init when the effect tears down
  //   2. fully `.remove()` the previous map instance
  //   3. clear `_leaflet_id` + innerHTML on the container so the next mount
  //      gets a fresh node
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      // If a stale map is still attached to this DOM node (e.g. from the
      // first StrictMode pass), wipe it out before creating a new one.
      if ((container as any)._leaflet_id) {
        try {
          delete (container as any)._leaflet_id;
        } catch {}
        container.innerHTML = '';
      }

      leafletRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(container, {
        zoomControl: false,
        preferCanvas: true,
      }).setView([26.9124, 75.7873], 12);

      L.tileLayer(TILE_URLS[tileStyle], {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setLeafletReady(true);
    })();

    return () => {
      cancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
      layerRef.current = null;
      routeRef.current = null;
      animatedMarkerRef.current = null;
      leafletRef.current = null;
      if (container) {
        try {
          delete (container as any)._leaflet_id;
        } catch {}
        container.innerHTML = '';
      }
      setLeafletReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tiles when style changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    map.eachLayer((layer) => {
      if ((layer as any)._url) map.removeLayer(layer);
    });
    L.tileLayer(TILE_URLS[tileStyle], {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
    }).addTo(map);
  }, [tileStyle, leafletReady]);

  const visible = useMemo(() => {
    const visibleUsers = users.filter((u) => {
      if (filter === 'all') return true;
      if (filter === 'donors') return u.role === 'donor';
      if (filter === 'ngos') return u.role === 'ngo';
      if (filter === 'volunteers') return u.role === 'volunteer';
      return false;
    });
    const visibleDonations =
      filter === 'all' || filter === 'donations'
        ? donations.filter((d) => d.status !== 'cancelled')
        : [];
    return { visibleUsers, visibleDonations };
  }, [filter, users, donations]);

  // Render markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    visible.visibleUsers.forEach((u) => {
      if (u.role === 'admin') return;
      const icon = makeUserIcon(L, u);
      const marker = L.marker([u.location.lat, u.location.lng], { icon });
      marker.on('click', () => setSelected({ type: 'user', payload: u }));
      marker.bindTooltip(u.name, { direction: 'top', offset: [0, -10] });
      layer.addLayer(marker);
    });

    visible.visibleDonations.forEach((d) => {
      if (filter === 'donors' || filter === 'ngos' || filter === 'volunteers') return;
      const icon = makeDonationIcon(L, d);
      const marker = L.marker([d.pickupLocation.lat, d.pickupLocation.lng], { icon });
      marker.on('click', () => setSelected({ type: 'donation', payload: d }));
      marker.bindTooltip(d.title, { direction: 'top', offset: [0, -10] });
      layer.addLayer(marker);
    });
  }, [visible, filter, leafletReady]);

  // Live route animation: pick the in-transit donation that has a tracking path
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (animatedMarkerRef.current) {
      map.removeLayer(animatedMarkerRef.current);
      animatedMarkerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const live =
      selected?.type === 'donation' && (selected.payload as Donation).trackingPath
        ? (selected.payload as Donation)
        : donations.find(
            (d) => d.status === 'in-transit' && d.trackingPath && d.trackingPath.length > 1,
          );

    if (!live || !live.trackingPath || live.trackingPath.length < 2) return;

    const path: [number, number][] = live.trackingPath.map((p) => [p.lat, p.lng]);
    const route = L.polyline(path, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      dashArray: '8 6',
    }).addTo(map);
    routeRef.current = route;

    const truckIcon = L.divIcon({
      html: `<div class="zwl-truck">🚚</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    const animMarker = L.marker(path[0], { icon: truckIcon }).addTo(map);
    animatedMarkerRef.current = animMarker;

    let segment = 0;
    let t = 0;
    const speed = 0.0035;

    const animate = () => {
      t += speed;
      if (t >= 1) {
        t = 0;
        segment = (segment + 1) % (path.length - 1);
      }
      const a = path[segment];
      const b = path[segment + 1];
      const lat = a[0] + (b[0] - a[0]) * t;
      const lng = a[1] + (b[1] - a[1]) * t;
      animMarker.setLatLng([lat, lng]);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    if (selected?.type === 'donation') {
      map.fitBounds(route.getBounds(), { padding: [60, 60], maxZoom: 14 });
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [selected, donations, leafletReady]);

  const handleLocate = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([19.0760, 72.8777], 11);
  };

  const totals = useMemo(() => {
    return {
      donors: users.filter((u) => u.role === 'donor').length,
      ngos: users.filter((u) => u.role === 'ngo').length,
      volunteers: users.filter((u) => u.role === 'volunteer').length,
      active: donations.filter((d) =>
        ['pending', 'accepted', 'assigned', 'picked-up', 'in-transit'].includes(d.status),
      ).length,
    };
  }, [users, donations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div className="relative rounded-2xl overflow-hidden border bg-background min-h-[520px]">
        <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {!leafletReady && (
          <div className="absolute inset-0 grid place-items-center text-center bg-muted/40 z-[2]">
            <div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-3" />
              <div className="text-sm text-muted-foreground">Loading map…</div>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-[400]">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList className="bg-background/90 backdrop-blur shadow-lg">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="donors">Donors</TabsTrigger>
              <TabsTrigger value="ngos">NGOs</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-background/90 backdrop-blur shadow-lg"
              onClick={() =>
                setTileStyle((s) => (s === 'light' ? 'dark' : s === 'dark' ? 'street' : 'light'))
              }
            >
              <Layers className="w-4 h-4 mr-1" />
              Style
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-background/90 backdrop-blur shadow-lg"
              onClick={handleLocate}
            >
              <Locate className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-[400] bg-background/90 backdrop-blur shadow-lg rounded-2xl border px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <Legend color="#10b981" label="Donor" />
            <Legend color="#f59e0b" label="NGO" />
            <Legend color="#3b82f6" label="Volunteer" />
            <Legend color="#ef4444" label="Pickup" />
          </div>
        </div>

        <div className="absolute top-20 left-4 z-[400] bg-background/90 backdrop-blur shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {totals.active} active deliveries
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SidebarStat icon={Heart} label="Donors" value={totals.donors} tone="emerald" />
          <SidebarStat icon={Building2} label="NGOs" value={totals.ngos} tone="amber" />
          <SidebarStat icon={Truck} label="Volunteers" value={totals.volunteers} tone="blue" />
          <SidebarStat icon={Package} label="Active" value={totals.active} tone="rose" />
        </div>

        {selected ? (
          <SelectionCard selection={selected} onClose={() => setSelected(null)} />
        ) : (
          <Card className="border">
            <CardContent className="pt-6 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                In transit now
              </div>
              {donations
                .filter((d) => ['picked-up', 'in-transit', 'assigned'].includes(d.status))
                .slice(0, 5)
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelected({ type: 'donation', payload: d })}
                    className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.imageUrl}
                      alt={d.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{d.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.quantityKg} kg · {d.pickupAddress.area}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'text-[10px] capitalize',
                        d.status === 'in-transit'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200',
                      )}
                    >
                      {d.status.replace('-', ' ')}
                    </Badge>
                  </button>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SidebarStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'blue' | 'rose';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <Card className="border">
      <CardContent className="pt-4 pb-4">
        <div className={cn('w-8 h-8 rounded-lg grid place-items-center mb-2', tones[tone])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-foreground">{label}</span>
    </div>
  );
}

function SelectionCard({
  selection,
  onClose,
}: {
  selection: { type: 'user' | 'donation'; payload: DemoUser | Donation };
  onClose: () => void;
}) {
  if (selection.type === 'user') {
    const u = selection.payload as DemoUser;
    return (
      <Card className="border">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-full bg-gradient-to-br grid place-items-center text-white font-semibold',
                  u.avatarColor,
                )}
              >
                {u.initials}
              </div>
              <div>
                <div className="font-bold">{u.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {u.role} · {u.city}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
          {u.organization && <div className="text-sm text-muted-foreground">{u.organization}</div>}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="w-3 h-3 mr-1" />
              {u.address.area}
            </Badge>
            {u.online && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                Online
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              ★ {u.rating}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
            <div>
              <div className="text-muted-foreground">Donations</div>
              <div className="font-bold">{u.stats.totalDonations}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Meals</div>
              <div className="font-bold">{u.stats.mealsProvided.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const d = selection.payload as Donation;
  return (
    <Card className="border">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold">{d.title}</div>
            <div className="text-xs text-muted-foreground">
              {d.pickupAddress.area}, {d.pickupAddress.city}
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.imageUrl} alt={d.title} className="w-full h-32 object-cover rounded-lg" />
        <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            <Package className="w-3 h-3 mr-1" /> {d.quantityKg} kg
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Users className="w-3 h-3 mr-1" /> {d.estimatedMeals} meals
          </Badge>
          <Badge variant="outline" className="text-[10px] capitalize">
            <Clock className="w-3 h-3 mr-1" /> {d.status.replace('-', ' ')}
          </Badge>
        </div>
        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Navigation className="w-3 h-3 mr-1" />
          Open in maps
        </Button>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Marker icon helpers (take the lazy-loaded L instance as an arg)
// ────────────────────────────────────────────────────────────────────────────────
function makeUserIcon(L: typeof LeafletNS, u: DemoUser) {
  const colors: Record<string, string> = {
    donor: '#10b981',
    ngo: '#f59e0b',
    volunteer: '#3b82f6',
    admin: '#64748b',
  };
  const symbols: Record<string, string> = {
    donor: '♥',
    ngo: '🏢',
    volunteer: '🚚',
    admin: '★',
  };
  const color = colors[u.role];
  const symbol = symbols[u.role];
  const pulse = u.online ? 'zwl-pulse' : '';
  return L.divIcon({
    html: `
      <div class="zwl-marker ${pulse}" style="background:${color}">
        <span>${symbol}</span>
      </div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function makeDonationIcon(L: typeof LeafletNS, d: Donation) {
  const color =
    d.status === 'delivered'
      ? '#10b981'
      : d.status === 'in-transit' || d.status === 'picked-up'
      ? '#6366f1'
      : d.status === 'assigned' || d.status === 'accepted'
      ? '#0ea5e9'
      : '#ef4444';
  return L.divIcon({
    html: `
      <div class="zwl-marker" style="background:${color}">
        <span>📦</span>
      </div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}
