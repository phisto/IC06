var rotate_point = function (point, around, theta) {
    return {
            x : Math.cos(theta) * (point.x-around.x) - Math.sin(theta) * (point.y-around.y) + around.x,
            y : Math.sin(theta) * (point.x-around.x) + Math.cos(theta) * (point.y-around.y) + around.y
        };
};

// extract ball and repulsor from a contact
var extract_from_contact = function (contact) {
    var ms = gamvas.state.getCurrentState();

    var fixture_a = contact.GetFixtureA(),
        fixture_b = contact.GetFixtureB();


    var types = [fixture_a.GetBody().GetUserData().data.type,
                 fixture_b.GetBody().GetUserData().data.type];
    sound = types.sort().join("-");
    if (ms[sound])
        ms[sound].play()


    var modifier = false, ball = false, tablet = false;

    if (fixture_a.GetBody().GetUserData().data.name.search("Modifier") != -1){
            modifier = fixture_a;
    }
    else if (fixture_b.GetBody().GetUserData().data.name.search("Modifier") != -1){
            modifier = fixture_b;
    }
    if (fixture_a.GetBody().GetUserData().data.name.search("Ball") != -1) {
        ball = fixture_a;
    }

    else if (fixture_b.GetBody().GetUserData().data.name.search("Ball") != -1) {
        ball = fixture_b;
    }

    if (fixture_a.GetBody().GetUserData().data.name.search("Tablet") != -1) {
            tablet = fixture_a;
    }
    else if (fixture_b.GetBody().GetUserData().data.name.search("Tablet") != -1){
            tablet = fixture_b;
    }
    var result = {};
    result.type_extract = "NA"

    if (modifier && ball) {
        result.type_extract = "modifier_ball";
        result.modifier = modifier;
        result.ball = ball;
    }

    else if (tablet && ball) {
        result.type_extract = "tablet_ball";
        result.tablet = tablet;
        result.ball = ball;
    }

    return result;
};

// aliases
var b2vec2 = Box2D.Common.Math.b2Vec2;
var b2ContactListener = Box2D.Dynamics.b2ContactListener;

var draw_line = function(ctx, point1, point2, color) {
    color = color || "#000000";

    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.strokeStyle = color;
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
};

var gradient = function (ctx, point1, point2, stops) {
    var lingrad = ctx.createLinearGradient(point1.x, point1.x, point2.x,point2.y);

    for (var i=0; i < stops.length; i++) {
        lingrad.addColorStop(stops[i][0], stops[i][1]);
    }

    return lingrad;
};

var translate = function(point, vec) {
    vec.x = vec.x || 0;
    vec.y = vec.y || 0;

    return { x : point.x + vec.x,
             y: point.y + vec.y };
};

var draw_rectangle = function (ctx, x, y, w, h, stroke, fill) {
    stroke = stroke || "black";
    fill = fill || "white";

    ctx.beginPath();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.fill();
};

var convert_for_json = function (obj) {
    var converted = {
                     name: obj.name,
                     position : obj.position,
                     center : obj.center,
                     rotation : obj.rotation,
                     currentState : obj.currentState,
                     type : obj.type,
                     to_be_kicked : obj.to_be_kicked
                     };
    console.log(converted)
    return converted;
};

var to_export = function(obj) {
    var not_to_export = {"canon" : "", "dummy": "", "tablet" : ""};
    return !(obj.type in not_to_export);
};

var export_level = function (name_level) {
    var ms = gamvas.state.getCurrentState();

    return JSON.stringify(
            _.filter(
                _.map(ms.getActors(),
                      convert_for_json),
                to_export));
}

var add_from_json = function(json) {
    var st =  gamvas.state.getCurrentState(); 
    var objects = JSON.parse(json);
    _.each(objects, function (obj) {
        var creator;
        switch(obj.type) {
            case "normalBall": creator = normalBallActor; break;
            case "featherBall": creator = featherBallActor; break;
            case "repulsor": creator = repulsorActor; break;
            case "attractor": creator = attractorActor; break;
        }

        if (obj.type == "normalBall")
            console.log(obj)
        if (creator) {
            var new_obj = new creator(obj.position.x, obj.position.y);
            st.addActor(new_obj);

            if (obj.to_be_kicked === true) {
                new_obj.to_be_kicked = true;
                st.balls_to_kick++;
            }
        }

    });
}

var import_level = function (json_level) {
    var prev_state = gamvas.state.getCurrentState(); 
    for (name_actor in prev_state.actors) {
        prev_state.removeActor(name_actor);
    }
    new_ms = new Level("mainState" + globalCounter++);
    new_ms._setup();
    gamvas.state.addState(new_ms);
    gamvas.state.setState(new_ms.name);
    
    add_from_json(json_level);
}

var save = function (number) {
    localStorage["level" + number] = export_level();
}

var load = function (number) {
    json_level = localStorage["level" + number];
    import_level(json_level)
}

var setup_world = function () {
    gamvas.physics.pixelsPerMeter = 128;
    gamvas.physics.resetWorld(0, 9.8, false);
    gamvas.physics.getWorld().SetContactListener(new contact_listener());
    gamvas.physics.getWorld().SetDebugDraw(new debugDraw());
    gamvas.physics.setGravity(new gamvas.Vector2D(0, 0));    
}

var getCanonExit = function() {
    var st = gamvas.state.getCurrentState();
    var theta = st.canon.rotation,
        around = st.canon.position,
        rotated_point = rotate_point(st.sortie_initiale_du_canon, around, theta);
    return rotated_point;
};

var launchBall = function(force) {
    var st = gamvas.state.getCurrentState();

    if (new Date() - st.last_launch_time > MAX_TIME_ELAPSED) {
        st.last_launch_time = new Date();

        var random = Math.floor(Math.random()*3),
            canon_exit = getCanonExit();
        switch (random) {
            case 0 : var creator = normalBallActor; break;
            case 1 : var creator = glassBallActor; break;
            case 2 : var creator = featherBallActor; break;
        }
        creator = featherBallActor;
       var newBall = new creator(canon_exit.x, canon_exit.y),
            vec = new gamvas.Vector2D(-5*force/10, 0).rotate(Math.PI/2 + st.canon.rotation);

        newBall.body.SetLinearVelocity(vec);
        st.addObjects.push(newBall);
        //this.launchSound.play();
    }
}