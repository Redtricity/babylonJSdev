import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Light,
  Color3,
  Camera,
  Engine,
  StandardMaterial,
} from "@babylonjs/core";

//---Functions---//
function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 10, 0), scene);
  light.intensity = 0.7;
  light.diffuse = new Color3(0.5, 0.5, 0.5);
  light.specular = new Color3(0, 0, 0);
  light.groundColor = new Color3(0, 0, 0);

  // Shadows for the light
  light.shadowEnabled = true;
  return light;
}

function createPlanet(scene: Scene) {
  let planet = MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 32 }, scene);
  planet.position.y = 1;

  let planetMaterial = new StandardMaterial("planetMaterial", scene);
  planetMaterial.diffuseColor = new Color3(0, 0, 1);
  planet.material = planetMaterial;

  // Shadows for the planet
  planet.receiveShadows = true;
  return planet;
}

function createStar(scene: Scene, position: Vector3) {
  let star = MeshBuilder.CreateSphere("star", { diameter: 0.5, segments: 16 }, scene);
  star.position = position;

  let starMaterial = new StandardMaterial("starMaterial", scene);
  starMaterial.emissiveColor = new Color3(1, 1, 0);
  star.material = starMaterial;

  // Shadows for the star
  star.receiveShadows = true;
  return star;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.attachControl(true);
  return camera;
}

export default function createSpaceScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    light?: Light;
    planet?: Mesh;
    stars?: Mesh[];
    camera?: Camera;
  }

  let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();

  // Create light, planet, stars, and camera
  that.light = createLight(that.scene);
  that.planet = createPlanet(that.scene);
  that.camera = createArcRotateCamera(that.scene);

  // Create stars at different positions
  that.stars = [];
  that.stars.push(createStar(that.scene, new Vector3(5, 5, -5)));
  that.stars.push(createStar(that.scene, new Vector3(-3, 2, 4)));
  that.stars.push(createStar(that.scene, new Vector3(1, 6, -3)));

  engine.runRenderLoop(() => {
    if (that.scene) {
      that.scene.render();
    }
  });

  // A function that gets called before each frame is rendered
  that.scene.registerBeforeRender(() => {
    // Rotate the planet about its Y-axis by a small angle
    if (that.planet) {
      that.planet.rotation.y += 0.005; //Rotation speed
    }
  });

  return that;
}
