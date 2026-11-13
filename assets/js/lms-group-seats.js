(() => {
  "use strict";
  console.info("[LMS Group Seats] build 20261004-training4");

  const SUPABASE_URL = "https://elpbnytpciqnbexiaebp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGJueXRwY2lxbmJleGlhZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTYwMzQsImV4cCI6MjEwNTg3MjAzNH0.kWzPDxpdeorkJJpP6pvt4LCP-W9uGGVAgcQVVheVuE8";
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.sessionStorage,storageKey:"s4u-training-auth-session"}
  });

  const FONT_KEY="s4u_lms_font_size", FONT_DEFAULT=14, FONT_MIN=12, FONT_MAX=18;
  const navItems=[
    ["lms-dashboard.html","Dashboard","⌂"],["lms-my-courses.html","My Courses","▶"],["lms-courses.html","Course Library","▦"],["lms-progress.html","Progress","◉"],["lms-certificates.html","Certificates","✓"],["lms-live-training.html","Live Training","●"],["lms-my-appointments.html","Appointments","◷"],["lms-group-seats.html","Group Seats","♙"],["lms-documents.html","Documents","▤"],["lms-orders.html","Orders","≡"],["lms-notifications.html","Notifications","✉"],["lms-account.html","Account","○"],["lms-support.html","Support","?"]
  ];
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const metric=(label,value,sub)=>`<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:""}</article>`;
  const fmtDate=v=>{if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?"":new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(d)};
  let purchases=[];

  function readFontSize(){const stored = localStorage.getItem(FONT_KEY);
    const n = stored === null ? FONT_DEFAULT : Number(stored);return Number.isFinite(n)?Math.min(FONT_MAX,Math.max(FONT_MIN,n)):FONT_DEFAULT}
  function applyFontSize(n){const value=Math.min(FONT_MAX,Math.max(FONT_MIN,Number(n)||FONT_DEFAULT));document.documentElement.style.setProperty("--portal-font-root",value+"px");
    document.documentElement.style.setProperty("--lms-text-scale", String(value / FONT_DEFAULT));localStorage.setItem(FONT_KEY,String(value));const el=document.getElementById("fontSizeValue");if(el)el.textContent=value===FONT_DEFAULT?"Default":String(value);return value}
  let portalFontSize=applyFontSize(readFontSize());

  function renderShell(){
    const links = navItems.map(([href,label,icon]) => `<a href="${href}"${href === "lms-group-seats.html" ? ' class="active" aria-current="page"' : ""}><span class="ico">${icon}</span><span>${esc(label)}</span></a>`).join("");
    document.getElementById("trainingPortalApp").innerHTML = `
      <div class="app">
        <aside class="side" id="side">
          <div class="brand"><img src="images/logo2.png" alt="Workforce Training by screenings4u"></div>
          <nav class="nav"><div class="nav-title">Workforce Training by screenings4u</div>${links}</nav>
          <div class="side-foot"><div style="font-size:.5625rem;color:#9fb3c7">Portal</div><div style="font-size:.6875rem;font-weight:800;color:#fff;margin-top:3px">lms.screenings4u.com</div></div>
        </aside>
        <main class="main">
          <header class="top">
            <div class="top-left">
              <button class="menu" id="menu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobileNav"><span class="menu-bars" aria-hidden="true"><span></span><span></span><span></span></span></button>
              <div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">Group Seats</span></div>
            </div>
            <div class="top-right">
              <div class="top-utility-group top-time-group"><div class="portal-clock" aria-label="Current date and time"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div>
              <div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer" role="group" aria-label="Page font size"><button type="button" id="fontDown" aria-label="Decrease font size">A−</button><button type="button" class="font-reset" id="fontSizeValue" aria-label="Reset font size">Default</button><button type="button" id="fontUp" aria-label="Increase font size">A+</button></div></div>
              <div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div>
            </div>
          </header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true" aria-label="Portal navigation"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">Group Seats</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content">
            <section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>Group Training Seats</h1><p>Assign and manage learner seats from your group training purchases.</p><div class="hero-actions"><a class="btn primary" href="https://training.screenings4u.com/group-training.html">Explore Group Training</a></div></section>
            <section class="section" id="content"><div class="loading-msg">Loading appointments…</div></section>
          </div>
        </main>
      </div>`;
  }

  function startClock(){
    const update = () => {
      const now = new Date();
      document.getElementById("portalClockDate").textContent = new Intl.DateTimeFormat("en-US", {weekday:"short", month:"short", day:"numeric", year:"numeric"}).format(now);
      document.getElementById("portalClockTime").textContent = new Intl.DateTimeFormat("en-US", {hour:"numeric", minute:"2-digit", second:"2-digit", hour12:true}).format(now);
    };
    update();
    window.__s4uLmsGroupSeatsClock = setInterval(update, 1000);
  }

  function bindShell(){
    document.getElementById("fontDown")?.addEventListener("click", () => { portalFontSize = applyFontSize(portalFontSize - 1); });
    document.getElementById("fontUp")?.addEventListener("click", () => { portalFontSize = applyFontSize(portalFontSize + 1); });
    document.getElementById("fontSizeValue")?.addEventListener("click", () => { portalFontSize = applyFontSize(FONT_DEFAULT); });
    const menu = document.getElementById("menu");
    const mobile = document.getElementById("mobileNav");
    menu?.addEventListener("click", () => {
      const open = !mobile.classList.contains("open");
      mobile.classList.toggle("open", open);
      document.body.classList.toggle("mobile-nav-open", open);
      menu.setAttribute("aria-expanded", String(open));
      mobile.setAttribute("aria-hidden", String(!open));
    });
    mobile?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mobile.classList.remove("open");
      document.body.classList.remove("mobile-nav-open");
      menu?.setAttribute("aria-expanded", "false");
      mobile.setAttribute("aria-hidden", "true");
    }));
    document.getElementById("logout")?.addEventListener("click", async () => {
      await db.auth.signOut();
      window.location.replace("https://lms.screenings4u.com/training-login.html");
    });
  }

  async function call(body){
    const {data,error}=await db.functions.invoke("lms-group-seat-actions",{body});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    return data||{};
  }
  function showMessage(text,bad=false){const el=document.getElementById("seatMessage");if(!el)return;el.textContent=text;el.className=`seat-message ${bad?"bad":"good"}`;window.setTimeout(()=>{el.className="seat-message";el.textContent=""},6000)}

  function purchaseCard(p){
    const assignments=Array.isArray(p.assignments)?p.assignments:[];
    const active=assignments.filter(a=>a.status==="active");
    const total=Number(p.seats_purchased||0), used=Number(p.seats_used||0), available=Math.max(0,Number(p.seats_available??(total-used)));
    const percent=total?Math.min(100,Math.round((used/total)*100)):0;
    const course=p.lms_courses?.title||p.lms_training_products?.name||"";
    const rows=assignments.map(a=>`<div class="assignment-row"><strong>${esc(a.learner_name||"")}</strong><span>${esc(a.learner_email||"")}</span><span class="badge ${a.status==="active"?"good":"bad"}">${esc(a.status||"")}</span>${a.status==="active"?`<button class="seat-revoke" type="button" data-revoke="${esc(a.id)}" data-purchase="${esc(p.id)}">Revoke</button>`:"<span></span>"}</div>`).join("");
    return `<article class="seat-card"><div class="seat-card-head"><div><h3>${esc(course)}</h3><p>${p.lms_training_products?.name?esc(p.lms_training_products.name):""}</p><div class="purchase-meta"><span>${esc(p.status||"")}</span>${p.created_at?`<span>Purchased ${esc(fmtDate(p.created_at))}</span>`:""}</div></div><div class="seat-count">${available} available<small>${used} of ${total} assigned</small></div></div><div class="seat-body"><div class="seat-bar"><span style="width:${percent}%"></span></div>${available>0&&p.status==="active"?`<form class="seat-form" data-assign="${esc(p.id)}"><div class="field"><label>First Name</label><input name="first_name" autocomplete="given-name" required></div><div class="field"><label>Last Name</label><input name="last_name" autocomplete="family-name" required></div><div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div><div class="field"><label>Phone</label><input name="phone" type="tel" autocomplete="tel"></div><div class="seat-form-actions"><button class="btn primary" type="submit">Assign Learner Seat</button></div></form>`:""}<div class="assignment-list">${rows||'<div class="seat-empty">No learner seats are currently assigned.</div>'}</div></div></article>`;
  }

  function render(){
    const totalPurchased=purchases.reduce((n,p)=>n+Number(p.seats_purchased||0),0);
    const totalAssigned=purchases.reduce((n,p)=>n+Number(p.seats_used||0),0);
    const totalAvailable=purchases.reduce((n,p)=>n+Math.max(0,Number(p.seats_available??(Number(p.seats_purchased||0)-Number(p.seats_used||0)))),0);
    const activePackages=purchases.filter(p=>p.status==="active").length;
    document.getElementById("content").innerHTML=`<div id="seatMessage" class="seat-message"></div><section class="wt-seats-stats">${[["Seat Packages",purchases.length,"Group purchases","▦"],["Seats Purchased",totalPurchased,"Total capacity","◉"],["Assigned Seats",totalAssigned,"Learner assignments","✓"],["Available Seats",totalAvailable,`${activePackages} active package${activePackages===1?"":"s"}`,"♙"]].map(([label,value,detail,icon])=>`<article class="wt-seats-stat"><span class="wt-seats-stat-icon" aria-hidden="true">${icon}</span><div><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></div></article>`).join("")}</section><section class="wt-seats-panel"><div class="wt-seats-panel-head"><div><h2>Group Training Packages</h2><p>Assign available seats and manage your learners from purchased packages.</p></div><span class="wt-seats-package-count">${purchases.length} package${purchases.length===1?"":"s"}</span></div>${purchases.length?`<div class="group-grid">${purchases.map(purchaseCard).join("")}</div>`:`<div class="wt-seats-empty"><div class="wt-seats-empty-icon" aria-hidden="true">♙</div><h3>No group training packages yet</h3><p>Once you purchase group training seats, your packages and learner assignments will appear here.</p><a class="wt-seats-cta" href="https://training.screenings4u.com/group-training.html">Explore Group Training →</a></div>`}</section><div class="wt-seats-help"><div><h2>Need help managing learner seats?</h2><p>Our training support team can help with assignments and group training access.</p></div><a href="lms-support.html" class="wt-seats-cta outline">Contact Support →</a></div>`;
    document.querySelectorAll("[data-assign]").forEach(form=>form.addEventListener("submit",assignSeat));
    document.querySelectorAll("[data-revoke]").forEach(btn=>btn.addEventListener("click",revokeSeat));
  }

  async function assignSeat(e){
    e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);const button=form.querySelector("button[type=submit]");if(button)button.disabled=true;
    try{await call({action:"assign",purchase_id:form.dataset.assign,first_name:fd.get("first_name"),last_name:fd.get("last_name"),email:fd.get("email"),phone:fd.get("phone")});form.reset();await load();showMessage("Learner seat assigned.");}
    catch(err){showMessage(err?.message||"Unable to assign learner seat.",true)}
    finally{if(button)button.disabled=false}
  }
  async function revokeSeat(e){
    const btn=e.currentTarget;if(!await window.LMSDialog.confirm("Revoke this learner seat?",{title:"Revoke Learner Seat",confirmText:"Revoke Seat",type:"warning"}))return;btn.disabled=true;
    try{await call({action:"revoke",purchase_id:btn.dataset.purchase,assignment_id:btn.dataset.revoke});await load();showMessage("Learner seat revoked.");}
    catch(err){showMessage(err?.message||"Unable to revoke learner seat.",true);btn.disabled=false}
  }
  async function load(){const result=await call({action:"workspace"});purchases=Array.isArray(result.purchases)?result.purchases:[];render()}

  async function init(){
    renderShell();bindShell();startClock();
    const {data,error}=await db.auth.getSession();if(error)throw error;
    if(!data?.session?.user?.id){location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-group-seats.html");return}
    try{await load()}catch(err){console.error("[LMS Group Seats]",err);document.getElementById("content").innerHTML=`<div class="panel"><div class="empty">${esc(err?.message||"Unable to load group seats.")}</div></div>`}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
