/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:35:01, 15-Oct-2019
 * @Filename: generator.js
 * @Last modified by:   edl
 * @Last modified time: 23:58:56, 19-Oct-2019
 */

const COLORMAP = {
  empty:0x111100,
  jumpfloor:0xFFFF00, //floor you can jump through
  room:{
    t:0xFE0000, //ceiling
    b:0xFF0000, //floor
    l:0x00FF00, //left wall
    r:0x00FE00  //right wall
  },
  corridor:{
    t:0x990000, //ceiling
    b:0x980000, //floor
    l:0x009900, //left wall
    r:0x009800  //right wall
  }
}

class Dungeon {
  constructor(width, height, seed,
              roomnum, roomdat, forprop, stp, corridorwidth)
  {
    this.stats = {
      rooms:{
        num:roomnum,
        dat:roomdat
      },
      corridor:{
        forward:Math.max(forprop, 1-forprop), //probability of going towards end vs. backwards (must be >0.5)
        straight:stp, //probability of continuing in direction
      }
    }
    this.corridorwidth = corridorwidth;
    this.rng = new Math.seedrandom(seed);
    this.w = width;
    this.h = height;
    this.a = width*height;
    this.map = zeros([width, height]);
    this.rooms = [];
    this.generateRooms();
    this.generateCorridors();
    // this.drawRooms()
  }

  generateRooms(){
    let roomweights = this.stats.rooms.dat.map((x)=>x.weight)

    let tries = 30; //number of times to try placing room before giving up

    let roomdisp = new PoissonDisc(this.w, this.h, tries, this.rng(), 1)

    for (let i = 0; i < this.stats.rooms.num; i++){
      let cr = this.stats.rooms.dat[randomWeighted(roomweights, this.rng())];
      let wantedSize = cr.dims.map((x, ind) => normalRandomScaled(x, cr.var[ind], this.rng())+2);
      let room = roomdisp.addPoint(...wantedSize.map((e, ind) => e*(cr.dist+0.5)));
      if (room === undefined) continue;
      let tl = room.map((e,ind) => Math.floor(e - wantedSize[ind]/2)+1); //top left
      let tr = room.map((e,ind) => Math.floor(e + wantedSize[ind]/2)-1); //bottom right
      if(rectIsEmpty(this.map, ...tl.map((x)=>x-1), ...tr.map((x)=>x+1))){
        this.rooms.push([...tl, ...tr]);
        this.generateRoom(...tl, ...tr);
      }
    }
  }

  generateCorridors(){
    let nR = this.rooms.length;

    // this.generateCorridor(this.rooms[0], this.rooms[1]);

    for (let i = 1; i < nR; i++) {
      // let from = this.rooms[Math.floor(this.rng())*i];
      let to = this.rooms[i];
      let toc = [(to[0]+to[2])/2, (to[1]+to[3])/2]; //center of room
      let mind = Infinity;
      let mini = 0;
      //get closest room that is connected
      for (let j = 0; j < i; j++){
        let cr = this.rooms[j];
        let crc = [(cr[0]+cr[2])/2, (cr[1]+cr[3])/2]; //center of test room
        let dst = toc.map((e, i) => (e-crc[i])**2).reduce((a, b) => a+b);
        if (dst < mind){
          mind = dst;
          mini = j;
        }
      }
      this.generateCorridor(this.rooms[mini], to);
    }
  }

