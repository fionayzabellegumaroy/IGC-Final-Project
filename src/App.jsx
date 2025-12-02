// dont forget, since i am doing animations, might need to get clock delta in app and then pass?

import { ThreeJsWorld as World } from "./components";
import { Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { audio as audioSrc, screen, screenFirst, yes } from "./assets";
import { regenerateMaze } from "./core/mazeGeneration.js";
import "./App.css";

function App() {
  const [start, setStart] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [worldMounted, setWorldMounted] = useState(false); // Track if World has mounted
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

  const handleZoomIn = () => {
    setZoom(true);

    // setTimeout(() => {
    //   try {
    //     regenerateMaze();
    //     setStart(1);
    //   } catch (e) {
    //     console.error("Failed to (re)start maze", e);
    //   }
    // }, 100);

    setTimeout(() => {
      try {
        setStart(1);
        // setWorldMounted(true); //
        regenerateMaze();
        setZoom(false);
      } catch (e) {
        console.error("Failed to animate", e);
      }
    }, 1000);
  };

  // const handleZoomIn = () => {
  //   setZoom(true);

  //   setWorldMounted(true);

  //   // After zoom animation completes, make world visible
  //   setTimeout(() => {
  //     setStart(1);
  //     setZoom(false);
  //   }, 800);
  // };

  // console.log("start:", start);
  // console.log("isFirst:", isFirst);
  // console.log("zoom:", zoom);
  return (
    <Grid
      id="everything"
      container
      style={{
        alignItems: "center",
        // backgroundColor: !zoom ? "#432534" : "#000000",
        backgroundColor: "#432534",
        height: "100vh",
        justifyItems: "center",
        left: 0,
        overflow: "hidden", //still somehow shows scrollbars without this
        position: "absolute",
        top: 0,
        transition: "background-color 0.8s ease",
        width: "100vw",
      }}
    >
      {start ? (
        <Grid
          id="world-grid"
          sx={{
            height: "100vh",
            // Hide while preloading, show when start is true
            opacity: start ? 1 : 0,
            transform: start ? "scale(1)" : "scale(0.8)",
            transition: start
              ? "opacity 0.5s ease, transform 0.5s ease"
              : "none",
            position: "absolute",
            width: "100vw",
            // Prevent interaction while hidden
            pointerEvents: start ? "auto" : "none",
          }}
        >
          <World
            onExit={() => {
              setTimeout(() => {
                setWorldMounted(false);
                setStart(0);
              }, 500); // Wait for fade out
              setZoom(false);
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
          sx={
            {
              // height: "100vh",
              // width: "100vw",
            }
          }
        >
          <Grid id="start-screen-grid" sx={{ flexShrink: 0 }}>
            {/* <img
              id="screen-arcade-first-img"
              src={screenFirst}
              style={{
                display: isFirst ? "block" : "none",
                flexShrink: 0,
                height: "100vh",
                left: "50%",
                opacity: zoom ? 0 : 1,
                overflow: "hidden",
                position: "fixed",
                top: "50%",
                transform: !zoom
                  ? "translate(-50%, -50%) scale(1)" //remove later if not needed
                  : "translate(-50%, -50%) scale(0)",
                transition: "opacity 0.8s ease",
                width: "100vw",
                zIndex: 1,
              }}
            /> */}
            <img
              id="screen-first-img"
              src={screen}
              style={{
                // display: isFirst ? "block" : "none",
                // height: isFirst ? "385px" : "100%",
                left: "50%",
                // maxHeight: "95vh",
                opacity: !zoom ? 1 : 0,
                position: "fixed",
                top: "50%",
                transform: !zoom
                  ? "translate(-50%, -65%) scale(1)"
                  : "translate(-50%, -65%) scale(0)",
                transition: "transform 0.8s ease, opacity 0.8s ease",
                // width: "568px"
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
                if (isFirst) {
                  // setZoom(true);
                  handleZoomIn();
                  regenerateMaze();
                  setIsFirst(false);
                } else {
                  regenerateMaze();
                  setWorldMounted(true);
                  setStart(1);
                }
                // handleZoomIn();
              }}
              src={yes}
              style={{
                cursor: "pointer",
                flexShrink: 0,
                height: "60px",
                left: "50%",
                margin: 0,
                opacity: !zoom ? 1 : 0,
                padding: 0,
                position: "fixed",
                top: "50%",
                transform: !zoom
                  ? "translate(-50%, 50%) scale(1)" // remove if not using
                  : "translate(-50%, 50%) scale(0)",
                transition: !zoom ? "none" : "opacity 0.8s ease",
                width: "60px",
                zIndex: 100,
              }}
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

export default App;
