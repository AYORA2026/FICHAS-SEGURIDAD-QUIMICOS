// Uso: node tools/gen-pics.mjs <carpeta con node_modules (svgo, @iconify-json/noto, @ghs-hazard-pictograms/assets)> pics.js
// Genera pics.js de la app a partir de paquetes npm (Noto Emoji + pictogramas GHS oficiales).
import fs from 'fs';import pk from '/tmp/claude-0/-home-claude-fichas-seguridad-quimicos/18da7c47-ab6a-5f01-a5ac-6512dc3f2ea2/scratchpad/font/node_modules/svgo/dist/svgo-node.cjs'; const {optimize}=pk;
const S=process.argv[2], OUT=process.argv[3];
const NM=S+'/ico/node_modules/';
const noto=JSON.parse(fs.readFileSync(NM+'@iconify-json/noto/icons.json'));
const NAMES=['oil-drum','gear','fuel-pump','alembic','warning','page-facing-up','mouth','raised-hand','eye','lungs','police-car-light','stethoscope','construction-worker','hospital','safety-vest'];
const out={noto:{},ghs:{}};
const clean=(svg,id)=>optimize(svg,{multipass:true,plugins:[
 {name:'preset-default',params:{overrides:{removeViewBox:false}}},
 'convertStyleToAttrs',
 {name:'prefixIds',params:{prefix:id,delim:'-'}},
 {name:'removeAttrs',params:{attrs:['width','height','style','xmlns:svg','version']}},
 {name:'cleanupNumericValues',params:{floatPrecision:2}}]}).data;
for(const n of NAMES){
  let d=noto.icons[n]; if(!d){const a=noto.aliases&&noto.aliases[n]; if(a) d=noto.icons[a.parent];}
  if(!d){console.error('FALTA noto',n);process.exit(1);}
  const w=d.width||noto.width||128,h=d.height||noto.height||128;
  out.noto[n]=clean(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${d.body}</svg>`,'n'+Object.keys(out.noto).length).replace(/<svg/,'<svg aria-hidden="true" focusable="false"');
}
const G=NM+'@ghs-hazard-pictograms/assets/assets/';
const M={GHS01:'physical_hazards_pictograms/ghs01_explosive/GHS-pictogram-explos.svg',GHS02:'physical_hazards_pictograms/ghs02_flammable/GHS-pictogram-flamme.svg',GHS03:'physical_hazards_pictograms/ghs03_oxidizing/GHS-pictogram-rondflam.svg',GHS04:'physical_hazards_pictograms/ghs04_compressedgas/GHS-pictogram-bottle.svg',GHS05:'physical_hazards_pictograms/ghs05_corrosive/GHS-pictogram-acid.svg',GHS06:'health_hazards_pictograms/ghs06_toxic/GHS-pictogram-skull.svg',GHS07:'health_hazards_pictograms/ghs07_healthhazard_hazardoustoozonelayer/GHS-pictogram-exclam.svg',GHS08:'health_hazards_pictograms/ghs08_serioushealthhazard/GHS-pictogram-silhouette.svg',GHS09:'environmental_hazards_pictograms/ghs09_hazardoustotheenvironment/GHS-pictogram-pollu.svg'};
for(const [k,f] of Object.entries(M)){
  const raw=fs.readFileSync(G+f,'utf8');
  out.ghs[k]=clean(raw,'g'+k.slice(3)).replace(/<svg/,'<svg aria-hidden="true" focusable="false"');
}
const head=`/* Pictogramas incluidos en la app (sin cargar nada de internet).
   · GHS01–09: pictogramas oficiales de peligro del Sistema Globalmente Armonizado (ONU/CLP).
     Paquete @ghs-hazard-pictograms/assets (MIT), dibujos de Wikimedia Commons.
   · Iconos de color: Noto Emoji de Google, licencia Apache 2.0 (github.com/googlefonts/noto-emoji).
   Generado con tools; no editar a mano. */
`;
fs.writeFileSync(OUT,head+'const PIC = '+JSON.stringify(out)+';\n');
console.log(fs.statSync(OUT).size,'bytes');
for(const k in out.noto)console.log(k,out.noto[k].length, /style=/.test(out.noto[k])?'STYLE!':'');
for(const k in out.ghs)console.log(k,out.ghs[k].length,/style=/.test(out.ghs[k])?'STYLE!':'');
