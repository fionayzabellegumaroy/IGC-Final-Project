import { Button, Grid } from "@mui/material";
import { TIME_LIMIT } from "../utils";

export const Result = ({ onClose, sad, timeElapsed, win }) => {
  let time = Math.max(0, TIME_LIMIT - Math.floor(timeElapsed));
  let resultStatement =
    win && !sad
      ? `Congratulations! You found the exit with ${time} seconds left!` //idk if i like the wording here
      : !win && !sad
      ? `Hmm... You didn't find the exit in time.`
      : `You found the exit, but chose not to leave... before the time ran out.`;
  let closingStatement =
    !win && sad
      ? `Continue wandering` // closed letter
      : !win && !sad
      ? `Maybe try again, just one more time?` // time ran out
      : `Home`; // win
  return (
    <Grid
      container
      sx={{
        backgroundColor: "#432534",
        borderRadius: "10px",
        boxShadow: "5px 5px 8px hsl(0 0% 0% / 0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        justifyContent: "center",
        left: "50%",
        padding: "20px",
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        zIndex: 1000,
      }}
    >
      <Grid
        sx={{
          //   backgroundColor: "#efd6ac",
          //   border: "1px black solid",
          //   borderRadius: "5px",
          color: "#efd6ac",
          fontSize: "18px",
          fontWeight: "bold",
          padding: "10px",
          width: "100%",
        }}
      >
        <p style={{margin: 0}}>{resultStatement}</p>
      </Grid>
      <Grid
        onClick={() => onClose()}
        sx={{
          backgroundColor: "#efd6ac",
          border: "1px black solid",
          borderRadius: "5px",
          color: "#432534",
          cursor: "pointer",
          fontSize: "18px",
          padding: "10px",
          width: "100%",
        }}
      >
        <p style={{margin: 0}}>{closingStatement}</p>
      </Grid>
    </Grid>
  );
};
