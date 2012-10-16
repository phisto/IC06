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

    vec.Multiply(-0.003/Math.pow(d, 2));
    return vec;
};

var apply_force_center = function(obj, force) {
    obj.ApplyImpulse(force, obj.GetWorldCenter());
};

var b2vec2 = Box2D.Common.Math.b2Vec2;

