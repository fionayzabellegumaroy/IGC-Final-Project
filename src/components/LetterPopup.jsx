import { letter as letterImg } from "../assets";
import { Button, Grid } from "@mui/material";

export default function LetterPopup({ onCloseLetter, onHome }) {
  return (
    <Grid
      container
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        left: "50%",
        padding: "12px",
        position: "fixed",
        textAlign: "center",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
      }}
    >
      <Grid>
        <img
          src={letterImg}
          alt="Letter"
          style={{
            display: "block",
            margin: "0 auto",
            width: "300px",
          }}
        />
      </Grid>
      <Grid
        container
        sx={{
          backgroundColor: "#dab970",
          display: "flex",
          flexDirection: "row",
          gap: "30px",
          justifyContent: "center",
          width: "100%",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <Grid
          sx={{
            backgroundColor: "#a78947",
            borderRadius: "5px",
            color: "#373532",
            padding: "1%",
            width: "40%",
          }}
        >
          <Button onClick={onCloseLetter} sx={{ color: "#373532" }}>
            Close
          </Button>
        </Grid>

        <Grid
          sx={{
            backgroundColor: "#a78947",
            borderRadius: "5px",
            color: "#373532",
            padding: "1%",
            width: "40%",
          }}
        >
          <Button onClick={onHome} sx={{ color: "#373532" }}>
            Go Home
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
