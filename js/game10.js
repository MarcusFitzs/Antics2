let menuScene = new Phaser.Scene('Menu');
let gameScene1 = new Phaser.Scene('Game1');
let gameScene2 = new Phaser.Scene('Game2');
let gameScene3 = new Phaser.Scene('Game3');
let pauseScene = new Phaser.Scene('Pause');

var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true,
    physics: {
        default: 'arcade',
    },
    scene: [menuScene, gameScene1, gameScene2, gameScene3, pauseScene] 
};

var game = new Phaser.Game(config);

var score = 0;
var positions1 = {
    
// spawn positions for strawberry map1
x: [60, 220, 580, 540, 500, 380, 220, 140, 340, 60],
y: [60, 60, 60, 140, 220, 220, 140, 300, 300, 220]
}

// spawn positions for strawberry map2
var positions2 = {
x: [140, 420, 580, 320, 220, 500, 60, 100, 540, 320],
y: [60, 140, 300, 180, 220, 300, 60, 300, 60, 60]
}

// spawn positions for strawberry map3
var positions3 = {
x: [60, 540, 140, 140, 420, 420, 580, 580, 180, 100],
y: [180, 180, 140, 220, 220, 140, 300, 60, 60, 300]
}

var gameOver = false;

// Bullet class
let Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
    function Bullet (scene){
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 0.5;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bullet from tower to the player
    fire: function (shooter, target){
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta/2;
        this.y += this.ySpeed * delta/2;
        this.born += delta;
        if (this.born > 5800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});


// Bomb class
let Bomb = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bomb Constructor
    function Bomb (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bomb');
        this.speed = 0.1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bomb from tower to the player
    fire: function (shooter, target)
    {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bomb to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bomb with shooters rotation
        this.born = 0; // Time since new bomb spawned
    },

    // Updates the position of the bomb each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 5800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

// Menu Scene
menuScene.preload = function(){
    this.load.image('titleBG', 'assets/TitleBG.png');
    this.load.image('title', 'assets/TitleLite.png');
    this.load.image('button', 'assets/ButtonBG.png');
}

menuScene.create = function(){
    this.titleBG = this.add.image(320, 180, 'titleBG');
    this.title = this.add.image(320, 140, 'title');
    this.button = this.add.image(320, 240, 'button');
    
    //start game if button pressed
    this.button.setInteractive();
    this.button.on('pointerdown', function(){
        
        console.log(this);
        this.scene.start(gameScene1);
        document.getElementById("theScore").innerHTML = "Score: " + score;
    }, this);
}


// LEVEL 1
gameScene1.preload = function(){
    // Load in images and sprites
    this.load.image('player', 'assets/player.png');
    this.load.image('tower', 'assets/CircleTower.png');
    this.load.image('tower2', 'assets/SquareTower.png');
    this.load.image('bullet', 'assets/Bullet.png');
    this.load.image('bomb', 'assets/Bomb.png');
    this.load.image('background', 'assets/Background3.png');
    this.load.image('border', 'assets/border.png');
    this.load.image('range', 'assets/Range.png');
    this.load.image('strawberry', 'assets/strawberry.png');
    this.load.image('archer', 'assets/ArcherFirePix.png');
    this.load.image('cannon', 'assets/Cannon.png');
    
    // Load audio
    this.load.audio('bowFire', 'assets/BowFire.wav');
    this.load.audio('cannonFire', 'assets/CannonFire.wav');
}

gameScene1.create = function(){
    // Set world bounds
    this.physics.world.setBounds(0, 0, 640, 360);
    
    // Add group for borders
    borders = this.physics.add.staticGroup();
    
    // Add the background map and the borders (refreshBody for scale collision adjustment)
    var background = this.add.image(320, 180, 'background');
    borders.create(320, 20, 'border').setScale(16,1).refreshBody();
    borders.create(620, 200, 'border').setScale(1,8).refreshBody();
    borders.create(320, 340, 'border').setScale(14,1).refreshBody();
    borders.create(20, 220, 'border').setScale(1,7).refreshBody();
    borders.create(100, 160, 'border').setScale(1,6).refreshBody();
    borders.create(180, 180, 'border').setScale(1,5).refreshBody();
    borders.create(220, 100, 'border').setScale(1,1).refreshBody();
    borders.create(260, 200, 'border').setScale(1,6).refreshBody();
    borders.create(340, 180, 'border').setScale(1,5).refreshBody();
    borders.create(380, 260, 'border').setScale(1,1).refreshBody();
    borders.create(420, 160, 'border').setScale(1,6).refreshBody();
    borders.create(500, 260, 'border').setScale(1,1).refreshBody();
    borders.create(540, 220, 'border').setScale(1,3).refreshBody();
    borders.create(500, 140, 'border').setScale(1,3).refreshBody();
    borders.create(560, 100, 'border').setScale(2,1).refreshBody();

    // Add group for projectile objects (arrows, bombs)
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    tower2Bombs = this.physics.add.group({ classType: Bomb, runChildUpdate: true });

    // Add player, enemy, reticle, healthpoint sprites
    player = this.physics.add.sprite(20, 60, 'player');
    range = this.physics.add.sprite(100, 260, 'range').setVisible(false);
    range2 = this.physics.add.sprite(500, 180, 'range').setVisible(false).setScale(2,2);
    tower = this.physics.add.sprite(100, 260, 'tower');
    enemy = this.physics.add.sprite(100, 260, 'archer');
    tower2 = this.physics.add.sprite(340, 140, 'tower2');
    cannon = this.physics.add.sprite(340, 140, 'cannon');
    strawberry = this.physics.add.sprite(60, 60, 'strawberry');
    reticle = this.physics.add.sprite(100, 60, 'target').setVisible(false);
    hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
    hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
    hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

    // Set image/sprite properties
    background.setOrigin(0.5, 0.5).setDisplaySize(640, 360);
    player.setOrigin(0.5, 0.5).setCollideWorldBounds(true)
    tower.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    // Set sprite variables
    player.health = 3;
    enemy.lastFired = 0;
    tower2.lastFired = 0;
    
    // Add sound
    this.bowFire = this.sound.add('bowFire');
    this.cannonFire = this.sound.add('cannonFire');

    // invisible 'reticle' follows pointer
    this.input.on('pointermove', function (pointer) {
        reticle.x = pointer.x;
        reticle.y = pointer.y;
    }, this);
    
    //sets the walls as physical objects in game
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, borders);
    
    // start moving when pointer is down
    this.input.on('pointerdown', function (pointer)
    {
        console.log("pointer down");

        this.physics.moveToObject(player, pointer, 200);
    }, this);
    
    // stop moving when pointer is up
    this.input.on('pointerup', function (pointer)
    {
        console.log("pointer up");

        this.physics.moveToObject(player, pointer, 0);
    }, this);
    
    // udate the direction of movement when the mouse moves (cant get it to work only when pointer is down at the moment)
    this.input.on('pointermove', function (pointer)
    {
        this.physics.moveToObject(player, pointer, 200);
    }, this);
}


gameScene1.update = function(time, delta){
    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    cannon.rotation = Phaser.Math.Angle.Between(cannon.x, cannon.y, player.x, player.y);

    // Make enemy fire
    enemyFire(enemy, player, time, this);
    tower2Fire(tower2, player, time, this);
    
    // keep track of score and move to next map when complete by setting collision between strawberry and player
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), strawberry.getBounds())) {
        
        //strawberry respawns at one of 10 positions
        let randNum = Math.floor(Math.random() * 10)
        strawberry.x = positions1.x[randNum];
        strawberry.y = positions1.y[randNum];
        
        score++;
        
        //update the score
        document.getElementById("theScore").innerHTML = "Score: " + score;
        if(score == 5){
            this.scene.start(gameScene2);  
        }
    }
    
    if (gameOver == true){
        this.scene.start(menuScene); 
        gameOver = false;
        score = 0;
    }
}


