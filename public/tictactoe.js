//Make connection 
var socket = io.connect("http://localhost:3000");
console.log("Connection made");


var join   = document.getElementById("play"),
    square  = document.getElementsByClassName("square"),
    turnX   = document.getElementById("turn-x"),
    turnO   = document.getElementById("turn-o"),
    readyX   = document.getElementById("ready-x"),
    readyO   = document.getElementById("ready-o"),
    gameover = document.getElementById("gameover"),
    gameoverText = document.getElementById("gameover-text"),
    endGame = document.getElementById("end-game");

var playerX = "";
var playerO = "";
var magicSquare = [8, 1, 6, 3, 5, 7, 4, 9, 2];
var gameBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var checkWin = [];
var turn = 0;


join.addEventListener("click", function() {
    socket.emit("join");
    join.style.transform = "translateX(1000px)";
});

endGame.addEventListener("click", function() {
    socket.emit("reset");
});


socket.on("join", function(data) {
    if(data.players == 1) {
        readyX.textContent = "Joined"
        readyO.textContent = "Waiting..."
    } else {
        readyX.textContent = ""
        readyO.textContent = ""
        turnX.classList.add("turn");
    }
});

Array.from(square).forEach(function(element) {
    element.addEventListener("click", function(e) {
        socket.emit("played", {
            space: e.target.id,
            turn: turn
        });
    });
});

socket.on("played", function(data) {
    document.getElementById(data.space).textContent = data.content;
    if(data.content === "X") {
        gameBoard[data.space] = 1;
    } else {
        gameBoard[data.space] = -1;
    }
    console.log(gameBoard);
    results();
});

socket.on("win", function(data) {
    gameover.style.display = "block";
    gameoverText.textContent = data;
});

socket.on("draw", function(data) {
    gameover.style.display = "block";
    gameoverText.textContent = data;
});

socket.on("reset", function() {
    reset();
});

socket.on("disconnected", function() {
    gameover.style.display = "block";
    gameoverText.textContent = "Player Disconnected";
});


//Magic Square template
// 8 | 1 | 6
// --+---+--
// 3 | 5 | 7
// --+---+--
// 4 | 9 | 2

function results() {
    for(i = 0; i < 9; i++) {
        checkWin[i] = magicSquare[i] * gameBoard[i];
    }
    var win1 = checkWin[0] + checkWin[1] + checkWin[2];
    var win2 = checkWin[3] + checkWin[4] + checkWin[5];
    var win3 = checkWin[6] + checkWin[7] + checkWin[8];
    var win4 = checkWin[0] + checkWin[3] + checkWin[6];
    var win5 = checkWin[1] + checkWin[4] + checkWin[7];
    var win6 = checkWin[2] + checkWin[5] + checkWin[8];
    var win7 = checkWin[6] + checkWin[4] + checkWin[2];
    var win8 = checkWin[0] + checkWin[4] + checkWin[8];
    var wins = [win1, win2, win3, win4, win5, win6, win7, win8];
    turn++;
    for(i = 0; i < 8; i++) {
        if(wins[i] === 15 || wins[i] === -15) {
            socket.emit("win", {
                winner: wins[i]
            });
            return;
        }else if(turn === 9) {
            socket.emit("draw");
            return;
        }
    }
    if(turn % 2 == 0) {
        turnO.classList.remove("turn");
        turnX.classList.add("turn");
        console.log("x turn")
    } else {
        turnX.classList.remove("turn");
        turnO.classList.add("turn");
        console.log("o turn")
    }
}

function reset() {
    gameBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    checkWin = [];
    turn = 0;
    Array.from(square).forEach(function(element) {
        element.innerHTML = "";
    });
    join.style.transform = "none";
    gameover.style.display = "none";
    turnX.classList.remove("turn");
    turnO.classList.remove("turn");
    readyX.textContent = ""
    readyO.textContent = ""
}