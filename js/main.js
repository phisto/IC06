

mainState = gamvas.State.extend({

    init: function() {
        //sounds
        if (navigator.appVersion.search("Chromium") == -1) {
            this.SoundlaunchSound = this.addSound("sound/launchCanon.ogg");
            // this.trapSound = this.addSound("sound/shock_ball_trap.ogg");
            // this.ballShock = this.addSound("sound/shock_ball_ball.ogg");
            // this.wallShock = this.addSound("sound/shock_ball_wall.ogg");
            // this.combos = this.addSound("sound/combos.ogg");
        }
        this.divforce = document.getElementById("force");
        // setup the world
        gamvas.physics.pixelsPerMeter = 128;
        gamvas.physics.resetWorld(0, 9.8, false);
        gamvas.physics.getWorld().SetContactListener(new contact_listener());
        gamvas.physics.getWorld().SetDebugDraw(new debugDraw());
        gamvas.physics.setGravity(new gamvas.Vector2D(0, 0));

        this.canon = new canonActor();
        this.addActor(new tabletActor());
        this.addActor(this.canon);

        this.sortie_initiale_du_canon = { x: this.canon.position.x, y: this.canon.position.y-180};

        this.force = 5;
        this.last_launch_time = new Date() - 5000;
        this.addObjects = [];
        this.colliding_elements = {};

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
            creator = featherBallActor;
            var newBall = new creator(rotated_point.x, rotated_point.y),
                vec = new gamvas.Vector2D(-5*force/10, 0).rotate(Math.PI/2 + this.canon.rotation);

            newBall.body.SetLinearVelocity(vec);
            this.addObjects.push(newBall);
            // this.launchSound.play();
        }
    },

    update: function(t) {
       _.forEach(this.colliding_elements, function (data) {
            var apply_influence = function (modifiable_fixture) {
                data.modifier.remote_action(modifiable_fixture);
            }
            _.forEach(data.modifiable, apply_influence);
       });
    },

    draw: function(t) {
        gamvas.physics.drawDebug();

        // rotate the canon
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            this.canon.rotate(-0.1*Math.PI*t);
            if (this.canon.rotation < -MAX_ROTATION)
                this.canon.rotation = -MAX_ROTATION;
        }

        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            this.canon.rotate(0.1*Math.PI*t);
            if (this.canon.rotation > MAX_ROTATION)
                this.canon.rotation = MAX_ROTATION;
        }

        if (gamvas.key.isPressed(gamvas.key.SPACE)) {
            if (this.force < 20)
                this.force += 5*t;
            this.divforce.innerHTML = this.force;
        }

        this.draw_visor();
        //this.draw_delay_before_new_launch();

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

    onKeyUp: function(keyCode, _, ev) {
        if (keyCode == gamvas.key.SPACE) {
            this.launchBall(this.force);
            this.force = 5;
        }
        return gamvas.key.exitEvent();
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
        var objects = JSON.parse(json);
        _.each(objects, function (obj) {
            var creator;
            switch(obj.type) {
                case "normalBall": creator = normalBallActor; break;
                case "featherBall": creator = featherBallActor; break;
                case "repulsor": creator = repulsorActor; break;
                case "attractor": creator = attractorActor; break;
            }

            if (creator) {
                var new_obj = new creator(obj.position.x, obj.position.y);
                gamvas.state.getCurrentState().addActor(new_obj);
            }

        });
    },
    to_export : function(obj) {
        var not_to_export = {"canon" : "", "dummy": "", "tablet" : ""};
        return !(obj.type in not_to_export);
    },

    export_level: function (name_level) {
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

            var obj = new ms.creator(worldMouse.x, worldMouse.y);
            obj.to_be_kicked = true;

            this.addObjects.push(obj);
        }
    }
});

var save = function (number) {
    localStorage["level" + number] = gamvas.state.getCurrentState().export_level();
}

var load = function (number) {
    json_level = localStorage["level" + number];
    import_level(json_level)
}

var import_level = function (json_level) {
    var prev_state = gamvas.state.getCurrentState() 
    for (name_actor in prev_state.actors) {
        prev_state.removeActor(name_actor);
    }
    new_ms = new mainState("mainState" + globalCounter++);
    new_ms._setup();
    gamvas.state.addState(new_ms);
    gamvas.state.setState(new_ms.name);
    gamvas.state.getCurrentState().import_level(json_level);
}

var ms = new mainState("mainState");
    gamvas.state.addState(ms);

// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.start('gameCanvas', true);
    //ms.addActor(new attractorActor(100, 100, 200, 1));  
});

var choose_right_creator = function (ev) {
    switch (ev.currentTarget.id) {
        case "btn_repulsor_creator":
            ms.creator = repulsorActor;
        break;
        case "btn_attractor_creator":
            ms.creator = attractorActor
        break;
        case "btn_ball_creator":
            ms.creator = normalBallActor;
        break;
        case "btn_wall_creator":
            ms.creator = wallActor;
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