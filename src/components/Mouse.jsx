import { Grid } from "@mui/material";

export const Mouse = () => {
  return (
    <Grid
      sx={{
        backgroundColor: "#432435",
        border: "1px black solid",
        height: "5px",
        left: "50%",
        pointerEvents: "none",
        position: "absolute",
        transform: "translate(-50%, -50%)",
        top: "50%",
        width: "5px",
        zIndex: 9999,
      }}
    ></Grid>
  );
};
