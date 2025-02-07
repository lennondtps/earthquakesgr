import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Function to create custom colored markers
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Get marker color based on magnitude
const getMarkerColor = (magnitude) => {
  if (magnitude >= 6) return 'red';
  if (magnitude >= 5) return 'orange';
  if (magnitude >= 4) return 'gold';
  return 'green';
};

const EarthquakeMap = ({ earthquakes }) => {
  const center = earthquakes.length > 0 
    ? [earthquakes[0].latitude, earthquakes[0].longitude]
    : [39.0742, 21.8243]; // Default to Greece center

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {earthquakes.map((eq, index) => {
        const color = getMarkerColor(eq.magnitude);
        const customIcon = createCustomIcon(color);

        return (
          <Marker 
            key={index} 
            position={[eq.latitude, eq.longitude]}
            icon={customIcon}
          >
            <Popup>
              <strong>M {eq.magnitude}</strong><br />
              {eq.location}<br />
              {new Date(eq.pubDate).toUTCString()}<br />
              Depth: {eq.depth} km
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default EarthquakeMap;