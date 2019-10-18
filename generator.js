/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:35:01, 15-Oct-2019
 * @Filename: generator.js
 * @Last modified by:   edl
 * @Last modified time: 23:06:35, 17-Oct-2019
 */

class Dungeon {
  constructor(width, height, seed,
              roomnum, roomdist, roomsize, roomvar)
    this.rng = new Math.seedrandom(seed);
    this.w = width;
    this.h = height;
    this.a = width*height;
    this.map = zeros([width, height]);
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
      room[0] *= roomdims[0]/roomdims[1]
      console.log(room);
      if (room === undefined) break;
      console.log(room);
      console.log(roomvar, roomdims);
      for (let iii = 0; iii < tries; iii++){
        let wantedSize = roomdims.map((x, ind) => {return normalRandomScaled(x, roomvar[ind])});
        console.log(wantedSize);
        let tl = room.map((e,ind) => ind - wantedSize[i]/2); //top left
        let tr = room.map((e,ind) => ind + wantedSize[i]/2); //top right
        if(rectIsEmpty(this.map, ...tl, ...tr)){
          this.generateRoom(...tl, ...tr);
          break;
        }
      }
    }
  }

  generateRoom(x1, y1, x2, y2) {
    
  }
}

function randomDungeon(seed, w, h){
  let rng = new Math.seedrandom(seed);
  let roomnum = 100;
  let roomdist = 0;
  let roomsize = [20, 10];
  let roomvar = [3,6];
  return new Dungeon(w, h, seed, roomnum, roomdist, roomsize, roomvar);
}
