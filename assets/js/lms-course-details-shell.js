(() => {
"use strict";
const URL_BASE="https://elpbnytpciqnbexiaebp.supabase.co";
const ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGJueXRwY2lxbmJleGlhZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTYwMzQsImV4cCI6MjEwNTg3MjAzNH0.kWzPDxpdeorkJJpP6pvt4LCP-W9uGGVAgcQVVheVuE8";
const db=window.supabase.createClient(URL_BASE,ANON,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.sessionStorage,storageKey:"s4u-training-auth-session"}});
const nav=[["lms-dashboard.html","Dashboard","⌂"],["lms-my-courses.html","My Courses","▶"],["lms-courses.html","Course Library","▦"],["lms-progress.html","Progress","◉"],["lms-certificates.html","Certificates","✓"],["lms-live-training.html","Live Training","●"],["lms-my-appointments.html","Appointments","◷"],["lms-group-seats.html","Group Seats","♙"],["lms-documents.html","Documents","▤"],["lms-orders.html","Orders","≡"],["lms-notifications.html","Notifications","✉"],["lms-account.html","Account","○"],["lms-support.html","Support","?"]];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plain=v=>{const d=document.createElement("div");d.innerHTML=String(v||"");return (d.textContent||"").replace(/\s+/g," ").trim()};
const fmtMinutes=n=>!n?"Self-paced":n<60?n+" min":Math.floor(n/60)+" hr"+(Math.floor(n/60)!==1?"s":"")+(n%60?" "+n%60+" min":"");
function shell(){
 const links=nav.map(([href,label,icon],i)=>`<a href="${href}"${i===2?' class="active"':""}><span class="ico">${icon}</span><span>${label}</span></a>`).join("");
 document.getElementById("trainingPortalApp").innerHTML=`
 <div class="app"><aside class="side" id="side"><div class="brand"><img src="images/training-logo.png" alt="screenings4u Learning Center"></div><nav class="nav"><div class="nav-title">SCREENINGS4U LEARNING CENTER</div>${links}</nav><div class="side-foot"><div style="font-size:.5625rem;color:#9fb3c7">Portal</div><div style="font-size:.6875rem;font-weight:800;color:#fff;margin-top:3px">lms.screenings4u.com</div></div></aside>
 <main class="main"><header class="top"><div class="top-left"><button class="menu" id="menu" aria-label="Open navigation" aria-controls="mobileNav" aria-expanded="false" type="button"><span class="menu-bars" aria-hidden="true"><span></span><span></span><span></span></span></button><div class="top-context"><span class="top-eyebrow">SCREENINGS4U LEARNING CENTER</span><span class="crumb">Course Details</span></div></div><div class="top-right"><div class="top-utility-group top-time-group"><div class="portal-clock"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div><div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer"><button id="fontDown" type="button">A−</button><button class="font-reset" id="fontSizeValue" type="button">Default</button><button id="fontUp" type="button">A+</button></div></div><div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div></div></header>
 <section class="mobile-nav" id="mobileNav" aria-label="Portal navigation" aria-hidden="true"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>SCREENINGS4U LEARNING CENTER</strong></div><span class="mobile-nav-current">Course Details</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
 <div class="content"><nav class="detail-crumb"><a href="lms-courses.html">Course Library</a><span aria-hidden="true">›</span><span id="detailCrumb">Course Details</span></nav><section class="hero detail-hero"><span class="hero-kicker">SCREENINGS4U LEARNING CENTER</span><h1 id="detailTitle">Course Details</h1><p id="detailSummary">Loading your training course...</p><div class="detail-hero-meta" id="detailMeta"></div></section><section class="section" id="content"><div class="panel detail-pad">Loading course information...</div></section></div></main></div>`;
 const mobile=document.getElementById("mobileNav"),menu=document.getElementById("menu");
 menu?.addEventListener("click",()=>{const open=!mobile.classList.contains("open");mobile.classList.toggle("open",open);document.body.classList.toggle("mobile-nav-open",open);mobile.setAttribute("aria-hidden",String(!open));menu.setAttribute("aria-expanded",String(open))});
 mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.classList.remove("open");document.body.classList.remove("mobile-nav-open")}));
 document.getElementById("logout").addEventListener("click",async()=>{await db.auth.signOut();location.replace("training-login.html")});
 const fontKey="s4u_lms_font_size";let size=Math.max(12,Math.min(18,Number(localStorage.getItem(fontKey)||14)));
 const apply=()=>{document.documentElement.style.setProperty("--portal-font-root",size+"px");localStorage.setItem(fontKey,String(size));document.getElementById("fontSizeValue").textContent=size===14?"Default":String(size)};
 apply();document.getElementById("fontDown").onclick=()=>{size=Math.max(12,size-1);apply()};document.getElementById("fontUp").onclick=()=>{size=Math.min(18,size+1);apply()};document.getElementById("fontSizeValue").onclick=()=>{size=14;apply()};
 const clock=()=>{const now=new Date();document.getElementById("portalClockDate").textContent=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}).format(now);document.getElementById("portalClockTime").textContent=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true}).format(now)};clock();setInterval(clock,1000);
}
async function fetchRows(query){const r=await query;if(r.error)throw r.error;return r.data||[]}
function render(course,enrollment,sections,lessons,catalog){
 const title=course.title||"Course",description=plain(course.description||course.short_description||"Complete your training at your own pace.");
 const count=lessons.length,minutes=lessons.reduce((sum,l)=>sum+Number(l.estimated_minutes||0),0);
 document.title=title+" | screenings4u Learning Center";
 document.getElementById("detailCrumb").textContent=title;
 document.getElementById("detailTitle").textContent=title;
 document.getElementById("detailSummary").textContent=plain(course.short_description||course.description||"Review the curriculum and choose how to continue.");
 document.getElementById("detailMeta").innerHTML=`<span>Self-paced</span><span>${count} published lessons</span><span>${sections.length} modules</span><span>${esc(fmtMinutes(minutes))}</span>`;
 const action=enrollment?`lms-course-player.html?course=${encodeURIComponent(course.id)}&enrollment=${encodeURIComponent(enrollment.id)}`:`lms-checkout.html?course=${encodeURIComponent(course.id)}`;
 const label=enrollment?(enrollment.status==="completed"?"Review Course":"Continue Learning"):"Purchase Full Access";
 const modules=sections.map((section,i)=>{const rows=lessons.filter(l=>l.section_id===section.id);return `<details class="detail-module" ${i===0?"open":""}><summary><span><strong>${esc(section.title||"Module "+(i+1))}</strong><small>${rows.length} lesson${rows.length===1?"":"s"}</small></span><span aria-hidden="true">⌄</span></summary><ul>${rows.map(l=>`<li><span>${esc(l.title)}</span><small>${l.estimated_minutes?esc(l.estimated_minutes)+" min":""}</small></li>`).join("")||"<li>No published lessons yet</li>"}</ul></details>`}).join("")||'<p class="detail-muted">This course has no published modules yet.</p>';
 const marketingBySlug={
  "dot-specimen-collector-training":"dot-specimen-collector-training.html",
  "dot-urine-specimen-collector-training-plus-hair-collector-training":"dot-specimen-collector-training.html",
  "dot-urine-specimen-collector-training-train-the-trainer":"dot-specimen-collector-training.html",
  "dot-specimen-collector-train-the-trainer-plus-hair-collector-training":"dot-specimen-collector-training.html",
  "dot-der-training":"der-training.html",
  "supervisor-training":"supervisor-training.html",
  "dot-employee-training":"employee-training.html",
  "dot-hazmat-training":"hazmat-training.html"
 };
 const mainSlugs=new Set(["dot-specimen-collector-training","dot-der-training","supervisor-training","dot-employee-training","dot-hazmat-training"]);
 const renderLink=c=>`<a class="detail-course-link${c.id===course.id?" current":""}" href="lms-course-details.html?course=${encodeURIComponent(c.id)}"><span><strong>${esc(c.title)}</strong><small>${esc(plain(c.short_description||c.description||"View the course curriculum."))}</small></span><span aria-hidden="true">›</span></a>`;
 const mainCourses=catalog.filter(c=>mainSlugs.has(c.slug)).map(renderLink).join("");
 const collectorVariants=catalog.filter(c=>!mainSlugs.has(c.slug)).map(renderLink).join("");
 const detailsLink=marketingBySlug[course.slug]?"https://training.screenings4u.com/"+marketingBySlug[course.slug]:"https://training.screenings4u.com/pricing.html";
 document.getElementById("content").innerHTML=`
 <div class="detail-layout"><div class="detail-main">
 <article class="panel detail-pad"><div class="detail-kicker">ABOUT THIS COURSE</div><h2>Course Overview</h2><p class="detail-desc">${esc(description)}</p><div class="detail-stat-row"><span>${count} lessons</span><span>${sections.length} modules</span><span>${esc(fmtMinutes(minutes))}</span></div><p class="detail-marketing"><a href="${detailsLink}" target="_blank" rel="noopener noreferrer">View official training details</a></p></article>
 <article class="panel detail-pad"><div class="detail-kicker">COURSE CONTENT</div><h2>Full Course Curriculum</h2><p class="detail-muted">${enrollment?"Open the course player to complete lessons and assessments.":"Preview the published lesson outline. Enrollment is required to open the player."}</p><div class="detail-modules">${modules}</div></article>
 
 </div><aside class="detail-aside"><article class="panel detail-pad detail-purchase"><div class="detail-kicker">${enrollment?"YOUR ENROLLMENT":"REVIEW & PURCHASE"}</div><h2>${enrollment?"Your Course Access":"Get Full Course Access"}</h2><p class="detail-muted">${enrollment?"Your progress stays linked to this enrollment.":"Purchase or course assignment is required before starting training."}</p><div class="detail-summary-row"><span>Course Access</span><strong>${enrollment?"Enrolled":"Purchase required"}</strong></div><div class="detail-summary-row"><span>Progress</span><strong>${enrollment?Math.round(Number(enrollment.progress_percent||0))+"%":"Not started"}</strong></div><div class="detail-summary-row"><span>Published Lessons</span><strong>${count}</strong></div><a class="btn primary detail-main-action" href="${action}">${label} →</a>${enrollment?`<a class="detail-secondary-link" href="lms-my-courses.html">Back to My Courses</a>`:""}<small class="detail-footnote">${enrollment?"Open the LMS player to continue or review your training.":"Secure checkout connects your purchase to your Learning Center account."}</small></article></aside></div><article class="panel detail-pad detail-catalog-panel"><div class="detail-kicker">LEARNING CENTER COURSES</div><h2>Training Courses <span class="detail-count">${catalog.length} published</span></h2><p class="detail-muted">Choose one of the five main training tracks or a collector-training package. Every course opens its own LMS record and enrolled learners can continue in the player.</p><h3 class="detail-subheading">Core training</h3><div class="detail-course-list">${mainCourses}</div>${collectorVariants?`<h3 class="detail-subheading">Collector training packages</h3><div class="detail-course-list">${collectorVariants}</div>`:""}<div class="detail-group-callout"><div><strong>Training a team?</strong><p>Group Training purchases seats in these courses, rather than creating a separate LMS course.</p></div><a href="https://training.screenings4u.com/group-training.html" target="_blank" rel="noopener noreferrer">Group Training Options →</a></div></article>`;
}
async function init(){
 shell();
 const params=new URLSearchParams(location.search),courseId=params.get("course"),slug=params.get("slug");
 if(!courseId&&!slug){document.getElementById("content").innerHTML='<div class="panel detail-pad">No course selected. <a href="lms-courses.html">Browse Course Library</a>.</div>';return}
 try{
 const auth=await db.auth.getSession();if(auth.error)throw auth.error;
 const user=auth.data?.session?.user;
 if(!user){location.replace("training-login.html?returnTo="+encodeURIComponent(location.pathname+location.search));return}
 const courses=await fetchRows(db.from("lms_courses").select("id,slug,title,short_description,description,status,certificate_enabled,navigation_mode").eq("status","published").order("title"));
 const course=courses.find(c=>c.id===courseId||c.slug===slug);
 if(!course)throw Error("Course not found in published LMS catalog.");
 // Paid lesson bodies stay protected by RLS; this RPC exposes only published
 // module/lesson headings and durations for the pre-purchase catalog preview.
 const [enrollments,outlineResult]=await Promise.all([
  fetchRows(db.from("lms_enrollments").select("id,course_id,user_id,status,progress_percent,expires_at").eq("user_id",user.id).eq("course_id",course.id).in("status",["active","completed"])),
  db.rpc("lms_course_published_outline",{p_course_id:course.id})
 ]);
 if(outlineResult.error)throw outlineResult.error;
 const outline=outlineResult.data||{};
 const sections=Array.isArray(outline.sections)?outline.sections:[];
 const lessons=Array.isArray(outline.lessons)?outline.lessons:[];
 render(course,enrollments[0]||null,sections,lessons,courses);
 }catch(e){console.error("[Course Details]",e);document.getElementById("content").innerHTML=`<div class="panel detail-pad"><h2>Unable to load course</h2><p>${esc(e.message||"Please try again.")}</p><a class="btn primary" href="lms-courses.html">Return to Course Library</a></div>`}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