// LEVEL 2
gameScene2.preload = function(){
    this.load.image('player', 'assets/player.png');
    this.load.image('tower', 'assets/CircleTower.png');
    this.load.image('tower2', 'assets/SquareTower.png');
    this.load.image('bullet', 'assets/Bullet.png');
    this.load.image('bomb', 'assets/Bomb.png');
    this.load.image('background', 'assets/Background3.png');
    this.load.image('border', 'assets/border.png');
    this.load.image('range', 'assets/Range.png');
    this.load.image('strawberry', 'assets/strawberry.png');
    this.load.image('archer', 'assets/ArcherFirePix.png');
    this.load.image('cannon', 'assets/Cannon.png');
    this.load.image('tower3', 'assets/OctoTower.png');
    this.load.image('ballista', 'assets/BallistaSm.png');
}

gameScene2.create = function(){
    // Set world bounds
    this.physics.world.setBounds(0, 0, 640, 360);
    
    borders = this.physics.add.staticGroup();
    
    // Add the background map and the borders (refreshBody for scale collision adjustment)
    var background = this.add.image(320, 180, 'background');
    borders.create(150, 20, 'border').setScale(7.5,1).refreshBody();
    borders.create(490, 20, 'border').setScale(7.5,1).refreshBody();
    borders.create(20, 180, 'border').setScale(1,7).refreshBody();
    borders.create(620, 180, 'border').setScale(1,7).refreshBody();
    borders.create(320, 340, 'border').setScale(16,1).refreshBody();
    borders.create(100, 60, 'border').setScale(1,1).refreshBody();
    borders.create(320, 100, 'border').setScale(12,1).refreshBody();
    borders.create(380, 140, 'border').setScale(1,1).refreshBody();
    borders.create(460, 180, 'border').setScale(5,1).refreshBody();
    borders.create(180, 180, 'border').setScale(5,1).refreshBody();
    borders.create(260, 220, 'border').setScale(1,1).refreshBody();
    borders.create(320, 260, 'border').setScale(12,1).refreshBody();
    borders.create(540, 300, 'border').setScale(1,1).refreshBody();

    // Add group for Bullet objects
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    tower2Bombs = this.physics.add.group({ classType: Bomb, runChildUpdate: true });

    // Add player, enemy, reticle, healthpoint sprites
    player = this.physics.add.sprite(320, 20, 'player');
    range = this.physics.add.sprite(380, 140, 'range').setVisible(false);
    tower = this.physics.add.sprite(380, 180, 'tower');
    tower2 = this.physics.add.sprite(260, 180, 'tower2');
    cannon = this.physics.add.sprite(260, 180, 'cannon');
    enemy = this.physics.add.sprite(380, 180, 'archer');
    strawberry = this.physics.add.sprite(240, 60, 'strawberry');
    reticle = this.physics.add.sprite(100, 60, 'target').setVisible(false);
    hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
    hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
    hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

    // Set image/sprite properties
    background.setOrigin(0.5, 0.5).setDisplaySize(640, 360);
    player.setOrigin(0.5, 0.5).setCollideWorldBounds(true)//.setDrag(500, 500);
    tower.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    // Set sprite variables
    player.health = 3;
    enemy.lastFired = 0;
    tower2.lastFired = 0;

    this.input.on('pointermove', function (pointer) {
        reticle.x = pointer.x;
        reticle.y = pointer.y;
    }, this);
    
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, borders);
    
    // start moving when pointer is down
    this.input.on('pointerdown', function (pointer)
    {
        console.log("pointer down");

        this.physics.moveToObject(player, pointer, 200);
    }, this);
    
    // stop moving when pointer is up
    this.input.on('pointerup', function (pointer)
    {
        console.log("pointer up");

        this.physics.moveToObject(player, pointer, 0);
    }, this);
    
    // udate the direction of movement when the mouse moves (cant get it to work only when pointer is down at the moment)
    this.input.on('pointermove', function (pointer)
    {
        this.physics.moveToObject(player, pointer, 200);
    }, this);
}

