import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const EarthquakeList = ({ earthquakes, onEarthquakeClick, selectedEarthquakeId }) => {
  return (
    <List sx={{ 
      height: { xs: '30vh', md: '80vh' },
      scrollbarWidth: 'thin', // For Firefox
      scrollbarColor: '#555 #2c2c2c', // For Firefox
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#2c2c2c',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#555',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#777',
      },
    }}>
      {earthquakes.map((eq, index) => (
        <ListItem
          key={index}
          button
          onClick={() => onEarthquakeClick(eq)}
          selected={selectedEarthquakeId === eq.link}
        >
          <ListItemText
            primary={`M ${eq.magnitude} - ${eq.location}`}
            secondary={
              <>
                <Typography component="span" variant="body2">
                  {formatDistanceToNow(new Date(eq.pubDate), { addSuffix: true })}
                </Typography>
                <br />
                Depth: {eq.depth} km
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default EarthquakeList;