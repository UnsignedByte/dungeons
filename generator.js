/**
 * @Author: Edmund Lam <edl>
 * @Date:   18:35:01, 15-Oct-2019
 * @Filename: generator.js
 * @Last modified by:   edl
 * @Last modified time: 00:44:00, 18-Oct-2019
 */

class Dungeon {
  constructor(width, height, seed,
              roomnum, roomdat)
  {
    this.rng = new Math.seedrandom(seed);
    this.w = width;
    this.h = height;
    this.a = width*height;
    this.mat = zeros([width, height]);
    this.generateRooms(roomnum, roomdat);
  }

  generateRooms(roomnum, roomdat){
    //roomnum = total number of rooms

    let roomweights = roomdat.map((x)=>x.weight)

    //roomdist = average distance (in number of rooms) between each room
    //roomdims = average width and height of room
    //roomvar = variation of room dimensions

    let tries = 30; //number of times to try placing room before giving up

    let roomdisp = new PoissonDisc(this.w, this.h, tries, 1)

    for (let i = 0; i < roomnum; i++){
      let cr = roomdat[chance.weighted([...Array(roomweights.length).keys()], roomweights)];
      console.log(cr.dims.map((e) => e*(cr.dist+0.5)));
      let room = roomdisp.addPoint(...cr.dims.map((e, ind) => e*(cr.dist+0.5)));
      console.log(room);
      if (room === undefined) break;
      room = Array.from(room)
      room[0] *= cr.dims[0]/cr.dims[1];
      for (let iii = 0; iii < tries; iii++){
        let wantedSize = cr.dims.map((x, ind) => normalRandomScaled(x, cr.var[ind]));
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
  let roomnum = 1000;

  let roomdat = [
    {
      weight:3,
      dist:5,
      dims:[20,20],
      var:[5,10]
    },
    {
      weight:5,
      dist:4,
      dims:[10,10],
      var:[2,2]
    },
    {
      weight:2,
      dist:10,
      dims:[50,5],
      var:[3,1]
    },
    {
      weight:0.1,
      dist:10,
      dims:[100,100],
      var:[50,50]
    }
  ]
  return new Dungeon(w, h, seed, roomnum, roomdat);
}
