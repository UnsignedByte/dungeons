/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:41:21, 15-Oct-2019
 * @Filename: utils.js
 * @Last modified by:   edl
 * @Last modified time: 10:15:30, 18-Oct-2019
 */

 function zeros(dim, val) {
   if (val === undefined) val = 0;
   var arr = [];
   for (var i = 0; i < dim[0]; ++i) {
     arr.push(dim.length === 1 ? val : zeros(dim.slice(1), val));
   }
   return arr;
 }

function rectIsEmpty(arr, x1, y1, x2, y2){
  if (x1 < 0 || x2 >= arr.length || y1 < 0 || y2 >= arr[0].length) return false;
  for (let i = x1; i < x2; i++){
    if (Math.max(...arr[i].slice(y1, y2)) > 0) return false;
  }
  return true;
}

function pasteRect(arr, arr2, x1, y1){
  for (let i = x1; i < arr2.length+x1; i++){
    if (i < 0 || i >= arr.length) continue;
    for (let j = y1; j < arr2[0].length+y1; j++){
      if (j < 0 || j >= arr[0].length) continue;
      arr[i][j] = arr2[i-x1][j-y1];
    }
  }
  return arr;
}

function hexToRgb(hex) {
    var r = (hex >> 16) & 255;
    var g = (hex >> 8) & 255;
    var b = hex & 255;

    return [r,g,b]
}

function canvasPutMatrix(ctx, mat) {
  var height = mat[0].length;
  var width = mat.length;

  var h = ctx.canvas.height;
  var w = ctx.canvas.width;

  var imgData = ctx.getImageData(0, 0, w, h);
  var data = imgData.data;  // the array of RGBA values

  for(var i = 0; i < width; i++) {
      for(var j = 0; j < height; j++) {
          var s = 4 * j * w + 4 * i;  // calculate the index in the array
          var x = hexToRgb(mat[i][j]);  // the RGB values
          data[s] = x[0];
          data[s + 1] = x[1];
          data[s + 2] = x[2];
          data[s + 3] = 255;  // fully opaque
      }
  }

  ctx.putImageData(imgData, 0, 0);
}

function randomWeighted(weights, seed){
  let rand = (new Math.seedrandom(seed))()*weights.reduce((a, b) => a+b, 0);
  for(let i = 0; i < weights.length; i++){
    rand-=weights[i];
    if (rand < 0) return i;
  }
  return NaN;
}

class PoissonDisc{
  constructor(w, h, tries, seed, cSize){
    if (tries === undefined) tries = 30;
    if (cSize === undefined) cSize = Math.sqrt(2);
    this.rng = new Math.seedrandom(seed)
    this.tries = tries;
    this.cSize = cSize;
    this.gw = Math.ceil(w/cSize);
    this.gh = Math.ceil(h/cSize);
    this.grid = new Array(this.gw*this.gh).fill(NaN);
    this.queue = [];
    this.oldQ = 0;
    this.initiated = false;
    this.w = w;
    this.h = h;
  }

  addPoint(hr, vr){
    if (!this.initiated) return this.sample((this.rng()/2+1/4) * this.w, (this.rng()/2+1/4) * this.h);

    while (this.oldQ){
      let choiceind = Math.floor(this.rng()*this.oldQ);
      let choice = this.queue[choiceind];

      for (let j = 0; j < this.tries; j++){
        let radians = Math.PI*this.rng()*2;
        let dist = Math.sqrt(this.rng())*vr*2;
        let x = choice[0]+dist*Math.cos(radians)*hr/vr;
        let y = choice[1]+dist*Math.sin(radians);
        if (0 <= x && x < this.w && 0 <= y && y < this.h && this.inRange(x, y)) {
          return this.sample(x, y);
        }
      }
      this.queue[choiceind] = this.queue.pop();
      this.oldQ--;
    }
    return undefined
  }
  inRange(x, y, hr, vr){
    let xx = Math.floor(x / this.cSize);
    let yy = Math.floor(y / this.cSize);
    let rX = [Math.max(0, Math.floor((x-hr)/this.cSize)), Math.min(this.gw, Math.ceil((x+hr)/this.cSize))];
    let rY = [Math.max(0, Math.floor((y-vr)/this.cSize)), Math.min(this.gh, Math.ceil((y+vr)/this.cSize))];
    for (let yy = rY[0]; yy<rY[1]; yy++){
      let Y = yy*this.gw;
      for (let xx = rX[0]; xx<rX[1]; xx++){
        let pt = this.grid[Y+xx];
        if (pt && (((pt[0]-x)/hr)**2+((pt[1]-y)/vr)**2 < 1)) return false
      }
    }
    return true
  }
  sample(x, y){
    let p = [x, y];
    this.queue.push(p);
    this.grid[this.gw*Math.floor(y/this.cSize)+Math.floor(x/this.cSize)] = p;
    this.initiated = true
    this.oldQ++;
    return p
  }
  get(x, y){
    return this.grid[Math.floor(y)*this.gw+Math.floor(x)];
  }
  find(x, y){
    return (Math.floor(x/this.cSize), Math.floor(y/this.cSize));
  }
  getAll(){
    let ret = [];
    for (let a = 0; a < this.grid.length; a++) {
      if (!isNaN(this.grid[a])){
        ret.push(this.grid[a])
      }
    }
    return ret
  }
}
