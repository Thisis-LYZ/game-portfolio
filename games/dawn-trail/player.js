"use strict";
(() => {
  const canvas=document.getElementById("game"),cover=document.getElementById("cover"),start=document.getElementById("start"),status=document.getElementById("status"),detail=document.getElementById("detail"),progress=document.getElementById("progress"),retry=document.getElementById("retry"),fullscreen=document.getElementById("fullscreen"),player=document.getElementById("player");
  let instance=null,loading=false;
  const titleScreen=cover.querySelector(".title-screen");
  function fitTitleArt(){
    const ratio=window.devicePixelRatio||1,w=cover.clientWidth,h=cover.clientHeight;
    if(!w||!h)return;
    const unit=Math.floor(Math.min(w*ratio/320,h*ratio/180));
    if(unit<1)return;
    const width=320*unit/ratio,height=180*unit/ratio;
    titleScreen.style.width=width+"px";titleScreen.style.height=height+"px";
    titleScreen.style.left=Math.round((w-width)*ratio/2)/ratio+"px";
    titleScreen.style.top=Math.round((h-height)*ratio/2)/ratio+"px";
  }
  if(window.ResizeObserver)new ResizeObserver(fitTitleArt).observe(cover);
  window.addEventListener("resize",fitTitleArt);fitTitleArt();
  const modes=document.createElement("div"),windowed=document.createElement("button"),fullscreenToolbar=document.createElement("div"),exitFullscreen=document.createElement("button");
  modes.className="play-modes";modes.setAttribute("role","group");modes.setAttribute("aria-label","游玩方式");
  windowed.type="button";windowed.textContent="网页游玩";windowed.setAttribute("aria-pressed","true");
  fullscreen.textContent="全屏游玩";fullscreen.setAttribute("aria-pressed","false");
  fullscreen.replaceWith(modes);modes.append(windowed,fullscreen);
  fullscreenToolbar.id="fullscreen-toolbar";
  const modeLabel=document.createElement("span");modeLabel.textContent="黎明之路 · 全屏游玩";
  exitFullscreen.id="exit-fullscreen";exitFullscreen.type="button";exitFullscreen.textContent="返回网页 · Esc";
  fullscreenToolbar.append(modeLabel,exitFullscreen);player.prepend(fullscreenToolbar);
  function inFullscreen(){return document.fullscreenElement===player||document.webkitFullscreenElement===player;}
  function syncMode(){const active=inFullscreen();windowed.setAttribute("aria-pressed",String(!active));fullscreen.setAttribute("aria-pressed",String(active));fitTitleArt();if(instance)canvas.focus();else if(!loading)start.focus();}
  async function returnToPage(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();}finally{syncMode();}}
  windowed.addEventListener("click",returnToPage);exitFullscreen.addEventListener("click",returnToPage);
  document.addEventListener("fullscreenchange",syncMode);document.addEventListener("webkitfullscreenchange",syncMode);
  fullscreen.disabled=false;
  function fail(message){cover.dataset.state="error";status.textContent="游戏暂时没有加载成功";detail.textContent=message;progress.hidden=true;start.hidden=true;retry.hidden=false;cover.hidden=false;cover.style.display="flex";console.error(message);}
  retry.addEventListener("click",()=>location.reload());
  start.addEventListener("click",async()=>{
    if(loading)return;
    if(!window.WebAssembly){fail("当前浏览器不支持游戏运行，请使用较新的电脑浏览器。");return;}
    loading=true;cover.dataset.state="loading";start.hidden=true;progress.hidden=false;status.textContent="正在准备冒险……";detail.textContent="首次加载需要一点时间，请保持页面打开。";
    try{
      const response=await fetch("build-config.json");if(!response.ok)throw new Error("游戏资源暂未就绪，请稍后重试。");
      const build=await response.json();
      await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=build.loaderUrl;s.onload=resolve;s.onerror=()=>reject(new Error("游戏加载器下载失败，请检查网络后重试。"));document.body.appendChild(s);});
      const config={...build.config,devicePixelRatio:Math.min(window.devicePixelRatio||1,2),showBanner:(message,type)=>{if(type==="error")fail("运行时发生错误。请重新加载；如果重复出现，请将报错截图发给作者。 "+message);else console.warn(message);}};
      instance=await createUnityInstance(canvas,config,(value)=>{progress.value=value;status.textContent="正在加载冒险 · "+Math.round(value*100)+"%";});
      cover.style.display="none";fullscreen.disabled=false;canvas.focus();
    }catch(error){fail(error.message||String(error));}
  });
  fullscreen.addEventListener("click",async()=>{
    if(inFullscreen()){await returnToPage();return;}
    try{if(player.requestFullscreen)await player.requestFullscreen();else if(player.webkitRequestFullscreen)player.webkitRequestFullscreen();else if(instance)instance.SetFullscreen(1);syncMode();}
    catch{syncMode();}
  });
  canvas.addEventListener("pointerdown",()=>canvas.focus());
  canvas.addEventListener("contextmenu",event=>event.preventDefault());
  canvas.addEventListener("keydown",event=>{if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code))event.preventDefault();});
  // Reuse DawnRpgUI.Button's exact atlas rectangles and 3 px nine-slice border.
  for(const button of [start,retry]){
    const label=document.createElement("span");label.className="rpg-button-label";label.textContent=button.textContent;button.textContent="";
    for(const [state,sourceX] of [["normal",0],["hover",48]]){
      const skin=document.createElement("span");skin.className="rpg-button-skin "+state;skin.setAttribute("aria-hidden","true");
      for(let row=0;row<3;row++)for(let col=0;col<3;col++){
        const piece=document.createElement("span");
        if(row===1&&col===1){piece.className="rpg-button-fill";skin.append(piece);continue;}
        const sx=sourceX+[0,3,45][col],sy=160+[0,3,13][row],sw=[3,42,3][col],sh=[3,10,3][row];
        const img=document.createElement("img");img.src="rpg-ui.png";img.alt="";img.draggable=false;
        img.style.cssText=`width:${1024/sw*100}%;height:${1024/sh*100}%;left:${-sx/sw*100}%;top:${-sy/sh*100}%;`;
        piece.append(img);skin.append(piece);
      }
      button.append(skin);
    }
    button.append(label);
  }
  start.focus({preventScroll:true});
})();
