globalCounter = 0;

ballActor = gamvas.Actor.extend({
    create: function(name, x, y, size, type, linearDamping, angularDamping) {
        this._super(name, x, y);
        this.type = "ball";
        

        var st = gamvas.state.getCurrentState();
        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date() ));
        this.restitution = 0.5;
        this.layer = 2;

        var _size = size || 16; 

        this.bodyCircle(this.position.x, this.position.y, _size);
        console.log(this.body)
        this.body.m_linearDamping = linearDamping || 1;
        this.body.m_angularDamping = angularDamping || 0.8;
    }
});

normalBallActor = function (x, y) {
    return new ballActor("normalBallActor" + globalCounter++, x, y, 16, "normalBall");
}
glassBallActor = function (x, y) { 
    return new ballActor("glassBallActor" + globalCounter++, x, y, 16, "glassBall", 0.1);
}

featherBallActor = function (x, y) { 
    return new ballActor("featherBallActor" + globalCounter++, x, y, 8, "featherBall");
}

modifierActor = gamvas.Actor.extend({
    create: function(name, x, y, range, force, type) {
        this._super("Modifier" + name, x, y);
        this.type = "modifier";
        this.force = force;

        var st = gamvas.state.getCurrentState();
        
        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date()));
        this.bodyCircle(this.position.x, this.position.y, range, gamvas.physics.STATIC);
        this.setCenter(12, 12);
        this.setSensor(true);
    }
});


repulsorActor = function (x, y, range, force) {
    var _range = range || 100,
        _force = -force || -1;

    return new modifierActor("repulsorActor" + globalCounter++, x, y, range, force, "repulsor");
}

attractorActor = function (x, y, range, force) {
    var _range = range || 100,
        _force = force || 1;
    return new modifierActor("attractorActor" + globalCounter++, x, y, range, force, "attractor");
}

wallActor = gamvas.Actor.extend({
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

canonActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        this.type = "canon";

        var st = gamvas.state.getCurrentState();
        this.setCenter(70, 180);
        this.setFile(st.resource.getImage('img/canon.png?' + new Date()));

    }
});
