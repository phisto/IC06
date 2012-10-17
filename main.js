var settings = {
    positionCanon : {x:0, y:300}
};

var listener = new b2Listener;

// when there is a contact, we check if the two objects
// are ballthrown and repulsor and we add the ballthrown
// in the colliding_elements dictionnary
listener.BeginContact = function(contact) {
    var extract = extract_ball_repulsor(contact);
    if (extract) {
        var ball = extract.ball,
            repulsor = extract.repulsor,
            repulsor_name = repulsor.GetBody().GetUserData().data.name,
            ball_name = ball.GetBody().GetUserData().data.name;
        
        if (ms.colliding_elements[repulsor_name] === undefined)
            ms.colliding_elements[repulsor_name] = {repulsor : repulsor, debris : {}};

        ms.colliding_elements[repulsor_name].debris[ball_name] = ball;
    }
};

// when the contacts ends between repulsor and ballthrown
// we have to remove the ballthrown from the colliding elements
listener.EndContact = function(contact) {
    var extract = extract_ball_repulsor(contact);
    if (extract) {
        var ball = extract.ball,
            repulsor = extract.repulsor,
            repulsor_name = repulsor.GetBody().GetUserData().data.name,
            ball_name = ball.GetBody().GetUserData().data.name;
        
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
        
        this.counterBall = 0;
        this.addObjects = [];

        // create canon
        this.canon = new canonActor('canon', settings.positionCanon.x, settings.positionCanon.y);
        this.addActor(this.canon);
        
        //create repulsors
        this.addActor(new repulsorActor('repulsor', 0, 10, 64, 20));
        this.addActor(new repulsorActor('repulsor2', 200, 200, 64, 20));
       
        // create the walls
        this.addActor(new wallActor('ground', 0, 230, 640, 20));
        this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
        this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
        this.addActor(new wallActor('top', 0, -230, 640, 20));

        // colliding elements keeps track of all the objects
        // within the reach of each repulsor
        this.colliding_elements = {};
        gamvas.physics.getWorld().SetContactListener(listener);

        // debugDraw : draw all the transparents boxes around the objects
        var debugDraw = new Box2D.Dynamics.b2DebugDraw();

        debugDraw.SetSprite(gamvas.getContext2D());
        debugDraw.SetDrawScale(gamvas.physics.pixelsPerMeter);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
        debugDraw.m_sprite.graphics.clear = function() {};
        gamvas.physics.getWorld().SetDebugDraw(debugDraw);

        // our world has no gravity
        gamvas.physics.setGravity(new gamvas.Vector2D(0, 0));

    },
    
    launchBall : function() {
        var theta = this.canon.rotation,
            sortie_initiale_du_canon = { x: 0, y: this.canon.position.y-180},
            around = this.canon.position,
            rotated_point = rotate_point(sortie_initiale_du_canon, around, theta),
            newBall = new circleActor("ballthrown" + this.counterBall++, rotated_point.x, rotated_point.y),
            vec = new gamvas.Vector2D(-5, 0).rotate(Math.PI/2 + this.canon.rotation);

        newBall.body.SetLinearVelocity(vec);
        this.addObjects.push(newBall);
    },

    update: function(t) {
       _.forEach(this.colliding_elements, function (data, repulsor_name) {
            var repulsor_fixture = data.repulsor,
                debris = data.debris;

            _.forEach(debris, function (ball_fixture, ball_name) {
                var vec = force_between_objects(ball_fixture, repulsor_fixture),
                    ball_position = ball_fixture.GetBody().GetWorldCenter();

                apply_force_center(ball_fixture.GetBody(), vec);

            });
       });
    },
    draw: function(t) {
        gamvas.physics.drawDebug();

        // rotate the canon
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            this.canon.rotate(-0.7*Math.PI*t);
            if (this.canon.rotation < -1.12)
                this.canon.rotation = -1.12;
        }
        
        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            this.canon.rotate(0.7*Math.PI*t);
            if (this.canon.rotation > 1.12)
                this.canon.rotation = 1.12;
        }

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