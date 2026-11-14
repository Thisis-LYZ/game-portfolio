"use strict";
(() => {
  const canvas=document.getElementById("game"),cover=document.getElementById("cover"),start=document.getElementById("start"),status=document.getElementById("status"),detail=document.getElementById("detail"),progress=document.getElementById("progress"),retry=document.getElementById("retry"),fullscreen=document.getElementById("fullscreen"),player=document.getElementById("player");
  let instance=null,loading=false;
  function fail(message){status.textContent="游戏暂时没有加载成功";detail.textContent=message;progress.hidden=true;start.hidden=true;retry.hidden=false;cover.hidden=false;cover.style.display="flex";console.error(message);}
  retry.addEventListener("click",()=>location.reload());
  start.addEventListener("click",async()=>{
    if(loading)return;
    if(!window.WebAssembly){fail("当前浏览器不支持游戏运行，请使用较新的电脑浏览器。");return;}
    loading=true;start.hidden=true;progress.hidden=false;status.textContent="正在准备冒险……";detail.textContent="首次加载较慢，请保持页面打开。";
    try{
      const response=await fetch("build-config.json");if(!response.ok)throw new Error("游戏资源暂未就绪，请稍后重试。");
      const build=await response.json();
      await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=build.loaderUrl;s.onload=resolve;s.onerror=()=>reject(new Error("游戏加载器下载失败，请检查网络后重试。"));document.body.appendChild(s);});
      const config={...build.config,devicePixelRatio:Math.min(window.devicePixelRatio||1,2),showBanner:(message,type)=>{if(type==="error")fail("运行时发生错误。请重新加载；如果重复出现，请将报错截图发给作者。 "+message);else console.warn(message);}};
      instance=await createUnityInstance(canvas,config,(value)=>{progress.value=value;status.textContent="正在加载冒险 · "+Math.round(value*100)+"%";});
      cover.style.display="none";fullscreen.disabled=false;canvas.focus();
    }catch(error){fail(error.message||String(error));}
  });
  fullscreen.addEventListener("click",()=>{if(!instance)return;if(player.requestFullscreen)player.requestFullscreen().then(()=>canvas.focus()).catch(()=>{canvas.focus();});else instance.SetFullscreen(1);});
  canvas.addEventListener("pointerdown",()=>canvas.focus());
  canvas.addEventListener("contextmenu",event=>event.preventDefault());
  canvas.addEventListener("keydown",event=>{if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code))event.preventDefault();});
})();
