var express = require("express");
var socket = require("socket.io");

var app = express();
var server = app.listen(3000, function() {
    console.log("Listening on port 3000")
});

//Satatic Files
app.use(express.static("public"));

//Socket Setup
var io = socket(server);

var players = 0;
var playerX = "";
var playerO = "";

io.on("connection", function(socket) {
    console.log("Made socket connection", socket.id);

    socket.on("join", function() {
        if(players == 0) {
            playerX = socket.id;
            players++;
        } else if(players == 1) {
            playerO = socket.id;
            players++;
        }
        io.sockets.emit("join", {players: players})
        console.log(players);
    });

    socket.on("played", function(data) {
        if(data.turn % 2 == 0 && socket.id == playerX) {
            io.sockets.emit("played", {
                space: data.space,
                content: "X"
            });
        } else if(data.turn % 2 != 0 && socket.id == playerO) {
            io.sockets.emit("played", {
                space: data.space,
                content: "O"
            });
        }
    });

    socket.on("win", function(data) {
        if(data.winner == 15) {
            io.sockets.emit("win", "X wins!");
        } else {
            io.sockets.emit("win", "O wins!");
        }
    });

    socket.on("draw", function () {
        io.sockets.emit("draw", "It's a Draw");
    });

    socket.on("reset", function () {
        io.sockets.emit("reset");
        players = 0;
        playerX = "";
        playerO = "";
    });

    socket.on("disconnect", function() {
        if(socket.id == playerX || socket.id == playerO) {
            console.log("player disconnected");
            socket.broadcast.emit("disconnected");
            players = 0;
            playerX = "";
            playerO = "";
        }
    });
});