import "./styles.css";
import WebGLFont from "./components/WebGLFont/WebGLFont";
import { shaders } from "./components/WebGLFont/shaders";

const type = new WebGLFont({
  word: "DISTORT",
  position: [-90, -10, 0],
  rotation: [Math.PI, 0, 0],
  zoom: 150,
  vertex: shaders[3].vertex,
  fragment: shaders[3].fragment
});
