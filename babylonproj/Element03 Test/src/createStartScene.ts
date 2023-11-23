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
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  AnimationPropertiesOverride,
  } from "@babylonjs/core";
  // ------------------------------------------
  
  //functions

  //-------------------------------------------

  //create terrain

  function createTerrain(scene: Scene) {
    //Create large ground for valley environment
    const largeGroundMat = new StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
    
    const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
    largeGround.material = largeGroundMat;
    return largeGround;
  }

  //Create more detailed ground
  function createGround(scene: Scene) {
    //Create Village ground
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground = MeshBuilder.CreateGround("ground", {width:24, height:24});
    ground.material = groundMat;
    ground.position.y = 0.01;
    return ground;
  }

  //Create Skybox
  function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }

  //Creating sprite trees
  function createTrees(scene: Scene) {
    const spriteManagerTrees = new SpriteManager("treesManager", "textures/palmtree.png", 2000, {width: 512, height: 1024}, scene);

    //We create trees at random positions
    for (let i = 0; i < 500; i++) {
        const tree = new Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (-30);
        tree.position.z = Math.random() * 20 + 8;
        tree.position.y = 0.5;
    }

    for (let i = 0; i < 500; i++) {
      const tree = new Sprite("tree", spriteManagerTrees);
      tree.position.x = Math.random() * (25) + 7;
      tree.position.z = Math.random() * -35  + 8;
      tree.position.y = 0.5;
  }
  return spriteManagerTrees;
}

function createBox(scene: Scene, width: number) {
  const boxMat = new StandardMaterial("boxMat");
  if (width == 2) {
    boxMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/semihouse.png") 
  }
  else {
     boxMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png");   
  }

  //options parameter to set different images on each side
  const faceUV: Vector4[] = [];
  if (width == 2) {
    faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); //front face
    faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0); //right side
    faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0); //left side
  }
  else {
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
  }
  //only need to set four faces as the top and bottom cannot be seen

  const box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true});
  box.position.y = 0.5;
  box.material = boxMat;
  return box;
}

function createRoof(scene: Scene, width: number) {
  const roofMat = new StandardMaterial("roofMat");
  roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");

  const roof = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
  roof.material = roofMat;
  roof.scaling.x = 0.75;
  roof.scaling.y = width;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;
  return roof;
}

function createHouse(scene: Scene, width: number) {
  const box = createBox(scene, width);
  const roof = createRoof(scene, width);
  const house: any = Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);
  //for the UNDEFINED parameter - the BabylonJS Documentation says to use null instead of undefined but this is in JAVASCRIPT.
  //TypeScript does not accept null.
  return house;
}

//This is adapted from the cloning and instances from the Village tutorial in the BabylonJS Documentation
function cloneHouse(scene: Scene) {
  const detached_house = createHouse(scene, 1); //.clone("clonedHouse");
  detached_house.rotation.y = -Math.PI / 16;
  detached_house.position.x = -6.8;
  detached_house.position.z = 2.5;

  const semi_house = createHouse(scene, 2); //.clone("clonedHouse");
  semi_house.rotation.y = -Math.PI / 16;
  semi_house.position.x = -4.5;
  semi_house.position.z = 3;

  //each entry is an array [house type, rotation, x, z]
  const places: number[] [] = []; 
  places.push([1, -Math.PI / 16, -6.8, 2.5 ]);
  places.push([2, -Math.PI / 16, -4.5, 3 ]);
  places.push([2, -Math.PI / 16, -1.5, 4 ]);
  places.push([2, -Math.PI / 3, 1.5, 6 ]);
  places.push([2, 15 * Math.PI / 16, -6.4, -1.5 ]);
  places.push([1, 15 * Math.PI / 16, -4.1, -1 ]);
  places.push([2, 15 * Math.PI / 16, -2.1, -0.5 ]);
  places.push([1, 5 * Math.PI / 4, 0, -1 ]);
  places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3 ]);
  places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5 ]);
  places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7 ]);
  places.push([2, Math.PI / 1.9, 4.75, -1 ]);
  places.push([1, Math.PI / 1.95, 4.5, -3 ]);
  places.push([2, Math.PI / 1.9, 4.75, -5 ]);
  places.push([1, Math.PI / 1.9, 4.75, -7 ]);
  places.push([2, -Math.PI / 3, 5.25, 2 ]);
  places.push([1, -Math.PI / 3, 6, 4 ]);

  const houses: Mesh[] = [];
  for (let i = 0; i < places.length; i++) {
    if (places[i][0] === 1) {
        houses[i] = detached_house.createInstance("house" + i);
    }
    else {
        houses[i] = semi_house.createInstance("house" + i);
    }
      houses[i].rotation.y = places[i][1];
      houses[i].position.x = places[i][2];
      houses[i].position.z = places[i][3];
  }

  return houses;
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

let keyDownMap: any[] = [];


function importPlayerMesh(scene, x: number, y: number) {
  let tempItem = { flag: false } 
  let item = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene,
function(newMeshes, particleSystems, skeletons) {
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
  if (keydown) {
    if (!animating) {
    animating = true;
    scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
    }
   } else {
    animating = false;
    scene.stopAnimation(skeleton);
   } 
 });
});
  return item;
 }
 
//----------------------------------------------------------

//----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      terrain?: Mesh;
      ground?: Mesh;
      skybox?: Mesh;
      trees?: SpriteManager;
      //You can uncomment if you wish to have them produced separately
      //box?: Mesh;
      //roof?: Mesh;
      //BAD PRACTICE in TypeScript but a working solution for the time being.
      house?: any;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      importMesh?: any; 
      actionManager?: any; 
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();

    //any further code goes here
    that.terrain = createTerrain(that.scene);
    that.ground = createGround(that.scene);
    that.skybox = createSkybox(that.scene);
    that.trees = createTrees(that.scene);
    that.actionManager = actionManager(that.scene);
    that.importMesh = importPlayerMesh(that.scene, 0, 0);
    



    //housing
    that.house = cloneHouse(that.scene);
    //that.box = createBox(that.scene);
    //that.roof = createRoof(that.scene);
    //that.house = createHouse(that.scene, 2); 
    //const house = Mesh.MergeMeshes([that.box, that.roof], true, false, undefined, false, true);

    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  //----------------------------------------------------
  
  

