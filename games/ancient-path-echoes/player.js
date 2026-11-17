"use strict";
(()=>{
const isVideo=new URLSearchParams(location.search).get('view')==='video';
const gameSection=document.getElementById('game-section'),videoSection=document.getElementById('video-section');
const canvas=document.getElementById('game'),cover=document.getElementById('cover'),start=document.getElementById('start'),retry=document.getElementById('retry'),status=document.getElementById('status'),progress=document.getElementById('progress');
const release='https://github.com/Thisis-LYZ/game-portfolio/releases/download/ancient-path-v48/';
let instance=null,loading=false;
function fail(message){loading=false;status.textContent=message;start.hidden=true;retry.hidden=false;cover.hidden=false;}
retry.addEventListener('click',()=>location.reload());
if(isVideo){
 gameSection.hidden=true;videoSection.hidden=false;document.title='古道回响 · 完整试玩录屏';document.getElementById('mode-title').textContent='从巨龙的托付，到遗迹重获清晨。';document.getElementById('watch-link').setAttribute('aria-current','page');
 const video=document.getElementById('walkthrough'),videoStatus=document.getElementById('video-status');
 video.src=release+'AncientPathEchoes-v48-full-playthrough.mp4';video.preload='metadata';
 video.addEventListener('error',()=>{videoStatus.textContent='若当前浏览器无法在线播放，可使用左侧链接下载录屏。';});
 document.querySelectorAll('[data-seek]').forEach(b=>b.addEventListener('click',()=>{const time=Number(b.dataset.seek);const seek=()=>{video.currentTime=time;video.play().catch(()=>{videoStatus.textContent='点击播放器中的播放按钮继续。';});};if(video.readyState>=1)seek();else{video.addEventListener('loadedmetadata',seek,{once:true});video.load();}}));
 return;
}
document.getElementById('play-link').setAttribute('aria-current','page');
document.getElementById('fullscreen').addEventListener('click',async()=>{const frame=document.getElementById('player');try{if(frame.requestFullscreen)await frame.requestFullscreen();else if(instance)instance.SetFullscreen(1);else status.textContent='先进入试玩，再使用全屏。';}catch{status.textContent='当前浏览器暂不支持全屏，可继续在网页内游玩。';}});
start.addEventListener('click',async()=>{
 if(loading||instance)return;loading=true;start.disabled=true;progress.hidden=false;status.textContent='正在准备前路…';
 try{
  if(!window.WebAssembly)throw Error('请使用支持网页游戏的较新浏览器。');
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='Build/v48.loader.js';script.onload=resolve;script.onerror=()=>reject(Error('游戏加载器未能下载，请重试。'));document.body.append(script);});
  instance=await createUnityInstance(canvas,{dataUrl:'Build/v48.data.unityweb',frameworkUrl:'Build/v48.framework.js.unityweb',codeUrl:'Build/v48.wasm.unityweb',streamingAssetsUrl:'StreamingAssets',companyName:'WoodlandSanctuary',productName:'古道回响',productVersion:'0.48.0',autoSyncPersistentDataPath:true,devicePixelRatio:Math.min(window.devicePixelRatio||1,2),showBanner:(text,type)=>{if(type==='error')fail('运行遇到问题，请重新加载。'+text);else console.warn(text);}},value=>{progress.value=value;status.textContent='正在加载 · '+Math.round(value*100)+'%';});
  cover.hidden=true;loading=false;canvas.focus();
 }catch(error){fail(error.message||String(error));}
});
})();
