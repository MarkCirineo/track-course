"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

import "leaflet/dist/leaflet.css";

type CourseForMap = {
  id: string;
  displayName: string;
  courseLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  tees: Array<{ name: string | null; courseRating: number | null; slope: number | null }>;
};

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function CourseMapInner({ courses }: { courses: CourseForMap[] }) {
  const withCoords = courses.filter(
    (c): c is CourseForMap & { latitude: number; longitude: number } =>
      c.latitude != null && c.longitude != null
  );

  return (
    <MapContainer center={[40, -95]} zoom={4} className="h-[600px] w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((course) => (
        <Marker key={course.id} position={[course.latitude, course.longitude]} icon={defaultIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <Link href={`/courses/${course.id}`} className="font-semibold hover:underline">
                {course.displayName}
              </Link>
              {course.courseLocation && (
                <p className="text-sm text-muted-foreground">{course.courseLocation}</p>
              )}
              {course.tees[0] && (
                <p className="mt-1 text-xs">
                  Rating / Slope: {course.tees[0].courseRating ?? "—"} /{" "}
                  {course.tees[0].slope ?? "—"}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
