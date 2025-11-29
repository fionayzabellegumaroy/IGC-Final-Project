import { ThreeJsWorld as World } from "./components";
import { Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { audio as audioSrc, no, screen, triangle, yes } from "./assets";
import { regenerateMaze } from "./core/mazeGeneration.js";

function App() {
  const [start, setStart] = useState(0);
  const bgAudioRef = useRef(null);

  useEffect(() => {
    // create background audio from imported asset; name locally to avoid shadowing the import
    const audio = new Audio(audioSrc);
    audio.volume = 0.1;
    audio.loop = true;
    bgAudioRef.current = audio;

    return () => {
      try {
        bgAudioRef.current.pause();
      } catch (e) {}
      bgAudioRef.current = null;
    };
  }, []);

  bgAudioRef.current?.play().catch(() => {});
  return (
    <Grid
      id="everything"
      container
      style={{
        justifyItems: "center",
        alignItems: "center",
        display: "block",
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
      }}
    >
      {start ? (
        <Grid
          id="world-grid"
          sx={{ height: "100vh", position: "absolute", width: "100vw" }}
        >
          <World onExit={() => setStart(0)} />
        </Grid>
      ) : (
        <Grid
          id="start-screen-container"
          container
          alignItems="center"
          justifyContent="center"
          sx={{ height: "100vh", position: "absolute", width: "100vw" }}
        >
          <Grid sx={{ flexShrink: 0 }}>
            <img
              src={screen}
              style={{
                display: "block",
                height: "100%",
                left: 0,
                position: "absolute",
                top: 0,
                width: "100%",
              }}
            />
          </Grid>
          <Grid
            container
            id="options-container"
            sx={{
              gap: 20,
              justifyContent: "center",
              left: "50%",
              minHeight: "100px",
              position: "absolute",
              top: "70%",
              transform: "translate(-50%, -50%)",
              width: "360px",
              zIndex: 1000,
            }}
          >
            <Grid
              sx={{ flexShrink: 0 }}
              onClick={() => {
                try {
                  regenerateMaze();
                } catch (e) {}
                setStart(1);
              }}
            >
              <img
                src={yes}
                style={{
                  width: "70px",
                  height: "70px",
                  cursor: "pointer",
                }}
              />
            </Grid>
            {/* <Grid sx={{ flexShrink: 0 }} >
              <img src={no} style={{ width: "70px",
                  height: "70px",
                  cursor: "pointer"
                  }} />
            </Grid> */}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

export default App;
