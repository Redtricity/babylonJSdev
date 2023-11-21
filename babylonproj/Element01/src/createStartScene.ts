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
  Texture,
  CubeTexture,
  DirectionalLight,
  ShadowGenerator,
} from "@babylonjs/core";

//---Functions---//

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 10, 0), scene);
  light.intensity = 1.5; // Increase the intensity
  // ... other light settings
  return light;
}

function createPlanet(scene: Scene) {
  let planet = MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 32 }, scene);
  planet.position.y = 1;

  let planetMaterial = new StandardMaterial("planetMaterial", scene);
  //planetMaterial.diffuseColor = new Color3(0, 0, 1);
  planetMaterial.diffuseTexture = new Texture("textures/8k_earth_daymap.jpg", scene); // Adding the texture
  planet.material = planetMaterial;

  // Shadows for the planet
  planet.receiveShadows = true;
  return planet;
}

function createStar(scene: Scene, position: Vector3) {
  let star = MeshBuilder.CreateSphere("star", { diameter: 0.2, segments: 16 }, scene);
  star.position = position;

  let starMaterial = new StandardMaterial("starMaterial", scene);
  starMaterial.emissiveColor = new Color3(1, 1, 1); // White color for the star
  star.material = starMaterial; // Ensure the material is assigned to the star

  // Function to continuously animate the star's emissive color for a twinkling effect
  let animateStar = () => {
    // Change the emissive color at intervals to create a sparkling effect
    setInterval(() => {
      starMaterial.emissiveColor = new Color3(
        1, // Adjust the R component as needed (1 for maximum)
        1, // Adjust the G component as needed (1 for maximum)
        Math.random() // Random B component (0 to 1)
      );
    }, 500); // Change every 0.5 seconds (adjust the timing as needed)
  };

  // Call the function to start the animation
  animateStar();

  // Shadows for the star
  star.receiveShadows = true;
  return star;
}

function createMoon(scene: Scene) {
  let moon = MeshBuilder.CreateSphere("moon", { diameter: 1, segments: 32 }, scene);
  moon.position = new Vector3(4, 2, 0); // Position the moon accordingly

  let moonMaterial = new StandardMaterial("moonMaterial", scene);
  moonMaterial.diffuseTexture = new Texture("textures/8k_moon.jpg", scene); // Moon texture
  moon.material = moonMaterial;

  // Shadows for the moon
  moon.receiveShadows = true;

  return moon;
}
function createMoonLight(scene: Scene, moon: Mesh) {
  const moonLight = new DirectionalLight("moonLight", new Vector3(0, -1, 0), scene);
  moonLight.intensity = 0.8; // Adjust intensity as needed
  moonLight.diffuse = Color3.White(); // Set the light color

  // Position the moonLight behind the moon to cast shadows
  moonLight.position = new Vector3(moon.position.x, moon.position.y, moon.position.z - 2);

  // Set light's target to the moon to help shadow direction
  moonLight.setDirectionToTarget(moon.position);

  // Enable shadows for the light
  const shadowGenerator = new ShadowGenerator(1024, moonLight);
  shadowGenerator.addShadowCaster(moon);

  return moonLight;
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
    moon?: Mesh;
    moonLight?: DirectionalLight;
  }

  let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();

  // Create light, planet, stars, and camera
  that.light = createLight(that.scene);
  that.planet = createPlanet(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  that.moon = createMoon(that.scene);
  that.moonLight = createMoonLight(that.scene, that.moon);

  // Create stars at different positions
  that.stars = [];
  that.stars.push(createStar(that.scene, new Vector3(5, 5, -5)));
  that.stars.push(createStar(that.scene, new Vector3(-3, 2, 4)));
  that.stars.push(createStar(that.scene, new Vector3(1, 6, -3)));
  that.stars.push(createStar(that.scene, new Vector3(-2, -4, 2)));
  that.stars.push(createStar(that.scene, new Vector3(4, -3, -1)));
  that.stars.push(createStar(that.scene, new Vector3(2, 3, 5)));
  that.stars.push(createStar(that.scene, new Vector3(-5, -2, -4)));
  that.stars.push(createStar(that.scene, new Vector3(0, 4, 3)));
  that.stars.push(createStar(that.scene, new Vector3(3, -5, 1)));
  that.stars.push(createStar(that.scene, new Vector3(2, -2, 3)));
  that.stars.push(createStar(that.scene, new Vector3(1, 3, -5)));
  that.stars.push(createStar(that.scene, new Vector3(-4, -1, 5)));
  that.stars.push(createStar(that.scene, new Vector3(-1, 4, -2)));
  that.stars.push(createStar(that.scene, new Vector3(4, 2, 1)));
  that.stars.push(createStar(that.scene, new Vector3(-3, 5, -4)));


  engine.runRenderLoop(() => {
    if (that.scene) {
      that.scene.render();
    }
  });

  // A function that gets called before each frame is rendered
  that.scene.registerBeforeRender(() => {
    // Rotate the planet about its Y-axis by a small angle
    if (that.planet) {
      that.planet.rotation.y += 0.002; //Rotation speed
    }
  });

  // A function that gets called before each frame is rendered
  that.scene.registerBeforeRender(() => {
    // Rotate the moon about its Y-axis by a small angle
    if (that.moon) {
      that.moon.rotation.y -= 0.002; // Rotation speed for the moon
    }
  });

  return that;
}
