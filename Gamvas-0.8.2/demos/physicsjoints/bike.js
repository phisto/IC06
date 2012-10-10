bikeBody = gamvas.Actor.extend({
    init: function() {
        var cs = gamvas.state.getCurrentState();
        this.setFile(cs.resource.getImage('triangle.png'), 64, 64);
        this.density = 0.4;
        this.bodyRect(0, -60, 300, 20);
        this.setCenter(40, 0);
        this.setGroupIndex(-1);
    }
});

bikeWheel = gamvas.Actor.extend({
    init: function() {
        var cs = gamvas.state.getCurrentState();
        this.setFile(cs.resource.getImage('triangle.png'), 64, 64);
        this.density = 0.1;
        this.friction = 0.8;
        this.bodyCircle(0, 0, 32);
        this.setGroupIndex(-1);
    }
});

bikeAxel = gamvas.Actor.extend({
    init: function() {
        this.bodyRect(0, 0, 4, 4);
        this.setCenter(2, 2);
        this.setGroupIndex(-1);
    }
});

groundBody = gamvas.Actor.extend({
    init: function() {
        var cs = gamvas.state.getCurrentState();
        this.setFile(cs.resource.getImage('triangle.png'), 64, 64);
        this.friction = 0.95;
        this.bodyRect(0, 200, 2000, 20, gamvas.physics.STATIC);
        this.setCenter(32, 32);
    }
});

bikeState = gamvas.State.extend({
    init: function() {
        this.motorSpeed = 0;
        this.bBody = new bikeBody('body');
        this.bBackWheel = new bikeWheel('backwheel');
        this.bBackWheel.setPosition(-74, 0);
        this.bBackWheel.friction = 0.71;
        this.bFrontWheel = new bikeWheel('frontwheel');
        this.bFrontWheel.setPosition(74, 0);
        this.bBackAxel = new bikeAxel('backaxel');
        this.bBackAxel.setPosition(-74, 0);
        this.bFrontAxel = new bikeAxel('frontaxel');
        this.bFrontAxel.setPosition(74, 0);


        this.motorWheel = this.bBackAxel.addRevoluteJoint(this.bBackWheel, false, {
            enableMotor: true,
            maxMotorTorque: 500
        });
        this.bFrontAxel.addRevoluteJoint(this.bFrontWheel, false, {
        });

        this.joint = this.bBody.addPrismaticJoint(this.bBackAxel, false, new gamvas.Vector2D(0, 1), {
            lowerTranslation: 0.01,
            upperTranslation: -0.3,
            enableMotor: true
            // enableLimit: true
        });

        this.joint2 = this.bBody.addPrismaticJoint(this.bFrontAxel, false, new gamvas.Vector2D(0, 1), {
            lowerTranslation: 0.01,
            upperTranslation: -0.3,
            enableMotor: true
            // enableLimit: true
        });

        this.addActor(this.bBody);
        this.addActor(this.bBackWheel);
        this.addActor(this.bFrontWheel);
        this.addActor(new groundBody('ground'));

        var debugDraw = new Box2D.Dynamics.b2DebugDraw();
        debugDraw.SetSprite(gamvas.getContext2D());
        debugDraw.SetDrawScale(gamvas.physics.pixelsPerMeter);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
        debugDraw.m_sprite.graphics.clear = function() {};
        gamvas.physics.getWorld().SetDebugDraw(debugDraw);
    },

    draw: function(t) {
        gamvas.physics.drawDebug();

        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            if (this.motorSpeed < 50) {
                if (this.motorSpeed < 0) {
                    this.motorSpeed += 5000*t;
                } else {
                    this.motorSpeed += 500*t;
                }
            }

        }
        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            if (this.motorSpeed > -50) {
                if (this.motorSpeed > 0) {
                    this.motorSpeed -= 5000*t;
                } else {
                    this.motorSpeed -= 500*t;
                }
            }
        }
        this.motorSpeed *= 1.0-(0.1*t);
        this.motorWheel.SetMotorSpeed(this.motorSpeed);

        var jt = this.joint.GetJointTranslation();
        this.joint.SetMaxMotorForce(Math.abs(800*jt));
        // this.joint.SetMotorSpeed(this.joint.GetMotorSpeed()-((2*jt)*t));

        var jt2 = this.joint2.GetJointTranslation();
        this.joint2.SetMaxMotorForce(Math.abs(800*jt2));
        // this.joint2.SetMotorSpeed(this.joint2.GetMotorSpeed()-((2*jt2)*t));
    }
});

gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new bikeState('bike'));
    gamvas.start('gameCanvas', true);
});
