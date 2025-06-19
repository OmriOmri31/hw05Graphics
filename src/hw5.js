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
  const r = 1, tube = 0.07, seg = 100;
  const torusGeom = new THREE.TorusGeometry(r, tube, 8, seg);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff3131 });

  const rightRim = new THREE.Mesh(torusGeom, mat);
  rightRim.position.set(27, 7, 0);
  rightRim.rotation.x = Math.PI / 2;

  const leftRim = new THREE.Mesh(torusGeom, mat);
  leftRim.position.set(-27, 7, 0);
  leftRim.rotation.x = Math.PI / 2;

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
  const n = 30;  // lines per layer

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

(function addSupports(){
  const y = 8;
  const mat   = new THREE.LineBasicMaterial({ color: 0xff3131});
  const rp1 = new THREE.Vector3(28,y,0);
  const rp2 = new THREE.Vector3(32,y-3,0);
  const rp3 = new THREE.Vector3(32,0,0);
  const lp1 = new THREE.Vector3(-28,y,0);
  const lp2 = new THREE.Vector3(-32,y-3,0);
  const lp3 = new THREE.Vector3(-32,0,0);
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([rp1, rp2]), mat));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([rp2, rp3]), mat));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([lp1, lp2]), mat));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([lp2, lp3]), mat));
}());

