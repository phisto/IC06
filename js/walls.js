var wallActor = gamvas.Actor.extend({
    create: function(x, y, w, h) {
        this._super("Wall" + globalCounter++, x, y);
        var st = gamvas.state.getCurrentState();

        if (w>h) { 
            var img = st.resource.getImage('img/horizontal.png?' + new Date());
        } else {
            var img = st.resource.getImage('img/vertical.png?' + new Date());
        }
        img.style.clip="rect(10px, 10px, 10px, 10px)";
        this.setFile(img);
            console.log(this)

        this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);

        this.addState(new Rotable("d" + globalCounter++), true);
        st.registerInputEvents(this);
        this.layer = 4;
    }
});
