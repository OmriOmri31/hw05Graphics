import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(60, 0.2, 30);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
  (function addLinesOnCourt() {
    const y = 0.11;                   // floor top 0.10 -> lift by +0.01
    //court boundaries
    const points = [
      new THREE.Vector3(-30, y, -15),
      new THREE.Vector3( 30, y, -15),
      new THREE.Vector3( 30, y,  15),
      new THREE.Vector3(-30, y,  15)
    ];
    const geometryBoundary = new THREE.BufferGeometry().setFromPoints(points);


    //court central line
    const centralLinePoints = [
      new THREE.Vector3(0, y,  15),
      new THREE.Vector3(0, y,  -15)
    ]
    const geometryCentralLine = new THREE.BufferGeometry().setFromPoints(centralLinePoints);


    // Circle:
    const r = 6, edges = 100;
    const curve   = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2);
    const pointsOfTheCircle  = curve.getPoints(edges);
    const circleG = new THREE.BufferGeometry().setFromPoints(pointsOfTheCircle).rotateX(-Math.PI / 2) .translate(0, y, 0);
    const circle  = new THREE.LineLoop(circleG, new THREE.LineBasicMaterial({ color: 0xffffff }));

    //Arcs
    //Right arc
    const xRadiusArc = 16, yRadiusArc = 12, edgesArc = 100;
    const curveRightArc   = new THREE.EllipseCurve(30, 0, xRadiusArc, yRadiusArc, Math.PI/2, Math.PI * 1.5);
    const edgesOfRightArc  = curveRightArc.getPoints(edgesArc);
    const RArcGeom = new THREE.BufferGeometry().setFromPoints(edgesOfRightArc).rotateX(-Math.PI / 2) .translate(0, y, 0);
    const rightArc  = new THREE.LineLoop(RArcGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));

    //Left arc
    const curveLeftArc   = new THREE.EllipseCurve(-30, 0, xRadiusArc, yRadiusArc, Math.PI * 1.5, Math.PI/2);
    const edgesOfLeftArc  = curveLeftArc.getPoints(edgesArc);
    const LArcGeom = new THREE.BufferGeometry().setFromPoints(edgesOfLeftArc).rotateX(-Math.PI / 2).translate(0, y, 0);
    const leftArc = new THREE.LineLoop(LArcGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));


    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const boundary  = new THREE.LineLoop(geometryBoundary, material);
    const centralLine  = new THREE.LineLoop(geometryCentralLine, material);

    boundary.renderOrder = 1;         // draw after the wooden court (extra safety)
    scene.add(boundary);
    scene.add(centralLine);
    scene.add(circle);
    scene.add(rightArc);
    scene.add(leftArc);
  })();


}
(function addRims() {
  // Rim:
  const r = 1, edges = 100;
  const rRim   = new THREE.EllipseCurve(27, 0, r, r, 0, Math.PI * 2);
  const pointsOfRRim  = rRim.getPoints(edges);
  const lRim   = new THREE.EllipseCurve(-27, 0, r, r, 0, Math.PI * 2);
  const pointsOfLRim  = lRim.getPoints(edges);
  const rRimG = new THREE.BufferGeometry().setFromPoints(pointsOfRRim).rotateX(-Math.PI / 2) .translate(0, 7, 0);
  const lRimG = new THREE.BufferGeometry().setFromPoints(pointsOfLRim).rotateX(-Math.PI / 2) .translate(0, 7, 0);
  const rightRim   = new THREE.LineLoop(rRimG, new THREE.LineBasicMaterial({ color: 0xff3131 }));
  const leftRim   = new THREE.LineLoop(lRimG, new THREE.LineBasicMaterial({ color: 0xff3131 }));

  scene.add(rightRim);
  scene.add(leftRim);
})();

(function addBoards(){
  const rBoardGeom = new THREE.BoxGeometry(0.1, 4, 6).translate(28,8,0);
  const lBoardGeom = new THREE.BoxGeometry(0.1, 4, 6).translate(-28,8,0);
  const boardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,  //
    shininess: 5,
    transparent: true,
    opacity: 0.7
  });
  const rBoard = new THREE.Mesh(rBoardGeom, boardMaterial);
  const lBoard = new THREE.Mesh(lBoardGeom, boardMaterial);
  rBoard.receiveShadow = true;
  lBoard.receiveShadow = true;
  scene.add(rBoard);
  scene.add(lBoard)
})();

(function addNets(){
  const mat   = new THREE.LineBasicMaterial({ color: 0xffffff, transparent:true, opacity:0.5 });
  const rims  = [27, -27];          // X positions of the two hoops
  const yTop  = 7, depth = 2; // rim height and net depth
  const rTop  = 1, rBot = 0.3;  // top & bottom radius
  const n     = 30;                 // lines per layer

  rims.forEach(x => {
    for (let i = 0; i < n; i++) {
      const a =  i * 2 * Math.PI / n; //spaces between lines
      [
        [a, rTop, yTop, rBot, yTop - depth],
      ].forEach(v => {
        const [ang, rt, yt, rb, yb] = v;
        const p1 = new THREE.Vector3(x + Math.cos(ang) * rt, yt, Math.sin(ang) * rt);
        const p2 = new THREE.Vector3(x + Math.cos(ang) * rb, yb, Math.sin(ang) * rb);
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), mat));
      });
    }
  });
}());


// Create all elements
createBasketballCourt();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();