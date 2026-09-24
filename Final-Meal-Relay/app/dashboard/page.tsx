
function EmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-10 pb-10 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 grid place-items-center mx-auto">
          <Truck className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="font-bold">No active deliveries</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When you create a donation, you'll see live status here as NGOs accept and volunteers pick it up.
        </p>
        <Link href="/donate">
          <Button className="bg-emerald-600 hover:bg-emerald-700 mt-2">
            <Plus className="w-4 h-4 mr-1" />
            Donate food
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
