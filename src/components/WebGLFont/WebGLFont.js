global.THREE = require("three");
const THREE = global.THREE;
const OrbitControls = require("three-orbit-controls")(THREE);
const loadFont = require("load-bmfont");
const createGeometry = require("three-bmfont-text");
const MSDFShader = require("three-bmfont-text/shaders/msdf");

// Font assets
const fontFile = require("../../assets/Lato-Black.fnt");
const fontAtlas = require("../../assets/Lato-Black.png");

// Nice colors
const colors = require("nice-color-palettes");
const palette = colors[73];
const background = palette[0];
const fontColor = parseInt(palette[2].replace("#", "0x"));

export default class WebGLFont {
  constructor(opts = {}) {
    // Options obj
    this.options = opts;

    // Variables
    this.vars = {
      word: this.options.word,
      position: [...this.options.position],
      rotation: [...this.options.rotation],
      zoom: this.options.zoom,
      vertex: this.options.vertex,
      fragment: this.options.fragment
    };

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth,
      window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = this.vars.zoom;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#app"),
      antialias: true
    });
    this.renderer.setClearColor(background);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Clock
    this.clock = new THREE.Clock();

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Load font files to initialize renderer
    this.loadBMF();
  }

  loadBMF() {
    // Create geometry of packed glyphs
    loadFont(fontFile, (err, font) => {
      this.geometry = createGeometry({
        font,
        text: this.vars.word
      });
    });

    // Load texture containing font glyphs
    this.loader = new THREE.TextureLoader();
    this.loader.load(fontAtlas, texture => {
      setTimeout(() => {
        this.init(this.geometry, texture);
        this.animate();
      }, 1500);
    });
  }

  init(geometry, texture) {
    this.createMesh(geometry, texture);
    this.onResize();
    window.addEventListener("resize", () => this.onResize(), false);
    this.render();
  }

  createMesh(geometry, texture) {
    // Material
    this.material = new THREE.RawShaderMaterial(
      MSDFShader({
        vertexShader: this.vars.vertex,
        fragmentShader: this.vars.fragment,
        color: fontColor,
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        negate: false
      })
    );

    // Create time variable from prestablished shader uniforms
    this.material.uniforms.time = { type: "f", value: 0.0 };

    // Mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(...this.vars.position);
    this.mesh.rotation.set(...this.vars.rotation);
    this.scene.add(this.mesh);
  }

  onResize() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    w < 640
      ? (this.camera.position.z = 250)
      : (this.camera.position.z = this.vars.zoom);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    // Update time uniform
    this.mesh.material.uniforms.time.value = this.clock.getElapsedTime();
    this.mesh.material.uniformsNeedUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }
}
