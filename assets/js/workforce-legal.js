/* LMS is footerless. Remove any previously injected legal strip; never insert a footer. */
(()=>{"use strict";
function removeFooter(){
 document.getElementById("wt-lms-legal")?.remove();
 document.querySelectorAll("footer.wt-lms-legal, .wt-lms-footer").forEach(el=>el.remove());
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",removeFooter,{once:true});
else removeFooter();
})();