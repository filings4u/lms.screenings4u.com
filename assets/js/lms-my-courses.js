(() => {
  "use strict";

  console.info("[LMS My Courses] build 20261004-training3");

  const SUPABASE_URL = "https://elpbnytpciqnbexiaebp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGJueXRwY2lxbmJleGlhZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTYwMzQsImV4cCI6MjEwNTg3MjAzNH0.kWzPDxpdeorkJJpP6pvt4LCP-W9uGGVAgcQVVheVuE8";

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.sessionStorage,
      storageKey: "s4u-training-auth-session"
    }
  });

  const FONT_KEY = "s4u_lms_font_size";
  const FONT_DEFAULT = 14;
  const FONT_MIN = 12;
  const FONT_MAX = 18;
  const ACTIVE_NAV_INDEX = 1;

  const navItems = [
    ["lms-dashboard.html", "Dashboard", "⌂"],
    ["lms-my-courses.html", "My Courses", "▶"],
    ["lms-courses.html", "Course Library", "▦"],
    ["lms-progress.html", "Progress", "◉"],
    ["lms-certificates.html", "Certificates", "✓"],
    ["lms-live-training.html", "Live Training", "●"],
    ["lms-my-appointments.html", "Appointments", "◷"],
    ["lms-group-seats.html", "Group Seats", "♙"],
    ["lms-documents.html", "Documents", "▤"],
    ["lms-orders.html", "Orders", "≡"],
    ["lms-notifications.html", "Notifications", "✉"],
    ["lms-account.html", "Account", "○"],
    ["lms-support.html", "Support", "?"]
  ];

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pct = value => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
  };
  const fmtDate = value => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("en-US", {month:"short", day:"numeric", year:"numeric"}).format(d);
  };
  const statusLabel = row => {
    const progress = pct(row.progress_percent);
    if (row.status === "expired" || (row.expires_at && new Date(row.expires_at).getTime() <= Date.now())) return "Access Expired";
    if (row.status === "completed" || progress >= 100) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };
  const statusClass = value => value === "Completed" ? "good" : value === "In Progress" ? "warn" : "";
  const badge = value => `<span class="badge ${statusClass(value)}">${esc(value)}</span>`;
  const metric = (label, value, sub) => `<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</article>`;

  function readFontSize(){
    const stored = localStorage.getItem(FONT_KEY); const n = stored === null ? FONT_DEFAULT : Number(stored);
    return Number.isFinite(n) ? Math.min(FONT_MAX, Math.max(FONT_MIN, n)) : FONT_DEFAULT;
  }
  function applyFontSize(n){
    const value = Math.min(FONT_MAX, Math.max(FONT_MIN, Number(n) || FONT_DEFAULT));
    document.documentElement.style.setProperty("--portal-font-root", value + "px"); document.documentElement.style.setProperty("--lms-text-scale", String(value / FONT_DEFAULT));
    localStorage.setItem(FONT_KEY, String(value));
    const el = document.getElementById("fontSizeValue");
    if (el) el.textContent = value === FONT_DEFAULT ? "Default" : String(value);
    return value;
  }
  let portalFontSize = applyFontSize(readFontSize());

  function renderShell(){
    const links = navItems.map(([href,label,icon], index) => `<a href="${href}"${index === ACTIVE_NAV_INDEX ? ' class="active" aria-current="page"' : ""}><span class="ico">${icon}</span><span>${esc(label)}</span></a>`).join("");

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
              <div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">My Courses</span></div>
            </div>
            <div class="top-right">
              <div class="top-utility-group top-time-group"><div class="portal-clock" aria-label="Current date and time"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div>
              <div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer" role="group" aria-label="Page font size"><button type="button" id="fontDown" aria-label="Decrease font size">A−</button><button type="button" class="font-reset" id="fontSizeValue" aria-label="Reset font size">Default</button><button type="button" id="fontUp" aria-label="Increase font size">A+</button></div></div>
              <div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div>
            </div>
          </header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true" aria-label="Portal navigation"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">My Courses</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content">
            <section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>My Courses</h1><p>View your training, continue active courses, and access completed records and certificates.</p></section>
            <section class="section" id="content"></section>
          </div>
        </main>
      </div>`;
  }

  function startClock(){
    const update = () => {
      const now = new Date();
      const dateEl = document.getElementById("portalClockDate");
      const timeEl = document.getElementById("portalClockTime");
      if (dateEl) dateEl.textContent = new Intl.DateTimeFormat("en-US", {weekday:"short", month:"short", day:"numeric", year:"numeric"}).format(now);
      if (timeEl) timeEl.textContent = new Intl.DateTimeFormat("en-US", {hour:"numeric", minute:"2-digit", second:"2-digit", hour12:true}).format(now);
    };
    update();
    window.__s4uLmsCoursesClock = setInterval(update, 1000);
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

  async function loadData(userId){
    const {data: enrollments, error: enrollmentError} = await db
      .from("lms_enrollments")
      .select("id,course_id,status,progress_percent,enrolled_at,started_at,completed_at,last_activity_at,expires_at,course:lms_courses(id,slug,title,short_description,status,certificate_enabled)")
      .eq("user_id", userId)
      .in("status", ["active", "completed", "expired"])
      .order("last_activity_at", {ascending:false, nullsFirst:false});
    if (enrollmentError) throw enrollmentError;

    const rows = (enrollments || []).filter(row => row.course?.id && row.course?.title);
    const enrollmentIds = rows.map(row => row.id);
    let certificates = [];

    if (enrollmentIds.length){
      const certResult = await db
        .from("lms_certificates")
        .select("id,enrollment_id,status,issued_at,certificate_number")
        .in("enrollment_id", enrollmentIds)
        .eq("status", "issued");
      if (certResult.error) throw certResult.error;
      certificates = certResult.data || [];
    }

    renderCourses(rows, certificates);
  }

  function renderCourses(rows, certificates){
  const now=Date.now();
  const isExpired=row=>row.status==="expired"||(row.expires_at&&new Date(row.expires_at).getTime()<=now);
  const statusFor=row=>isExpired(row)?"Access Expired":row.status==="completed"||pct(row.progress_percent)>=100?"Completed":pct(row.progress_percent)>0?"In Progress":"Not Started";
  const active=rows.filter(row=>!isExpired(row)&&statusFor(row)!=="Completed");
  const completed=rows.filter(row=>statusFor(row)==="Completed");
  const expired=rows.filter(isExpired);
  const inProgress=active.filter(row=>pct(row.progress_percent)>0);
  const average=rows.length?Math.round(rows.reduce((sum,row)=>sum+pct(row.progress_percent),0)/rows.length):0;
  const imageFor=row=>{
    const slug=String(row.course?.slug||"").toLowerCase();
    if(slug.includes("hazmat")||slug.includes("hazard"))return "images/hazmat-hero.png";
    if(slug.includes("der")||slug.includes("designated"))return "images/der-hero.png";
    if(slug.includes("supervisor")||slug.includes("suspicion"))return "images/supervisor-hero.png";
    if(slug.includes("employee")||slug.includes("alcohol"))return "images/employee-hero.png";
    if(slug.includes("collector")||slug.includes("specimen"))return "images/collector-hero.png";
    return "images/group-hero.png";
  };
  const linkFor=row=>{
    const status=statusFor(row),progress=pct(row.progress_percent);
    const cert=certificates.find(c=>c.enrollment_id===row.id);
    if(status==="Access Expired")return {href:"lms-checkout.html?"+new URLSearchParams({product:"training-course-extension-30-days",course:row.course.id,enrollment:row.id}).toString(),label:"Extend Access · $115",kind:"extend"};
    if(status==="Completed"&&cert)return {href:"lms-certificates.html?certificate="+encodeURIComponent(cert.id),label:"Certificate",kind:"outline"};
    return {href:"lms-course-player.html?course="+encodeURIComponent(row.course.id)+"&enrollment="+encodeURIComponent(row.id),label:status==="Completed"?"Review":progress>0?"Continue":"Start",kind:progress>0?"gold":"outline"};
  };
  const statDefs=[
    ["Active Courses",active.length,"Training in progress","▤"],
    ["Completed Courses",completed.length,"Finished enrollments","✓"],
    ["Expired Access",expired.length,"Previous enrollments shown","▣"],
    ["Average Progress",average+"%","Across assigned courses","▥"],
    ["Certificates",certificates.length,"Issued certificates","✧"]
  ];
  const metricCards=statDefs.map(([label,value,detail,icon],i)=>
    '<article class="wt-myc-stat wt-myc-stat-'+i+'"><span class="wt-myc-stat-icon" aria-hidden="true">'+icon+'</span><div><span class="wt-myc-stat-label">'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(detail)+'</small></div></article>'
  ).join("");
  const learningCards=[...inProgress].sort((a,b)=>new Date(b.last_activity_at||0)-new Date(a.last_activity_at||0)).slice(0,3).map(row=>{
    const progress=pct(row.progress_percent);
    const action=linkFor(row);
    return '<article class="wt-myc-learning-card">'+
      '<img src="'+imageFor(row)+'" alt="" loading="lazy">'+
      '<div class="wt-myc-learning-info"><h3 title="'+esc(row.course.title)+'">'+esc(row.course.title)+'</h3>'+
      '<div class="wt-myc-percent"><span class="wt-myc-track"><span style="width:'+progress+'%"></span></span><strong>'+progress+'%</strong></div>'+
      '<div class="wt-myc-learning-bottom"><small>Last activity: '+(row.last_activity_at?esc(fmtDate(row.last_activity_at)):"Not recorded")+'</small>'+
      '<a class="wt-myc-action gold" href="'+esc(action.href)+'">Continue Course ›</a></div></div></article>';
  }).join("");
  const ordered=[...rows].sort((a,b)=>{
    const weight=r=>isExpired(r)?3:statusFor(r)==="Completed"?2:statusFor(r)==="Not Started"?1:0;
    return weight(a)-weight(b)||(new Date(b.last_activity_at||0)-new Date(a.last_activity_at||0));
  });
  const tableRows=ordered.map(row=>{
    const progress=pct(row.progress_percent),status=statusFor(row),action=linkFor(row);
    const description=String(row.course.short_description||"").trim();
    return '<tr class="wt-myc-row" data-status="'+esc(status)+'" data-search="'+esc((row.course.title+" "+description).toLowerCase())+'">'+
      '<td data-label="Course"><div class="wt-myc-course-cell"><img src="'+imageFor(row)+'" alt="" loading="lazy"><div class="wt-myc-course-copy"><strong>'+esc(row.course.title)+'</strong>'+
      (description?'<small title="'+esc(description)+'">'+esc(description)+'</small>':"")+
      (status==="Access Expired"?'<small>Previous course record; progress is preserved.</small>':"")+
      '</div></div></td>'+
      '<td data-label="Progress"><div class="wt-myc-table-progress"><strong>'+progress+'%</strong><span class="wt-myc-track"><span style="width:'+progress+'%"></span></span></div></td>'+
      '<td data-label="Status"><span class="wt-myc-badge wt-myc-badge-'+status.toLowerCase().replace(/\s+/g,"-")+'">'+esc(status)+'</span></td>'+
      '<td data-label="Enrolled">'+(row.enrolled_at?esc(fmtDate(row.enrolled_at)):"—")+'</td>'+
      '<td data-label="Access Through">'+(row.expires_at?esc(fmtDate(row.expires_at)):"—")+'</td>'+
      '<td data-label="Last Activity">'+(row.last_activity_at?esc(fmtDate(row.last_activity_at)):"—")+'</td>'+
      '<td data-label="Action"><a class="wt-myc-action '+action.kind+'" href="'+esc(action.href)+'">'+esc(action.label)+' ›</a></td></tr>';
  }).join("");
  const content=document.getElementById("content");
  content.classList.add("wt-myc");
  content.innerHTML=
    '<section class="wt-myc-stats" aria-label="Training overview">'+metricCards+'</section>'+
    '<section class="wt-myc-section wt-myc-learning" aria-labelledby="mycContinueTitle"><div class="wt-myc-section-header"><div class="wt-myc-section-heading"><span class="wt-myc-heading-icon gold">▶</span><div><h2 id="mycContinueTitle">Continue Learning</h2><p>Pick up where you left off on your active training.</p></div></div><a class="wt-myc-heading-link" href="#mycCourseList">View All Active Courses →</a></div>'+
    (learningCards?'<div class="wt-myc-learning-grid">'+learningCards+'</div>':'<p class="wt-myc-empty">Courses you have started will appear here.</p>')+'</section>'+
    '<section class="wt-myc-section wt-myc-library" id="mycCourseList" aria-labelledby="mycCoursesTitle"><div class="wt-myc-section-header"><div class="wt-myc-section-heading"><span class="wt-myc-heading-icon">▤</span><div><h2 id="mycCoursesTitle">My Courses</h2><p>All current and previous enrollments, including expired access.</p></div></div>'+
    '<div class="wt-myc-filters"><label class="wt-myc-search-wrap"><span class="sr-only">Search my courses</span><input type="search" id="mycSearch" placeholder="Search my courses…" autocomplete="off"></label>'+
    '<label class="wt-myc-select-wrap"><span class="sr-only">Filter course status</span><select id="mycStatus"><option value="all">All Statuses</option><option value="In Progress">In Progress</option><option value="Not Started">Not Started</option><option value="Completed">Completed</option><option value="Access Expired">Access Expired</option></select></label></div></div>'+
    '<div class="wt-myc-table-scroll"><table class="wt-myc-table"><thead><tr><th>Course</th><th>Progress</th><th>Status</th><th>Enrolled</th><th>Access Through</th><th>Last Activity</th><th>Action</th></tr></thead><tbody>'+tableRows+'</tbody></table></div>'+
    '<p id="mycNoMatches" class="wt-myc-empty" hidden>No courses match your search or selected status.</p></section>';
  const search=document.getElementById("mycSearch");
  const filter=document.getElementById("mycStatus");
  const applyFilter=()=>{
    const q=search.value.trim().toLowerCase(),s=filter.value;
    let visible=0;
    content.querySelectorAll(".wt-myc-row").forEach(el=>{
      const show=(s==="all"||el.dataset.status===s)&&(!q||el.dataset.search.includes(q));
      el.hidden=!show;
      if(show)visible++;
    });
    document.getElementById("mycNoMatches").hidden=visible!==0;
  };
  search.addEventListener("input",applyFilter);
  filter.addEventListener("change",applyFilter);
  content.querySelector(".wt-myc-heading-link")?.addEventListener("click",()=>{
    filter.value="In Progress";applyFilter();
  });
}

  async function init(){
    renderShell();
    bindShell();
    startClock();

    const {data, error} = await db.auth.getSession();
    if (error) throw error;
    const session = data?.session;
    if (!session?.user?.id){
      window.location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-my-courses.html");
      return;
    }

    try{
      await loadData(session.user.id);
    }catch(error){
      console.error("[LMS My Courses]", error);
      throw error;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