gameScene2.update = function(time, delta){
    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    cannon.rotation = Phaser.Math.Angle.Between(cannon.x, cannon.y, player.x, player.y);

    // Make enemy fire
    enemyFire(enemy, player, time, this);
    tower2Fire(tower2, player, time, this);
    
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), strawberry.getBounds())) {
        let randNum = Math.floor(Math.random() * 10)
        strawberry.x = positions2.x[randNum];
        strawberry.y = positions2.y[randNum];
        
        score++;
        document.getElementById("theScore").innerHTML = "Score: " + score;
        if(score == 10){
            this.scene.start(gameScene3);  
        }
    }
    
    if (gameOver == true){
        this.scene.start(menuScene); 
        gameOver = false;
    }
}


// LEVEL 3
gameScene3.preload = function(){
    this.load.image('player', 'assets/player.png');
    this.load.image('tower', 'assets/CircleTower.png');
    this.load.image('tower2', 'assets/SquareTower.png');
    this.load.image('bullet', 'assets/Bullet.png');
    this.load.image('bomb', 'assets/Bomb.png');
    this.load.image('background', 'assets/Background3.png');
    this.load.image('border', 'assets/border.png');
    this.load.image('range', 'assets/Range.png');
    this.load.image('strawberry', 'assets/strawberry.png');
    this.load.image('archer', 'assets/ArcherFirePix.png');
    this.load.image('cannon', 'assets/Cannon.png');
    this.load.image('tower3', 'assets/OctoTower.png');
    this.load.image('ballista', 'assets/BallistaSm.png');
}

