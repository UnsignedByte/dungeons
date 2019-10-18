/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:41:21, 15-Oct-2019
 * @Filename: utils.js
 * @Last modified by:   edl
 * @Last modified time: 23:06:23, 17-Oct-2019
 */

 function zeros(dim) {
   var arr = [];
   for (var i = 0; i < dim[0]; ++i) {
     arr.push(dim.length === 1 ? 0 : zeros(dim.slice(1)));
   }
   return arr;
 }

function rectIsEmpty(arr, x1, y1, x2, y2){
  if (x1 < 0 || x2 > arr.length || y1 < 0 || y2 > arr.length) return false;
  for (let i = x1; i <x2; i++){
    if (sum(...arr[i].splice(y1, y2)) > 0) return false;
  }
  return true;
}

function hexToRgb(hex) {
    var i = parseInt(hex, 16);
    var r = (i >> 16) & 255;
    var g = (i >> 8) & 255;
    var b = i & 255;

    return [r,g,b]
}

function canvasPutMatrix(ctx, mat) {
  var height = arr1.length;
  var width = arr1[0].length;

  var h = ctx.canvas.height;
  var w = ctx.canvas.width;

  var imgData = ctx.getImageData(0, 0, w, h);
  var data = imgData.data;  // the array of RGBA values

  for(var i = 0; i < height; i++) {
      for(var j = 0; j < width; j++) {
          var s = 4 * i * w + 4 * j;  // calculate the index in the array
          var x = hexToRgb(arr1[i][j]);  // the RGB values
          data[s] = x[0];
          data[s + 1] = x[1];
          data[s + 2] = x[2];
          data[s + 3] = 255;  // fully opaque
      }
  }

  ctx.putImageData(imgData, 0, 0);
}

class PoissonDisc{
  constructor(w, h, r, tries, cSize){
    if (tries === undefined) tries = 30;
    if (cSize === undefined) cSize = Math.sqrt(2);
    this.tries = tries;
    this.cSize = cSize;
    this.r = r;
    this.gw = Math.ceil(w/cSize);
    this.gh = Math.ceil(h/cSize);
    this.grid = new Array(this.gw*this.gh).fill(NaN);
    this.queue = [];
    this.oldQ = 0;
    this.initiated = false;
    this.w = w;
    this.h = h;
  }

  addPoint(){
    if (!this.initiated) return this.sample((Math.random()/2+1/4) * this.w, (Math.random()/2+1/4) * this.h);

    while (this.oldQ){
      let choiceind = Math.floor(Math.random()*this.oldQ);
      let choice = this.queue[choiceind];

      for (let j = 0; j < this.tries; j++){
        let radians = Math.PI*Math.random()*2;
        let dist = Math.sqrt(Math.random())*this.r*2;
        let x = choice[0]+dist*Math.cos(radians);
        let y = choice[1]+dist*Math.sin(radians);
        if (0 <= x && x < this.w && 0 <= y && y < this.h && this.inRange(x, y)) return this.sample(x, y);
      }
      this.queue[choiceind] = this.queue.pop();
      this.oldQ--;
    }
    return undefined
  }
  inRange(x, y){
    let xx = Math.floor(x / this.cSize);
    let yy = Math.floor(y / this.cSize);
    let rX = [Math.max(0, Math.floor((x-this.r)/this.cSize)), Math.min(this.gw, Math.ceil((x+this.r)/this.cSize))];
    let rY = [Math.max(0, Math.floor((y-this.r)/this.cSize)), Math.min(this.gh, Math.ceil((y+this.r)/this.cSize))];
    for (let yy = rY[0]; yy<rY[1]; yy++){
      let Y = yy*this.gw;
      for (let xx = rX[0]; xx<rX[1]; xx++){
        let pt = this.grid[Y+xx];
        if (pt && ((pt[0]-x)**2+(pt[1]-y)**2 < this.r**2)) return false
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
