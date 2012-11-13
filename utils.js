var rotate_point = function (point, around, theta) {
    return {
            x : Math.cos(theta) * (point.x-around.x) - Math.sin(theta) * (point.y-around.y) + around.x,
            y : Math.sin(theta) * (point.x-around.x) + Math.cos(theta) * (point.y-around.y) + around.y
        };
};


var force_between_objects = function (ball, repulsor, force) {
    var center_ball = ball.GetBody().GetWorldCenter(),
        center_repulsor = repulsor.GetBody().GetWorldCenter();

    var vec = new b2vec2((center_repulsor.x - center_ball.x),
                         (center_repulsor.y - center_ball.y)),
        d = vec.Normalize();

    vec.Multiply(0.001*force/Math.pow(d, 1));

    return vec;
};

var apply_force_center = function(obj, force) {
    obj.ApplyImpulse(force, obj.GetWorldCenter());
};

// extract ball and repulsor from a contact
var extract_ball_repulsor = function (contact) {
    var fixture_a = contact.GetFixtureA(),
        fixture_b = contact.GetFixtureB();

    var repulsor = false, ball = false;


    if (fixture_a.GetBody().GetUserData().data.name.search("Modifier") != -1)
        repulsor = fixture_a;
    if (fixture_b.GetBody().GetUserData().data.name.search("Modifier") != -1)
        repulsor = fixture_b;

    if (fixture_a.GetBody().GetUserData().data.name.search("Ball") != -1)
        ball = fixture_a;
    if (fixture_b.GetBody().GetUserData().data.name.search("Ball") != -1)
        ball = fixture_b;

    if (repulsor && ball) {
        console.log(repulsor, ball)
        return {repulsor:repulsor, ball:ball};
    }


    return false;
};

// aliases
var b2vec2 = Box2D.Common.Math.b2Vec2;
var b2Listener = Box2D.Dynamics.b2ContactListener;

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
