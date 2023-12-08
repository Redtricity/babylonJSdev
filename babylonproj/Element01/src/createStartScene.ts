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

//----------------------------------------------------
//MIDDLE OF CODE - FUNCTIONS
//----------------------------------------------------


function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 10, 0), scene);
  light.intensity = 0.9; 
  return light;
}

function createPlanet(scene: Scene) {
  let planet = MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 32 }, scene);
  planet.position.y = 1;

  let planetMaterial = new StandardMaterial("planetMaterial", scene);
  planetMaterial.diffuseTexture = new Texture("./assets/8k_earth_daymap.jpg", scene); // Adding the texture
  planet.material = planetMaterial;

  // Shadows for the planet
  planet.receiveShadows = true;
  return planet;
}

function createStar(scene: Scene, position: Vector3) {
  let star = MeshBuilder.CreateSphere("star", { diameter: 0.1, segments: 16 }, scene);
  star.position = position;

  let starMaterial = new StandardMaterial("starMaterial", scene);
  starMaterial.emissiveColor = new Color3(1, 1, 1); // White color for the star
  star.material = starMaterial; // Ensure the material is assigned to the star

  // Function to continuously animate the star's emissive color for a twinkling effect
  let animateStar = () => {
    // Change the emissive color at intervals to create a sparkly effect
    setInterval(() => {
      starMaterial.emissiveColor = new Color3(
        1, 
        1, 
        Math.random() 
      );
    }, 500); // Change every 0.5 seconds (adjust the timing as needed)
  };

  // Call the function to start the animation
  animateStar();

  // Shadows for the star
  star.receiveShadows = true;
  return star;
}

//function to create the Moon
function createMoon(scene: Scene) {
  let moon = MeshBuilder.CreateSphere("moon", { diameter: 1, segments: 32 }, scene);
  moon.position = new Vector3(4, 2, 0); // Position the moon accordingly

  let moonMaterial = new StandardMaterial("moonMaterial", scene);
  moonMaterial.diffuseTexture = new Texture("./assets/8k_moon.jpg", scene); // Moon texture
  moon.material = moonMaterial;

  // Shadows for the moon
  moon.receiveShadows = true;

  return moon;
}

// //function to createMoonLight
// function createMoonLight(scene: Scene, moon: Mesh) {
//   const moonLight = new DirectionalLight("moonLight", new Vector3(0, -1, 0), scene);
//   moonLight.intensity = 0.8; // Adjust intensity as needed
//   moonLight.diffuse = Color3.White(); // Set the light color

//   // Position the moonLight behind the moon to cast shadows
//   moonLight.position = new Vector3(moon.position.x, moon.position.y, moon.position.z - 2);

//   var lightSphere = Mesh.CreateSphere("sphere", 10, 2, scene);
//     var lightspheremat = new StandardMaterial("lightspheremat",scene)
//        lightSphere.position = moonLight.position;
//       lightSphere.material = new StandardMaterial("light", scene);

//   // Set light's target to the moon to help shadow direction
//   moonLight.setDirectionToTarget(moon.position);

//   // Enable shadows for the light
//   const shadowGenerator = new ShadowGenerator(1024, moonLight);
//   shadowGenerator.addShadowCaster(moon);


//   return moonLight;
// }

// ArcRotateCamera
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

	// Skybox
	function skyBox(scene: Scene)
  {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("./assets/space", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }

  //function to create a Box
function createBox(scene: Scene) {
  let box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position = new Vector3(0, 1, 0); // Position the box at a height
  box.receiveShadows = true; // Allow the box to receive shadows
  return box;
}

//function to create a Ground
function createGround(scene: Scene) {
  let ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  ground.receiveShadows = true; // Allow the ground to receive shadows
  return ground;
}

function createdirectionallight(scene: Scene, mesh1:Mesh,mesh2:Mesh){
  var light = new DirectionalLight("dir01", new Vector3(-9, -2, -1), scene);
  light.position = new Vector3(20, 20, 20);
  light.intensity = 0.5;
 light.diffuse = new Color3(150, 150, 150);
  var lightSphere = Mesh.CreateSphere("sphere", 10, 2, scene);
  var lightspheremat = new StandardMaterial("lightspheremat",scene)
     lightSphere.position = light.position;
    lightSphere.material = new StandardMaterial("light", scene);
  var shadowGenerator = new ShadowGenerator(1024, light);
  shadowGenerator.addShadowCaster(mesh1);
  shadowGenerator.addShadowCaster(mesh2);
  shadowGenerator.useExponentialShadowMap = true;
 //(1, 1, 0);
   light.intensity = 10;
}


  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  //----------------------------------------------------------
  
export default function createSpaceScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    light?: Light;
    planet?: Mesh;
    stars?: Mesh[];
    camera?: Camera;
    skybox?: Mesh;
    moon?: Mesh;
    //moonLight?: DirectionalLight;
  }

  let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();

  // Create light, planet, stars, and camera
  that.light = createLight(that.scene);
  that.planet = createPlanet(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  that.moon = createMoon(that.scene);
  //that.moonLight = createMoonLight(that.scene, that.moon);
  that.skybox = skyBox(that.scene);
  createdirectionallight(that.scene, that.planet, that.moon);

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

  //that.light = 

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
