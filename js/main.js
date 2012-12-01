// TODO
// Score
// Comptage des points
// Gagner

var level = new Level("level" + globalCounter++);
    gamvas.state.addState(level);

// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.start('gameCanvas', true);
    load(4);
});

var choose_right_creator = function (ev) {
    var st = gamvas.state.getCurrentState();
    switch (ev.currentTarget.id) {
        case "btn_repulsor_creator":
            st.creator = repulsorActor;
        break;
        case "btn_attractor_creator":
            st.creator = attractorActor
        break;
        case "btn_normal_ball_creator":
            st.creator = normalBallActor;
        break;
        case "btn_feather_ball_creator":
            st.creator = featherBallActor;
        break;
        case "btn_lead_ball_creator":
            st.creator = leadBallActor;
        break;
        case "btn_wall_creator":
            st.creator = wallActor;
        break;
        case "btn_trap_ball_creator":
            st.creator = trapBallActor;
        break;
        case "btn_none_creator":
            st.creator = undefined;
        break;
        case "btn_save":
            save(parseInt(prompt("number of the level")))
        break;
    }
}

$(function () {
    $("button").click(choose_right_creator);

    for (key in localStorage) {
        if (typeof(key)=='string' && key.search("level") != -1) {
        console.log(key)
            var link = $("<a>"), li = $("<li>");
            var number = parseInt(key.substr(5,2));
            link.attr("href", "javascript:load("+ number + ")").text("level" + number);
            li.append(link);
            $("#level-links").append(li)
        };
    };
});