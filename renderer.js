/**
 * @Author: Edmund Lam <edl>
 * @Date:   17:17:50, 19-Oct-2019
 * @Filename: renderer.js
 * @Last modified by:   edl
 * @Last modified time: 10:49:16, 22-Oct-2019
 */

var Window = (function(){
  var self = {};

  self.height = 6;
  self.zoom = canv.height/self.height;
  self.width = canv.width/self.zoom;
  self.rect = null;

  function getMapPixels(){
    return getRect(game.map, Math.floor(game.pos[0]-self.width/2), Math.floor(game.pos[1]-self.height/2), self.width+1, self.height+1);
  }

  function drawImage(im, x, y){
    let cpos = pos.map((e, i) => (e-pos[i])*self.zoom);
    context.drawImage(im, ...cpos);
  }

  function drawTile(pos, bf){
    let tlp = [Math.floor(game.pos[0]-self.width/2), Math.floor(game.pos[1]-self.height/2)];
    let col = self.rect[pos[0]][pos[1]];

    drawImage(TEXTURESETS[TEXTUREMAP[(col<<8)>>8]][col&256][bf], pos.map((e, i) => e+tlp[i]));
  }

  function drawTiles(bf){
    for (let i = 0; i < self.rect.length; i++){
      for(let j = 0; j < self.rect[0].length; j++){
        drawTile([i,j],bf);
      }
    }
  }

  self.render = function(){
    self.rect = getMapPixels();
    drawTiles(0);
    // drawTiles(1);
  }

  return self;
}());
