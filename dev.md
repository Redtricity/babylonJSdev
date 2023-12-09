# Element 5 Documentation

## Features included in my element
- Creation of a 3D Enviroment
- Character Controller
- Lighting
- Animation
- Motion
- SkyBox
- Materials
- Merged Materials
- Constrained Camera Motion

## Functionality Highlights

## Menu Scene

### Scene Setup and User Interface

- **Skybox Creation**: This function, skyBox, generates a skybox, a large cube rendered around the entire scene, providing the appearance of distant backgrounds. It uses a cube texture to achieve this effect.

```typescript

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

```
### Lightning and Camera

- **createHemiLight**: The hemispheric light emits light from above the scene.
```typescript

function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  return light;
}

```

- **createArcRotateCamera**: Provides user control by allowing rotation around a target point
```typescript

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

```

### GUI
- **GUI Button Creation**: The function createSceneButton generates a GUI button on the screen. This button, upon click, triggers an action, such as transitioning to another scene (setSceneIndex(1)).
```typescript

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

```

### Music
- **Background Music**: Initializes background music using a Sound object. It plays a sound file when triggered and handles audio unlock for mobile devices upon user interaction.
```typescript

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

```
## Game Scene

### Celestial Bodies
- **Skybox Creation**: A skybox is generated using `MeshBuilder.CreateBox` and a cube texture representing a cosmic environment.
```typescript

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


```
- **Planets**: Multiple planets are constructed using `MeshBuilder.CreateSphere`, each with distinct textures for their surfaces. Physics interactions might be simulated for these planets.
```typescript

function createPlanet(scene: Scene, px: number, py: number, pz: number) {
    let planet = MeshBuilder.CreateSphere("planet", { diameter: 6, segments: 68 }, scene);
    planet.position.y = 1;
  
    let planetMaterial = new StandardMaterial("planetMaterial", scene);
    // planetMaterial.diffuseColor = new Color3(0, 0, 1);
    planetMaterial.diffuseTexture = new Texture("./assets/8k_sun.jpg", scene); // Adding the texture
    planet.material = planetMaterial;

    planet.position.x = px;
    planet.position.y = py;
    planet.position.z = pz;
    
 
  return planet;
  }

  function createSecondPlanet(scene: Scene, px: number, py: number, pz: number) {
    let secondPlanet = createPlanet(scene, px, py, pz); // Reusing the existing createPlanet function
    secondPlanet.scaling = new Vector3(0.5, 0.5, 0.5); // Scaling the second planet down
    secondPlanet.position.x = px + 10; // Positioning the second planet to the right of the first one
    secondPlanet.position.y = py - 2; // Lowering the second planet
    secondPlanet.position.z = pz;

    let secondPlanetMaterial = new StandardMaterial("secondPlanetMaterial", scene);
    //planetMaterial.diffuseColor = new Color3(0, 0, 1);
    secondPlanetMaterial.diffuseTexture = new Texture("./assets/8k_jupiter.jpg", scene); // Adding the texture
    secondPlanet.material = secondPlanetMaterial;

  return secondPlanet;
}

```

### Interactive Elements
- **Clickable Box**: A clickable box triggers the creation of stars using `createClickableBox` function. This demonstrates interactive behavior upon user interaction.
```typescript
function createClickableBox(scene: Scene, x: number, y: number, z: number) {
  let box: Mesh = MeshBuilder.CreateBox("clickableBox", { size: 1 }, scene);
  box.position = new Vector3(x, y, z);

  
  const material = new StandardMaterial("boxMaterial", scene);
  material.diffuseColor = new Color3(0.5, 0.5, 1.0); 
  box.material = material

  
  box.actionManager = new ActionManager(scene);
  box.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnPickTrigger,
      },
      function () {
        box.position.y += 0.2;
        let starPosition = new Vector3(box.position.x, box.position.y + 1, box.position.z);
        createStar(scene, starPosition);
      }
    )
  );

  return box;
}

```

### Lighting
- **Hemispheric Light**: Utilizes `HemisphericLight` to provide ambient lighting within the scene.
```typescript

function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.5;
  return light;
}

```
- **Spotlight and Point Light**: These light sources are dynamically positioned, influencing the scene's lighting and casting shadows on objects like planets.
```typescript
function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {

  switch (index) {
    case 1: 
      const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
      hemiLight.intensity = 0.1;
      return hemiLight;
      break;
    case 2: 
      const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
      spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
      let shadowGenerator = new ShadowGenerator(1024, spotLight);
      shadowGenerator.addShadowCaster(mesh);
      shadowGenerator.useExponentialShadowMap = true;
      return spotLight;
      break;
    case 3: 
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
  light.intensity = 0.5;
  return light;
}

```

### Physics Simulation
- **Physics Aggregates**: Elements like the ground, boxes, and player are assigned physics properties utilizing Babylon.js' physics aggregations (`PhysicsAggregate`), enabling realistic physical behaviors within the scene.
```typescript
const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);

let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
    playerAggregate.body.disablePreStep = false;


```

### Creating Stars
- **Stars**: Small spheres representing stars are created throughout the scene. They exhibit dynamic color changes to simulate twinkling.

```typescript
function createStar(scene: Scene, position: Vector3) {
  let star = MeshBuilder.CreateSphere("star", { diameter: 0.1, segments: 16 }, scene);
  star.position = position;

  let starMaterial = new StandardMaterial("starMaterial", scene);
  starMaterial.emissiveColor = new Color3(0, 0, 0.5); 
  star.material = starMaterial; 

  let animateStar = () => {
    setInterval(() => {
      starMaterial.emissiveColor = new Color3(
        0, 
        0, 
        Math.random() * 0.5 
      );
    }, 500); 
  };

  animateStar();

  star.receiveShadows = true;
  return star;
}

```

- **Twinkling Stars**: The createStar function creates a continuous color-changing effect to simulate twinkling by altering the emissive color of the stars at intervals.


### Camera and Controls
- **ArcRotateCamera**: A camera allowing rotation around a target point, facilitating user interaction within the 3D environment.
```typescript
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


```
- **User Input Handling**: Controls for movement and animation of a 3D model are managed through keyboard input using `scene.actionManager`.
```typescript
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


```

## Assets Used
- `8k_moon.jpg`, `8k_sun.jpg`, `8k_jupiter.jpg`: Textures used for planet surfaces.
- `space` (directory): Cube texture utilized for the skybox.
- `dummy3.babylon` (model): A 3D model used for user interaction and movement.

