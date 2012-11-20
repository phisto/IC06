globalCounter = 0;

GRAVITY_POWER = 0.8;


Box2D.Dynamics.b2Fixture.prototype.get_force = function () {
    return this.GetBody().GetUserData().data.force;
}

Box2D.Dynamics.b2Fixture.prototype.apply_force_center = function (force_vec) {
    this.GetBody().ApplyImpulse(force_vec, this.GetBody().GetWorldCenter());
}

Box2D.Dynamics.b2Fixture.prototype.remote_action = function(other_fixture) {
    var center_other = other_fixture.GetBody().GetWorldCenter(),
        center_this = this.GetBody().GetWorldCenter(),

        vec = new b2vec2((center_this.x - center_other.x),
                     (center_this.y - center_other.y)),
        length = vec.Length(),
        d = vec.Normalize();

    if (length < 0.05) {
    console.log(other_fixture.GetBody().GetUserData().data.explode());
    }
    vec.Multiply(0.001*this.get_force()/Math.pow(d, GRAVITY_POWER));
    other_fixture.apply_force_center(vec);
}


// -----
// Balls
// -----
var ballActor = gamvas.Actor.extend({
    create: function(name, x, y, size, type, linearDamping, angularDamping) {
        this._super(name, x, y);
        this.type = type;


        var st = gamvas.state.getCurrentState();
        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date() ));
        this.restitution = 0.5;
        this.layer = 1;

        var _size = size || 16;

        this.bodyCircle(this.position.x, this.position.y, _size);
        this.body.m_linearDamping = linearDamping || 1;
        this.body.m_angularDamping = angularDamping || 0.8;
    },

    explode: function() {
        console.log(this, "exploded")
    }
});

var normalBallActor = function (x, y) {
    return new ballActor("normalBallActor" + globalCounter++, x, y, 16, "normalBall");
}

var glassBallActor = function (x, y) {
    return new ballActor("glassBallActor" + globalCounter++, x, y, 16, "glassBall", 0.1);
}

var featherBallActor = function (x, y) {
    return new ballActor("featherBallActor" + globalCounter++, x, y, 8, "featherBall");
}

var dummyBody = gamvas.Actor.extend({
    create : function (x, y, size) {
        this._super("Dummy" + globalCounter++, x, y);
        this.bodyCircle(this.position.x, this.position.y, size, gamvas.physics.STATIC);
    }
});



// ---------
// Modifiers
// ---------

var modifierActor = gamvas.Actor.extend({
    create: function(name, x, y, range, force, type) {
        this._super("Modifier" + name, x, y);
        this.type = "modifier";
        this.force = force;

        var st = gamvas.state.getCurrentState(),
            dummy = new dummyBody(x, y, 14);

        st.addActor(dummy);
        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date()));
        this.bodyCircle(this.position.x, this.position.y, range, gamvas.physics.STATIC);
        this.setCenter(12, 12);
        this.setSensor(true);
        this.layer = 1;
    }
});

var repulsorActor = function (x, y, range, force) {
    var _range = range || 100,
        _force = -force || -1;

    return new modifierActor("repulsorActor" + globalCounter++, x, y, _range, _force, "repulsor");
}

var attractorActor = function (x, y, range, force) {
    var _range = range || 200,
        _force = force || 1;
    return new modifierActor("attractorActor" + globalCounter++, x, y, _range, _force, "attractor");
}




var wallActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        var st = gamvas.state.getCurrentState();
        if (w>h) {
            this.setFile(st.resource.getImage('img/horizontal.png?' + new Date()));
        } else {
            this.setFile(st.resource.getImage('img/vertical.png?' + new Date()));
        }

        this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
    }
});

var canonActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        this.type = "canon";
        this.layer = 0;

        var st = gamvas.state.getCurrentState();
        this.setCenter(70, 180);
        this.setFile(st.resource.getImage('img/canon.png?' + new Date()));

    },

    get_sortie : function () {
        var sortie = this.GetBody().GetWorldPoint({x:0, y:0});

        console.log(sortie)
    }
});

var tabletActor = gamvas.Actor.extend({
    create : function () {
        var position = { x: 0, y: 0};

        this._super("Tablet", position.x, position.y);
        var st = gamvas.state.getCurrentState();
        this.setFile(st.resource.getImage('img/tablet.png?' + new Date()));
        this.setCenter(381, 280);
        this.bodyRect(position.x, position.y, 762, 560, gamvas.physics.STATIC);
        this.setSensor(true);
        this.layer = 2;

    }
});

var contact_listener = function () {
    var listener = new b2ContactListener;

    // when there is a contact, we check if the two objects
    // are ballthrown and repulsor and we add the ballthrown
    // in the colliding_elements dictionnary
    listener.BeginContact = function(contact) {
        var extract = extract_from_contact(contact);
        if (extract.type_extract == "modifier_ball") {
            var ball = extract.ball,
                modifier = extract.modifier,
                modifier_name = modifier.GetBody().GetUserData().data.name,
                ball_name = ball.GetBody().GetUserData().data.name;

            if (ms.colliding_elements[modifier_name] === undefined)
                ms.colliding_elements[modifier_name] = {modifier : modifier, modifiable : {}};

            ms.colliding_elements[modifier_name].modifiable[ball_name] = ball;
        }
    };

    // when the contacts ends between repulsor and ballthrown
    // we have to remove the ballthrown from the colliding elements
    listener.EndContact = function(contact) {
        var extract = extract_from_contact(contact);

        if (extract.type_extract == "modifier_ball") {
            console.log("coucou maureen");
            var ball = extract.ball,
                modifier = extract.modifier,
                modifier_name = modifier.GetBody().GetUserData().data.name,
                ball_name = ball.GetBody().GetUserData().data.name;

            delete ms.colliding_elements[modifier_name].modifiable[ball_name];
        }

        else if (extract.type_extract == "tablet_ball") {
            if (extract.ball.GetBody().GetUserData().data.to_be_kicked) {
                console.log("You've just kicked a good ball");
            }
        }
    };

    return listener;
}

var debugDraw = function () {
        // debugDraw : draw all the transparents boxes around the objects
    var _debugDraw = new Box2D.Dynamics.b2DebugDraw();

    _debugDraw.SetSprite(gamvas.getContext2D());
    _debugDraw.SetDrawScale(gamvas.physics.pixelsPerMeter);
    _debugDraw.SetFillAlpha(0.5);
    _debugDraw.SetLineThickness(1.0);
    _debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
    _debugDraw.m_sprite.graphics.clear = function() {};

    return _debugDraw;
}