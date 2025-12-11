import "./App.css";
import { audio as audioSrc, screen, yes } from "./assets";
import { ThreeJsWorld as World } from "./components";
import { regenerateMaze } from "./core";
import { Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";

function App() {
  const [start, setStart] = useState(0);
  const [isFirst, setIsFirst] = useState(true);
  const bgAudioRef = useRef(null);

  useEffect(() => {
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

  return (
    <Grid
      id="everything"
      container
      style={{
        alignItems: "center",
        backgroundColor: "#432534",
        height: "100vh",
        justifyItems: "center",
        left: 0,
        overflow: "hidden", 
        position: "absolute",
        top: 0,
        width: "100vw",
      }}
    >
      {start ? (
        <Grid
          id="world-grid"
          sx={{
            height: "100vh",
            position: "absolute",
            width: "100vw",
          }}
        >
          <World
            onExit={() => {
              setStart(0);
            }}
          />
        </Grid>
      ) : null}

      {!start && (
        <Grid
          id="start-screen-container"
          container
          alignItems="center"
          justifyContent="center"
        >
          <img
            id="screen-first-img"
            src={screen}
            style={{
              left: "50%",
              position: "fixed",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <img
            id="yes-img"
            onClick={() => {
              if (bgAudioRef.current) {
                bgAudioRef.current.play().catch((e) => {
                  console.error("Audio play failed:", e);
                });
              }
              regenerateMaze();
              setStart(1);
              if (isFirst) {
                setIsFirst(false);
              }
            }}
            src={yes}
            style={{
              cursor: "pointer",
              flexShrink: 0,
              height: "60px",
              left: "50%",
              margin: 0,
              padding: 0,
              position: "fixed",
              top: "50%",
              transform: "translate(-50%, 50%)",
              width: "60px",
              zIndex: 100,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default App;
