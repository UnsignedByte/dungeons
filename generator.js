/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:35:01, 15-Oct-2019
 * @Filename: generator.js
 * @Last modified by:   edl
 * @Last modified time: 23:51:51, 17-Oct-2019
 */

class Dungeon {
  constructor(width, height, seed,
              roomnum, roomdist, roomsize, roomvar)
  {
    this.rng = new Math.seedrandom(seed);
    this.w = width;
    this.h = height;
    this.a = width*height;
    this.mat = zeros([width, height]);
    this.generateRooms(roomnum, roomdist, roomsize, roomvar);
  }

  generateRooms(roomnum, roomdist, roomdims, roomvar){
    //roomnum = number of rooms
    //roomdist = average distance (in number of rooms) between each room
    //roomdims = average width and height of room
    //roomvar = variation of room dimensions

    let tries = 30; //number of times to try placing room before giving up
    let w = Math.floor(roomdims[1]/roomdims[0]*this.w); // squish grid such that rooms are "square"
    let r = roomdims[1]*Math.sqrt(2)/2 //half diagonal of squished room

    let roomdisp = new PoissonDisc(w, this.h, r*(2*roomdist+1), tries, 1)

    for (let i = 0; i < roomnum; i++){
      let room = roomdisp.addPoint();
      if (room === undefined) break;
      room = Array.from(room)
      room[0] *= roomdims[0]/roomdims[1];
      for (let iii = 0; iii < tries; iii++){
        let wantedSize = roomdims.map((x, ind) => {return normalRandomScaled(x, roomvar[ind])});
        let tl = room.map((e,ind) => Math.floor(e - wantedSize[ind]/2)); //top left
        let tr = room.map((e,ind) => Math.floor(e + wantedSize[ind]/2)); //top right
        if(rectIsEmpty(this.mat, ...tl, ...tr)){
          this.generateRoom(...tl, ...tr);
          break;
        }
      }
    }
  }

  generateRoom(x1, y1, x2, y2) {
    let roomdim = [x2-x1, y2-y1];
    this.mat = pasteRect(this.mat, zeros(roomdim, 0xFFFFFF), x1, y1);
  }
}

function randomDungeon(seed, w, h){
  let rng = new Math.seedrandom(seed);
  let roomnum = 10000;
  let roomdist = 3;
  let roomsize = [20, 10];
  let roomvar = [3,6];
  return new Dungeon(w, h, seed, roomnum, roomdist, roomsize, roomvar);
}
