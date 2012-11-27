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
}
