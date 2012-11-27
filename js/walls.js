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
