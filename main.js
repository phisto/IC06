// a class for our round physics objects
circleActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('img/circle.png'));
            // set physics proberties... before...
            this.restitution = 0.5;
            this.friction = 0;
            this.layer = 2;
            // ... creating the actual physics collision object
            this.bodyCircle(this.position.x, this.position.y, 16);
            this.body.m_linearDamping = 0.3;
        }
});

// a class for our polygon objects
triangleActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('img/triangle.png'));
            this.restitution = 0.2;
            this.layer = 2;
            // add the physics collision body, set coordinates
            // of the polygon clockwise in pixel positions
            this.bodyPolygon(this.position.x, this.position.y, [ [16,0], [32,32], [0,32] ], 16, 16);
            // add a random rotation
            this.setRotation(Math.random()*2*Math.PI);
        }
});

// create our collision objects
wallActor = gamvas.Actor.extend({
        create: function(name, x, y, w, h) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            // check if we are a horizontal box or a vertical
            if (w>h) {
                this.setFile(st.resource.getImage('img/horizontal.png'));
            } else {
                this.setFile(st.resource.getImage('img/vertical.png'));
            }
            // create a static (non moving) rectangle
            this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
        }
});

canonActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        var st = gamvas.state.getCurrentState();
        this.setCenter(70, 180);
        this.setFile(st.resource.getImage('img/canon.png'));

    }
});


var positionCanon = {x:0, y:300};
var timestamp_space = new Date();

var rotate_point = function (point, around, theta) {
    return {
            x : Math.cos(theta) * (point.x-around.x) - Math.sin(theta) * (point.y-around.y) + around.x,
            y : Math.sin(theta) * (point.x-around.x) + Math.cos(theta) * (point.y-around.y) + around.y
        };
};

mainState = gamvas.State.extend({
    init: function() {
        // set how many pixels are considered 1m, this is a very
        // important setting on how realistic the sim looks
        // try to orient it on your objects and how long they
        // would be in real life
        gamvas.physics.pixelsPerMeter = 128;

        // disable object sleeping (third parameter is false)
        var w = gamvas.physics.resetWorld(0, 9.8, false);
        this.counter = 0;
        this.addObjects = [];

        // create a few dynamic circles so something happens
        this.canon = new canonActor('test', positionCanon.x, positionCanon.y);
        this.addActor(this.canon);

        // create the walls
        this.addActor(new wallActor('ground', 0, 230, 640, 20));
        this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
        this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
        this.addActor(new wallActor('top', 0, -230, 640, 20));
    },
    
    launchBall : function() {
        //If you rotate point (point.x, py) around point (ox, oy) by angle theta you'll get:
        //p'x = cos(theta) * (point.x-ox) - sin(theta) * (py-oy) + ox
        //p'y = sin(theta) * (point.x-ox) + cos(theta) * (py-oy) + oy

        var theta = this.canon.rotation;
        var sortie_initiale_du_canon = { x: 0, y: this.canon.position.y-180};
        var around = this.canon.position;
        var rotated_point = rotate_point(sortie_initiale_du_canon, around, theta);

        var newBall = new circleActor("ballthrown" + this.counter++, rotated_point.x, rotated_point.y);
        
        var vec = new gamvas.Vector2D(-5, 0);
        newBall.body.SetLinearVelocity(vec.rotate(Math.PI/2 + this.canon.rotation));

        newBall.friction = 0.5;
        this.addObjects.push(newBall);
    },

    draw: function(t) {
        // move/rotate the camera
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            this.canon.rotate(-0.7*Math.PI*t);
            
            if (this.canon.rotation < -1.12)
                this.canon.rotation = -1.12;
            console.log(this.canon.rotation);
        }
        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            this.canon.rotate(0.7*Math.PI*t);
            if (this.canon.rotation > 1.12)
                this.canon.rotation = 1.12;
            console.log(this.canon.rotation);

        }
        if (gamvas.key.isPressed(gamvas.key.UP)) {
            if (this.camera.zoomFactor < 1.5) {
                this.camera.zoom(0.7*t);
            }
        }

        if (gamvas.key.isPressed(gamvas.key.DOWN)) {
            if (this.camera.zoomFactor > 0.1) {
                this.camera.zoom(-0.7*t);
            }
        }

        // get a vector (note: we use positive 9.8 as our gravity
        // as our y coordinate runs down the screen)
        var vec = new gamvas.Vector2D(0, 0);

        // our world has no gravity     
        gamvas.physics.setGravity(vec);

        // you should always add physics object in your draw
        // function and not in your event functions, as events
        // can take place all the time and it could lead to
        // flickering and other problems adding objects in
        // event handlers
        while (this.addObjects.length > 0) {
            // get the current and remove it from the array
            var curr = this.addObjects.shift();
            this.addActor(curr);
        }
    },

    onMouseDown: function(b, x, y) {
        // do we have a left mouse button press?
        if (b == gamvas.mouse.LEFT) {
            // have we reached the limit of dynamic objects?
            if (this.counter < 50) {
                // convert the screen mouse position to world position
                var worldMouse = this.camera.toWorld(x, y);
                // are we in our box?
                if ( (worldMouse.x < 300) && (worldMouse.x > -300) && (worldMouse.y < 220) && (worldMouse.y > -220)) {
                    // save that we have to add our object (read draw comments
                    // to know why)
                    this.addObjects.push(new gamvas.Vector2D(worldMouse.x, worldMouse.y));
                }
            }
        }
    },

    onKeyDown: function(keyCode) {
        if (keyCode == gamvas.key.SPACE) {
            this.launchBall();
        }
        return gamvas.key.exitEvent();
    }
});

// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new mainState('mainState'));
    gamvas.start('gameCanvas', true);
    console.log("coucou")
});
