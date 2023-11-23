import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Vector4,
  HemisphericLight,
  SpotLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Texture,
  Color3,
  Space,
  ShadowGenerator,
  PointLight,
  DirectionalLight,
  CubeTexture,
  Sprite,
  SpriteManager,
  } from "@babylonjs/core";

  //----------------------------------------------------

  //MIDDLE OF CODE - FUNCTIONS

  //----------------------------------------------------


  //create terrain
  function createTerrain(scene: Scene) 
  {
    const largeGroundMat = new StandardMaterial("largeGroundMat", scene);
    largeGroundMat.diffuseTexture = new Texture("Assets/textures/8k_moon.jpg");

    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "Assets/textures/8k_moon_inverted.jpg", {width:600, height:600, subdivisions: 1500, minHeight:0, maxHeight: 2});
    largeGround.material = largeGroundMat;
    largeGround.receiveShadows = true;
    return largeGround;
  }

  // Skybox Function
	function skyBox(scene: Scene)
  {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/space", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }


  //Creating the Antenna Function
  function createAntenna(scene: Scene) 
  {
    const antennaMat = new StandardMaterial("antennaMat", scene);
    
    // Create a sphere to represent the rounded part of the antenna
    const SphereLarge = MeshBuilder.CreateSphere("Sphere", { diameter: 0.5, segments: 16 }, scene);
    SphereLarge.material = antennaMat;
    
    // Create a cylinder to represent the long skinny part of the antenna
    const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 1, diameter: 0.1, tessellation: 7 }, scene);
    cylinder.material = antennaMat;
    cylinder.rotation.y = Math.PI / 2; // Rotate the cylinder to point upwards
  
    // Create a small sphere for detail
    const SphereSmall = MeshBuilder.CreateSphere("sphere", { diameter: 0.2, segments: 7 }, scene);
    SphereSmall.material = antennaMat;
  
    // Position the parts to form an antenna shape
    SphereLarge.position = new Vector3(3, 1, -4); // Adjust position as needed for the sphere
    cylinder.position = new Vector3(3, 1.5, -4); // Adjust position to place the cylinder on top of the sphere
    SphereSmall.position = new Vector3(3, 2, -4); // Adjust position as needed for the small sphere
  
    // Group the meshes into a parent mesh
    const antenna = Mesh.MergeMeshes([SphereLarge, cylinder, SphereSmall], true, false, undefined, false, true);
  
    return antenna;
  }
  
  function cloneAntenna(scene: Scene) {
    // Clone the original antenna
    //const clonedAntenna = originalAntenna.clone("clonedAntenna", null, true);
    const clonedAntenna: any = createAntenna(scene);
  
    // Add the cloned antenna to the scene
    clonedAntenna.position = new Vector3(5, 1, -4); 
    //scene.addMesh(clonedAntenna);
  
    return clonedAntenna;
  }

//----------------------------------------------------------

//Light and Camera Functions

//----------------------------------------------------------

function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
  // only spotlight, point and directional can cast shadows in BabylonJS
  switch (index) {
    case 1: //hemispheric light
      const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
      hemiLight.intensity = 0.1;
      return hemiLight;
      break;
    case 2: //spot light
      const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
      spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
      let shadowGenerator = new ShadowGenerator(1024, spotLight);
      shadowGenerator.addShadowCaster(mesh);
      shadowGenerator.useExponentialShadowMap = true;
      return spotLight;
      break;
    case 3: //point light
      const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
      pointLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
      shadowGenerator = new ShadowGenerator(1024, pointLight);
      shadowGenerator.addShadowCaster(mesh);
      shadowGenerator.useExponentialShadowMap = true;
      return pointLight;
      break;
  }
}

//Light Function
function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  return light;
}

//Camera Function
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
//----------------------------------------------------------

//BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE

//----------------------------------------------------------
  
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      terrain?: Mesh;
      ground?: Mesh;
      skybox?: Mesh;
      light?: Light;
      antenna?: any;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      clone?: any;
      
      
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();


    that.terrain = createTerrain(that.scene);
    that.skybox = skyBox(that.scene);
    that.antenna = createAntenna(that.scene);
    that.clone = cloneAntenna(that.scene);
    
    
    
    //Lights and Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  //----------------------------------------------------------
  
  
  

