// TODO 
// 1st Level
// Fake Walls around the scene to detect when
// a ball has been thrown away


MAX_TIME_ELAPSED = 1000;
POSITION_CANON = { x:0, y:300 }; 

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
        //sounds 
        // this.launchSound = this.addSound("sound/launchCanon.ogg");
        // this.trapSound = this.addSound("sound/shock_ball_trap.ogg");
        // this.ballShock = this.addSound("sound/shock_ball_ball.ogg");
        // this.wallShock = this.addSound("sound/shock_ball_wall.ogg");
        // this.combos = this.addSound("sound/combos.ogg");


        // set how many pixels are considered 1m, this is a very
        // important setting on how realistic the sim looks
        // try to orient it on your objects and how long they
        // would be in real life
        gamvas.physics.pixelsPerMeter = 128;

        // disable object sleeping (third parameter is false)
        var w = gamvas.physics.resetWorld(0, 9.8, false);
        
        this.last_launch_time = new Date() - 5000;
        this.counterBall = 0;
        this.counterBallLevel = 0;
        this.counterRepulsor = 0;
        this.counterWall = 0;

        this.force = 0;
        this.addObjects = [];

        // create canon
        this.canon = new canonActor('canon', POSITION_CANON.x, POSITION_CANON.y);
        //this.canon_sound = this.addSound("sound/canon_lancement.mp3");
        //this.canon_sound.play();
        this.addActor(this.canon);
        
        this.sortie_initiale_du_canon = { x: 0, y: this.canon.position.y-180};

        //create repulsors
        this.addActor(new repulsorActor(0, 10, 64, 20));
        this.addActor(new repulsorActor(200, 200, 64, 20));
       
        // create the walls
        //this.addActor(new wallActor('ground', 0, 230, 640, 20));
        //this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
        //this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
        //this.addActor(new wallActor('top', 0, -230, 640, 20));

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

    getCanonExit : function() {
        var theta = this.canon.rotation,
            around = this.canon.position,
            rotated_point = rotate_point(this.sortie_initiale_du_canon, around, theta);
        return rotated_point;
    },

    launchBall : function(force) {
        if (new Date() - ms.last_launch_time > MAX_TIME_ELAPSED) {
            ms.last_launch_time = new Date();

            var theta = this.canon.rotation,
                around = this.canon.position,
                rotated_point = rotate_point(this.sortie_initiale_du_canon, around, theta),
                random = Math.floor(Math.random()*3);
            switch (random) {
                case 0 : var creator = normalBallActor; break; 
                case 1 : var creator = glassBallActor; break; 
                case 2 : var creator = featherBallActor; break; 
            }
            var newBall = new creator(rotated_point.x, rotated_point.y),
                vec = new gamvas.Vector2D(-5*force/10, 0).rotate(Math.PI/2 + this.canon.rotation);

            newBall.body.SetLinearVelocity(vec);
            this.addObjects.push(newBall);
            // this.launchSound.play();
        }
    },

    update: function(t) {
       _.forEach(this.colliding_elements, function (data, repulsor_name) {
            var repulsor_fixture = data.repulsor,
                debris = data.debris;

            _.forEach(debris, function (ball_fixture, ball_name) {
                var vec = force_between_objects(ball_fixture, repulsor_fixture, 1),
                    ball_position = ball_fixture.GetBody().GetWorldCenter();

                apply_force_center(ball_fixture.GetBody(), vec);

            });
       });
    },


    draw: function(t) {
        gamvas.physics.drawDebug();

        // rotate the canon
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            this.canon.rotate(-0.2*Math.PI*t);
            if (this.canon.rotation < -1.12)
                this.canon.rotation = -1.12;
        }
        
        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            this.canon.rotate(0.2*Math.PI*t);
            if (this.canon.rotation > 1.12)
                this.canon.rotation = 1.12;
        }

        this.draw_visor();
        this.draw_delay_before_new_launch();

        while (this.addObjects.length > 0) {
            // get the current and remove it from the array
            var curr = this.addObjects.shift();
            this.addActor(curr);
        }
    },

    draw_visor : function ()  {
        var first_point = translate(this.canon.position, { y: -180 });
        var other_point = { x : this.canon.position.x,
                            y : this.canon.position.y-500 };
        other_point = rotate_point(other_point, this.canon.position, this.canon.rotation);

        draw_line(this.c, this.canon.position, other_point, "#FFFFFF");
    },

    draw_force : function () {
        
    },

    draw_delay_before_new_launch : function() {
        var time_elapsed = new Date() - this.last_launch_time;
        if (time_elapsed > MAX_TIME_ELAPSED) time_elapsed = MAX_TIME_ELAPSED; 

        var bottom = 10;
        var max_width = 198;
        var percentage = time_elapsed/MAX_TIME_ELAPSED;

        draw_rectangle(this.c, -420, -320, max_width+2, 10, "white", "white");
        draw_rectangle(this.c, -221, -319, - percentage * max_width, 8, "black", "black");
    },

    onKeyDown: function (keycode, _, ev) {
        if (keycode == gamvas.key.SPACE) {
            if (this.force < 20)
                this.force += 1;
            document.getElementById("force").innerHTML = this.force;
        }
        return gamvas.key.exitEvent();
    },

    onKeyUp: function(keyCode, _, ev) {
        if (keyCode == gamvas.key.SPACE) {
            this.launchBall(this.force);
            console.log(this.force);
            this.force = 3;
        }
        return gamvas.key.exitEvent();
    },
    
    to_export : function(obj) {
        var not_to_export = ["canon"];
        return true;
        //return !(obj.type in not_to_export);
    },

    convert_for_json : function (obj) {
        var converted = {
                         name: obj.name,
                         position : obj.position,
                         center : obj.center,
                         rotation : obj.rotation,
                         currentState : obj.currentState,
                         type : obj.type
                         };

        return converted;
    },

    import_level : function(json) {
        for (act in ms.actors) {
            delete ms.actors.act;
        }

        var objects = JSON.parse(json);
        _.each(objects, function (obj) {
            var new_obj;
                switch(obj.type) {
                    case "canon": new_obj =  new canonActor(); break;
                    case "ball": new_obj =  new ballActor(); break;
                    case "repulsor": new_obj =  new repulsorActor(); break;
                }

                new_obj.setPosition(obj.position);
                new_obj.setCenter(obj.center);
                new_obj.setState(obj.currentState);

                ms.addActor(new_obj);
            
        });
    },

    export_level: function (name_level) {
        console.log(1);
        return JSON.stringify(
                _.filter(
                    _.map(this.getActors(),
                          this.convert_for_json),
                    this.to_export));
    },


    onMouseDown: function(b, x, y) {
        // do we have a left mouse button press?
        if (b == gamvas.mouse.LEFT) {
            // convert the screen mouse position to world position
            var worldMouse = this.camera.toWorld(x, y);
            // are we in our box?

            if (Math.abs(worldMouse.x) > 430 || Math.abs(worldMouse.y) > 330)
                return

            switch (this.creator) {
                case "ball":     var obj = new normalBallActor(worldMouse.x, worldMouse.y);     break;
                case "repulsor": var obj = new repulsorActor(worldMouse.x, worldMouse.y, 100);  break;
                case "wall":     var obj = new wallActor(worldMouse.x, worldMouse.y, 100);      break;

            }
            
            this.addObjects.push(obj);
        }
    }
});

var ms = new mainState("mainState");
// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(ms);
    gamvas.start('gameCanvas', true);
});

n_level = 0;
var choose_right_creator = function (ev) {
    switch (ev.currentTarget.id) {
        case "btn_repulsor_creator":
            ms.creator = "repulsor";
        break;
        case "btn_ball_creator":
            ms.creator = "ball";
        break;
        case "btn_wall_creator":
            ms.creator = "wall";
        break;
        case "btn_save_creator":
            console.log("coucou");
            localStorage["level" + n_level++] = ms.export_level();
        break;
    }
}

$(function () {
    $("button").click(choose_right_creator);
});