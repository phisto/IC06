circleActor = gamvas.Actor.extend({
    create: function(name, x, y) {
        this._super(name, x, y);
        
        var st = gamvas.state.getCurrentState();
        
        this.setFile(st.resource.getImage('img/circle.png?' + new Date() ));
        this.restitution = 0.5;
        this.layer = 2;

        this.bodyCircle(this.position.x, this.position.y, 16);
        this.body.m_linearDamping = 0.6;
        this.body.m_angularDamping = 0.8;
    }
});

repulsorActor = gamvas.Actor.extend({
    create: function(name, x, y) {
        this._super(name, x, y);
        
        var st = gamvas.state.getCurrentState();
        
        this.setFile(st.resource.getImage('img/repulsor.png'));
        this.bodyCircle(this.position.x, this.position.y, 100, gamvas.physics.STATIC);
        this.setCenter(12, 12);
        this.setSensor(true);
    }
});

wallActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        var st = gamvas.state.getCurrentState();
        if (w>h) {
            this.setFile(st.resource.getImage('img/horizontal.png'));
        } else {
            this.setFile(st.resource.getImage('img/vertical.png'));
        }

        this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
    }
});

canonActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super(name, x, y);
        var st = gamvas.state.getCurrentState();
        this.setCenter(70, 180);
        this.setFile(st.resource.getImage('img/canon.png'));

    }
});
