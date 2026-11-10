/* Minimal policy links inside the LMS content. No footer element or footer bar. */
(()=>{"use strict";
const id="wt-lms-legal";
const links=[
["https://training.screenings4u.com/terms.html","Terms"],
["https://training.screenings4u.com/privacy.html","Privacy"],
["https://training.screenings4u.com/refund-policy.html","Refunds"],
["https://training.screenings4u.com/disclaimer.html","Disclaimer"],
["https://training.screenings4u.com/accessibility.html","Accessibility"]
];
let strip;
function render(){
  if(document.body.matches(".wt-training-login"))return true;
  const target=document.querySelector("#trainingPortalApp .main .content") || document.querySelector("#trainingPortalApp .main");
  if(!target)return false;
  if(!strip){
    strip=document.createElement("nav");
    strip.id=id;
    strip.setAttribute("aria-label","Training legal policies");
    const inner=document.createElement("div");
    inner.className="wt-lms-legal-links";
    for(const [url,title] of links){
      const a=document.createElement("a");a.href=url;a.textContent=title;inner.appendChild(a);
    }
    strip.appendChild(inner);
  }
  if(strip.parentElement!==target)target.appendChild(strip);
  return true;
}
function init(){
 if(render())return;
 const observer=new MutationObserver(()=>{if(render())observer.disconnect()});
 observer.observe(document.getElementById("trainingPortalApp")||document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();