(() => {
  "use strict";

  console.info("[LMS Notifications] build 20261112-inbox-redesign");

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

  function readFontSize(){const stored = localStorage.getItem(FONT_KEY); const n = stored === null ? FONT_DEFAULT : Number(stored);return Number.isFinite(n)?Math.min(FONT_MAX,Math.max(FONT_MIN,n)):FONT_DEFAULT;}
  function applyFontSize(n){const value=Math.min(FONT_MAX,Math.max(FONT_MIN,Number(n)||FONT_DEFAULT));document.documentElement.style.setProperty("--portal-font-root",value+"px"); document.documentElement.style.setProperty("--lms-text-scale", String(value / FONT_DEFAULT));localStorage.setItem(FONT_KEY,String(value));const el=document.getElementById("fontSizeValue");if(el)el.textContent=value===FONT_DEFAULT?"Default":String(value);return value;}
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
    // One entry per conversation, rather than one large repeating card per message.
    // All messages remain accessible via the existing Support conversation route.
    const learner=messages.filter(row=>row.sender==="customer").length;
    const admin=messages.filter(row=>row.sender==="admin").length;
    const activeThreads=new Set(messages.map(row=>row.kind+":"+row.threadId)).size;
    const latest=messages[0]?.at?fmtWhen(messages[0].at):"—";
    const filtered=visibleRows();
    const byThread=new Map();
    for(const row of filtered){
      const key=row.kind+":"+row.threadId;
      if(!byThread.has(key))byThread.set(key,{...row,count:0,adminCount:0});
      const item=byThread.get(key);
      item.count++;
      if(row.sender==="admin")item.adminCount++;
    }
    const threads=Array.from(byThread.values()).sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));
    const summary=[
      ["Conversations",activeThreads,"Training conversations","messages-square"],
      ["From Training Staff",admin,"Staff responses","mail"],
      ["Sent by You",learner,"Your messages","send"],
      ["Latest Activity",latest,"Last message","clock"]
    ];
    const items=threads.map(row=>{
      const fromAdmin=row.sender==="admin";
      const href="lms-support.html?ticket="+encodeURIComponent(row.threadId);
      return '<article class="wt-notify-thread '+(fromAdmin?"admin":"customer")+'">'+
        '<div class="wt-notify-thread-icon" aria-hidden="true">'+(fromAdmin?"✉":"✎")+'</div>'+
        '<div class="wt-notify-thread-main">'+
          '<div class="wt-notify-thread-eyebrow"><span>'+(fromAdmin?"Training Team":"You")+'</span><span class="wt-notify-thread-dot" aria-hidden="true">·</span><span>'+(row.kind==="ticket"?"Support Conversation":"Training Message")+'</span></div>'+
          '<h3><a href="'+esc(href)+'">'+esc(row.subject)+'</a></h3>'+
          '<p>'+esc(row.body)+'</p>'+
          '<div class="wt-notify-thread-meta"><time>'+esc(fmtWhen(row.at))+'</time>'+
             (row.number?'<span class="wt-notify-reference">'+esc(row.number)+'</span>':"")+
             '<span>'+itemCount(row.count)+' in this conversation</span></div>'+
        '</div>'+
        '<a class="wt-notify-thread-open" href="'+esc(href)+'" aria-label="Open '+esc(row.subject)+' conversation">Open Conversation <span aria-hidden="true">›</span></a>'+
      '</article>';
    }).join("");
    document.getElementById("content").innerHTML=
      '<section class="wt-notify-overview" aria-label="Training message summary">'+summary.map(([name,value,sub,icon])=>
        '<article class="wt-notify-stat"><span class="wt-notify-stat-icon" aria-hidden="true">'+({ "messages-square":"▤",mail:"✉",send:"↗",clock:"◷"}[icon])+'</span><div><small>'+esc(name)+'</small><strong>'+esc(value)+'</strong><span>'+esc(sub)+'</span></div></article>'
      ).join("")+'</section>'+
      '<section class="wt-notify-inbox">'+
        '<div class="wt-notify-inbox-head"><div><span class="wt-notify-section-kicker">WORKFORCE TRAINING</span><h2>Message Center</h2><p>All conversations between you and the training support team.</p></div>'+
        '<a class="wt-notify-compose" href="lms-support.html">Send a Message <span aria-hidden="true">＋</span></a></div>'+
        '<div class="wt-notify-controls">'+
          '<div class="wt-notify-segments" role="group" aria-label="Filter messages by sender">'+
          ['all','admin','customer'].map(v=>'<button type="button" data-sender="'+v+'" aria-pressed="'+(currentSender===v)+'" class="'+(currentSender===v?"active":"")+'">'+({all:"All Messages",admin:"From Training Staff",customer:"Sent by Me"}[v])+'</button>').join("")+
          '</div><div class="wt-notify-control-end"><label class="wt-notify-search-label" for="wtNotifySearch">Search conversations</label><input id="wtNotifySearch" type="search" placeholder="Search messages" autocomplete="off"><label class="sr-only" for="wtNotifyKind">Conversation type</label><select id="wtNotifyKind"><option value="all">All Types</option><option value="ticket">Support Tickets</option><option value="chat">Training Messages</option></select><button type="button" id="refreshNotifications" class="wt-notify-refresh" aria-label="Refresh messages">Refresh</button></div></div>'+
        '<div class="wt-notify-results" aria-live="polite">'+threads.length+' conversation'+(threads.length===1?"":"s")+'</div>'+
        (items?'<div class="wt-notify-thread-list" id="wtNotifyThreadList">'+items+'</div>':
          '<div class="wt-notify-empty"><span class="wt-notify-empty-icon">✉</span><h3>No conversations found</h3><p>Messages from Workforce Training will appear here. Change your filters or contact the training team.</p><a class="wt-notify-compose" href="lms-support.html">Contact Training Support</a></div>')+
      '</section>';
    const select=document.getElementById("wtNotifyKind");
    if(select)select.value=currentKind;
    document.querySelectorAll("[data-sender]").forEach(btn=>btn.addEventListener("click",()=>{currentSender=btn.dataset.sender;render()}));
    select?.addEventListener("change",event=>{currentKind=event.target.value;render()});
    document.getElementById("refreshNotifications")?.addEventListener("click",()=>loadData().catch(showError));
    const input=document.getElementById("wtNotifySearch");
    input?.addEventListener("input",()=>{
      const q=input.value.trim().toLowerCase();
      let count=0;
      document.querySelectorAll(".wt-notify-thread").forEach(node=>{
        const match=!q||node.textContent.toLowerCase().includes(q);
        node.hidden=!match;if(match)count++;
      });
      const result=document.querySelector(".wt-notify-results");
      if(result)result.textContent=count+" conversation"+(count===1?"":"s");
    });
  }
  function itemCount(count){return count+" message"+(count===1?"":"s")}
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