gameScene3.create = function(){
    // Set world bounds
    this.physics.world.setBounds(0, 0, 640, 360);
    
    borders = this.physics.add.staticGroup();
    
    // Add the background map and the borders (refreshBody for scale collision adjustment)
    var background = this.add.image(320, 180, 'background');
    borders.create(320, 20, 'border').setScale(16,1).refreshBody();
    borders.create(320, 340, 'border').setScale(16,1).refreshBody();
    borders.create(20, 100, 'border').setScale(1,3).refreshBody();
    borders.create(20, 260, 'border').setScale(1,3).refreshBody();
    borders.create(620, 180, 'border').setScale(1,7).refreshBody();
    borders.create(320, 100, 'border').setScale(12,1).refreshBody();
    borders.create(320, 260, 'border').setScale(12,1).refreshBody();
    borders.create(100, 180, 'border').setScale(1,3).refreshBody();
    borders.create(300, 180, 'border').setScale(9,1).refreshBody();
    borders.create(540, 140, 'border').setScale(1,1).refreshBody();
    borders.create(540, 220, 'border').setScale(1,1).refreshBody();

    // Add group for Bullet objects
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    tower2Bombs = this.physics.add.group({ classType: Bomb, runChildUpdate: true });

    // Add player, enemy, reticle, healthpoint sprites
    player = this.physics.add.sprite(20, 180, 'player');
    range = this.physics.add.sprite(380, 140, 'range').setVisible(false);
    tower = this.physics.add.sprite(460, 180, 'tower');
    tower2 = this.physics.add.sprite(100, 180, 'tower2');
    cannon = this.physics.add.sprite(100, 180, 'cannon');
    enemy = this.physics.add.sprite(460, 180, 'archer');
    strawberry = this.physics.add.sprite(60, 60, 'strawberry');
    reticle = this.physics.add.sprite(100, 60, 'target').setVisible(false);
    hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
    hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
    hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

    // Set image/sprite properties
    background.setOrigin(0.5, 0.5).setDisplaySize(640, 360);
    player.setOrigin(0.5, 0.5).setCollideWorldBounds(true)//.setDrag(500, 500);
    tower.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    // Set sprite variables
    player.health = 3;
    enemy.lastFired = 0;
    tower2.lastFired = 0;

    this.input.on('pointermove', function (pointer) {
        reticle.x = pointer.x;
        reticle.y = pointer.y;
    }, this);
    
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, borders);
    
    // start moving when pointer is down
    this.input.on('pointerdown', function (pointer)
    {
        console.log("pointer down");

        this.physics.moveToObject(player, pointer, 200);
    }, this);
    
    // stop moving when pointer is up
    this.input.on('pointerup', function (pointer)
    {
        console.log("pointer up");

        this.physics.moveToObject(player, pointer, 0);
    }, this);
    
    // udate the direction of movement when the mouse moves (cant get it to work only when pointer is down at the moment)
    this.input.on('pointermove', function (pointer)
    {
        this.physics.moveToObject(player, pointer, 200);
    }, this);
}

