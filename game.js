/**
 * @Author: Edmund Lam <edl>
 * @Date:   12:01:43, 20-Oct-2019
 * @Filename: game.js
 * @Last modified by:   edl
 * @Last modified time: 10:32:42, 22-Oct-2019
 */

var game = {
  pos:[0,0],
  vec:[0,0], //movement vector
  map:null
}

var TEXTUREMAP = {};
TEXTUREMAP[COLORMAP.empty] = TEXTURESETS.empty;
TEXTUREMAP[COLORMAP.jumpfloor] = TEXTURESETS.jumpfloor;
TEXTUREMAP[COLORMAP.room.t] = TEXTURESETS.floor;
TEXTUREMAP[COLORMAP.corridor.t] = TEXTURESETS.floor;
TEXTUREMAP[COLORMAP.room.b] = TEXTURESETS.floor;
TEXTUREMAP[COLORMAP.corridor.b] = TEXTURESETS.floor;
TEXTUREMAP[COLORMAP.room.l] = TEXTURESETS.wall;
TEXTUREMAP[COLORMAP.room.r] = TEXTURESETS.wall;
TEXTUREMAP[COLORMAP.corridor.l] = TEXTURESETS.wall;
TEXTUREMAP[COLORMAP.corridor.r] = TEXTURESETS.wall;