  generateCorridor(from, to){

    let replaceMap = {};
    replaceMap[COLORMAP.empty] = COLORMAP.empty;
    replaceMap[COLORMAP.jumpfloor] = COLORMAP.jumpfloor;
    replaceMap[COLORMAP.room.b] = COLORMAP.jumpfloor;
    replaceMap[COLORMAP.room.t] = COLORMAP.jumpfloor;

    let randStart = (y1, y2) => {
      if (y2-y1 < this.corridorwidth) return y2;
      return y1+Math.floor(this.rng()*(y2-y1-this.corridorwidth)); // where corridor starts
    };

    let fillCorridorSlice = (x, y) => {
      // 0 = vertical, 1 = horizontal
      for (let i = -1; i <= this.corridorwidth; i++){ //top down
        for (let j = -1; j <= this.corridorwidth; j++){ //left right
          if ((j === -1 || j === this.corridorwidth) && (i === -1 || i === this.corridorwidth)) continue; //Ignore corners
          let p = [x+j, y+i];
          if (this.map[p[0]] === undefined || this.map[p[0]][p[1]] === undefined) continue;
          let col = (this.map[p[0]][p[1]] >> 8) << 8;
          if (col in replaceMap) this.map[p[0]][p[1]] = replaceMap[col];
          else{
            if (i === -1){
              this.map[p[0]][p[1]] = COLORMAP.corridor.t;
            }else if (i === this.corridorwidth){
              this.map[p[0]][p[1]] = COLORMAP.corridor.b;
            }else if (j === -1){
              this.map[p[0]][p[1]] = COLORMAP.corridor.l;
            }else if (j === this.corridorwidth){
              this.map[p[0]][p[1]] = COLORMAP.corridor.r;
            }else{
              this.map[p[0]][p[1]] = COLORMAP.empty;
            }
          }
        }
      }
    };

    let fromy = randStart(from[1], from[3]);
    let toy = randStart(to[1], to[3]);

    let dir = 2*(Math.round(this.rng())-0.5);

    let fromx = (from[2]+from[0])/2+(from[2]-from[0])*dir/2;
    let tox = (to[2]+to[0])/2+(to[2]-to[0])*(Math.round(this.rng())-0.5);

    dir = -dir+2;

    //0 = right, 1 = down, 2 = left, 3 = up

    let cp = this.stats.corridor.forward;
    let st = this.stats.corridor.straight;

    let x = fromx;
    let y = fromy;

    do {
      fillCorridorSlice(x, y, dir % 2);
      if (this.rng() > st){
        let dstF = Math.min(1,((toy-y)**2+(tox-x)**2)/((toy-fromy)**2+(tox-fromx)**2))
        if (dir%2 === 0){
          dir = 0+((toy-y > 0)*2-1)*((this.rng()>(1-cp)*dstF)*2-1);
        }else{
          dir = 3+((tox-x > 0)*2-1)*((this.rng()>(1-cp)*dstF)*2-1);
        }
        dir = (dir + 4)%4;
      }
      // console.log(dir);
      switch (dir){
        case 0:
          x++;
          break;
        case 1:
          y++;
          break;
        case 2:
          x--;
          break;
        case 3:
          y--;
          break;
      }
      // console.log(fromx, fromy);
      x = Math.max(0, Math.min(this.map.length, x));
      y = Math.max(0, Math.min(this.map[0].length, y));
      // console.log(x, y, tox, toy, dir);
    } while (x != tox || y != toy)
  }

  generateRoom(x1, y1, x2, y2){
    let rd = [x2-x1, y2-y1];
    let roomMap = zeros(rd, COLORMAP.empty);

    let addFloor = (y, x, w) => {
      for (let i = Math.floor(x-w/2); i < Math.floor(x+w/2); i++){
        if (roomMap[i] !== undefined && (roomMap[i][y] >> 8) << 8 === COLORMAP.empty) roomMap[i][y] = COLORMAP.jumpfloor;
      }
    }

    let fy = rd[1];
    let w = 0;
    let x = rTR(this.rng(), 0, rd[0]);

    do { // go up to 2 below roof of room
      fy -= rTR(this.rng(), 2, this.corridorwidth);
      let oldw = w;
      w = rTR(this.rng(), this.corridorwidth, Math.max(this.corridorwidth, rd[0]));
      // console.log(x/rd[0]);
      x += ((this.rng()>x/rd[0])*2-1)*rTR(this.rng(), 0, this.corridorwidth+(w+oldw)/2);
      // console.log(x);
      addFloor(fy, x, w);
    } while (fy > 1)

    this.map = pasteRect(this.map, roomMap, x1, y1);
    this.map = pasteRect(this.map, zeros([rd[0], 1], COLORMAP.room.b), x1, y2);  //floor
    this.map = pasteRect(this.map, zeros([1, rd[1]], COLORMAP.room.l), x1-1, y1); //left wall
    this.map = pasteRect(this.map, zeros([1, rd[1]], COLORMAP.room.r), x2, y1); //right wall
    this.map = pasteRect(this.map, zeros([rd[0], 1], COLORMAP.room.t), x1, y1-1); //right wall
  }
}

function randomDungeon(seed, w, h){
  let rng = new Math.seedrandom(seed);
  let roomnum = rTR(rng(), 16, 128);
  let corridorwidth = rTR(rng(), 3, 10);

  let genRandomRoom = () => {
    let room = {};
    room.dims = [];
    room.var = [];
    for (let i = 2; i--;){
      // usually have a small room, occasionally large
      // \frac{100}{1+100^{\left(-2\left(\frac{1}{1.7-x}-1\right)\right)}}+4
      room.dims[i] = Math.floor(100/(1+100**(-2*(1/(1.7-rng())-1)))+corridorwidth);
      room.var[i] = rTR(rng(), 0, (room.dims[i]-corridorwidth)/2)
    }
    room.weight = rng();
    room.dist = rTR(rng(), 0, 4);
    return room
  }
  let nRoomTypes = rTR(rng(), 1, Math.ceil(roomnum/10));
  let roomdat = [];

  for (let i = nRoomTypes; i--;){
    roomdat.push(genRandomRoom());
  }

  //corridor stats -
  //Forwardness (how often to go towards goal vs away)
  //    as it approaches 0.5 it will become crazy so range is (0.6-1)
  let forprop = 1-rng()*0.4;
  //Straightness of corridors (how often to turn)
  //    as it approaches 1 it will become crazy so range is (0=.9)
  //    More occurences of high numbers (because most things from 0-0.7 look similar)
  let straightness = (1-Math.cos(Math.PI*rng())**8)*0.9;

  return new Dungeon(w, h, rng(), roomnum, roomdat, forprop, straightness, corridorwidth);
}
