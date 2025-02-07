import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const EarthquakeList = ({ earthquakes, selectedIndex }) => {
  return (
    <List sx={{ overflow: 'auto', maxHeight: '80vh' }}>
      {earthquakes.map((eq, index) => (
        <ListItem key={index} selected={selectedIndex === index}>
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