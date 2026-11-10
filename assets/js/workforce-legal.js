/* One minimal legal strip on LMS pages; no marketing footer. */
(()=>{"use strict";
const legalId="wt-lms-legal";
const links=[
["https://training.screenings4u.com/terms.html","Terms"],
["https://training.screenings4u.com/privacy.html","Privacy"],
["https://training.screenings4u.com/refund-policy.html","Refunds"],
["https://training.screenings4u.com/disclaimer.html","Disclaimer"],
["https://training.screenings4u.com/accessibility.html","Accessibility"]
];
function render(){
 if(document.getElementById(legalId))return;
 const strip=document.createElement("footer");
 strip.id=legalId;
 strip.setAttribute("aria-label","Training legal links");
 const inner=document.createElement("div");inner.className="wt-lms-legal-inner";
 const name=document.createElement("span");name.className="wt-lms-legal-name";
 name.textContent="© "+new Date().getFullYear()+" Workforce Training by screenings4u.";
 const nav=document.createElement("nav");nav.className="wt-lms-legal-links";nav.setAttribute("aria-label","Legal policies");
 links.forEach(([url,title])=>{const a=document.createElement("a");a.href=url;a.textContent=title;nav.appendChild(a)});
 inner.append(name,nav);strip.appendChild(inner);document.body.appendChild(strip);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();
