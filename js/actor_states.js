var distance = function (point1, point2) {
    return Math.sqrt( Math.pow(point1.x - point2.x, 2) +  Math.pow(point1.y - point2.y, 2))
}

Draggable = gamvas.ActorState.extend({
    enter : function () {
        this.actor.selected = false;
    },
    onMouseDown: function(button, x, y, ev) {
        if (button == gamvas.mouse.LEFT) {
            var st = gamvas.state.getCurrentState();
            // use mouseposition in world coordinates, instead of screen coordinates
            var worldMouse = st.camera.toWorld(x, y);
            
            if (distance(worldMouse, this.actor.position) < 10) {
                this.actor.selected = !this.actor.selected;
            }
        }
    },
    onMouseMove: function(x, y, ev) {
        if (this.actor.selected == true) {
            // set position according to mouse position
            var st = gamvas.state.getCurrentState();
            // use mouseposition in world coordinates, instead of screen coordinates
            var worldMouse = st.camera.toWorld(x, y);
            this.actor.setPosition(worldMouse.x, worldMouse.y);
            if (this.actor.dummy)
                this.actor.dummy.setPosition(worldMouse.x, worldMouse.y)
        }
    },

    onKeyUp: function (key) {
        if (this.actor.selected == true && key == gamvas.key.BACKSPACE) {
            var st = gamvas.state.getCurrentState();
            if (this.actor.dummy !== undefined)
                st.removeActor(this.actor.dummy.name);
            st.removeActor(this.actor.name);
        }
    }
});

Rotable = Draggable.extend({
    onKeyDown : function (key) {
        if (this.actor.selected == true) {
            if (key == gamvas.key.LEFT)
                this.actor.rotate(3*2*Math.PI/360)
            if (key == gamvas.key.RIGHT)
                this.actor.rotate(-3*2*Math.PI/360)
        }
    }
});

var LeaveTrace = Draggable.extend({
    init: function (name) {
        this._super(name);
    },

    enter: function () {
        this.actor.counter = 0;
        this.actor.selected = false;
        this.actor.prev_pos = { x : this.actor.position.x, y: this.actor.position.y};
    },

    update: function(t) {
        this.actor.counter++;
        if (this.actor.counter%10 == 0 && distance(this.actor.prev_pos, this.actor.position) > 10) {
            this.actor.prev_pos = { x : this.actor.position.x, y: this.actor.position.y};
            this.actor.st.trajectories.push({x:this.actor.position.x, y:this.actor.position.y});
        }
    }
});