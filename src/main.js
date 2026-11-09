import * as THREE from 'three';

const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#91a997');
scene.fog = new THREE.FogExp2('#9aaf9b', 0.0085);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 240);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
scene.add(new THREE.HemisphereLight('#d9ebd4', '#364a3c', 2.25));
const sun = new THREE.DirectionalLight('#ffe3ae', 3.1);
sun.position.set(-32, 54, 25); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -45; sun.shadow.camera.right = 45; sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
scene.add(sun);
const mat = (color, roughness=.87, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  grass: mat('#748c64'), grassLight: mat('#8a9e70'), darkGrass: mat('#526b56'), bark: mat('#554c3c'), barkLight: mat('#766248'), leaf: mat('#506d55'), leaf2: mat('#758a60'), rock: mat('#797f73'), rockLight: mat('#a1a18a'), gold: mat('#e3c47f',.48), berry: mat('#e58b93',.4), berryLeaf: mat('#668b58'), water: new THREE.MeshStandardMaterial({color:'#679b91',roughness:.22,metalness:.18,transparent:true,opacity:.85}), dragon: mat('#a8614e',.58), dragonLight: mat('#e3a06b',.58), wing: new THREE.MeshStandardMaterial({color:'#553e46',roughness:.65,side:THREE.DoubleSide}), player: mat('#d0b277'), cloth: mat('#536b5f'), leather: mat('#604b38'), wisp: new THREE.MeshStandardMaterial({color:'#6752a2',emissive:'#392761',emissiveIntensity:1.3,roughness:.4}), shrine: mat('#c8b787',.52), crystal: new THREE.MeshStandardMaterial({color:'#9de7d2',emissive:'#46bfa9',emissiveIntensity:1.7,roughness:.25})
};
const geometry = { sphere: new THREE.SphereGeometry(1, 14, 10), smallSphere: new THREE.SphereGeometry(1, 10, 8), cone: new THREE.ConeGeometry(1,1,7), cylinder: new THREE.CylinderGeometry(1,1,1,8), ico: new THREE.IcosahedronGeometry(1,1) };
function mesh(geo, material, parent, x=0,y=0,z=0, sx=1,sy=1,sz=1){ const m=new THREE.Mesh(geo,material); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function groundHeight(x,z){return Math.sin(x*.11+z*.06)*.58+Math.cos(z*.13-x*.045)*.48+Math.sin(x*.04)*.55;}
const groundGeo = new THREE.PlaneGeometry(180,180,90,90); groundGeo.rotateX(-Math.PI/2);
const pos=groundGeo.attributes.position;
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,groundHeight(x,z)-.22)}groundGeo.computeVertexNormals();
const ground=new THREE.Mesh(groundGeo,mats.grass);ground.receiveShadow=true;scene.add(ground);
// distant layered ridges
for(let layer=0;layer<3;layer++){const ridge=group(scene,0,-1-layer*.4,-48-layer*13);for(let i=0;i<18;i++){const x=-92+i*11+Math.sin(i*3+layer)*3,h=9+((i*17+layer*11)%13)+layer*2;const peak=mesh(new THREE.ConeGeometry(12+layer*3,h,5),mat(layer===0?'#687d70':layer===1?'#778d7b':'#91a18a'),ridge,x,h*.45,-Math.abs(x)*.04,1,1,1);peak.rotation.y=i*1.7;peak.castShadow=false;}}
// distant misty sun
const sunDisc=mesh(new THREE.SphereGeometry(4,20,16),new THREE.MeshBasicMaterial({color:'#f4daa0'}),scene,25,24,-75);sunDisc.castShadow=false;
// meandering water and stepping stones
const stream=mesh(new THREE.PlaneGeometry(14,86),mats.water,scene,-20,-.26,-18,1,1,1);stream.rotation.z=-.055;
for(let i=0;i<15;i++){const x=-20+Math.sin(i*.65)*2.8,z=18-i*5.2;const stone=mesh(new THREE.DodecahedronGeometry(.7+Math.sin(i)*.2,0),i%3?mats.rock:mats.rockLight,scene,x,groundHeight(x,z)+.1,z,.9,.35,1.1);stone.rotation.y=i*.72;}
// props
const trees=[];
function makeTree(x,z,scale=1){const y=groundHeight(x,z);const g=group(scene,x,y,z);mesh(new THREE.CylinderGeometry(.13,.25,2.1,7),mats.bark,g,0,1,0,.8,1,.8);for(let i=0;i<3;i++){mesh(new THREE.ConeGeometry(1.05-i*.12,2.0,7),i===1?mats.leaf2:mats.leaf,g,0,1.65+i*.72,0,1.25-i*.12,1,1.15-i*.1);}g.scale.setScalar(scale);trees.push(g);}
for(let i=0;i<54;i++){const angle=i*2.399,rad=12+((i*37)%57);const x=Math.cos(angle)*rad,z=Math.sin(angle)*rad-10;if(Math.abs(x+20)<9&&Math.abs(z+18)<44)continue;if(Math.hypot(x,z-(-56))<15)continue;makeTree(x,z,.75+(i%5)*.11);}
// scattered rocks
for(let i=0;i<44;i++){const a=i*2.4,r=7+(i*19)%54,x=Math.cos(a)*r,z=Math.sin(a)*r-11;if(Math.hypot(x-6,z+12)<6)continue;const rock=mesh(new THREE.DodecahedronGeometry(.5+(i%4)*.17,0),i%3?mats.rock:mats.rockLight,scene,x,groundHeight(x,z)+.17,z,1.2,.72,.95);rock.rotation.set(i*.3,i, i*.7);}
// berry bushes
const pickups=[];let berryCount=0,woodCount=0,stoneCount=0;
function makeBush(x,z,index){const g=group(scene,x,groundHeight(x,z),z);mesh(new THREE.IcosahedronGeometry(.63,1),mats.berryLeaf,g,0,.55,0,1.25,.78,1);mesh(new THREE.IcosahedronGeometry(.42,0),mats.leaf2,g,-.35,.49,.18,1,1,1);for(let i=0;i<5;i++){const a=i*2.4;const b=mesh(geometry.smallSphere,mats.berry,g,Math.cos(a)*.44,.55+(i%2)*.34,Math.sin(a)*.44,.13,.15,.13);b.material=mats.berry;}const glow=mesh(new THREE.SphereGeometry(.9,10,8),new THREE.MeshBasicMaterial({color:'#f0a2a3',transparent:true,opacity:.08}),g,0,.6,0);glow.castShadow=false;pickups.push({group:g,type:'berry',active:true,index});}
[[2,-3],[-8,-10],[12,-21],[-15,7],[20,-3],[6,-36],[-30,-14],[26,-26]].forEach((p,i)=>makeBush(...p,i));
function makeResource(x,z,type){const g=group(scene,x,groundHeight(x,z),z);if(type==='wood'){mesh(new THREE.CylinderGeometry(.18,.25,1.3,7),mats.barkLight,g,0,.55,0,1,1,1);mesh(new THREE.CylinderGeometry(.17,.17,1.3,7),mats.bark,g,.35,.3,.2,1,1,1).rotation.z=Math.PI/2;}else{const c=mesh(new THREE.DodecahedronGeometry(.48,0),mats.rockLight,g,0,.34,0,1.2,.75,1);c.rotation.y=.5;}pickups.push({group:g,type,active:true});}
for(let i=0;i<15;i++){const a=i*2.17,r=7+(i*11)%36,x=Math.cos(a)*r,z=Math.sin(a)*r-13;makeResource(x,z,i%3?'wood':'stone');}
// player's stylized wanderer
const player=group(scene,0,groundHeight(0,8),8);
mesh(new THREE.CapsuleGeometry(.36,.75,4,8),mats.cloth,player,0,.82,0,1,1,1);
mesh(geometry.sphere,mats.player,player,0,1.58,0,.32,.34,.3);
mesh(new THREE.ConeGeometry(.37,.37,8),mats.leather,player,0,1.87,0,1,.62,1);
mesh(new THREE.CylinderGeometry(.13,.22,.46,7),mats.player,player,.45,.8,0,1,1,1).rotation.z=-.42;
mesh(new THREE.CylinderGeometry(.13,.22,.46,7),mats.player,player,-.45,.8,0,1,1,1).rotation.z=.42;
mesh(new THREE.CylinderGeometry(.14,.14,.53,7),mats.leather,player,.2,.29,0,1,1,1);
mesh(new THREE.CylinderGeometry(.14,.14,.53,7),mats.leather,player,-.2,.29,0,1,1,1);
const playerShadow=mesh(new THREE.CircleGeometry(.65,20),new THREE.MeshBasicMaterial({color:'#192c25',transparent:true,opacity:.27,depthWrite:false}),player,0,.03,0,1,.38,1);playerShadow.rotation.x=-Math.PI/2;playerShadow.castShadow=false;
// dragon, assembled from expressive low-poly forms
const dragon=group(scene,6,groundHeight(6,-12),-12);dragon.rotation.y=-.7;
const dragonBody=mesh(geometry.sphere,mats.dragon,dragon,0,1.32,0,.72,.69,1.25);
mesh(geometry.sphere,mats.dragonLight,dragon,0,1.0,.03,.51,.28,.96);
const neck=mesh(geometry.sphere,mats.dragon,dragon,0,1.73,-.84,.38,.55,.42);neck.rotation.x=-.48;
const head=group(dragon,0,2.1,-1.14);mesh(geometry.sphere,mats.dragon,head,0,0,0,.45,.36,.53);mesh(geometry.sphere,mats.dragonLight,head,0,-.17,-.35,.32,.18,.44);
for(const side of [-1,1]){mesh(geometry.smallSphere,mat('#f2ce83',.28),head,side*.26,.08,-.28,.07,.07,.07);const horn=mesh(new THREE.ConeGeometry(.12,.52,6),mats.gold,head,side*.27,.49,.06,1,1,1);horn.rotation.z=side*-.3;}
const wings=[];
for(const side of [-1,1]){const pivot=group(dragon,side*.48,1.76,.05);const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(side*1.65,.72);shape.lineTo(side*1.85,-.55);shape.lineTo(side*.55,-.12);shape.lineTo(side*.15,-.52);shape.closePath();const wing=new THREE.Mesh(new THREE.ShapeGeometry(shape),mats.wing);wing.material.side=THREE.DoubleSide;wing.castShadow=true;wing.receiveShadow=true;pivot.add(wing);const bone=new THREE.Mesh(new THREE.CylinderGeometry(.025,.055,2,6),mats.dragonLight);bone.position.set(side*.77,.08,0);bone.rotation.z=side*.58;pivot.add(bone);wings.push({pivot,side});}
const tail=group(dragon,0,1.34,.9);for(let i=0;i<5;i++){const seg=mesh(geometry.sphere,mats.dragon,tail,0,-.06*i,.31*i,.28-i*.035,.28-i*.03,.4);seg.rotation.x=.1*i;}const tailTip=mesh(new THREE.ConeGeometry(.23,.72,5),mats.dragon,tail,0,-.3,1.85,1,.7,1);tailTip.rotation.x=Math.PI/2;
for(let side of [-1,1]){for(let i=0;i<2;i++){const leg=mesh(new THREE.CylinderGeometry(.11,.16,.53,7),mats.dragon,dragon,side*.47,.55,.48-i*.75);leg.rotation.z=side*.16;}}
const dragonAura=mesh(new THREE.SphereGeometry(2.2,12,10),new THREE.MeshBasicMaterial({color:'#efbc78',transparent:true,opacity:.08,depthWrite:false}),dragon,0,1.2,0);dragonAura.castShadow=false;
// distant shrine / goal
const shrine=group(scene,0,groundHeight(0,-62),-62);
mesh(new THREE.CylinderGeometry(3.2,4.4,.75,7),mats.shrine,shrine,0,.38,0,1,1,1);
mesh(new THREE.CylinderGeometry(2.3,2.8,.34,8),mats.gold,shrine,0,.91,0,1,1,1);
for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const pillar=mesh(new THREE.CylinderGeometry(.42,.56,4.8,6),mats.shrine,shrine,Math.cos(a)*2.1,3.3,Math.sin(a)*2.1,.9,1,1);pillar.rotation.z=Math.cos(a)*-.12;const cap=mesh(new THREE.ConeGeometry(.7,.7,6),mats.gold,shrine,Math.cos(a)*2.1,5.9,Math.sin(a)*2.1);cap.rotation.z=Math.cos(a)*-.12;}
const portal=mesh(new THREE.TorusGeometry(1.7,.12,8,32),mats.gold,shrine,0,4.6,0,1,1.25,1);portal.rotation.x=Math.PI/2;
mesh(geometry.ico,mats.crystal,shrine,0,3.6,0,.7,1.3,.7);
const shrineLight=new THREE.PointLight('#78e6cb',8,20);shrineLight.position.set(0,4,0);shrine.add(shrineLight);
// roaming shadow wisp threat
const enemies=[];
for(let i=0;i<2;i++){const e=group(scene,i?18:-20,1,-29-i*12);mesh(geometry.ico,mats.wisp,e,0,0,0,.68,.85,.68);mesh(geometry.sphere,mat('#d88ca3',.35),e,0,.06,-.53,.1,.1,.08);for(let s of [-1,1]){const spike=mesh(geometry.cone,mats.wisp,e,s*.43,-.45,.15,.4,.7,.4);spike.rotation.z=s*.3;}e.userData={phase:i*2.5,hp:3,hitFlash:0};enemies.push(e);}
// decorative fireflies
const fireflies=[];for(let i=0;i<36;i++){const f=mesh(geometry.smallSphere,new THREE.MeshBasicMaterial({color:i%3?'#d8dc9c':'#f0c77d'}),scene,(Math.random()-.5)*68,1+Math.random()*5,-45+Math.random()*65,.045,.045,.045);f.castShadow=false;fireflies.push({mesh:f,phase:Math.random()*7,speed:.5+Math.random()});}