gameScene3.update = function(time, delta){
    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    cannon.rotation = Phaser.Math.Angle.Between(cannon.x, cannon.y, player.x, player.y);

    // Make enemy fire
    enemyFire(enemy, player, time, this);
    tower2Fire(tower2, player, time, this);
    
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), strawberry.getBounds())) {
        let randNum = Math.floor(Math.random() * 10)
        strawberry.x = positions3.x[randNum];
        strawberry.y = positions3.y[randNum];
        
        score++;
        document.getElementById("theScore").innerHTML = "Score: " + score;
        if(score == 15){
            //this.gameOver;
            document.getElementById("theScore").innerHTML = "Score: 5 - WINNER";
            score = 0;
            this.scene.start(menuScene);  
        }
    }
    
    if (gameOver == true){
        this.scene.start(menuScene); 
        gameOver = false;
    }
}

// Player Hit
function playerHitCallback(playerHit, bulletHit){
    // Reduce health of player\
    if (bulletHit.active === true && playerHit.active === true)
    {
        playerHit.health = playerHit.health - 1;
        //console.log("Player hp: ", playerHit.health);

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health == 2)
        {
            hp3.destroy();
            console.log(player.health);
            document.getElementById("theHealth").innerHTML = "Health: " + player.health;
            console.log(gameOver);
        }
        else if (playerHit.health == 1)
        {
            hp2.destroy();
            console.log(player.health);
            document.getElementById("theHealth").innerHTML = "Health: " + player.health;
        }
        else
        {
            hp1.destroy();
            player.destroy();
            console.log(player.health);
            document.getElementById("theHealth").innerHTML = "Health: " + player.health;
            gameOver = true;
            
            // Game over, back to menu
            //this.scene.start(menuScene);  
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

// Arrow Fire
function enemyFire(enemy, player, time, gameObject){
    if (enemy.active === false)
    {
        return;
    }

    // Tower fires if it hasn't fired in a certain ammount of time and if within range
    if ((time - enemy.lastFired) > 1000 && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.range.getBounds()))
    {
        gameScene1.bowFire.play();
        
        enemy.lastFired = time;

        // Get bullet from bullets group
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(enemy, player);
            // Add collider between bullet and player
            gameObject.physics.add.collider(player, bullet, playerHitCallback);
        }
    }
}

// Bomb Fire
function tower2Fire(tower2, player, time, gameObject)
{
    if (tower2.active === false)
    {
        return;
    }

    // Tower fires if it hasn't fired in a certain ammount of time
    if ((time - tower2.lastFired) > 3000)
    {
        gameScene1.cannonFire.play();
        
        tower2.lastFired = time;

        // Get bomb from bombs group
        var bomb = tower2Bombs.get().setActive(true).setVisible(true);

        if (bomb)
        {
            bomb.fire(tower2, player);
            // Add collider between bomb and player
            gameObject.physics.add.collider(player, bomb, playerHitCallback);
        }
    }
}