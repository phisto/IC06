var wallActor = gamvas.Actor.extend({
    create: function(x, y) {
        this._super("Wall" + globalCounter++, x, y);
        this.type = "Wall";
        var st = gamvas.state.getCurrentState();

        var img = st.resource.getImage('img/horizontal.png?' + new Date());

        img.style.clip="rect(10px, 10px, 10px, 10px)";
        this.setFile(img);
            console.log(this)

        this.bodyRect(this.position.x, this.position.y, 100, 20, gamvas.physics.STATIC);

        this.addState(new Rotable("d" + globalCounter++), true);
        st.registerInputEvents(this);
        this.layer = 4;
    }
});
