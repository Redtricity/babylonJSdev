import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core"; 
import * as GUI from "@babylonjs/gui";
import setSceneIndex from "./index";

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



  // Skybox
	function skyBox(scene: Scene)
  {
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("assets/space", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }

  



//----------------------------------------------------------------------------------------------

function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
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


function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
  var button = GUI.Button.CreateSimpleButton(name, index);
  button.left = x;
  button.top = y;
  button.width = "160px"
  button.height = "60px";
  button.color = "white";
  button.cornerRadius = 20;
  button.background = "#00008B"; // Dark blue color

  const buttonClick = new Sound("MenuClickSFX", "./assets/audio/menu-click.wav", scene, null, {
    loop: false,
    autoplay: false,
  });

  button.onPointerUpObservable.add(function () {
    buttonClick.play();
    setSceneIndex(1);
  });
  advtex.addControl(button);
  return button;

  
}

// function createBackgroundMusic(scene: Scene) {
//   const backgroundMusic = new Sound("BackgroundMusic", "./audio/386056__dudeawesome__discovery-sounds-sound-bites.flac", scene, null, {
//     loop: true,
//     autoplay: true,
//   });
//   return backgroundMusic;
// }

function createBackgroundMusic(scene: Scene) {
  const backgroundMusic = new Sound("BackgroundMusic", "./assets/audio/391840__vabsounds__space.wav", scene, null, {
    loop: true,
    autoplay: true,
  });

  Engine.audioEngine!.useCustomUnlockedButton = true;

  // Unlock audio on first user interaction.
  window.addEventListener('click', () => {
    if(!Engine.audioEngine!.unlocked){
        Engine.audioEngine!.unlock();
    }
  }, { once: true });

  return backgroundMusic;
}

// //----------------------------------------------------------

// //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function MenuScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      importMesh?: any; 
      backgroundMusic?: Sound; 
      
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    
    that.skybox = skyBox(that.scene);
    that.backgroundMusic = createBackgroundMusic(that.scene); // Initialize background music
    

    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    let button1 = createSceneButton(that.scene, "but1", "Start Game", "0px", "-75px", advancedTexture);
    let button2 = createSceneButton(that.scene, "but2", "Options", "0px", "0px", advancedTexture);


    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  //----------------------------------------------------
  
  

