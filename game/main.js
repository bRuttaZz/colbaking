// variables
const canvas = document.getElementById("game");
canvas.width = 660;
canvas.height = 660;
const ctx = canvas.getContext('2d');

var running = true;             // for controlling animation
var loadingText_running = true;

let audio_need = false;

let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let noices = [];            // ingnore the grammar :)
let noicesOut = [];
let initGamespeed = 8;      // 8 default
let gamespeed = initGamespeed;
let keys = {};
let king = nking;

let obstacle_position = [100, 100, 140, 180,180, 100 ];
let obstacle_type = [0,1,0,1,0,1];

let spawnTime = [200, 100, 250]
let spawnTimer = spawnTime[Math.floor(Math.random() * spawnTime.length)];

let initNoice_spawnTimer = 5;           // floor noice
let noice_spawTimer = initNoice_spawnTimer;

window.requestAnimationFrame =
           window.requestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.msRequestAnimationFrame;


// audio bgm
 
if (typeof bgm.loop == 'boolean'){
    bgm.loop = true;
}
else{   
    bgm.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
    }, false);
}

class Player {
    constructor (x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        

        this.dy = 0;
        this.jumpForce = 15;
        this.grounded = false;
        this.jumpTimer = 0;
        this.originalH = h;

    }
    
    Draw (){
        ctx.beginPath();
        ctx.drawImage(king, this.x, this.y,this.w, this.h);
        ctx.closePath();
    }

    Animate(){
        // hu hu
        if (keys['KeyH']){
            this.h = 188;
            king = hking;
        }else{
            this.h = this.originalH;
            king = nking;
        }

        //jump
        if (keys['Space'] || keys['KeyW'] || keys['touch']){
            this.jump();
        }
        else{
            this.jumpTimer = 0;
        }
        this.y += this.dy;

        // Gravity
        if(this.y + this.h < canvas.height - 100){
            this.dy += gravity;
            this.grounded = false;
        }
        else{
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h -100;
        }
        
        this.Draw();

        
    }

    jump () {
        if(this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
            jumpM.play();
        }
        else if (this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }


}

class Obstacle{
    constructor (x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.type = type;

        this.dx = -gamespeed;
    }

    Update (){
        this.x += this.dx;
        this.Draw();
        this.dx = -gamespeed;
    }

