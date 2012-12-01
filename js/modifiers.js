var dummyBody = gamvas.Actor.extend({
    create : function (x, y, size) {
        this._super("Dummy" + globalCounter++, x, y);
        this.type = "dummy";
        this.bodyCircle(this.position.x, this.position.y, size, gamvas.physics.STATIC);
    }
});

// ---------
// Modifiers
// ---------

var modifierActor = gamvas.Actor.extend({
    create: function(name, x, y, range, force, type) {
        this._super("Modifier" + name, x, y);
        this.force = force;

        var st = gamvas.state.getCurrentState(),
            dummy = new dummyBody(x, y, 14);
        this.dummy = dummy;
        st.addActor(dummy);

        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date()));
        this.bodyCircle(this.position.x, this.position.y, range, gamvas.physics.STATIC);
        this.setCenter(12, 12);
        this.setSensor(true);
        this.layer = 1;
        this.addState(new Draggable("d" + globalCounter++), true);
        st.registerInputEvents(this);

    }
});

var repulsorActor = modifierActor.extend({
    create : function (x, y, range, force) {
        var _range = range || 100,
            _force = -force || -1;
        this._super("repulsorActor" + globalCounter++, x, y, _range, _force, "repulsor");
        this.type = "repulsor";

    }
});

var attractorActor =  modifierActor.extend({
    create : function (x, y, range, force) {
        var _range = range || 100,
            _force = force || 1;
        this._super("attractorActor" + globalCounter++, x, y, _range, _force, "attractor");
        this.type = "attractor";
    }
});
