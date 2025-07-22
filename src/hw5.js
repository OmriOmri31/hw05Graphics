  import {OrbitControls} from './OrbitControls.js'
  
  const scene = new THREE.Scene();
  
  const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  camera1.position.set(0, 15, 30);
  camera1.lookAt(0, 0, 0);
  
  camera2.position.set(0, 30, 0);
  camera2.lookAt(0, 0, 0);
  
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // Set background color
  scene.background = new THREE.Color(0x000000);
  
  // Add lights to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(10, 15, 0);
  scene.add(directionalLight);
  
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-10, 15, 0);
  scene.add(directionalLight2);
  
  const directionalLightCorner = new THREE.DirectionalLight(0xffff00, 0.2);
  directionalLightCorner.position.set(-30, 15, -15);
  scene.add(directionalLightCorner);
  
  // Enable shadows
  renderer.shadowMap.enabled = true;
  directionalLight.castShadow = true;
  
  function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
  }
  
  // Create basketball court
  function createBasketballCourt() {
    const courtGeometry = new THREE.BoxGeometry(60, 0.2, 30);
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('./src/components/MapleTexture.webp');
  
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(6, 3); // adjust for plank scale
  
    const courtMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.4,
      metalness: 0.05
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
  
      boundary.renderOrder = 1;
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
  let ball;
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
  
    ball = new THREE.Group();
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
  
  (function addOfficialsTable(){
    const topGeom = new THREE.BoxGeometry(10, 0.2, 4).translate(0,3,-19.5);
    const lGeom = new THREE.BoxGeometry(0.2, 3, 4).translate(-5,1.5,-19.5);
    const rGeom = new THREE.BoxGeometry(0.2, 3, 4).translate(5,1.5,-19.5);
    const frontGeom = new THREE.BoxGeometry(10, 3, 0.1).translate(0,1.5,-17.5);
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 0x00080,  //
      metalness: 5,
      opacity: 0.7
    });
    const topSide = new THREE.Mesh(topGeom, tableMaterial);
    const frontSide  = new THREE.Mesh(frontGeom, tableMaterial);
    const rSide = new THREE.Mesh(lGeom, tableMaterial);
    const lSide = new THREE.Mesh(rGeom, tableMaterial);
    topSide.receiveShadow = true;
    frontSide.receiveShadow = true;
    rSide.receiveShadow = true;
    lSide.receiveShadow = true;
    scene.add(topSide);
    scene.add(frontSide)
    scene.add(rSide);
    scene.add(lSide)
  })();
  
  (function addSquaresOnBoard(){
    const x = 27.9;          // match the board’s X (−28 for left, +28 for right)
    const y = 8;           // board centre-height
    const z = 0;           // board is at z = 0
  
    const ptsL = [
      new THREE.Vector3(-x, y + 0.5, z - 1),
      new THREE.Vector3(-x, y + 0.5, z + 1),
      new THREE.Vector3(-x, y - 1, z + 1),
      new THREE.Vector3(-x, y - 1, z - 1)
    ];
  
    const ptsR = [
      new THREE.Vector3(x, y + 0.5, z - 1),
      new THREE.Vector3(x, y + 0.5, z + 1),
      new THREE.Vector3(x, y - 1, z + 1),
      new THREE.Vector3(x, y - 1, z - 1)
    ];
  
    const geom = new THREE.BufferGeometry().setFromPoints(ptsL);
    const geomR = new THREE.BufferGeometry().setFromPoints(ptsR);
    const square = new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: 0x000000 }));
    const squareR = new THREE.LineLoop(geomR, new THREE.LineBasicMaterial({ color: 0x000000 }));
    scene.add(square);
    scene.add(squareR);
  
  }());
  
  
  function addStands(baseX, baseY, baseZ, numberOfLevels){
    if (numberOfLevels === 0)
      return;
    const x = baseX;
    const y = baseY;
    const z = baseZ;
  
    const topGeom = new THREE.BoxGeometry(60, 0.1, 2).translate(x,y+1,z+2);
    const frontStandGeom = new THREE.BoxGeometry(60, 1.9, 0.1).translate(x, y, z+1);
    const standMaterial = new THREE.MeshPhongMaterial({
      color: 0x66645e,
      shininess: 0.4
    });
    const topPart = new THREE.Mesh(topGeom, standMaterial);
    const frontPart  = new THREE.Mesh(frontStandGeom, standMaterial);
    topPart.receiveShadow = true;
    frontPart.receiveShadow = true;
  
    scene.add(topPart);
    scene.add(frontPart)
    addStands(x, y+1.9, z+2, numberOfLevels-1 )
  }
  //ball consts
  const BALL_SPEED = 0.5;
  const COURT_X = 29;
  const COURT_Z = 14;
  //const BALL_SMOOTHNESS = 0.9
  
  // Create all elements
  createBasketballCourt();
  addStands(0, 1, 18, 5 )
  
  
  let activeCamera = camera1; // Start with camera1
  
  // Orbit controls
  const controls = new OrbitControls(activeCamera, renderer.domElement);
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
    <p>O – Toggle orbit rotation</p>
    <p>Y / B – Move forward / back</p>
    <p>G / H – Move left / right</p>
    <p>C – Switch camera</p>
    <p>N – Reset view</p>
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
    const k = e.key.toLowerCase();
    const speed = 2;
  
    // movement helpers
    const fwd  = new THREE.Vector3();      // forward
    const side = new THREE.Vector3();      // right
    const moveAlong = (vec, dist) => {
      activeCamera.position.addScaledVector(vec, dist);
      controls.target.addScaledVector(vec, dist);   // keep POV
    };
  
    // O – toggle OrbitControls rotation
    if (k === 'o') {
      isOrbitEnabled = !isOrbitEnabled;
    }
  
    // y / b – forward / backward
    if (k === 'y' || k === 'b') {
      activeCamera.getWorldDirection(fwd);
      moveAlong(fwd, k === 'y' ?  speed : -speed);
    }
  
    // g / h – left / right
    if (k === 'g' || k === 'h') {
      activeCamera.getWorldDirection(fwd);
      side.crossVectors(fwd, activeCamera.up).normalize();
      moveAlong(side, k === 'h' ? speed : -speed);
    }
  
    /* C – switch between camera1 and camera2 */
    if (k === 'c') {
      activeCamera = (activeCamera === camera1) ? camera2 : camera1;
      controls.object = activeCamera;
    }
  
    /* N – reset both cameras and controls */
    if (k === 'n') {
      camera1.position.set(0, 15, 30);
      camera1.lookAt(0, 0, 0);
  
      camera2.position.set(0, 30, 0);
      camera2.lookAt(0, 0, 0);
  
      activeCamera = camera1;                  // default view
      controls.object = activeCamera;
      controls.target.set(0, 0, 0);
      controls.update();
    }
    //ball movement
    /* Arrow‑keys – move the ball on the court */
    if (k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') {

      const dx = (k === 'arrowleft'  ? -1 : k === 'arrowright' ?  1 : 0) * BALL_SPEED;
      const dz = (k === 'arrowup'    ? -1 : k === 'arrowdown'  ?  1 : 0) * BALL_SPEED;

      // keep the ball in court
      ball.position.x += (THREE.MathUtils.clamp(ball.position.x + dx, -COURT_X, COURT_X) - ball.position.x);
      ball.position.z += (THREE.MathUtils.clamp(ball.position.z + dz, -COURT_Z, COURT_Z) - ball.position.z);
    }
    
  });
  
  // Animation function
  function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.enabled = isOrbitEnabled;
    controls.update();
    
    renderer.render(scene, activeCamera);
  }
  
  animate();
