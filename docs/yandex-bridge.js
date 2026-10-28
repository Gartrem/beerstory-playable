/* Yandex SDK boundary. This file contains no mock SDK and no advertising fallback. */
(function(root){
 'use strict';
 const state={sdk:null,unity:null,connected:false,wanted:false,active:false,ready:false,readySent:false,ad:false,lastPaused:null,lastShown:Date.now(),reasons:new Set()};
 function send(method,value){if(state.unity)state.unity.SendMessage('BeerYandexPlatform',method,String(value));}
 function sync(){const paused=state.reasons.size>0;if(state.lastPaused!==paused){state.lastPaused=paused;send('OnPlatformPause',paused?'1':'0');}const playing=state.wanted&&!paused;
  if(state.sdk && playing!==state.active){state.active=playing;if(playing)state.sdk.features.GameplayAPI.start();else state.sdk.features.GameplayAPI.stop();}
 }
 function pause(reason,value){if(value)state.reasons.add(reason);else state.reasons.delete(reason);sync();}
 function ready(){if(state.ready&&root.document){root.document.getElementById('loading').hidden=true;}if(state.ready&&state.sdk&&!state.readySent){state.readySent=true;state.sdk.features.LoadingAPI.ready();}}
 function deliver(){if(!state.unity||!state.connected)return;send('OnPlatformLanguage',state.sdk?.environment?.i18n?.lang||root.navigator?.language?.split('-')[0]||'ru');sync();ready();}
 async function init(){try{if(root.YaGames){state.sdk=await root.YaGames.init();state.sdk.on('game_api_pause',()=>pause('sdk',true));state.sdk.on('game_api_resume',()=>pause('sdk',false));}}
  catch(error){console.warn('Yandex SDK initialization unavailable:',String(error));}finally{state.connected=true;deliver();}return state.sdk;}
 function interstitial(){if(state.ad){return;}if(!state.sdk || Date.now()-state.lastShown<90000){send('OnAdComplete','0');return;}
  state.ad=true;pause('ad',true);let done=false;
  const finish=shown=>{if(done)return;done=true;state.ad=false;pause('ad',false);send('OnAdComplete',shown?'1':'0');};
  try{state.sdk.adv.showFullscreenAdv({callbacks:{onOpen:()=>{state.lastShown=Date.now();pause('ad',true);},onClose:finish,onError:()=>finish(false)}});}catch(error){finish(false);}
 }
 root.BeerYG={state,init,bind:unity=>{state.unity=unity;state.lastPaused=null;deliver();},connect:()=>deliver(),ready:()=>{state.ready=true;ready();},gameplay:value=>{state.wanted=!!value;sync();},interstitial,pause};
 if(root.document){root.document.addEventListener('visibilitychange',()=>pause('visibility',root.document.hidden));root.addEventListener('blur',()=>pause('focus',true));root.addEventListener('focus',()=>pause('focus',false));pause('visibility',root.document.hidden);}
})(typeof window!=='undefined'?window:globalThis);


