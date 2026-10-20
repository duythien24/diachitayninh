"use client";

// Map of the 96 communes/wards. Positions are estimates (area-weighted centre of the old units each one was merged from,
// see scripts/geocode-communes.mjs), so each commune is a dot, not a boundary.
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type CommuneMapPoint = {
  slug: string;
  name: string;
  typeLabel: string;
  documentCount: number;
  lat: number;
  lon: number;
};

export function CommuneMap({ points }: { points: CommuneMapPoint[] }) {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      const L = await import("leaflet");
      if (disposed || !holderRef.current) return;

      // Kept to the province: zooming out is not needed and would show wider maps the library has not reviewed.
      map = L.map(holderRef.current, {
        scrollWheelZoom: false,
        zoomSnap: 0.5,
        minZoom: 8,
        maxBounds: [
          [9.9, 105.2],
          [12.2, 107.3]
        ]
      });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Bản đồ nền &copy; Esri",
        maxZoom: 16
      }).addTo(map);

      const markers = points.map((point) => {
        const hasDocs = point.documentCount > 0;
        const marker = L.circleMarker([point.lat, point.lon], {
          radius: hasDocs ? 7 + Math.min(point.documentCount, 10) : 5,
          color: hasDocs ? "#6b1212" : "#9a6a1c",
          weight: 1.5,
          fillColor: hasDocs ? "#8e1b1b" : "#f1e3c4",
          fillOpacity: hasDocs ? 0.85 : 0.9
        });
        const label = `${point.typeLabel} ${point.name}`;
        marker.bindTooltip(label, { direction: "top", offset: [0, -6] });
        marker.bindPopup(
          `<div style="font-family:inherit;min-width:150px">
             <div style="font-size:12px;color:#9a6a1c">${point.typeLabel}</div>
             <div style="font-size:16px;font-weight:600;color:#8e1b1b">${point.name}</div>
             <div style="margin:4px 0 8px;font-size:13px">${hasDocs ? `${point.documentCount} tài liệu` : "Đang bổ sung tài liệu"}</div>
             <a href="/xa-phuong/${point.slug}" style="color:#8e1b1b;font-weight:600">Xem trang ${label}</a>
           </div>`
        );
        return marker.addTo(map!);
      });

      if (markers.length) {
        map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [24, 24] });
      } else {
        map.setView([11.0, 106.2], 9);
      }
    })();

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [points]);

  return (
    <div className="rounded-sm border border-brass/50 bg-paper p-2 shadow-book">
      <div ref={holderRef} className="h-[460px] w-full rounded-sm sm:h-[560px]" role="region" aria-label="Bản đồ 96 xã, phường Tây Ninh" />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pt-3 text-xs text-ink/70">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-maroon bg-palm" aria-hidden="true" /> Đã có tài liệu (chấm càng to càng nhiều)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-lacquer bg-sand" aria-hidden="true" /> Đang bổ sung
        </span>
        <span className="text-ink/50">Vị trí là điểm giữa ước tính từ các xã cũ (dữ liệu GADM), không phải ranh giới chính thức.</span>
      </div>
    </div>
  );
}
