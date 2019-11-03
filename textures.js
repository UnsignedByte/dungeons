/**
 * @Author: Edmund Lam <edl>
 * @Date:   10:09:15, 22-Oct-2019
 * @Filename: textures.js
 * @Last modified by:   edl
 * @Last modified time: 10:41:12, 22-Oct-2019
 */

let TEXTURESETS = {
  // numbers in list are ids of texture
  wall:[0, 2],
  floor:[1],
  empty:[3],
  jumpfloor:[4, 1]
};

(()=>{
  let count = 1;
  Object.keys(TEXTURESETS).forEach(key => {
    let types = ["b", "f"]
    for(j = 0; j < TEXTURESETS[key].length; j++){
      let tind = TEXTURESETS[key][j];
      TEXTURESETS[key][j] = [];
      for (let i = 0; i < types.length; i++){
        let img = new Image();
        count++;
        img.src = `../textures/${tind}${types[i]}.png`;
        img.onload = function() {
          TEXTURESETS[key][j][i] = img;
          count--;
          if(count === 0){
            console.log('hi');
          }
        }
      }
    }
  });
  count--;
})();
