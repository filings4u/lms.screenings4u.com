(() => {
  "use strict";

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
    ["lms-support.html", "Support", "? "]
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
  const statusClass = value => /complete|completed|issued|active/i.test(String(value || "")) ? "good" : /expired|cancel/i.test(String(value || "")) ? "bad" : "warn";
  const badge = value => `<span class="badge ${statusClass(value)}">${esc(value)}</span>`;
  const metric = (label, value, sub) => `<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</article>`;

  function readFontSize(){
    const n = Number(localStorage.getItem(FONT_KEY));
    return Number.isFinite(n) ? Math.min(FONT_MAX, Math.max(FONT_MIN, n)) : FONT_DEFAULT;
  }
  function applyFontSize(n){
    const value = Math.min(FONT_MAX, Math.max(FONT_MIN, Number(n) || FONT_DEFAULT));
    document.documentElement.style.setProperty("--portal-font-root", value + "px");
    localStorage.setItem(FONT_KEY, String(value));
    const el = document.getElementById("fontSizeValue");
    if (el) el.textContent = value === FONT_DEFAULT ? "Default" : String(value);
    return value;
  }
  let portalFontSize = applyFontSize(readFontSize());

  function renderShell(){
    const links = navItems.map(([href,label,icon], index) => `<a href="${href}"${index === 0 ? ' class="active" aria-current="page"' : ""}><span class="ico">${icon}</span><span>${esc(label)}</span></a>`).join("");
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
              <div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">Dashboard</span></div>
            </div>
            <div class="top-right">
              <div class="top-utility-group top-time-group"><div class="portal-clock" aria-label="Current date and time"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div>
              <div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer" role="group" aria-label="Page font size"><button type="button" id="fontDown" aria-label="Decrease font size">A−</button><button type="button" class="font-reset" id="fontSizeValue" aria-label="Reset font size">Default</button><button type="button" id="fontUp" aria-label="Increase font size">A+</button></div></div>
              <div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div>
            </div>
          </header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true" aria-label="Portal navigation"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">Dashboard</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content">
            <section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>Dashboard</h1><p>Snapshot of your assigned training, course progress, certificates, and recent learning activity.</p></section>
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
    window.__s4uLmsClock = setInterval(update, 1000);
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

  async function loadDashboard(userId){
    const {data: enrollments, error: enrollmentError} = await db
      .from("lms_enrollments")
      .select("id,course_id,status,progress_percent,enrolled_at,started_at,completed_at,last_activity_at,expires_at,course:lms_courses(id,slug,title,short_description,status,certificate_enabled)")
      .eq("user_id", userId)
      .in("status", ["active", "completed", "expired"])
      .order("last_activity_at", {ascending:false, nullsFirst:false});
    if (enrollmentError) throw enrollmentError;

    const rows = (enrollments || []).filter(r => r.course?.id && r.course?.title);
    const ids = rows.map(r => r.id);
    let certificates = [];
    let lessonProgress = [];
    if (ids.length){
      const [certResult, progressResult] = await Promise.all([
        db.from("lms_certificates").select("id,enrollment_id,status,issued_at").in("enrollment_id", ids).eq("status", "issued"),
        db.from("lms_lesson_progress").select("id,enrollment_id,lesson_id,progress_percent,started_at,completed_at,last_activity_at,lesson:lms_lessons(id,title)").in("enrollment_id", ids).order("last_activity_at", {ascending:false, nullsFirst:false}).limit(50)
      ]);
      if (certResult.error) throw certResult.error;
      if (progressResult.error) throw progressResult.error;
      certificates = certResult.data || [];
      lessonProgress = progressResult.data || [];
    }

    renderDashboard(rows, certificates, lessonProgress);
  }

  function renderDashboard(rows, certificates, lessonProgress){
    const now=Date.now();
    const expired=rows.filter(r=>r.status==="expired"||(r.expires_at&&new Date(r.expires_at).getTime()<=now));
    const completed=rows.filter(r=>!expired.includes(r)&&(r.status==="completed"||pct(r.progress_percent)>=100));
    const active=rows.filter(r=>!expired.includes(r)&&!completed.includes(r));
    const inProgress=active.filter(r=>pct(r.progress_percent)>0);
    const notStarted=active.filter(r=>pct(r.progress_percent)===0);
    const overall=rows.length?Math.round(rows.reduce((total,r)=>total+pct(r.progress_percent),0)/rows.length):0;
    const metrics=[
      ["Enrolled Courses",rows.length,"Your assigned training"],
      ["In Progress",inProgress.length,"Courses underway"],
      ["Completed",completed.length,"Finished courses"],
      ["Certificates",certificates.length,"Issued documents"]
    ];
    const images={
      "dot-specimen-collector-training":"images/collector-hero.png",
      "der-training":"images/der-hero.png",
      "supervisor-training":"images/supervisor-hero.png",
      "employee-training":"images/employee-hero.png",
      "hazmat-training":"images/hazmat-hero.png"
    };
    const imageFor=r=>{
      const slug=String(r.course?.slug||"").toLowerCase();
      if(images[slug])return images[slug];
      if(slug.includes("collector"))return images["dot-specimen-collector-training"];
      if(slug.includes("der-"))return images["der-training"];
      if(slug.includes("supervisor"))return images["supervisor-training"];
      if(slug.includes("employee"))return images["employee-training"];
      if(slug.includes("hazmat"))return images["hazmat-training"];
      return "images/group-hero.png";
    };
    const courseTiles=[...rows]
      .sort((a,b)=>{
        const score=r=>expired.includes(r)?3:completed.includes(r)?2:pct(r.progress_percent)>0?0:1;
        return score(a)-score(b);
      }).slice(0,6).map(r=>{
        const n=pct(r.progress_percent);
        const isExpired=expired.includes(r);
        const isCompleted=completed.includes(r);
        const label=isExpired?"Access Expired":isCompleted?"Completed":n>0?"In Progress":"Not Started";
        const params=new URLSearchParams({product:"training-course-extension-30-days",course:r.course.id,enrollment:r.id});
        const url=isExpired?"lms-checkout.html?"+params.toString():
          isCompleted?"lms-certificates.html":
          "lms-course-player.html?course="+encodeURIComponent(r.course.id)+"&enrollment="+encodeURIComponent(r.id);
        const action=isExpired?"Extend Access":isCompleted?"View Certificates":n>0?"Continue Course":"Start Course";
        return '<article class="wt-course-tile'+(isCompleted?' is-complete':'')+'">'+
          '<img class="wt-course-image" src="'+imageFor(r)+'" loading="lazy" alt="">'+
          '<div class="wt-course-body"><h3 class="wt-course-title">'+esc(r.course.title)+'</h3>'+
          '<div class="wt-course-status"><span>'+esc(label)+'</span><strong>'+n+'%</strong></div>'+
          '<div class="wt-progress-track" role="progressbar" aria-label="'+esc(r.course.title)+' progress" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+n+'%"></span></div>'+
          (r.expires_at?'<small style="font-size:11px;color:#63768a">Access until '+esc(fmtDate(r.expires_at))+'</small>':'')+
          '<a class="wt-course-action" href="'+url+'">'+action+' →</a></div></article>';
      }).join("");
    const recent=lessonProgress.filter(r=>r.lesson?.title).slice(0,5).map(r=>{
      const status=r.completed_at?"Completed":pct(r.progress_percent)+"% progress";
      return '<div class="activity-row"><div><strong>'+esc(r.lesson.title)+'</strong><small>'+esc(status)+(r.last_activity_at?' · '+esc(fmtDate(r.last_activity_at)):'')+'</small></div></div>';
    }).join("");
    const hero=document.querySelector(".app .hero");
    if(hero){
      hero.innerHTML='<span class="hero-kicker">LEARN · TRAIN · ACHIEVE</span>'+
        '<h1>Welcome back to Workforce Training.</h1>'+
        '<p>Continue your courses, review your progress, and access your training certificates in one place.</p>'+
        '<div class="wt-command-hero-actions"><a href="lms-my-courses.html">Continue Training →</a><a href="lms-courses.html">Browse Courses</a></div>';
    }
    document.getElementById("content").classList.add("wt-command");
    document.getElementById("content").innerHTML=
      '<section class="wt-command-metrics">'+metrics.map(x=>metric(...x)).join("")+'</section>'+
      '<div class="wt-command-columns"><div class="wt-command-left">'+
      '<section class="panel"><div class="panel-head"><div><h2>My Courses</h2><p>Pick up where you left off and track completed training.</p></div><a class="snapshot-link" href="lms-my-courses.html">View All Courses →</a></div>'+
      (courseTiles?'<div class="wt-course-cards">'+courseTiles+'</div>':'<p class="wt-empty">No courses are assigned to your account yet. Browse the available training catalog or contact support for enrollment assistance.</p>')+'</section>'+
      '<section class="panel"><div class="panel-head"><div><h2>Recent Learning Activity</h2><p>Lessons recorded by your training account.</p></div><a class="snapshot-link" href="lms-progress.html">View Progress →</a></div>'+
      (recent?'<div class="activity-list">'+recent+'</div>':'<p class="wt-empty">Learning activity appears here when you begin a course.</p>')+'</section>'+
      '</div><aside class="wt-command-right">'+
      '<section class="panel"><div class="panel-head"><h2>Learning Progress</h2></div>'+
      '<div class="wt-progress-overview"><div class="wt-progress-ring" style="--percent:'+overall+'"><span>'+overall+'%</span></div>'+
      '<div class="wt-progress-breakdown"><span>Completed <b>'+completed.length+'</b></span><span>In progress <b>'+inProgress.length+'</b></span><span>Not started <b>'+notStarted.length+'</b></span><span>Expired <b>'+expired.length+'</b></span></div></div>'+
      '<a class="snapshot-link" href="lms-progress.html" style="display:block;text-align:center;margin-top:20px">View Detailed Progress →</a></section>'+
      '<section class="panel"><div class="panel-head"><h2>Quick Actions</h2></div><div class="wt-quick-grid">'+
      '<a href="lms-courses.html"><span aria-hidden="true">▦</span>Browse Courses</a>'+
      '<a href="lms-certificates.html"><span aria-hidden="true">✧</span>My Certificates</a>'+
      '<a href="lms-orders.html"><span aria-hidden="true">▤</span>Orders &amp; Receipts</a>'+
      '<a href="lms-support.html"><span aria-hidden="true">?</span>Get Support</a>'+
      '</div></section>'+
      '<section class="panel"><div class="panel-head"><h2>More Training Tools</h2></div><div class="snapshot-attention">'+
      '<a class="attention-row" href="lms-group-seats.html"><div><strong>Group Seats</strong><span>Manage eligible training assignments</span></div><span>→</span></a>'+
      '<a class="attention-row" href="lms-my-appointments.html"><div><strong>Appointments</strong><span>View your upcoming scheduled sessions</span></div><span>→</span></a>'+
      '<a class="attention-row" href="lms-documents.html"><div><strong>Documents</strong><span>Access training materials</span></div><span>→</span></a>'+
      '</div></section></aside></div>';
  }

  async function init(){
    renderShell();
    bindShell();
    startClock();
    const {data, error} = await db.auth.getSession();
    if (error) throw error;
    const session = data?.session;
    if (!session?.user?.id){
      window.location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-dashboard.html");
      return;
    }
    try{
      await loadDashboard(session.user.id);
    }catch(error){
      console.error("[LMS Dashboard]", error);
      throw error;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