// Gameplay state and interface
const $=id=>document.getElementById(id);
const ui={healthFill:$('healthFill'),healthValue:$('healthValue'),staminaFill:$('staminaFill'),staminaValue:$('staminaValue'),berryCount:$('berryCount'),woodCount:$('woodCount'),stoneCount:$('stoneCount'),questTitle:$('questTitle'),questText:$('questText'),questProgress:$('questProgress'),questBar:$('questBar'),interaction:$('interaction'),interactionText:$('interactionText'),toast:$('toast'),toastText:$('toastText'),ridePrompt:$('ridePrompt'),mobileControls:$('mobileControls'),mountControls:$('mountControls'),gatherBtn:$('gatherBtn'),attackBtn:$('attackBtn'),flyBtn:$('flyBtn'),startScreen:$('startScreen'),victoryScreen:$('victoryScreen')};
let health=100,stamina=100,berries=0,wood=0,stone=0,bonded=false,riding=false,gameStarted=false,gameWon=false,collapsed=false;
let toastTimer=0,attackCooldown=0,damageCooldown=0,playerSpeed=0,flightY=0,clockTime=0,day=1,elapsed=0;
const keys=new Set();const input={x:0,y:0,run:false,fly:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function say(text){ui.toastText.textContent=text;ui.toast.classList.add('show');toastTimer=2.6;}
function updateInventory(){ui.berryCount.textContent=berries;ui.woodCount.textContent=wood;ui.stoneCount.textContent=stone;}
function updateQuest(){
  if(!bonded){ui.questTitle.textContent='A bond beyond fear';ui.questText.textContent=berries<3?'Find 3 moonberries and offer them to the dragon.':'Bring your moonberries to the dragon.';ui.questProgress.textContent=`${Math.min(berries,3)} / 3`;ui.questBar.style.width=`${Math.min(berries/3,1)*100}%`;}
  else{ui.questTitle.textContent='Where the stars fell';ui.questText.textContent='Reach the Starfall Shrine beyond the old river.';const d=Math.hypot(player.position.x-shrine.position.x,player.position.z-shrine.position.z);const p=clamp(1-d/75,0,1);ui.questProgress.textContent=d<5?'SHRINE':'NEAR';ui.questBar.style.width=`${Math.max(p*100,4)}%`;}
}
function setHealth(value){health=clamp(value,0,100);ui.healthFill.style.width=`${health}%`;ui.healthValue.textContent=Math.round(health);if(health<=0){health=55;ui.healthFill.style.width='55%';ui.healthValue.textContent='55';player.position.set(0,groundHeight(0,8),8);say('The wilds return you to the trail.');}}
function setStamina(value){stamina=clamp(value,0,100);ui.staminaFill.style.width=`${stamina}%`;ui.staminaValue.textContent=Math.round(stamina);}
function dist2(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function nearestPickup(){let found=null,best=3.6;for(const item of pickups){if(!item.active)continue;const d=dist2(player.position,item.group.position);if(d<best){best=d;found=item;}}return found;}
function interactionTarget(){const pickup=nearestPickup();if(pickup)return {kind:'pickup',value:pickup};if(!bonded&&berries>=3&&dist2(player.position,dragon.position)<5.2)return {kind:'tame'};if(bonded&&!riding&&dist2(player.position,dragon.position)<4.4)return {kind:'mount'};if(bonded&&dist2(player.position,shrine.position)<5.5)return {kind:'shrine'};return null;}
function updateInteraction(){const target=interactionTarget();if(!gameStarted||gameWon||riding){ui.interaction.classList.remove('show');ui.ridePrompt.classList.remove('show');return;}if(target){ui.interaction.classList.add('show');let label='';if(target.kind==='pickup')label=target.value.type==='berry'?'Gather moonberry':`Gather ${target.value.type==='wood'?'timber':'shardstone'}`;if(target.kind==='tame')label='Offer moonberries · tame dragon';if(target.kind==='mount')label='Mount your dragon';if(target.kind==='shrine')label='Touch the Starfall Shrine';ui.interactionText.textContent=label;}else ui.interaction.classList.remove('show');ui.ridePrompt.classList.toggle('show',bonded&&!riding&&dist2(player.position,dragon.position)<4.4);}
function doAction(){if(!gameStarted||gameWon)return;if(riding){return;}const target=interactionTarget();if(!target){say('Nothing close enough to interact with.');return;}if(target.kind==='pickup'){const item=target.value;item.active=false;item.group.visible=false;if(item.type==='berry'){berries++;say('Moonberry gathered.');}else if(item.type==='wood'){wood+=2;say('Gathered 2 timber.');}else{stone++;say('Shardstone gathered.');}updateInventory();updateQuest();return;}if(target.kind==='tame'){berries-=3;updateInventory();bonded=true;dragonAura.material.opacity=.16;ui.ridePrompt.classList.add('show');say('The dragon accepts your gift. A bond is formed!');updateQuest();persist();return;}if(target.kind==='mount'){mountDragon();return;}if(target.kind==='shrine'){winGame();}}
function mountDragon(){if(!bonded||riding)return;riding=true;player.visible=false;dragon.add(player);player.position.set(0,2.1,0);player.rotation.set(0,0,0);flightY=0;ui.mobileControls.style.display='none';ui.mountControls.classList.add('active');say('You and your dragon take to the skies.');}
function dismountDragon(){if(!riding)return;riding=false;const p=dragon.localToWorld(new THREE.Vector3(1.2,0,0));scene.add(player);player.visible=true;player.position.set(p.x,groundHeight(p.x,p.z),p.z);ui.mobileControls.style.display='block';ui.mountControls.classList.remove('active');say('Back on solid ground.');}
function winGame(){if(gameWon)return;gameWon=true;ui.victoryScreen.classList.remove('hidden');say('The Starfall Shrine awakens.');}
function strike(){if(!gameStarted||riding||attackCooldown>0||stamina<12)return;attackCooldown=.55;setStamina(stamina-12);let hit=false;for(const enemy of enemies){if(dist2(player.position,enemy.position)<3.7){enemy.userData.hp--;enemy.userData.hitFlash=.2;enemy.position.x+=Math.sign(enemy.position.x-player.position.x)*.8;hit=true;if(enemy.userData.hp<=0){scene.remove(enemy);enemies.splice(enemies.indexOf(enemy),1);say('Shadow wisp banished.');}else say('A solid strike!');break;}}if(!hit)say('Your strike cuts through empty air.');}
function startGame(){if(gameStarted)return;gameStarted=true;ui.startScreen.classList.add('dismiss');say('Find moonberries. The dragon waits by the old river.');}
function persist(){try{localStorage.setItem('emberfall-save',JSON.stringify({berries,wood,stone,bonded,player:{x:player.position.x,y:player.position.y,z:player.position.z}}));}catch{}}
try{const save=JSON.parse(localStorage.getItem('emberfall-save')||'null');if(save){berries=clamp(Number(save.berries)||0,0,8);wood=Number(save.wood)||0;stone=Number(save.stone)||0;bonded=!!save.bonded;if(save.player&&Number.isFinite(save.player.x)&&Math.abs(save.player.x)<75){player.position.set(save.player.x,groundHeight(save.player.x,save.player.z),save.player.z);}}
}catch{}
updateInventory();updateQuest();

let cameraYaw=0,dragging=false,lastPointerX=0,dodgeTimer=0,ambientAudio=null,soundOn=false;
function playTone(freq=520,duration=.09,type='sine'){if(!soundOn)return;try{ambientAudio??=new AudioContext();const osc=ambientAudio.createOscillator(),gain=ambientAudio.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.035,ambientAudio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ambientAudio.currentTime+duration);osc.connect(gain);gain.connect(ambientAudio.destination);osc.start();osc.stop(ambientAudio.currentTime+duration);}catch{}}
$('playBtn').addEventListener('click',()=>{startGame();playTone(420,.18);});
$('continueBtn').addEventListener('click',()=>{$('victoryScreen').classList.add('hidden');});
$('questToggle').addEventListener('click',()=>{collapsed=!collapsed;$('questCard').classList.toggle('collapsed',collapsed);$('questToggle').textContent=collapsed?'⌄':'⌃';});
$('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').style.color=soundOn?'#e4c57e':'#e9dfc6';if(soundOn){playTone(660,.18);if(ambientAudio?.state==='suspended')ambientAudio.resume();}});
ui.gatherBtn.addEventListener('pointerdown',e=>{e.preventDefault();doAction();playTone(560);});
$('dismountBtn').addEventListener('pointerdown',e=>{e.preventDefault();dismountDragon();});
ui.attackBtn.addEventListener('pointerdown',e=>{e.preventDefault();strike();playTone(180,.13,'triangle');});
ui.flyBtn.addEventListener('pointerdown',e=>{e.preventDefault();input.fly=true;ui.flyBtn.setPointerCapture(e.pointerId);});
ui.flyBtn.addEventListener('pointerup',()=>input.fly=false);ui.flyBtn.addEventListener('pointercancel',()=>input.fly=false);ui.flyBtn.addEventListener('lostpointercapture',()=>input.fly=false);
const joystick=$('joystick'),joyKnob=$('joyKnob');let joyPointer=null;
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoy(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});
function moveJoy(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy),scale=len>max?max/len:1;input.x=dx*scale/max;input.y=dy*scale/max;joyKnob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;}
function releaseJoy(){joyPointer=null;input.x=0;input.y=0;joyKnob.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',releaseJoy);joystick.addEventListener('pointercancel',releaseJoy);joystick.addEventListener('lostpointercapture',releaseJoy);
window.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();keys.add(key);if(key==='f'||key==='e'||key==='enter'){if(!gameStarted)startGame();else if(key==='enter'&&gameWon)ui.victoryScreen.classList.add('hidden');else doAction();}if(key==='r'&&gameStarted&&bonded){if(riding)dismountDragon();else if(dist2(player.position,dragon.position)<5)mountDragon();}if(key===' '&&!riding&&gameStarted&&stamina>20&&dodgeTimer<=0){dodgeTimer=.24;setStamina(stamina-20);playTone(250,.08,'triangle');}if(key==='escape'&&riding)dismountDragon();if(key==='j')strike();});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&gameStarted){dragging=true;lastPointerX=e.clientX;}});
window.addEventListener('pointerup',()=>dragging=false);
window.addEventListener('pointermove',e=>{if(dragging){cameraYaw-= (e.clientX-lastPointerX)*.005;lastPointerX=e.clientX;}});
window.addEventListener('blur',()=>{keys.clear();releaseJoy();input.fly=false;});

