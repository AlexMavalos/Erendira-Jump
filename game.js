/* ===== Selectores ===== */
const canvas   = document.getElementById("gameCanvas");
const ctx      = canvas.getContext("2d");
const scoreEl  = document.getElementById("score");
const banner   = document.getElementById("banner");
const loveMsg  = document.getElementById("loveMsg");
const resetBtn = document.getElementById("resetBtn");
const startBtn = document.getElementById("startBtn");
const startOv  = document.getElementById("startOverlay");
const tapJump  = document.getElementById("tapJump");

/* ===== Constantes ===== */
const GROUND_Y      = canvas.height - 40;
const GRAVITY       = 0.6;
const JUMP_V        = -12;
const BASE_SPEED    = 6;
const TARGET_RUN_H  = 64;
const TARGET_SPID_H = 32;

/* ===== Sprites ===== */
const imgRun    = new Image();
const imgSpider = new Image();
imgRun.src      = "assets/run.png";
imgSpider.src   = "assets/spider.png";

let RUN_W, RUN_H, RUN_SCALE;
let SP_W,  SP_H,  SP_SCALE;

/* ===== Estado ===== */
let player, obstacles, frame, score, speed;
let running = false;

/* ===== Clases ===== */
class Player{
  constructor(){
    this.w = RUN_W * RUN_SCALE;
    this.h = RUN_H * RUN_SCALE;
    this.x = 50;
    this.y = GROUND_Y - this.h;
    this.vy = 0; this.isJumping=false;
    this.frame=0; this.cnt=0;
  }
  jump(){ if(!this.isJumping){ this.vy=JUMP_V; this.isJumping=true; } }
  update(){
    this.vy += GRAVITY; this.y += this.vy;
    if(this.y >= GROUND_Y - this.h){
      this.y = GROUND_Y - this.h; this.vy=0; this.isJumping=false;
    }
    if(!this.isJumping && ++this.cnt % 6 === 0) this.frame = (this.frame+1)%4;
    if(this.isJumping) this.frame = 1;
  }
  draw(){
    ctx.drawImage(imgRun,
      this.frame*RUN_W,0,RUN_W,RUN_H,
      this.x,this.y,this.w,this.h);
  }
}
class Obstacle{
  constructor(){
    this.w = SP_W * SP_SCALE;
    this.h = SP_H * SP_SCALE;
    this.x = canvas.width + Math.random()*200;
    this.y = GROUND_Y - this.h;
  }
  update(){ this.x -= speed; }
  draw(){ ctx.drawImage(imgSpider,0,0,SP_W,SP_H,this.x,this.y,this.w,this.h); }
}

/* ===== Juego principal ===== */
function startGame(){
  player = new Player();
  obstacles=[]; frame=0; score=0; speed=BASE_SPEED;
  scoreEl.textContent=0;
  running=true;
  banner.classList.add("hidden");
  resetBtn.classList.add("hidden");
  tapJump.classList.remove("hidden");
  requestAnimationFrame(loop);
}
function loop(){
  if(!running) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#fff";
  ctx.beginPath(); ctx.moveTo(0,GROUND_Y); ctx.lineTo(canvas.width,GROUND_Y); ctx.stroke();

  player.update(); player.draw();

  if(frame%90===0) obstacles.push(new Obstacle());
  for(let i=obstacles.length-1;i>=0;i--){
    const o=obstacles[i]; o.update(); o.draw();
    if(o.x < player.x+player.w && o.x+o.w > player.x &&
       o.y < player.y+player.h && o.y+o.h > player.y) endGame();
    if(o.x+o.w < player.x && !o.counted){
      score++; o.counted=true; scoreEl.textContent=score; speed+=0.1;
      if(score===10) showBanner();
    }
    if(o.x+o.w<0) obstacles.splice(i,1);
  }
  frame++; requestAnimationFrame(loop);
}

/* ===== Helpers ===== */
function showBanner(){
  banner.classList.remove("hidden");
  banner.style.opacity=0;
  setTimeout(()=>{
    banner.style.opacity=1;
    banner.style.transform="translate(-50%,-50%) scale(1.1)";
  },50);
}
function toggleLove(){
  loveMsg.classList.toggle("show");
  if(loveMsg.classList.contains("show"))
    setTimeout(()=>loveMsg.classList.remove("show"),2000);
}
function endGame(){
  running=false;
  banner.classList.remove("hidden");
  banner.textContent="Los bugs se arreglan,\n¡Nuestro amor compila perfecto! 💗";
  resetBtn.classList.remove("hidden");
  tapJump.classList.add("hidden");
}

/* ===== Controles ===== */
function doJump(){ if(running) player.jump(); }

window.addEventListener("keydown",e=>{
  if(e.code==="Space"){ e.preventDefault(); doJump(); }
  else if(e.key.toLowerCase()==="l"){ toggleLove(); }
});
/* clic o toque directo en el canvas */
canvas.addEventListener("pointerdown", () => doJump(), {passive:true});
/* botón SALTAR (clic o toque) */
tapJump.addEventListener("pointerdown", e=>{ e.preventDefault(); doJump(); }, {passive:false});
/* botones inicio / reinicio */
startBtn.addEventListener("click",()=>{ startOv.classList.add("hidden"); startGame(); });
resetBtn.addEventListener("click",startGame);

/* ===== Responsive ===== */
function resizeCanvas(){
  const ideal=800, ratio=ideal/300;
  const w=Math.min(window.innerWidth-20,ideal);
  canvas.style.width=w+"px"; canvas.style.height=(w/ratio)+"px";
}
window.addEventListener("resize",resizeCanvas); resizeCanvas();

/* ===== Pre-carga sprites ===== */
let loaded=0;
function ready(){
  if(++loaded===2){
    RUN_W = imgRun.width/4; RUN_H = imgRun.height;
    RUN_SCALE = TARGET_RUN_H / RUN_H;
    SP_W = imgSpider.width; SP_H = imgSpider.height;
    SP_SCALE = TARGET_SPID_H / SP_H;  /* araña → 32 px de alto */
  }
}
imgRun.onload=ready; imgSpider.onload=ready;
