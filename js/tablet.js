var tabletActor = gamvas.Actor.extend({
    create : function () {
        var position = { x: 0, y: -25};
        this._super("Tablet" + globalCounter++, position.x, position.y);
        this.type = "tablet";
        var st = gamvas.state.getCurrentState();
        this.setFile(st.resource.getImage('img/tablet.png?' + new Date()));
        this.setCenter(300, 230);
        this.bodyRect(position.x, position.y, 600, 460, gamvas.physics.STATIC);
        this.setSensor(true);
        this.layer = 0;

    }
});