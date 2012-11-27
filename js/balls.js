// -----
// Balls
// -----
var ballActor = gamvas.Actor.extend({
    create: function(name, x, y, size, type, linearDamping, angularDamping) {
        this._super(name, x, y);
        this.type = type;


        var st = gamvas.state.getCurrentState();
        this.setFile(st.resource.getImage('img/' + type + '.png?' + new Date() ));
        this.restitution = 0.5;
        this.layer = 1;

        var _size = size || 16;

        this.bodyCircle(this.position.x, this.position.y, _size);
        this.body.m_linearDamping = linearDamping || 1;
        this.body.m_angularDamping = angularDamping || 0.8;
    },

    explode: function() {
        console.log(this, "exploded")
    }
});

var normalBallActor = ballActor.extend({
    create : function (x, y) {
        this._super("normalBallActor" + globalCounter++, x, y, 16, "normalBall");
    }
});

var glassBallActor = ballActor.extend({
    create : function (x, y) {
        this._super("glassBallActor" + globalCounter++, x, y, 16, "glassBall", 0.1);
    }
});

var featherBallActor = ballActor.extend({
    create : function (x, y) {
        this._super("featherBallActor" + globalCounter++, x, y, 8, "featherBall");
    }
});

var leadBallActor = ballActor.extend({
    create : function (x, y) {
        this._super("leadBallActor" + globalCounter++, x, y, 8, "leadBall");
        this.body.density = 1;
    }
});

