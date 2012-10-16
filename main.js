
mainActorState = gamvas.ActorState.extend({
    init: function() {
        // define our local variables
        this.counter = 0;
    },

    onCollision: function(a, ni) {
        if ( (a.type == "asteroid") && (ni > 15) ) {
            console.log("here is your captain speaking, we got hit hard by a asteroid... abandon ship!");
        }
    }

    // this is the actors brain, t is time in seconds since last tought
});

mainRepulsorState = gamvas.ActorState.extend({
    init : function () {
        console.log("creation repulseur");
    }
});
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

            // finally add the state to our actor
            this.addState(new mainActorState('main'));

            // and switch to it (actors have a default state which does nothing)
            this.setState('main');
           
        }
});

repulsorActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            this.type = "repulsor";
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('img/repulsor.png?' + new Date()));
            // set physics proberties... before...

            // ... creating the actual physics collision object
            this.bodyCircle(this.position.x, this.position.y, 100, gamvas.physics.STATIC);
            // finally add the state to our actor
            this.addState(new mainRepulsorState('repulsor'));

            // and switch to it (actors have a default state which does nothing)
            this.setSensor(true);
            
            this.setState('repulsor');
            //this.body.setUserData({type:"repulsor"});
            this.setCenter(12, 12);
           this.resetForces();
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

//Add listeners for contact
var b2Listener = Box2D.Dynamics.b2ContactListener;
var listener = new b2Listener;

var extract_ball_repulsor = function (contact) {
    var fixture_a = contact.GetFixtureA(),
        fixture_b = contact.GetFixtureB();

    var repulsor = false, ball = false;

    if (fixture_a.GetBody().GetUserData().data.name == "repulsor")
        repulsor = fixture_a;
    if (fixture_b.GetBody().GetUserData().data.name == "repulsor")
        repulsor = fixture_b;

    if (fixture_a.GetBody().GetUserData().data.name.search("ballthrown") != -1)
        ball = fixture_a;
    if (fixture_b.GetBody().GetUserData().data.name.search("ballthrown") != -1)
        ball = fixture_b;

    if (repulsor && ball) {
        return {repulsor:repulsor, ball:ball};
    }
    return false;
};


listener.BeginContact = function(contact) {
    var extract = extract_ball_repulsor(contact);
    if (extract) {
        var ball = extract.ball,
            repulsor = extract.repulsor;
        console.log("begin collision between ball and repulsor", ball.GetBody().GetUserData(), repulsor.GetBody().GetUserData());
        
        var repulsor_name = repulsor.GetBody().GetUserData().data.name,
            ball_name = ball.GetBody().GetUserData().data.name;
        
        if (ms.colliding_elements[repulsor_name] === undefined)
            ms.colliding_elements[repulsor_name] = {repulsor : repulsor, debris : {}};

        ms.colliding_elements[repulsor_name].debris[ball_name] = ball;
    }
};

listener.EndContact = function(contact) {
    var extract = extract_ball_repulsor(contact);
    if (extract) {
        var ball = extract.ball,
            repulsor = extract.repulsor;
        console.log("end collision between ball and repulsor", ball.GetBody().GetUserData(), repulsor.GetBody().GetUserData());

        var repulsor_name = repulsor.GetBody().GetUserData().data.name,
            ball_name = ball.GetBody().GetUserData().data.name;
        
            console.log(ms)
        delete ms.colliding_elements[repulsor_name].debris[ball_name];
    }
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

        window.repulsor = new repulsorActor('repulsor', 0, 10, 64, 20);
        window.repulsor.resetForces();
        this.addActor(window.repulsor);
        // create the walls
        this.addActor(new wallActor('ground', 0, 230, 640, 20));
        this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
        this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
        this.addActor(new wallActor('top', 0, -230, 640, 20));

        
        this.colliding_elements = {};

        var debugDraw = new Box2D.Dynamics.b2DebugDraw();
        debugDraw.SetSprite(gamvas.getContext2D());
        debugDraw.SetDrawScale(gamvas.physics.pixelsPerMeter);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
        debugDraw.m_sprite.graphics.clear = function() {};
        gamvas.physics.getWorld().SetDebugDraw(debugDraw);
        gamvas.physics.getWorld().SetContactListener(listener);

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
        
        window.ball = newBall;
        var vec = new gamvas.Vector2D(-5, 0);
        newBall.body.SetLinearVelocity(vec.rotate(Math.PI/2 + this.canon.rotation));

        newBall.friction = 0.5;
        this.addObjects.push(newBall);
    },

    update: function(t) {
       _.forEach(this.colliding_elements, function (data, repulsor_name) {
            var repulsor_fixture = data.repulsor;
            var debris = data.debris;

            _.forEach(debris, function (ball_fixture, ball_name) {
                var vec = force_between_objects(ball_fixture, repulsor_fixture);
                var ball_position = ball_fixture.GetBody().GetWorldCenter();


                console.log(vec, ball_position);
                window.o = ball_fixture;
                apply_force_center(ball_fixture.GetBody(), vec);

            });
       });
    },
    draw: function(t) {
                gamvas.physics.drawDebug();

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

    onKeyDown: function(keyCode) {
        if (keyCode == gamvas.key.SPACE) {
            this.launchBall();
        }
        return gamvas.key.exitEvent();
    }
});

var ms = new mainState("mainState");
// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(ms);
    gamvas.start('gameCanvas', true);
});
