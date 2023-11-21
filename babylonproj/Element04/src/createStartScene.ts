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
  } from "@babylonjs/core";
  
  
  function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    light.diffuse = new Color3(0.5, 0.5, 0.5); // Adjust to simulate space lighting
    light.specular = new Color3(0, 0, 0); // No specular light in space
    light.groundColor = new Color3(0, 0, 0); // No ground color in space
    return light;
  }

  function createPlanet(scene: Scene) {
    let planet = MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 32 }, scene);
    planet.position.y = 1;
    return planet;
  }
  
  function createStar(scene: Scene) {
    let star = MeshBuilder.CreateSphere("star", { diameter: 0.5, segments: 16 }, scene);
    star.position = new Vector3(5, 5, -5); // Position the star in the scene
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
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  
  export default function createSpaceScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      light?: Light;
      planet?: Mesh;
      star?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();

  that.light = createLight(that.scene);
  that.planet = createPlanet(that.scene);
  that.star = createStar(that.scene);
  that.camera = createArcRotateCamera(that.scene);

  return that;
}
