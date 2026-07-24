import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "Map Explorer" };

export default function MapPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        <PageHeader
          eyebrow="GIS"
          title="Coastal Map Explorer"
          description="Interactive Leaflet + OpenStreetMap layers land in Phase 5. Layout scaffold is ready."
        />
        <PlaceholderPanel
          title="Map canvas"
          description="Project polygons, plot markers, and sequestration density overlays will mount here."
        />
      </div>
    </div>
  );
}
