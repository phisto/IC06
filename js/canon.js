var canonActor = gamvas.Actor.extend({
    create: function(name, x, y, w, h) {
        this._super("canon" + globalCounter++, POSITION_CANON.x, POSITION_CANON.y);
        this.type = "canon";
        this.layer = 2;

        var st = gamvas.state.getCurrentState();
        this.setCenter(70, 180);
        this.setFile(st.resource.getImage('img/canon.png?' + new Date()));

    },

    get_sortie : function () {
        var sortie = this.GetBody().GetWorldPoint({x:0, y:0});

        console.log(sortie)
    }
});