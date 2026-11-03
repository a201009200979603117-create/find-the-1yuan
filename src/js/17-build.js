// ================= 建造 =================
let ghost=null,aimTile=null,buildCat='全部',beltStart=null;
// G：建造時在地上畫方格
const gridHelper=new THREE.GridHelper(25,25,0x9fd4ff,0x9fd4ff);gridHelper.material.transparent=true;gridHelper.material.opacity=.35;gridHelper.material.depthWrite=false;gridHelper.visible=false;scene.add(gridHelper);
