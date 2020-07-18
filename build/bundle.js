!function(e){function t(t){for(var r,a,o=t[0],d=t[1],i=0,u=[];i<o.length;i++)a=o[i],Object.prototype.hasOwnProperty.call(n,a)&&n[a]&&u.push(n[a][0]),n[a]=0;for(r in d)Object.prototype.hasOwnProperty.call(d,r)&&(e[r]=d[r]);for(l&&l(t);u.length;)u.shift()()}var r={},n={0:0};function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.e=function(e){var t=[],r=n[e];if(0!==r)if(r)t.push(r[2]);else{var o=new Promise((function(t,a){r=n[e]=[t,a]}));t.push(r[2]=o);var d,i=document.createElement("script");i.charset="utf-8",i.timeout=120,a.nc&&i.setAttribute("nonce",a.nc),i.src=function(e){return a.p+"bundle.chunk"+e+".js"}(e);var l=new Error;d=function(t){i.onerror=i.onload=null,clearTimeout(u);var r=n[e];if(0!==r){if(r){var a=t&&("load"===t.type?"missing":t.type),o=t&&t.target&&t.target.src;l.message="Loading chunk "+e+" failed.\n("+a+": "+o+")",l.name="ChunkLoadError",l.type=a,l.request=o,r[1](l)}n[e]=void 0}};var u=setTimeout((function(){d({type:"timeout",target:i})}),12e4);i.onerror=i.onload=d,document.head.appendChild(i)}return Promise.all(t)},a.m=e,a.c=r,a.d=function(e,t,r){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(a.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)a.d(r,n,function(t){return e[t]}.bind(null,n));return r},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a.oe=function(e){throw e};var o=window.webpackJsonp=window.webpackJsonp||[],d=o.push.bind(o);o.push=t,o=o.slice();for(var i=0;i<o.length;i++)t(o[i]);var l=d;a(a.s=4)}([function(e,t,r){"use strict";r.d(t,"e",(function(){return n})),r.d(t,"d",(function(){return a})),r.d(t,"c",(function(){return o})),r.d(t,"a",(function(){return d})),r.d(t,"b",(function(){return i}));const n="viewerLoadStart",a="viewerLoadProgress",o="viewerLoaded",d="materialChanged",i="stageSelected"},function(e,t){e.exports=function(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}},function(e,t,r){"use strict";var n=r(1),a=r.n(n),o=r(0),d=r(3);class i extends d.a{load(){return this.dispatch({type:o.e}),Promise.all([r.e(1),r.e(2)]).then(r.bind(null,5)).then(e=>e.loadResources(e=>{this.dispatch({type:o.d,data:e})}).then(()=>(this.dispatch({type:o.c}),e)))}}a()(i,"assetsPath","./assets"),t.a=i},function(e,t,r){"use strict";t.a=class{constructor(){let e={};this.dispatch=t=>{if(e[t.type])for(let r of e[t.type])r({data:t.data||null,type:t.type})},this.addEventListener=(t,r)=>{e[t]||(e[t]=[]),e[t].push(r)},this.removeEventListener=(t,r)=>{e[t]&&(e[t]=e[t].filter(e=>e!==r))},this.removeEventListeners=t=>{e[t]=[]}}}},function(e,t,r){"use strict";r.r(t);const n=new(r(2).a);n.addEventListener("viewerLoadStart",()=>{document.body.querySelector(".loader").classList.add("active")}),n.addEventListener("viewerLoaded",()=>{document.body.querySelector(".loader").classList.remove("active")}),n.addEventListener("viewerLoadProgress",e=>{document.body.querySelector(".loader-text").innerText=e.data.message}),n.load().then(({Viewer:e})=>{let t=new e;t.update(),document.body.appendChild(t.canvas),window.addEventListener("resize",()=>{t.update()}),t.shouldRender();let r=document.body.querySelectorAll("#items .container-item[data-id]");r.forEach(e=>{e.addEventListener("dragstart",e=>{let r=document.createElement("div");r.style.display="none",e.dataTransfer.setDragImage(r,0,0),t.building.setDrag(t.getInstance(e.currentTarget.dataset.id))})}),(r=document.body.querySelectorAll("#walls .container-item[data-id]")).forEach(e=>{e.addEventListener("dragstart",e=>{let r=document.createElement("div");r.style.display="none",e.dataTransfer.setDragImage(r,0,0),e.dataTransfer.setData("plain/text",`WallMaterial:${e.currentTarget.dataset.id}`),t.setStageSelectMode(!0)})}),(r=document.body.querySelectorAll("#roofs .container-item[data-id]")).forEach(e=>{e.addEventListener("click",e=>{t.setRoofMaterial(t.getMaterial(e.currentTarget.dataset.id))})}),t.canvas.addEventListener("drop",e=>{let r=e.dataTransfer.getData("plain/text");if(0===r.indexOf("WallMaterial")){let e=r.split(":").pop();t.setStageMaterial(t.building.currentStage,t.getMaterial(e))}t.setStageSelectMode(!1)}),document.body.querySelector("#apply").addEventListener("click",()=>{t.createEmptyBuilding(document.body.querySelector("#width").valueAsNumber,document.body.querySelector("#depth").valueAsNumber,document.body.querySelector("#height").valueAsNumber,document.body.querySelector("#levels").valueAsNumber)});let n=!1;document.body.querySelector("#selectmode").addEventListener("click",e=>{n=!n,t.setStageSelectMode(n),n?(e.currentTarget.classList.add("active"),e.currentTarget.innerText="Disable"):(e.currentTarget.classList.remove("active"),e.currentTarget.innerText="Enable")});let a=0;t.addEventListener("stageSelected",()=>{let e=t.building.selectedStage;null!=e?(a=e.number,document.body.querySelector("#selectedlevel").innerText=a,document.body.querySelector("#targetheight").valueAsNumber=e.height/30.48):(a=-1,document.body.querySelector("#selectedlevel").innerText="-")}),document.body.querySelector("#targetheight").addEventListener("input",e=>{+e.currentTarget.value<=4&&(e.currentTarget.value=4),a>=0&&t.setStageHeight(t.building.getStage(a),+e.currentTarget.value)}),document.body.querySelector("#getplan").addEventListener("click",e=>{let r=+document.body.querySelector("#targetlevel").value;r>=0&&t.getStagePlan(t.building.getStage(r))})})}]);