    Draw (){
        ctx.beginPath();
        ctx.drawImage(enemy[this.type], this.x, this.y,this.w, this.h);
        ctx.closePath();
    }

}

class Text{
    constructor(t, x,y, align, c, size, family = "sans-serif"){
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = align;
        this.c = c;
        this.s = size;
        this.f = family;
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px "+this.f;
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

class Noice{
    constructor (x, y, w, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.c = c;
    
        this.dx = -initGamespeed +3;
    }

    Update (){
        this.x += this.dx;
        this.Draw();
    }

    Draw (){
        ctx.beginPath();
        ctx.strokeStyle = this.c;
        ctx.lineWidth = 4;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.w, this.y);
        ctx.stroke();
        ctx.closePath();
    }

}

function random_num(min, max){
    return min + (Math.random()*max);
}

// spawning noice
function spawnNoice_beginiing (x){
    let y = random_num(canvas.height-90, canvas.height+10);
    let noice = new Noice(x, y, 5, '#022900');
    noices.push(noice);
}

function spawnNoice (){
    let y = random_num(canvas.height-90, canvas.height+10);
    let noice = new Noice(canvas.width, y, 5, '#022900');
    noices.push(noice);
}


// obstacle functions
function SpawnObstacle (){
    let y_position  = obstacle_position[Math.floor(Math.random() * obstacle_position.length)];
    let type = obstacle_type[Math.floor(Math.random() * obstacle_type.length)];
    if (type == 0){
        var obstacle = new Obstacle(canvas.width , canvas.height - (y_position+120), (610/canvas.getBoundingClientRect().width)*60, 120, type);
    }
    else {
        var obstacle = new Obstacle(canvas.width , canvas.height - (y_position+110), (610/canvas.getBoundingClientRect().width)*40, 110, type);
    }

    obstacles.push(obstacle);
}

function keydownHandler(evt){
    keys[evt.code]=true;
}
function touchstartHandler(){
    keys['touch'] = true;
}
function touchendHandler(){
    keys['touch'] = false;
}
function keyupHandler(evt){
    keys[evt.code] = false;
}


function start(){    
    startM.play();
    bgm.play();
    audio_need = true;
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('touchstart', touchstartHandler);
    document.addEventListener('touchend', touchendHandler);
    document.addEventListener('keyup', keyupHandler);


    ctx.font = "20px sans-serif";

    gravity = 1;
    
    score = 0;
    scoreText = new Text("score : "+ score, 30, 50, "left", "#141414","25");
    highscore = 0;
    if (localStorage.getItem('highscore')){
        highscore = localStorage.getItem('highscore');
    }
    highscoreText = new Text("high-score : "+ highscore, canvas.width-30, 50 , "right", "#141414", "25" );
    
    player = new Player(30, 0, (610/canvas.getBoundingClientRect().width)*60, 150);

    Animateframe();
}

function Animateframe() {
    if (running===true){    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // basement line
        ctx.beginPath();
        ctx.fillStyle = "#b2b2b2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = '#121212';
        ctx.lineWidth = 8;
        ctx.moveTo(0, canvas.height-100);
        ctx.lineTo(canvas.width, canvas.height-100);
        ctx.stroke();
        ctx.closePath();
      
        ctx.beginPath();
        ctx.fillStyle = '#46703c';
        ctx.fillRect(0,canvas.height-100, canvas.width, canvas.height-100, 0,canvas.height,canvas.width,canvas.height);
        ctx.closePath();


        spawnTimer--;
        if (spawnTimer <= 0){
            SpawnObstacle();
            // console.log(obstacles);
            spawnTimer = spawnTime[Math.floor(Math.random() * spawnTime.length)];
            spawnTimer = spawnTimer - gamespeed * 8;
            if (spawnTimer <60){
                spawnTimer = 60;
            }
        }
        
        noice_spawTimer -- ;
        if (noice_spawTimer <= 0){
            spawnNoice();
            noice_spawTimer = initNoice_spawnTimer ;
        }
        for (let i = 0; i<noices.length; i++){
            let n = noices[i];
            if (n.x+ n.w < 0){
                noices.splice(i,1);
            }
            n.Update();
        }


        // spawn Enemies
        for (let i =0; i<obstacles.length; i++){
            let o = obstacles[i];
            
            if (o.x + o.w < 0){
                obstacles.splice(i, 1);
            }
            
            // fail condition
            o.Update();
            if (
                player.x +20< o.x+o.w  &&
                player.x + player.w -15 > o.x  &&
                player.y < o.y + o.h  &&
                player.y + player.h -15 > o.y
            ){
                scoreText.Draw();
                keys = {};              // for avoiding accidental jumps
                obstacles = [];
                score = 0;
                gamespeed = initGamespeed;
                running = false;
                king = fking;
                highscoreText.Draw();
                localStorage.setItem('highscore', highscore);
                player.Draw();
                document.removeEventListener('keydown', keydownHandler);
                document.removeEventListener('touchstart', touchstartHandler);
                document.removeEventListener('touchend', touchendHandler);
                document.removeEventListener('keydown', keydownHandler);

                const playagainText = new Text("Click to Play Again.", canvas.width/2, canvas.height/2, "center", "#242424", "40");
                playagainText.Draw();
                bgm.pause();
                bgm.currentTime = 0;
                audio_need=false;
                failM.play();
                canvas.addEventListener('click', function(){
                    this.removeEventListener('click', arguments.callee);
                    running =true;
                    start();
                });
                return true;
                
            }
        }

        score += 0.05;
        scoreText.t = "score : "+Math.floor(score);
        scoreText.Draw();

        if (score > highscore){
            highscore = Math.floor(score);
        }

        highscoreText.t = "high-score : "+highscore;
        highscoreText.Draw();

        player.Animate();
        
        gamespeed+= 0.001;
        requestAnimationFrame(Animateframe);
    }
}

let loaded = 0;
let redundancy = 0;

function oneloaded(){
    if (loaded<9){
        loaded++;
    }
    if (loaded>=9 && redundancy<1){
        redundancy++;
        allloaded();
    }
}
function allloaded(){
    // console.log("things are fine");
    sayAllOkay();
}

// checking all the assets are loaded up
bgm.oncanplaythrough = oneloaded;
startM.oncanplaythrough = oneloaded;
failM.oncanplaythrough = oneloaded;
jumpM.oncanplaythrough = oneloaded;
nking.onload = oneloaded;
fking.onload = oneloaded;
hking.onload = oneloaded;
ghost1.onload = oneloaded;
ghost2.onload = oneloaded;


// from here loading section
function sayAllOkay(){

    loadingText_running = false;
    // drawing background
    ctx.beginPath();
    ctx.fillStyle = "#b2b2b2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = '#121212';
    ctx.lineWidth = 8;
    ctx.moveTo(0, canvas.height-100);
    ctx.lineTo(canvas.width, canvas.height-100);
    ctx.stroke();
    ctx.closePath();
  
    ctx.beginPath();
    ctx.fillStyle = '#46703c';
    ctx.fillRect(0,canvas.height-100, canvas.width, canvas.height-100, 0,canvas.height,canvas.width,canvas.height);
    ctx.closePath();
    ctx.beginPath();
    ctx.drawImage(king, canvas.width/2 - (610/canvas.getBoundingClientRect().width)*130 , canvas.height/2 - 75,(610/canvas.getBoundingClientRect().width)*60, 150);
    ctx.drawImage(playbutton,canvas.width/2 -  (610/canvas.getBoundingClientRect().width)*50, canvas.height/2 -75,(610/canvas.getBoundingClientRect().width)*200, 150 )
    ctx.closePath();
    
    for (let i=0 ; i<canvas.width ; i+=30){
        spawnNoice_beginiing(i);
    }
    
    for (let i=0 ; i < noices.length ; i++){
        noices[i].Update();
    }

    //Binding the click event on the canvas
    canvas.addEventListener('click', function (){
        this.removeEventListener('click', arguments.callee);
        start();
    }, false);
}


// before loading section
let dotCount = 0; 
let error_count = 0 ;
let frame = 50;
const loadingText = new Text("Content is loading", canvas.width/2 - 130, canvas.height/2, "left", "#242424", "25");
const addLine1 = new Text("smells something wrong :/",canvas.width/2 , canvas.height/2 -50, "center", "#242424", "20");
const addLine2 = new Text("It could be,",80 , canvas.height/2 -15, "left", "#242424", "20");
const addLine3 = new Text("1.Connectivity issues ",80 , canvas.height/2 + 20, "left", "#f72020", "20");
const addLine4 = new Text("(try refresh the tab and check your connectivity)",110 , canvas.height/2 + 55, "left", "#242424", "20");
const addLine5 = new Text("2.Browser compatibility issues ",80 , canvas.height/2 + 90, "left", "#f72020", "20");
const addLine6 = new Text("(Throw away your uncivilised browser, if it's :)",110, canvas.height/2 + 125, "left", "#242424", "20");
const addLine7 = new Text("3.Server side issues (The worst senario)",80 , canvas.height/2 + 160, "left", "#f72020", "20");
const addLine8 = new Text("(Sorry, probabily you can't fix this)",110 , canvas.height/2 + 195, "left", "#242424", "20");
const addLine9 = new Text("That's a lot, BTW I'm sad that you cant load this fantastic game )",canvas.width/2 , canvas.height/2 + 260, "center", "#141414", "17");

window.onload = function(){
    
    ctx.beginPath();
    ctx.fillStyle = "#b2b2b2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
    loadingText.Draw();
    animateText();
}

function animateText(){
    if (loadingText_running== true){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = "#b2b2b2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();

        frame--;
        if (frame<=0){
            dotCount++;
            error_count++;
            frame = 50;
        }
        if (dotCount>3){
            dotCount = 0;
        }

        if(error_count>=25){        //48
            error_count=25;
            loadingText.y = canvas.height / 2 -150;
            if (dotCount===0){
                loadingText.t = "Content is loading";
                addLine1.Draw();
                addLine2.Draw();
                addLine3.Draw();
                addLine4.Draw();
                addLine5.Draw();
                addLine6.Draw();
                addLine7.Draw();
                addLine8.Draw();
                addLine9.Draw();
            }
            else if (dotCount===1){
                loadingText.t = "Content is loading.";
                addLine1.Draw();
                addLine2.Draw();
                addLine3.Draw();
                addLine4.Draw();
                addLine5.Draw();
                addLine6.Draw();
                addLine7.Draw();
                addLine8.Draw();
                addLine9.Draw();
            }
            else if (dotCount===2){
                loadingText.t = "Content is loading..";
                addLine1.Draw();
                addLine2.Draw();
                addLine3.Draw();
                addLine4.Draw();
                addLine5.Draw();
                addLine6.Draw();
                addLine7.Draw();
                addLine8.Draw();
                addLine9.Draw();
                }
            else {
                loadingText.t = "Content is loading...";
                addLine1.Draw();
                addLine2.Draw();
                addLine3.Draw();
                addLine4.Draw();
                addLine5.Draw();
                addLine6.Draw();
                addLine7.Draw();
                addLine8.Draw();
                addLine9.Draw();
            }
        }
        else{
            if (dotCount===0){
                loadingText.t = "Content is loading";
            }
            else if (dotCount===1){
                loadingText.t = "Content is loading.";
            }
            else if (dotCount===2){
                loadingText.t = "Content is loading..";
            }
            else {
                loadingText.t = "Content is loading...";
            }
        }
        
        loadingText.Draw();
        requestAnimationFrame(animateText);
    }
}








// browser is not visible pause media
// not effective in all cases still works

var visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  visibilityChange = "webkitvisibilitychange";
}
//^different browsers^

document.addEventListener(visibilityChange, function(){
    if (audio_need){
        if (bgm.paused){
            bgm.play();
        }
        else{
            bgm.pause();
        }
    }
}, false);