import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  AppBar, 
  Toolbar, 
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Link,
  Container
} from '@mui/material';
import axios from 'axios';
import RSSParser from 'rss-parser';
import { formatAthensTime } from './utils/dateUtils';
import EarthquakeMap from './components/EarthquakeMap.jsx';
import EarthquakeList from './components/EarthquakeList.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Landscape } from '@mui/icons-material';

// Dark mode theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Time filter options
const timeFilters = [
  { label: 'Last 10 minutes', value: 10 },
  { label: 'Last 30 minutes', value: 30 },
  { label: 'Last hour', value: 60 },
  { label: 'Last 24 hours', value: 1440 }
];

// Magnitude filter options
const magnitudeFilters = [
  { label: 'All magnitudes', value: 'all' },
  { label: 'Minor (0 - 3.9)', value: [0, 3.9] },
  { label: 'Light (4 - 4.9)', value: [4, 4.9] },
  { label: 'Moderate (5 - 5.9)', value: [5, 5.9] },
  { label: 'Strong (6+)', value: [6, Infinity] }
];

const parseEarthquakeItem = (item) => {
  try {
    const description = item.content || item.description || '';
    const locationMatch = description.match(/(\d+\.?\d* km [NSEW]+ of .+?)</) || item.title.match(/of (.+)$/);
    
    const pubDate = new Date(item.pubDate + ' GMT');
    if (isNaN(pubDate.getTime())) {
      console.warn('Invalid date for item:', item);
      return null;
    }

    const magnitude = parseFloat(item.title.match(/M ([\d.]+)/)?.[1] || 0);

    return {
      title: item.title,
      link: item.link,
      pubDate: pubDate,
      location: locationMatch ? locationMatch[1].trim() : 'Unknown location',
      latitude: parseFloat(description.match(/Latitude: ([\d.]+)[NS]/i)?.[1] || 0),
      longitude: parseFloat(description.match(/Longitude: ([\d.]+)[EW]/i)?.[1] || 0),
      depth: parseFloat(description.match(/Depth: ([\d.]+)km/)?.[1] || 0),
      magnitude: magnitude
    };
  } catch (error) {
    console.error('Error parsing earthquake item:', error);
    return null;
  }
};

const App = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(1440); // Default to last 24 hours
  const [magnitudeFilter, setMagnitudeFilter] = useState('all'); // Default to all magnitudes
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState(null);

  // Latest earthquake is always the first in the sorted list
  const latestEarthquake = earthquakes[0] || {};

  const filterEarthquakes = (eqs, minutes, magnitudeRange) => {
    const now = new Date();
    return eqs.filter(eq => {
      // Time filter
      const timeDiff = (now - eq.pubDate) / (1000 * 60);
      const timeMatch = !minutes || (timeDiff <= minutes && timeDiff >= 0);
      
      // Magnitude filter
      const magnitudeMatch = magnitudeRange === 'all' || 
        (eq.magnitude >= magnitudeRange[0] && eq.magnitude <= magnitudeRange[1]);
      
      return timeMatch && magnitudeMatch;
    });
  };

  const handleTimeFilterChange = (event) => {
    const minutes = event.target.value;
    setTimeFilter(minutes);
    setFilteredEarthquakes(filterEarthquakes(earthquakes, minutes, magnitudeFilter));
  };

  const handleMagnitudeFilterChange = (event) => {
    const range = event.target.value;
    setMagnitudeFilter(range);
    setFilteredEarthquakes(filterEarthquakes(earthquakes, timeFilter, range));
  };

  const handleEarthquakeClick = (eq) => {
    setSelectedEarthquakeId(prevId => prevId === eq.link ? null : eq.link);
  };

  const fetchEarthquakes = async () => {
    try {
      const response = await axios.get(
        'https://corsproxy.io/?url=http://www.geophysics.geol.uoa.gr/stations/maps/seismicity.xml',
        { timeout: 10000 }
      );

      const parser = new RSSParser();
      const feed = await parser.parseString(response.data);

      const parsedEarthquakes = feed.items
        .map(parseEarthquakeItem)
        .filter(item => item !== null)
        .sort((a, b) => b.pubDate - a.pubDate);

      setEarthquakes(parsedEarthquakes);
      setFilteredEarthquakes(filterEarthquakes(parsedEarthquakes, timeFilter, magnitudeFilter));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching earthquakes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (earthquakes.length > 0) {
      setFilteredEarthquakes(filterEarthquakes(earthquakes, timeFilter, magnitudeFilter));
    }
  }, [earthquakes, timeFilter, magnitudeFilter]);

  // Clear selection if selected earthquake is filtered out
  useEffect(() => {
    if (selectedEarthquakeId && !filteredEarthquakes.some(eq => eq.link === selectedEarthquakeId)) {
      setSelectedEarthquakeId(null);
    }
  }, [filteredEarthquakes, selectedEarthquakeId]);

  // Find the selected earthquake object
  const selectedEarthquake = filteredEarthquakes.find(eq => eq.link === selectedEarthquakeId);

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h3" sx={{ flexGrow: 1 }}>
              <Landscape sx={{ ml: 2, fontSize:40, mt:1 }} />
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel shrink>Time Filter</InputLabel>
                <Select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  label="Time Filter"
                >
                  {timeFilters.map(filter => (
                    <MenuItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ minWidth: 140 }}>
                <InputLabel shrink>Magnitude Filter</InputLabel>
                <Select
                  value={magnitudeFilter}
                  onChange={handleMagnitudeFilterChange}
                  label="Magnitude Filter"
                >
                  {magnitudeFilters.map(filter => (
                    <MenuItem key={filter.label} value={filter.value}>
                      {filter.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Latest Earthquake:</Typography>
                {latestEarthquake.pubDate ? (
                  <>
                    {/* Mobile View */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Typography>
                        M {latestEarthquake.magnitude} - {latestEarthquake.location}
                      </Typography>
                      <Typography>
                        {formatAthensTime(latestEarthquake.pubDate)}
                      </Typography>
                    </Box>
                    {/* Desktop View */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <Typography>
                        M {latestEarthquake.magnitude} - {latestEarthquake.location} - {formatAthensTime(latestEarthquake.pubDate)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography>{loading ? 'Loading...' : 'No recent earthquakes'}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: { xs: '30vh', md: '80vh' }, overflowY: 'auto' }}>
              <EarthquakeList
                earthquakes={filteredEarthquakes}
                onEarthquakeClick={handleEarthquakeClick}
                selectedEarthquakeId={selectedEarthquakeId}
              />
            </Grid>

            <Grid item xs={12} md={8} sx={{ height: { xs: '60vh', md: '80vh' } }}>
              <Paper sx={{ height: '100%', p: 1 }}>
                <EarthquakeMap earthquakes={selectedEarthquake ? [selectedEarthquake] : filteredEarthquakes} />
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            With data from{' '}
            <Link 
              href="http://www.geophysics.geol.uoa.gr/stations/maps/recent_gr.html" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              UOA
            </Link>
          </Typography>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default App;