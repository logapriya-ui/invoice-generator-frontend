var x = document.getElementById("login");
var y = document.getElementById("register");
var z = document.getElementById("btn");

function register() {
    // Slide login out and register in
    x.style.left = "-400px";
    y.style.left = "50px";
    // Move the purple button background
    z.style.left = "110px";
}

function login() {
    // Slide register out and login in
    x.style.left = "50px";
    y.style.left = "450px";
    // Move the purple button background back
    z.style.left = "0";
}