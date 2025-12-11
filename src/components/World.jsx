import { World } from "../classes/";
import { regenerateMaze } from "../core";
import { Grid } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export let ThreeJsWorld = ({ onExit } = {}) => {
  let containerRef = useRef(null); // holds the DOM node where we mount the canvas
  let worldRef = useRef(null); // stores the World instance
  const [resetKey, setResetKey] = useState(0);

  const handleExit = useCallback(() => {
    if (typeof onExit === "function") {
      try {
        onExit();
      } catch (e) {
        console.error("Error calling app onExit", e);
      }
      return;
    }
    setResetKey((prev) => prev + 1);
  }, [onExit]);

  useEffect(() => {
    if (!containerRef.current) return;

    // regenerate maze so each world instance starts with a fresh maze
    try {
      regenerateMaze(5, 5);
    } catch (e) {
      console.error("Error regenerating maze:", e);
    }

    // initialize world and pass the onExit callback into the World instance
    worldRef.current = new World(containerRef.current, { onExit: handleExit });

    // start the Loop system
    worldRef.current.loop.start();

    // cleanup function
    return () => {
      if (worldRef.current) {
        try {
          worldRef.current.dispose();
        } catch (e) {}
        worldRef.current = null;
      }
    };
  }, [resetKey, handleExit]); // re-run if onExit changes

  return (
    <>
      <Grid
        container
        id="world-container"
        sx={{ height: "100vh", position: "absolute", width: "100vw" }}
      >
        <Grid
          id="world"
          ref={containerRef} // JSX renders div and after first mount, React assigns real DOM node to containerRef.current
          style={{
            margin: 0,
            padding: 0,
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        />
      </Grid>
    </>
  );
};
