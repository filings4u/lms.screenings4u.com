(() => {
  "use strict";

  console.info("[LMS Progress] build 20261004-training4");

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
  const ACTIVE_NAV_INDEX = 3;

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
  const metric = (label, value, sub) => `<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</article>`;
  const badge = (label, kind="") => `<span class="badge ${kind}">${esc(label)}</span>`;

  function readFontSize(){
    const stored = localStorage.getItem(FONT_KEY);
    const n = stored === null ? FONT_DEFAULT : Number(stored);
    return Number.isFinite(n) ? Math.min(FONT_MAX, Math.max(FONT_MIN, n)) : FONT_DEFAULT;
  }
  function applyFontSize(n){
    const value = Math.min(FONT_MAX, Math.max(FONT_MIN, Number(n) || FONT_DEFAULT));
    document.documentElement.style.setProperty("--portal-font-root", value + "px");
    document.documentElement.style.setProperty("--lms-text-scale", String(value / FONT_DEFAULT));
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
              <div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">Progress</span></div>
            </div>
            <div class="top-right">
              <div class="top-utility-group top-time-group"><div class="portal-clock" aria-label="Current date and time"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div>
              <div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer" role="group" aria-label="Page font size"><button type="button" id="fontDown" aria-label="Decrease font size">A−</button><button type="button" class="font-reset" id="fontSizeValue" aria-label="Reset font size">Default</button><button type="button" id="fontUp" aria-label="Increase font size">A+</button></div></div>
              <div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div>
            </div>
          </header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true" aria-label="Portal navigation"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">Progress</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content">
            <section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>Progress</h1><p>Review course completion, lesson activity, assessments, and certificate status across your assigned training.</p></section>
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
    window.__s4uLmsProgressClock = setInterval(update, 1000);
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
      .select("id,course_id,status,progress_percent,enrolled_at,started_at,completed_at,last_activity_at,expires_at,course:lms_courses(id,slug,title,certificate_enabled)")
      .eq("user_id", userId)
      .in("status", ["active", "completed", "expired"])
      .order("last_activity_at", {ascending:false, nullsFirst:false});
    if (enrollmentError) throw enrollmentError;

    const rows = (enrollments || []).filter(row => row.course?.id && row.course?.title);
    const enrollmentIds = rows.map(row => row.id);

    let lessons = [];
    let quizzes = [];
    let certificates = [];

    if (enrollmentIds.length){
      const [lessonResult, quizResult, certResult] = await Promise.all([
        db.from("lms_lesson_progress").select("id,enrollment_id,lesson_id,progress_percent,started_at,completed_at,last_activity_at,lesson:lms_lessons(id,title)").in("enrollment_id", enrollmentIds).order("last_activity_at", {ascending:false, nullsFirst:false}),
        db.from("lms_quiz_attempts").select("id,enrollment_id,quiz_id,score,passed,started_at,completed_at").in("enrollment_id", enrollmentIds).order("completed_at", {ascending:false, nullsFirst:false}),
        db.from("lms_certificates").select("id,enrollment_id,status,issued_at").in("enrollment_id", enrollmentIds).order("issued_at", {ascending:false, nullsFirst:false})
      ]);
      if (lessonResult.error) throw lessonResult.error;
      if (quizResult.error) throw quizResult.error;
      if (certResult.error) throw certResult.error;
      lessons = lessonResult.data || [];
      quizzes = quizResult.data || [];
      certificates = (certResult.data || []).filter(row => String(row.status || "").toLowerCase() !== "revoked");
    }

    render(rows, lessons, quizzes, certificates);
  }

  function render(rows, lessons, quizzes, certificates){
    const now=Date.now();
    const expired=rows.filter(row=>row.status==="expired"||(row.expires_at&&new Date(row.expires_at).getTime()<=now));
    const completed=rows.filter(row=>!expired.includes(row)&&(row.status==="completed"||pct(row.progress_percent)>=100));
    const active=rows.filter(row=>!expired.includes(row)&&!completed.includes(row));
    const started=active.filter(row=>pct(row.progress_percent)>0);
    const notStarted=active.filter(row=>pct(row.progress_percent)===0);
    const average=rows.length?Math.round(rows.reduce((sum,row)=>sum+pct(row.progress_percent),0)/rows.length):0;
    const lessonsDone=lessons.filter(row=>row.completed_at||pct(row.progress_percent)>=100).length;
    const assessmentsPassed=quizzes.filter(row=>row.passed===true).length;
    const certsIssued=certificates.filter(row=>String(row.status||"").toLowerCase()==="issued").length;
    const statusOf=row=>expired.includes(row)?"Access Expired":completed.includes(row)?"Completed":pct(row.progress_percent)>0?"In Progress":"Not Started";
    const imageFor=row=>{
      const s=String((row.course?.slug||"")+" "+(row.course?.title||"")).toLowerCase();
      if(s.includes("hazmat")||s.includes("hazard"))return "images/hazmat-hero.png";
      if(s.includes("der")||s.includes("designated"))return "images/der-hero.png";
      if(s.includes("supervisor")||s.includes("suspicion"))return "images/supervisor-hero.png";
      if(s.includes("employee")||s.includes("alcohol"))return "images/employee-hero.png";
      if(s.includes("collector")||s.includes("specimen"))return "images/collector-hero.png";
      return "images/group-hero.png";
    };
    const actionFor=row=>{
      const status=statusOf(row);
      const cert=certificates.find(x=>x.enrollment_id===row.id&&String(x.status||"").toLowerCase()==="issued");
      if(status==="Access Expired")return {href:"lms-checkout.html?"+new URLSearchParams({product:"training-course-extension-30-days",course:row.course.id,enrollment:row.id}),label:"Extend Access · $115"};
      if(cert)return {href:"lms-certificates.html?certificate="+encodeURIComponent(cert.id),label:"Certificate"};
      return {href:"lms-course-player.html?course="+encodeURIComponent(row.course.id)+"&enrollment="+encodeURIComponent(row.id),label:status==="Completed"?"Review":status==="Not Started"?"Start":"Continue"};
    };
    const mainStats=[
      ["Average Progress",average+"%","Across assigned training","◉"],
      ["Active Courses",active.length,"Courses underway","▶"],
      ["Completed Courses",completed.length,"Finished training","✓"],
      ["Total Enrollments",rows.length,"Assigned courses","▦"]
    ];
    const secondaryStats=[
      ["Completed Lessons",lessonsDone],
      ["Passed Assessments",assessmentsPassed],
      ["Certificates",certsIssued],
      ["Not Started",notStarted.length],
      ["Expired Access",expired.length]
    ];
    const activeTiles=[...started].sort((a,b)=>new Date(b.last_activity_at||0)-new Date(a.last_activity_at||0)).slice(0,3).map(row=>{
      const p=pct(row.progress_percent),action=actionFor(row);
      return '<article class="wt-prog-course"><img src="'+imageFor(row)+'" alt="" loading="lazy">'+
        '<div class="wt-prog-course-copy"><h3>'+esc(row.course.title)+'</h3>'+
        '<div class="wt-prog-progress"><span class="wt-prog-track"><span style="width:'+p+'%"></span></span><b>'+p+'%</b></div>'+
        '<div class="wt-prog-course-foot"><small>'+(row.last_activity_at?'Last activity: '+esc(fmtDate(row.last_activity_at)):'Course underway')+'</small>'+
        '<a href="'+esc(action.href)+'" class="wt-prog-button">'+esc(action.label)+' →</a></div></div></article>';
    }).join("");
    const activityEvents=[];
    lessons.filter(row=>row.completed_at&&row.lesson?.title).forEach(row=>activityEvents.push({at:row.completed_at,title:row.lesson.title,type:"Lesson completed",good:true}));
    quizzes.filter(row=>row.completed_at).forEach(row=>activityEvents.push({at:row.completed_at,title:row.passed?"Assessment passed":"Assessment completed",type:Number.isFinite(Number(row.score))?Number(row.score)+"% score":"Assessment",good:row.passed===true}));
    certificates.filter(row=>row.issued_at).forEach(row=>activityEvents.push({at:row.issued_at,title:"Certificate issued",type:"Training certificate",good:true}));
    activityEvents.sort((a,b)=>new Date(b.at)-new Date(a.at));
    const activityHtml=activityEvents.slice(0,8).map(item=>
      '<div class="wt-prog-activity-row"><span class="wt-prog-activity-icon'+(item.good?' good':'')+'">'+(item.good?'✓':'◉')+'</span>'+
      '<div><strong>'+esc(item.title)+'</strong><small>'+esc(item.type)+' · '+esc(fmtDate(item.at))+'</small></div>'+
      '<span class="wt-prog-event-tag'+(item.good?' good':'')+'">'+(item.good?'Complete':'Recorded')+'</span></div>'
    ).join("");
    const courseHtml=[...rows].sort((a,b)=>{
      const w=r=>statusOf(r)==="In Progress"?0:statusOf(r)==="Not Started"?1:statusOf(r)==="Completed"?2:3;
      return w(a)-w(b);
    }).map(row=>{
      const p=pct(row.progress_percent),s=statusOf(row),action=actionFor(row);
      return '<tr><td><div class="wt-prog-table-course"><img src="'+imageFor(row)+'" loading="lazy" alt=""><strong>'+esc(row.course.title)+'</strong></div></td>'+
        '<td><div class="wt-prog-table-progress"><strong>'+p+'%</strong><span class="wt-prog-track"><span style="width:'+p+'%"></span></span></div></td>'+
        '<td><span class="wt-prog-status '+s.toLowerCase().replace(/\s+/g,"-")+'">'+esc(s)+'</span></td>'+
        '<td>'+esc(fmtDate(row.last_activity_at)||"—")+'</td>'+
        '<td><a href="'+esc(action.href)+'" class="wt-prog-table-action">'+esc(action.label)+' →</a></td></tr>';
    }).join("");
    const content=document.getElementById("content");
    content.classList.add("wt-progress");
    content.innerHTML=
      '<section class="wt-prog-stats">'+mainStats.map(([label,value,detail,icon])=>
        '<article class="wt-prog-stat"><span class="wt-prog-stat-icon">'+icon+'</span><div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><span>'+esc(detail)+'</span></div></article>').join("")+'</section>'+
      '<section class="wt-prog-minis">'+secondaryStats.map(([label,value])=>
        '<div class="wt-prog-mini"><b>'+esc(value)+'</b><span>'+esc(label)+'</span></div>').join("")+'</section>'+
      '<section class="wt-prog-panel wt-prog-continue"><div class="wt-prog-heading"><div><h2>Continue Learning</h2><p>Resume your active training where you left off.</p></div><a href="lms-my-courses.html">View My Courses →</a></div>'+
      (activeTiles?'<div class="wt-prog-course-grid">'+activeTiles+'</div>':'<p class="wt-prog-empty">Your in-progress courses will appear here.</p>')+'</section>'+
      '<div class="wt-prog-bottom-grid">'+
      '<section class="wt-prog-panel wt-prog-summary"><div class="wt-prog-heading"><div><h2>Progress Summary</h2><p>Your overall learning progress at a glance.</p></div></div>'+
      '<div class="wt-prog-summary-content"><div class="wt-prog-ring" style="--progress:'+average+'"><div><strong>'+average+'%</strong><span>Average</span></div></div>'+
      '<div class="wt-prog-summary-breakdown"><div><span>Completed</span><b>'+completed.length+'</b></div><div><span>In progress</span><b>'+started.length+'</b></div><div><span>Not started</span><b>'+notStarted.length+'</b></div><div><span>Expired</span><b>'+expired.length+'</b></div></div></div></section>'+
      '<section class="wt-prog-panel wt-prog-records"><div class="wt-prog-heading"><div><h2>Learning Records</h2><p>Access related training documents.</p></div></div>'+
      '<a href="lms-certificates.html"><span>Certificates</span><small>View issued certificates</small><b>→</b></a>'+
      '<a href="lms-my-courses.html"><span>My Courses</span><small>Continue your assigned training</small><b>→</b></a>'+
      '<a href="lms-documents.html"><span>Documents</span><small>Course materials and records</small><b>→</b></a></section></div>'+
      '<section class="wt-prog-panel wt-prog-table-panel"><div class="wt-prog-heading"><div><h2>Course Progress</h2><p>All current and previous enrollments, including expired access.</p></div></div>'+
      (courseHtml?'<div class="wt-prog-table-scroll"><table class="wt-prog-table"><thead><tr><th>Course</th><th>Progress</th><th>Status</th><th>Last Activity</th><th>Action</th></tr></thead><tbody>'+courseHtml+'</tbody></table></div>':'<p class="wt-prog-empty">No assigned training yet.</p>')+'</section>'+
      '<section class="wt-prog-panel wt-prog-activity"><div class="wt-prog-heading"><div><h2>Recent Learning Activity</h2><p>Latest lessons, assessments, and certificate events.</p></div></div>'+
      (activityHtml?'<div class="wt-prog-activity-list">'+activityHtml+'</div>':'<p class="wt-prog-empty">Your learning history will appear here.</p>')+'</section>';
  }

  async function init(){
    renderShell();
    bindShell();
    startClock();

    const {data, error} = await db.auth.getSession();
    if (error) throw error;
    const session = data?.session;
    if (!session?.user?.id){
      window.location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-progress.html");
      return;
    }

    try {
      await loadData(session.user.id);
    } catch (error) {
      console.error("[LMS Progress]", error);
      throw error;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
