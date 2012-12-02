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

var contact_listener = function () {
    var listener = new b2ContactListener;

    // when there is a contact, we check if the two objects
    // are ballthrown and repulsor and we add the ballthrown
    // in the colliding_elements dictionnary
    listener.BeginContact = function(contact) {
        var ms = gamvas.state.getCurrentState();

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

        if (extract.type_extract == "trapball_ball") {
            console.log(extract)
            var ball = extract.ball,
                trapball = extract.trapball,
                trapball_name = trapball.GetBody().GetUserData().data.name,
                ball_name = ball.GetBody().GetUserData().data.name;

            var st = gamvas.state.getCurrentState();
            st.removeActor(trapball_name);
            st.removeActor(ball_name);
            st.update_score(-20);

        }
    };

    // when the contacts ends between repulsor and ballthrown
    // we have to remove the ballthrown from the colliding elements
    listener.EndContact = function(contact) {
        var st = gamvas.state.getCurrentState();

        var extract = extract_from_contact(contact);

        if (extract.type_extract == "modifier_ball") {
            var ball = extract.ball,
                modifier = extract.modifier,
                modifier_name = modifier.GetBody().GetUserData().data.name,
                ball_name = ball.GetBody().GetUserData().data.name;

            delete st.colliding_elements[modifier_name].modifiable[ball_name];
        }

        else if (extract.type_extract == "tablet_ball") {
            if (extract.ball.GetBody().GetUserData().data.to_be_kicked) {
                process_ball_kicked();
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