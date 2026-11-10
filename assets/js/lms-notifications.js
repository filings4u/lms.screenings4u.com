(() => {
  "use strict";

  console.info("[LMS Notifications] build 20261110-lms-messages-only");

  const SUPABASE_URL = "https://elpbnytpciqnbexiaebp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGJueXRwY2lxbmJleGlhZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTYwMzQsImV4cCI6MjEwNTg3MjAzNH0.kWzPDxpdeorkJJpP6pvt4LCP-W9uGGVAgcQVVheVuE8";

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.sessionStorage,storageKey:"s4u-training-auth-session"}
  });

  const FONT_KEY = "s4u_lms_font_size";
  const FONT_DEFAULT = 14;
  const FONT_MIN = 12;
  const FONT_MAX = 18;
  const ACTIVE_NAV_INDEX = 10;
  const navItems = [
    ["lms-dashboard.html","Dashboard","⌂"],["lms-my-courses.html","My Courses","▶"],["lms-courses.html","Course Library","▦"],["lms-progress.html","Progress","◉"],["lms-certificates.html","Certificates","✓"],["lms-live-training.html","Live Training","●"],["lms-my-appointments.html","Appointments","◷"],["lms-group-seats.html","Group Seats","♙"],["lms-documents.html","Documents","▤"],["lms-orders.html","Orders","≡"],["lms-notifications.html","Notifications","✉"],["lms-account.html","Account","○"],["lms-support.html","Support","?"]
  ];

  let rows = [];
  let readIds = new Set();
  let currentFilter = "all";
  let currentType = "all";
  let currentUser = null;

  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const metric = (label,value,sub) => `<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:""}</article>`;
  const normalizeMetadata = value => { if(!value) return {}; if(typeof value === "object") return value; try{return JSON.parse(value);}catch{return {};} };
  const fmtWhen = value => {
    if(!value) return "";
    const d = new Date(value); if(Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}).format(d);
  };

  function readFontSize(){const n=Number(localStorage.getItem(FONT_KEY));return Number.isFinite(n)?Math.min(FONT_MAX,Math.max(FONT_MIN,n)):FONT_DEFAULT;}
  function applyFontSize(n){const value=Math.min(FONT_MAX,Math.max(FONT_MIN,Number(n)||FONT_DEFAULT));document.documentElement.style.setProperty("--portal-font-root",value+"px");localStorage.setItem(FONT_KEY,String(value));const el=document.getElementById("fontSizeValue");if(el)el.textContent=value===FONT_DEFAULT?"Default":String(value);return value;}
  let portalFontSize = applyFontSize(readFontSize());

  function renderShell(){
    const links = navItems.map(([href,label,icon],index)=>`<a href="${href}"${index===ACTIVE_NAV_INDEX?' class="active" aria-current="page"':""}><span class="ico">${icon}</span><span>${esc(label)}</span></a>`).join("");
    document.getElementById("trainingPortalApp").innerHTML = `
      <div class="app">
        <aside class="side" id="side"><div class="brand"><img src="images/logo2.png" alt="Workforce Training by screenings4u"></div><nav class="nav"><div class="nav-title">Workforce Training by screenings4u</div>${links}</nav><div class="side-foot"><div style="font-size:.5625rem;color:#9fb3c7">Portal</div><div style="font-size:.6875rem;font-weight:800;color:#fff;margin-top:3px">lms.screenings4u.com</div></div></aside>
        <main class="main">
          <header class="top"><div class="top-left"><button class="menu" id="menu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobileNav"><span class="menu-bars" aria-hidden="true"><span></span><span></span><span></span></span></button><div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">Notifications</span></div></div><div class="top-right"><div class="top-utility-group top-time-group"><div class="portal-clock"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div><div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer"><button type="button" id="fontDown">A−</button><button type="button" class="font-reset" id="fontSizeValue">Default</button><button type="button" id="fontUp">A+</button></div></div><div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div></div></header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">Notifications</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content"><section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>Notifications</h1><p>View messages exchanged between you and Workforce Training administrators. Notifications from other portals are not shown.</p></section><section class="section" id="content"></section></div>
        </main>
      </div>`;
  }

  function bindShell(){
    document.getElementById("fontDown")?.addEventListener("click",()=>{portalFontSize=applyFontSize(portalFontSize-1);});
    document.getElementById("fontUp")?.addEventListener("click",()=>{portalFontSize=applyFontSize(portalFontSize+1);});
    document.getElementById("fontSizeValue")?.addEventListener("click",()=>{portalFontSize=applyFontSize(FONT_DEFAULT);});
    const menu=document.getElementById("menu"),mobile=document.getElementById("mobileNav");
    menu?.addEventListener("click",()=>{const open=!mobile.classList.contains("open");mobile.classList.toggle("open",open);document.body.classList.toggle("mobile-nav-open",open);menu.setAttribute("aria-expanded",String(open));mobile.setAttribute("aria-hidden",String(!open));});
    mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.classList.remove("open");document.body.classList.remove("mobile-nav-open");menu?.setAttribute("aria-expanded","false");mobile.setAttribute("aria-hidden","true");}));
    document.getElementById("logout")?.addEventListener("click",async()=>{await db.auth.signOut();window.location.replace("https://lms.screenings4u.com/training-login.html");});
  }

  function startClock(){const update=()=>{const now=new Date();const d=document.getElementById("portalClockDate"),t=document.getElementById("portalClockTime");if(d)d.textContent=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}).format(now);if(t)t.textContent=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true}).format(now);};update();window.__s4uLmsNotificationsClock=setInterval(update,1000);}


  // Scope this page to the LMS support service, not the global notifications table.
  // The service resolves the authenticated learner's own tickets and chat threads.
  let messages=[];
  let conversations=[];
  let currentSender="all";
  let currentKind="all";

  function isCustomer(message){
    return String(message.sender_type||"").toLowerCase()==="customer" ||
      (Boolean(message.sender_user_id) && String(message.sender_user_id)===String(currentUser?.id));
  }
  function senderType(message){
    return isCustomer(message)?"customer":"admin";
  }
  function isPublicExchange(message){
    const sender=String(message.sender_type||"").toLowerCase();
    return Boolean(String(message.body||"").trim()) &&
      message.is_internal_note!==true &&
      (isCustomer(message)||["admin","staff","agent","support","administrator","platform"].includes(sender));
  }
  function conversationFrom(record,kind){
    return {
      kind,
      id:String(record.id||""),
      subject:String(record.subject||"Training Support"),
      status:String(record.status||"open"),
      ticketNumber:String(record.ticket_number||""),
      updated:record.last_message_at||record.updated_at||record.created_at,
      messages:Array.isArray(record.messages)?record.messages:[]
    };
  }
  async function loadData(){
    const {data,error}=await db.functions.invoke("training-support-actions",{body:{action:"list"}});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    const tickets=Array.isArray(data?.tickets)?data.tickets:[];
    const threads=Array.isArray(data?.threads)?data.threads:[];
    conversations=[
      ...tickets.map(record=>conversationFrom(record,"ticket")),
      ...threads.map(record=>conversationFrom(record,"chat"))
    ];
    messages=conversations.flatMap(thread=>thread.messages.filter(isPublicExchange).map(message=>({
      id:String(message.id||""),
      threadId:thread.id,
      kind:thread.kind,
      subject:thread.subject,
      number:thread.ticketNumber,
      status:thread.status,
      sender:senderType(message),
      body:String(message.body||""),
      at:message.created_at||thread.updated
    }))).sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));
    render();
  }
  function visibleRows(){
    return messages.filter(row=>
      (currentSender==="all"||row.sender===currentSender)&&
      (currentKind==="all"||row.kind===currentKind)
    );
  }
  function render(){
    const learner=messages.filter(row=>row.sender==="customer").length;
    const admin=messages.filter(row=>row.sender==="admin").length;
    const activeThreads=new Set(messages.map(row=>row.kind+":"+row.threadId)).size;
    const latest=messages[0]?.at?fmtWhen(messages[0].at):"";
    const visible=visibleRows();
    const cards=visible.map(row=>{
      const fromAdmin=row.sender==="admin";
      const heading=fromAdmin?"Training Administrator":"You";
      const href="lms-support.html?ticket="+encodeURIComponent(row.threadId);
      return '<article class="wt-notify-message '+(fromAdmin?"admin":"customer")+'">'+
        '<span class="wt-notify-avatar" aria-hidden="true">'+(fromAdmin?"✉":"◉")+'</span>'+
        '<div class="wt-notify-message-main"><div class="wt-notify-message-head"><div><span class="wt-notify-sender">'+heading+'</span>'+
        '<h3>'+esc(row.subject)+'</h3></div><time>'+esc(fmtWhen(row.at))+'</time></div>'+
        '<p>'+esc(row.body)+'</p><div class="wt-notify-message-meta"><span class="wt-notify-kind">'+(row.kind==="ticket"?"Support Ticket":"Training Message")+'</span>'+
        (row.number?'<span>'+esc(row.number)+'</span>':"")+'</div></div>'+
        '<a class="wt-notify-view" href="'+esc(href)+'">View Conversation →</a></article>';
    }).join("");
    document.getElementById("content").innerHTML=
      '<section class="wt-notify-metrics">'+[
        ["Conversations",activeThreads,"Support threads","▤"],
        ["Administrator Replies",admin,"Messages from training staff","✉"],
        ["Your Messages",learner,"Messages you sent","◉"],
        ["Latest Message",latest||"—","Most recent exchange","◷"]
      ].map(([name,value,sub,icon])=>'<article class="wt-notify-metric"><span class="wt-notify-metric-icon" aria-hidden="true">'+icon+'</span><div><small>'+esc(name)+'</small><strong>'+esc(value)+'</strong><span>'+esc(sub)+'</span></div></article>').join("")+'</section>'+
      '<section class="wt-notify-panel"><div class="wt-notify-panel-head"><div><h2>Training Messages</h2>'+
      '<p>Messages exchanged between you and the Workforce Training support team.</p></div>'+
      '<a class="wt-notify-primary" href="lms-support.html">Send a Message →</a></div>'+
      '<div class="wt-notify-toolbar"><div class="wt-notify-filters" role="group" aria-label="Filter by sender">'+
      ['all','admin','customer'].map(v=>'<button type="button" data-sender="'+v+'" aria-pressed="'+(currentSender===v)+'" class="'+(currentSender===v?"active":"")+'">'+({all:"All Messages",admin:"From Admin",customer:"From Me"}[v])+'</button>').join("")+
      '</div><div class="wt-notify-toolbar-right"><label><span class="sr-only">Conversation type</span><select id="wtNotifyKind"><option value="all">All Conversations</option><option value="ticket">Support Tickets</option><option value="chat">Messages</option></select></label>'+
      '<button type="button" class="wt-notify-refresh" id="refreshNotifications">Refresh</button></div></div>'+
      '<div class="wt-notify-count" aria-live="polite">Showing '+visible.length+' of '+messages.length+' training messages</div>'+
      (cards?'<div class="wt-notify-messages">'+cards+'</div>':
        '<div class="wt-notify-empty"><span class="wt-notify-empty-icon" aria-hidden="true">✉</span><h3>No training messages yet</h3>'+
        '<p>Only conversations between you and the Workforce Training team appear here. Work orders and notifications from other portals are excluded.</p>'+
        '<a class="wt-notify-primary" href="lms-support.html">Contact Training Support →</a></div>')+
      '</section>';
    const select=document.getElementById("wtNotifyKind");
    if(select)select.value=currentKind;
    document.querySelectorAll("[data-sender]").forEach(btn=>btn.addEventListener("click",()=>{currentSender=btn.dataset.sender;render()}));
    select?.addEventListener("change",e=>{currentKind=e.target.value;render()});
    document.getElementById("refreshNotifications")?.addEventListener("click",()=>loadData().catch(showError));
  }
  function showError(error){
    console.error("[LMS Training Messages]",error);
    const content=document.getElementById("content");
    if(content)content.innerHTML='<div class="notification-error">'+esc(error?.message||"Unable to load training messages.")+'</div>';
  }

  async function init(){
    renderShell(); bindShell(); startClock();
    const {data,error}=await db.auth.getSession(); if(error)throw error;
    const session=data?.session; if(!session?.user?.id){window.location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-notifications.html");return;}
    currentUser=session.user;
    try{await loadData();}catch(error){showError(error);}
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
