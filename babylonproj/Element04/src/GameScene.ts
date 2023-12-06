import "@babylonjs/core/Debug/debugLayer";
import setSceneIndex from "./index";
import "@babylonjs/inspector";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core"; 
import * as GUI from "@babylonjs/gui";


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
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  AnimationPropertiesOverride,
  Sound,
  } from "@babylonjs/core";

 //Initialisation of Physics (Havok)
 let initializedHavok;
 HavokPhysics().then((havok) => {
   initializedHavok = havok;
 });

 const havokInstance = await HavokPhysics();
 const havokPlugin = new HavokPlugin(true, havokInstance);

 globalThis.HK = await HavokPhysics();
 //------------------------------------------
 //functions
 // -------------------------------------------

  // //Create more detailed ground
  function createGround(scene: Scene) {
    //Create Village ground
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("./textures/8k_moon.jpg");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground = MeshBuilder.CreateGround("ground", {width:24, height:24});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    ground.material = groundMat;  
    ground.position.y = 30;
    
    return ground;
  }

  //create terrain
  function createTerrain(scene: Scene) 
  {
    const largeGroundMat = new StandardMaterial("largeGroundMat", scene);
    largeGroundMat.diffuseTexture = new Texture("textures/8k_moon.jpg");

    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "./textures/8k_moon_inverted.jpg", {width:600, height:600, subdivisions: 1500, minHeight:0, maxHeight: 2});
    const groundAggregate = new PhysicsAggregate(largeGround, PhysicsShapeType.BOX, { mass: 0 }, scene);
    //groundAggregate.transformNode.position.y = 2;
      //groundAggregate.position.y
    largeGround.material = largeGroundMat;
    largeGround.receiveShadows = true;
    return largeGround;
  }


  function createBox(scene, x, y, z){
    let box: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position = new Vector3(x, y, z);

  // Create a dark blue material
  const material = new StandardMaterial("darkBlue", scene);
  material.diffuseColor = new Color3(0, 0, 0.5); // Adjust the RGB values to get the desired dark blue shade
  box.material = material;

  const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
  return box;
  }

  // Skybox
	function skyBox(scene: Scene)
  {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/space", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }


//----------------------------------------------------------------------------------------------

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

function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  return light;
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

//MIDDLE OF CODE - FUNCTIONS
let keyDownMap: any[] = [];
let currentSpeed: number = 0.1;
let walkingSpeed: number = 0.1;
let runningSpeed: number = 0.4;

function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
  let tempItem = { flag: false } 
  let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
    let mesh = newMeshes[0];
    let skeleton = skeletons[0];
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1; 

    let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
    // let runRange: any = skeleton.getAnimationRange("YBot_Run");
    // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
    // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
    // let idleRange: any = skeleton.getAnimationRange("YBot_Idle");

    let animating: boolean = false;

    scene.onBeforeRenderObservable.add(()=> {
      let keydown: boolean = false;
      let shiftdown: boolean = false;
      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        mesh.position.z += 0.1;
        mesh.rotation.y = 0;
        keydown = true;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        mesh.position.x -= 0.1;
        mesh.rotation.y = 3 * Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        mesh.position.z -= 0.1;
        mesh.rotation.y = 2 * Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        mesh.position.x += 0.1;
        mesh.rotation.y = Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["Shift"] || keyDownMap["LeftShift"]) {
        currentSpeed = runningSpeed;
        shiftdown = true;
      } else {
        currentSpeed = walkingSpeed;
        shiftdown = false;
      }

      if (keydown) {
        if (!animating) {
          animating = true;
          scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        }
      } else {
        animating = false;
        scene.stopAnimation(skeleton);
      }

      //collision
      if (mesh.intersectsMesh(collider)) {
        console.log("COLLIDED");
      }
    });

    //physics collision
    item = mesh;
    let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
    playerAggregate.body.disablePreStep = false;

  });
  return item;
}

function actionManager(scene: Scene){
  scene.actionManager = new ActionManager(scene);

  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        //parameters: 'w'
      },
      function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
    )
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyUpTrigger
      },
      function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
    )
  );
  return scene.actionManager;
} 

function createStar(scene: Scene, position: Vector3) {
  let star = MeshBuilder.CreateSphere("star", { diameter: 0.1, segments: 16 }, scene);
  star.position = position;

  let starMaterial = new StandardMaterial("starMaterial", scene);
  starMaterial.emissiveColor = new Color3(0, 0, 0.5); // Dark blue color for the star
  star.material = starMaterial; // Ensure the material is assigned to the star

  // Function to continuously animate the star's emissive color for a twinkling effect
  let animateStar = () => {
    // Change the emissive color at intervals to create a sparkling effect
    setInterval(() => {
      starMaterial.emissiveColor = new Color3(
        0, 
        0, 
        Math.random() * 0.5 // Random B component (0 to 0.5 for dark blue shades)
      );
    }, 500); // Change every 0.5 seconds (adjust the timing as needed)
  };

  // Call the function to start the animation
  animateStar();

  // Shadows for the star
  star.receiveShadows = true;
  return star;
}

////----------------------------------------------------------
//BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
////----------------------------------------------------------
  export default function GameScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      terrain?: Mesh;
      ground?: Mesh;
      skybox?: Mesh;
      trees?: SpriteManager;
      //You can uncomment if you wish to have them produced separately
      box?: Mesh;
      //roof?: Mesh;
      //BAD PRACTICE in TypeScript but a working solution for the time being.
      house?: any;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      importMesh?: any; 
      actionManager?: any; 
      stars?: Mesh[];
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);

    that.box = createBox(that.scene, 2, 2, 2);
   that.ground = createGround(that.scene);

    //any further code goes here
    //that.terrain = createTerrain(that.scene);
    that.ground = createGround(that.scene);
    that.skybox = skyBox(that.scene);
    that.actionManager = actionManager(that.scene);
    that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0);

    // Create stars at different positions
  that.stars = [];
  that.stars.push(createStar(that.scene, new Vector3(5, 5, -5)));
  that.stars.push(createStar(that.scene, new Vector3(-3, 2, 4)));
  that.stars.push(createStar(that.scene, new Vector3(1, 6, -3)));
  that.stars.push(createStar(that.scene, new Vector3(-2, 3, 2)));
  that.stars.push(createStar(that.scene, new Vector3(4, 7, -1)));
  that.stars.push(createStar(that.scene, new Vector3(2, 3, 5)));
  that.stars.push(createStar(that.scene, new Vector3(-5, 6, -4)));
  that.stars.push(createStar(that.scene, new Vector3(0, 4, 3)));
  that.stars.push(createStar(that.scene, new Vector3(3, 6, 1)));
  that.stars.push(createStar(that.scene, new Vector3(2, 4, 3)));
  that.stars.push(createStar(that.scene, new Vector3(1, 3, -5)));
  that.stars.push(createStar(that.scene, new Vector3(-4, 5, 5)));
  that.stars.push(createStar(that.scene, new Vector3(-1, 4, -2)));
  that.stars.push(createStar(that.scene, new Vector3(4, 2, 1)));
  that.stars.push(createStar(that.scene, new Vector3(-3, 5, -4)));
  that.stars.push(createStar(that.scene, new Vector3(-5, 5, 6)));
  that.stars.push(createStar(that.scene, new Vector3(-4, 4, 9)));
  that.stars.push(createStar(that.scene, new Vector3(6, 2, 8)));
  that.stars.push(createStar(that.scene, new Vector3(-5, 5, -5)));

  

    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  //----------------------------------------------------
  
  

