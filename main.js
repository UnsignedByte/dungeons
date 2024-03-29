/**
 * @Author: Edmund Lam <edl>
 * @Date:   21:56:34, 17-Oct-2019
 * @Filename: main.js
 * @Last modified by:   edl
 * @Last modified time: 13:47:46, 22-Oct-2019
 */

var globalSeed;
var globalRNG;

const MAPRATIO = 16; //how many in game pixels are equivalent to 1 "block"
const WALKSPEED = 1;

var KEYS_DOWN = {
  'arrowup':false,
  'arrowdown':false,
  'arrowleft':false,
  'arrowright':false
};

var canv, context;

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  return ctx;
}


window.onload = function(){
  globalSeed = Math.random();
  globalRNG = new Math.seedrandom(globalSeed);

  canv = document.getElementById('canvas');
  context = setupCanvas(canv);
  canv.width = window.innerWidth * 2;
  canv.height = window.innerHeight * 2;

  let testDungeon = randomDungeon(globalRNG(), window.innerWidth, window.innerHeight);
  canvasPutMatrix(context, testDungeon.map);
}

//Event Listeners
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() in KEYS_DOWN) KEYS_DOWN[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() in KEYS_DOWN) KEYS_DOWN[e.key.toLowerCase()] = false;
});
