import { Grid } from '@mui/material';   
export const Mouse = () => {
    return (
        <Grid sx={{ width: '5px', height: '5px', backgroundColor: '#ffffff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 9999 }}>
        </Grid>
    );
}