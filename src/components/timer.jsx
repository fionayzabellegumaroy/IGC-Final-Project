import { TIME_LIMIT } from "../config";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";

export const Timer = ({ timeStarted }) => {
  const timeTotal = TIME_LIMIT; // seconds
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!timeStarted) {
      setTimeElapsed(0);
      return;
    }

    const update = () => {
      const now = Date.now();
      setTimeElapsed(Math.max(0, Math.floor((now - timeStarted) / 1000))); // dividing by 1000 converts milliseconds to seconds
      // Math.floor so it only counts for whole seconds
      // Math.max to avoid negative time if timeStarted is in the future
    };

    update(); // initial call to set immediately
    const id = setInterval(update, 1000);
    return () => clearInterval(id); // cleanup on unmount
  }, [timeStarted]);

  const timeLeft = Math.max(0, timeTotal - timeElapsed);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <Grid
      sx={{
        position: "absolute",
        top: 20,
        left: 20,
        color: "white",
        fontSize: "24px",
        zIndex: 1000,
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#efd6ac",
          padding: 0,
          textDecoration: "none",
        }}
      >
        {minutes}:{seconds}
      </p>
    </Grid>
  );
};
