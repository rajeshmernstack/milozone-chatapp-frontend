import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAdminStore } from '../store/useAdminStore.js';

// Fix Leaflet's default marker icons (their bundled paths break with Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function UsersMap() {
  const users = useAdminStore((s) => s.users);
  const userList = [...users.values()].filter((u) => u.location);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: 600, width: '100%', borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userList.map((u) => (
        <Marker key={u.id} position={[u.location.lat, u.location.lng]}>
          <Popup>
            <strong>{u.nickname}</strong>
            <br />
            {u.partnerId ? 'paired' : 'waiting'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}