(function addBall () {
  const radius = 0.7;
  const sphereGeom = new THREE.SphereGeometry(radius, 100, 100);
  const sphereMat  = new THREE.MeshStandardMaterial({     // lit + rough
    color: 0xff7f00,   // vivid orange
    roughness: 0.7,
    metalness: 0.05
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);

  // Black seams
  const seamGeom = new THREE.TorusGeometry(radius, 0.01, 8, 64);
  const seamMat  = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const equator = new THREE.Mesh(seamGeom, seamMat);
  const meridX1  = new THREE.Mesh(seamGeom, seamMat); meridX1.rotation.x = Math.PI / 4;
  const meridX2  = new THREE.Mesh(seamGeom, seamMat); meridX2.rotation.x = Math.PI / 2;
  const meridX3  = new THREE.Mesh(seamGeom, seamMat); meridX3.rotation.x = Math.PI / -4;
  const meridZ  = new THREE.Mesh(seamGeom, seamMat); meridZ.rotation.z = Math.PI / 2;

  const ball = new THREE.Group();
  ball.add(sphere, equator, meridX1, meridX2, meridX3, meridZ);
  ball.position.set(0, radius + 0.1, 0);
  scene.add(ball);
}());

// BONUS!!
(function addBonusLines(){
  //Boxes
  const y = 0.11;
  //Left box
  const leftPoints = [
    new THREE.Vector3(-30, y, -3),
    new THREE.Vector3( -21 , y, -3),
    new THREE.Vector3( -21, y,  3),
    new THREE.Vector3(-30, y,  3)
  ];
  const geometryBoundary = new THREE.BufferGeometry().setFromPoints(leftPoints);

  // Left circle:
  const r = 3, edges = 100;
  const curve   = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2);
  const pointsOfTheCircle  = curve.getPoints(edges);
  const circleG = new THREE.BufferGeometry().setFromPoints(pointsOfTheCircle).rotateX(-Math.PI / 2) .translate(-21, y, 0);
  const circle  = new THREE.LineLoop(circleG, new THREE.LineBasicMaterial({ color: 0xffffff }));


  //Right box
  const rightPoints = [
    new THREE.Vector3(30, y, -3),
    new THREE.Vector3( 21 , y, -3),
    new THREE.Vector3( 21, y,  3),
    new THREE.Vector3(30, y,  3)
  ];
  const geometryBoundaryR = new THREE.BufferGeometry().setFromPoints(rightPoints);

  // Left circle:
  const curveR   = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2);
  const pointsOfTheCircleR  = curveR.getPoints(edges);
  const circleGR = new THREE.BufferGeometry().setFromPoints(pointsOfTheCircleR).rotateX(-Math.PI / 2) .translate(21, y, 0);
  const circleR  = new THREE.LineLoop(circleGR, new THREE.LineBasicMaterial({ color: 0xffffff }));

  //Arcs
  //Right arc
  const xRadiusArc = 3, yRadiusArc = 2, edgesArc = 100;
  const curveRightArc   = new THREE.EllipseCurve(29, 0, xRadiusArc, yRadiusArc, Math.PI/2, Math.PI * 1.5);
  const edgesOfRightArc  = curveRightArc.getPoints(edgesArc);
  const RArcGeom = new THREE.BufferGeometry().setFromPoints(edgesOfRightArc).rotateX(-Math.PI / 2) .translate(0, y, 0);
  const rightArc  = new THREE.Line(RArcGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));

  //Left arc
  const curveLeftArc   = new THREE.EllipseCurve(-29, 0, xRadiusArc, yRadiusArc, Math.PI * 1.5, Math.PI/2);
  const edgesOfLeftArc  = curveLeftArc.getPoints(edgesArc);
  const LArcGeom = new THREE.BufferGeometry().setFromPoints(edgesOfLeftArc).rotateX(-Math.PI / 2).translate(0, y, 0);
  const leftArc =new THREE.Line(LArcGeom, new THREE.LineBasicMaterial({ color: 0xffffff }));

  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const boundary  = new THREE.LineLoop(geometryBoundary, material);
  const boundaryR  = new THREE.LineLoop(geometryBoundaryR, material);

  //Box lines
  //Left box
  const firstLineLB = [ //LB = Left Bottom
    new THREE.Vector3(-28, y, 3),
    new THREE.Vector3( -28 , y, 4),
  ];

  const geometryFirstLineLB = new THREE.BufferGeometry().setFromPoints(firstLineLB);
  const leftFirstLineB  = new THREE.LineLoop(geometryFirstLineLB, material);
  scene.add(leftFirstLineB)

  const secondLineLB = [
    new THREE.Vector3(-26, y, 3),
    new THREE.Vector3( -26 , y, 4),
  ];
  const geometrySecondLineLB = new THREE.BufferGeometry().setFromPoints(secondLineLB);
  const leftSecondLineB  = new THREE.LineLoop(geometrySecondLineLB, material);
  scene.add(leftSecondLineB)

  const thirdLineLB = [
    new THREE.Vector3(-23, y, 3),
    new THREE.Vector3( -23 , y, 4),
  ];
  const geometryThirdLineLB = new THREE.BufferGeometry().setFromPoints(thirdLineLB);
  const leftThirdLineB  = new THREE.LineLoop(geometryThirdLineLB, material);
  scene.add(leftThirdLineB)

  const firstLineLT = [     //LT = Left Top
    new THREE.Vector3(-28, y, -3),
    new THREE.Vector3( -28 , y, -4),
  ];

  const geometryFirstLineLT = new THREE.BufferGeometry().setFromPoints(firstLineLT);
  const leftFirstLineT  = new THREE.LineLoop(geometryFirstLineLT, material);
  scene.add(leftFirstLineT)

  const secondLineLT = [
    new THREE.Vector3(-26, y, -3),
    new THREE.Vector3( -26 , y, -4),
  ];
  const geometrySecondLineLT = new THREE.BufferGeometry().setFromPoints(secondLineLT);
  const leftSecondLineT  = new THREE.LineLoop(geometrySecondLineLT, material);
  scene.add(leftSecondLineT)

  const thirdLineLT = [
    new THREE.Vector3(-23, y, -3),
    new THREE.Vector3( -23 , y, -4),
  ];
  const geometryThirdLineLT = new THREE.BufferGeometry().setFromPoints(thirdLineLT);
  const leftThirdLineT  = new THREE.LineLoop(geometryThirdLineLT, material);
  scene.add(leftThirdLineT)


  //Right box
  const firstLineRB = [ //RB = Right Bottom
    new THREE.Vector3(28, y, 3),
    new THREE.Vector3(28 , y, 4),
  ];

  const geometryFirstLineRB = new THREE.BufferGeometry().setFromPoints(firstLineRB);
  const rightFirstLineB  = new THREE.LineLoop(geometryFirstLineRB, material);
  scene.add(rightFirstLineB)

  const secondLineRB = [
    new THREE.Vector3(26, y, 3),
    new THREE.Vector3(26 , y, 4),
  ];
  const geometrySecondLineRB = new THREE.BufferGeometry().setFromPoints(secondLineRB);
  const rightSecondLineB  = new THREE.LineLoop(geometrySecondLineRB, material);
  scene.add(rightSecondLineB)

  const thirdLineRB = [
    new THREE.Vector3(23, y, 3),
    new THREE.Vector3(23 , y, 4),
  ];
  const geometryThirdLineRB = new THREE.BufferGeometry().setFromPoints(thirdLineRB);
  const rightThirdLineB  = new THREE.LineLoop(geometryThirdLineRB, material);
  scene.add(rightThirdLineB)

  const firstLineRT = [     //RT = Right Top
    new THREE.Vector3(28, y, -3),
    new THREE.Vector3(28 , y, -4),
  ];

  const geometryFirstLineRT = new THREE.BufferGeometry().setFromPoints(firstLineRT);
  const rightFirstLineT  = new THREE.LineLoop(geometryFirstLineRT, material);
  scene.add(rightFirstLineT)

  const secondLineRT = [
    new THREE.Vector3(26, y, -3),
    new THREE.Vector3(26 , y, -4),
  ];
  const geometrySecondLineRT = new THREE.BufferGeometry().setFromPoints(secondLineRT);
  const rightSecondLineT  = new THREE.LineLoop(geometrySecondLineRT, material);
  scene.add(rightSecondLineT)

  const thirdLineRT = [
    new THREE.Vector3(23, y, -3),
    new THREE.Vector3(23 , y, -4),
  ];
  const geometryThirdLineRT = new THREE.BufferGeometry().setFromPoints(thirdLineRT);
  const rightThirdLineT  = new THREE.LineLoop(geometryThirdLineRT, material);
  scene.add(rightThirdLineT)





  boundary.renderOrder = 1;
  scene.add(boundary);
  scene.add(circle);
  scene.add(boundaryR);
  scene.add(circleR);
  scene.add(rightArc);
  scene.add(leftArc);

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

const scoreboard = document.createElement('div');
scoreboard.id = 'scoreboard';
scoreboard.innerHTML = `
  <div><strong>Home</strong>: <span id="score-left">0</span></div>
  <div><strong>Guest</strong>: <span id="score-right">0</span></div>
`;
document.body.appendChild(scoreboard);


const instructionsElement = document.createElement('div');
instructionsElement.id = 'instructions';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
  <p>I - Zoom In</p>
`;
document.body.appendChild(instructionsElement);

// CSS
const style = document.createElement('style');
style.innerHTML = `
  body { margin: 0; overflow: hidden; font-family: 'Segoe UI', sans-serif; }

  #scoreboard {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 18px;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.4);
  }

  #scoreboard strong { color: #ffcc00; }

  #instructions {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    max-width: 220px;
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
  }

  #instructions h3 {
    margin-top: 0;
    font-size: 16px;
    color: #ffcc00;
  }
`;
document.head.appendChild(style);

document.addEventListener('keydown', e => {
  if (e.key === 'o') isOrbitEnabled = !isOrbitEnabled;
});
// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();
