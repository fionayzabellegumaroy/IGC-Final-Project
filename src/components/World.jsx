import { useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import { World } from "../classes/";

export let ThreeJsWorld = ({ onExit } = {}) => {
  let containerRef = useRef(null); // holds the DOM node where we mount the canvas
  let worldRef = useRef(null); // stores the World instance

  useEffect(() => {
    if (!containerRef.current) return;

    // regenerate maze so each world instance starts with a fresh maze
    try { regenerateMaze(); } catch (e) {}

    // initialize world and pass the onExit callback into the World instance
    worldRef.current = new World(containerRef.current, { onExit });

    // start the Loop system
    worldRef.current.loop.start();

    // cleanup function
    return () => {
      if (worldRef.current) {
        try { worldRef.current.loop.stop(); } catch (e) {}
        try { worldRef.current.dispose(); } catch (e) {}
        worldRef.current = null;
      }
    };
  }, [onExit]); // re-run if onExit changes

  return (
    <>
      <Grid container id="world-container" sx={{ height: "100vh", position: "absolute", width: "100vw" }}>
        <Grid
          id="world"
          ref={containerRef} // JSX renders div and after first mount, React assigns real DOM node to containerRef.current
          style={{ margin: 0, padding: 0, overflow: "hidden", width: "100%", height: "100%" }}
        />
      </Grid>
    </>
  );
};
