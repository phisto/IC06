var Level = gamvas.State.extend({
    init: function () {
        this.add_all_sounds();        
        this.add_all_images();        

        this.divforce = document.getElementById("force");

        setup_world();
    },


    enter: function() {
        this.canon = new canonActor();
        this.tablet = new tabletActor()
        this.addActor(this.tablet);
        this.addActor(this.canon);

        this.sortie_initiale_du_canon = { x: this.canon.position.x, y: this.canon.position.y-180};

        this.force = 5;
        this.last_launch_time = new Date() - 5000;
        this.addObjects = [];
        this.colliding_elements = {};

        this.trajectories = [];

        this.score = 0;
        this.update_score(0);
        this.balls_to_kick = 0;
    },


    update: function(t) {
        this.apply_modifier_gravity();
    },

    draw: function(t) {
        // rotate the canon
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            if (gamvas.key.isPressed(gamvas.key.SHIFT))
                this.canon.rotate(-0.02*Math.PI*t);
            else
                this.canon.rotate(-0.1*Math.PI*t);
            if (this.canon.rotation < -MAX_ROTATION)
                this.canon.rotation = -MAX_ROTATION;
        }

        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            if (gamvas.key.isPressed(gamvas.key.SHIFT))
                this.canon.rotate(0.02*Math.PI*t);
            else
                this.canon.rotate(0.1*Math.PI*t);
                
            if (this.canon.rotation > MAX_ROTATION)
                this.canon.rotation = MAX_ROTATION;
        }

        if (gamvas.key.isPressed(gamvas.key.A)) {
            if (this.force < 20)
                this.force += 5*t;
        }

        gamvas.physics.drawDebug();
        this.draw_visor();
        this.draw_breadcrumbs();
        this.add_waiting_objects();
    },

    onKeyUp: function(keyCode, _, ev) {
        if (keyCode == gamvas.key.A) {
            launchBall(this.force);
            this.force = 5;
        }
        return gamvas.key.exitEvent();
    },

    onKeyDown: function(keyCode) {
        if (keyCode == gamvas.key.SPACE) {
            return gamvas.key.exitEvent();
        }
    },
    
    onMouseDown: function(button, x, y) {
        if (button == gamvas.mouse.LEFT) {
            var worldMouse = this.camera.toWorld(x, y);
            
            // are we in our box?
            if (Math.abs(worldMouse.x) > 430 || Math.abs(worldMouse.y) > 330)
                return false;

            if (this.creator !== undefined ) {
                if (this.creator == wallActor) {
                    var obj = new this.creator(worldMouse.x, worldMouse.y, 100, 20)
                }
                else {
                    var obj = new this.creator(worldMouse.x, worldMouse.y);
                    if ($("#to_be_kicked").attr("checked") == "checked")
                        obj.to_be_kicked = true;
                    else
                        obj.to_be_kicked = false;
                }

                this.addObjects.push(obj);
                if ($("#permanent").attr("checked") != "checked")
                    this.creator = undefined;
            }
            else {
                console.log(worldMouse.x, worldMouse.y)
            }
        }
    },

    load: function(json) {
        import_level(json);
    },

    update_score: function (n) {
        this.score = this.score + n;
        $("#score").text(this.score) 
    },

    add_waiting_objects: function () {
        while (this.addObjects.length > 0) {
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


    draw_breadcrumbs: function() {
        this.c.fillStyle = "rgba(255,255,255, 0.2)";
        _.forEach(this.trajectories, function (p) {
            this.c.fillRect(p.x,p.y,3,3);
        }, this);
    },

    apply_modifier_gravity : function () {
        _.forEach(this.colliding_elements, function (data) {
            var apply_influence = function (modifiable_fixture) {
                data.modifier.remote_action(modifiable_fixture);
            }
            _.forEach(data.modifiable, apply_influence);
       });
    },

    add_all_sounds : function () {
        this.SoundlaunchSound = this.addSound("sound/launchCanon.ogg");
        this.trapSound = this.addSound("sound/shock_ball_trap.ogg");
        this.ballShock = this.addSound("sound/shock_ball_ball.ogg");
        this.wallShock = this.addSound("sound/shock_ball_wall.ogg");
        this.combos = this.addSound("sound/combos.ogg");
    },

    add_all_images: function () {

    }

})