function getMove(){let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);if(input.x||input.y){side=input.x;forward=-input.y;}let mag=Math.hypot(forward,side);if(mag>1){forward/=mag;side/=mag;}return {forward,side,mag};}
function bumpIntoTrees(x,z){for(const t of trees){const dx=x-t.position.x,dz=z-t.position.z,dist=Math.hypot(dx,dz),min=.72*t.scale.x;if(dist<min)return true;}return false;}
function updatePlayer(dt){const m=getMove(),moving=m.mag>.06;const sprint=keys.has('shift')&&stamina>3&&moving;const speed=(sprint?8.2:5.25)*(riding?1:1);let dx=0,dz=0;if(moving){dx=(Math.sin(cameraYaw)*m.forward+Math.cos(cameraYaw)*m.side);dz=(-Math.cos(cameraYaw)*m.forward+Math.sin(cameraYaw)*m.side);const norm=Math.hypot(dx,dz)||1;dx/=norm;dz/=norm;}
  if(riding){const dragonSpeed=10.4;dragon.rotation.y=Math.atan2(-dx,-dz);dragon.position.x=clamp(dragon.position.x+dx*dragonSpeed*dt,-78,78);dragon.position.z=clamp(dragon.position.z+dz*dragonSpeed*dt,-78,78);if(input.fly||keys.has(' ')){flightY=clamp(flightY+7*dt,0,13);}else if(keys.has('control')||m.forward<-.55){flightY=clamp(flightY-6*dt,0,13);}else flightY=Math.max(0,flightY-1.6*dt);dragon.position.y=groundHeight(dragon.position.x,dragon.position.z)+flightY;dragon.rotation.x=clamp(-m.forward*.12,-.16,.16);player.position.set(0,2.1,0);}
  else{let mult=1;if(dodgeTimer>0){mult=2.8;dodgeTimer-=dt;}const nx=player.position.x+dx*speed*mult*dt,nz=player.position.z+dz*speed*mult*dt;if(!bumpIntoTrees(nx,player.position.z))player.position.x=clamp(nx,-80,80);if(!bumpIntoTrees(player.position.x,nz))player.position.z=clamp(nz,-80,80);player.position.y=groundHeight(player.position.x,player.position.z);if(moving){player.rotation.y=Math.atan2(-dx,-dz);playerSpeed+=(speed-playerSpeed)*Math.min(1,dt*8);}else playerSpeed*=Math.max(0,1-dt*5);if(sprint)setStamina(stamina-17*dt);else setStamina(stamina+11*dt);}
  const dragonDistance=dist2(player.position,dragon.position);if(bonded&&!riding&&dragonDistance>5){const targetX=player.position.x-Math.sin(player.rotation.y)*3,targetZ=player.position.z-Math.cos(player.rotation.y)*3;dragon.position.x+=(targetX-dragon.position.x)*Math.min(1,dt*.8);dragon.position.z+=(targetZ-dragon.position.z)*Math.min(1,dt*.8);dragon.position.y=groundHeight(dragon.position.x,dragon.position.z);dragon.rotation.y=Math.atan2(dragon.position.x-player.position.x,player.position.z-dragon.position.z);}
  if(riding&&dist2(dragon.position,shrine.position)<5.4&&flightY<4)winGame();
}
function actorPosition(){return riding?dragon.position:player.position;}
function updateEnemies(dt,time){for(const enemy of [...enemies]){enemy.userData.phase+=dt;enemy.position.y=1.15+Math.sin(time*2.7+enemy.userData.phase)*.24;enemy.rotation.y+=dt*.45;enemy.rotation.z=Math.sin(time*1.7+enemy.userData.phase)*.08;if(enemy.userData.hitFlash>0){enemy.userData.hitFlash-=dt;enemy.scale.setScalar(1.15);}else enemy.scale.setScalar(1);if(!gameStarted)continue;const target=actorPosition(),dx=target.x-enemy.position.x,dz=target.z-enemy.position.z,d=Math.hypot(dx,dz);if(d<17&&d>1.45){enemy.position.x+=dx/d*dt*1.45;enemy.position.z+=dz/d*dt*1.45;}if(d<1.6&&damageCooldown<=0&&!riding){setHealth(health-12);damageCooldown=1.1;say('A shadow wisp struck you!');}}
}
function updateScene(dt,time){for(const {pivot,side} of wings){pivot.rotation.z=Math.sin(time*7+(side>0?Math.PI:0))*.34;}
  tail.rotation.y=Math.sin(time*2.5)*.24;dragonAura.material.opacity=.065+Math.sin(time*2)*.025;dragon.position.y=(riding?groundHeight(dragon.position.x,dragon.position.z)+flightY:groundHeight(dragon.position.x,dragon.position.z))+Math.sin(time*2.2)*.055;
  for(const item of pickups){if(item.active){item.group.position.y=groundHeight(item.group.position.x,item.group.position.z)+Math.sin(time*1.7+item.group.position.x)*.035;}}
  portal.rotation.z=time*.16;portal.scale.setScalar(1+Math.sin(time*2)*.035);shrineLight.intensity=7+Math.sin(time*2.4)*1.4;
  for(const f of fireflies){f.mesh.position.y+=Math.sin(time*f.speed+f.phase)*.003;f.mesh.position.x+=Math.cos(time*.5+f.phase)*.0015;f.mesh.material.opacity=.6+Math.sin(time*3+f.phase)*.3;}
  mats.water.color.setHSL(.46,.19,.48+Math.sin(time*1.5)*.025);
}
function updateCamera(dt){const actor=riding?dragon:player;const distance=riding?14:10,height=riding?7.5:6.4;const offset=new THREE.Vector3(Math.sin(cameraYaw)*distance,height,Math.cos(cameraYaw)*distance);const target=new THREE.Vector3(actor.position.x,actor.position.y+(riding?2.1:1.1),actor.position.z);const desired=target.clone().add(offset);camera.position.lerp(desired,1-Math.exp(-dt*3.1));const look=target.clone().add(new THREE.Vector3(-Math.sin(cameraYaw)*2,riding?1.4:.35,-Math.cos(cameraYaw)*2));camera.lookAt(look);}
function updateCompass(){const p=actorPosition(),d=Math.round(Math.hypot(p.x-shrine.position.x,p.z-shrine.position.z));$('direction').textContent=`STARFALL SHRINE · ${d}M`;}
function tickClock(dt){clockTime+=dt*2.6;if(clockTime>=24*60){clockTime=0;day++;}const total=Math.floor(8*60+42+clockTime),h=Math.floor(total/60)%24,m=total%60;$('clock').textContent=`DAY ${String(day).padStart(2,'0')} · ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;elapsed+=dt;damageCooldown=Math.max(0,damageCooldown-dt);attackCooldown=Math.max(0,attackCooldown-dt);if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}if(gameStarted&&!gameWon){updatePlayer(dt);updateEnemies(dt,time);updateInteraction();if(Math.floor(elapsed)%8===0&&elapsed%1<dt)persist();if(elapsed%1<dt)updateQuest();tickClock(dt);}updateScene(dt,time);updateCamera(dt);updateCompass();renderer.render(scene,camera);}
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<760?55:48;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);}
window.addEventListener('resize',resize);resize();camera.position.set(0,9,24);camera.lookAt(0,1,-7);animate();
