(() => {
  "use strict";
  console.info("[LMS Documents] build 20261110-redesign");

  const SUPABASE_URL="https://elpbnytpciqnbexiaebp.supabase.co";
  const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGJueXRwY2lxbmJleGlhZWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTYwMzQsImV4cCI6MjEwNTg3MjAzNH0.kWzPDxpdeorkJJpP6pvt4LCP-W9uGGVAgcQVVheVuE8";
  const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.sessionStorage,storageKey:"s4u-training-auth-session"}});
  const FONT_KEY="s4u_lms_font_size",FONT_DEFAULT=14,FONT_MIN=12,FONT_MAX=18;
  const navItems=[["lms-dashboard.html","Dashboard","⌂"],["lms-my-courses.html","My Courses","▶"],["lms-courses.html","Course Library","▦"],["lms-progress.html","Progress","◉"],["lms-certificates.html","Certificates","✓"],["lms-live-training.html","Live Training","●"],["lms-my-appointments.html","Appointments","◷"],["lms-group-seats.html","Group Seats","♙"],["lms-documents.html","Documents","▤"],["lms-orders.html","Orders","≡"],["lms-notifications.html","Notifications","✉"],["lms-account.html","Account","○"],["lms-support.html","Support","?"]];
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmtDate=v=>{if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?"":new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(d)};
  const fmtBytes=n=>{n=Number(n||0);if(!n)return"";if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`};
  const metric=(label,value,sub)=>`<article class="metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:""}</article>`;
  let docs=[],enrollments=[],files=[];

  function readFontSize(){const stored = localStorage.getItem(FONT_KEY); const n = stored === null ? FONT_DEFAULT : Number(stored);return Number.isFinite(n)?Math.min(FONT_MAX,Math.max(FONT_MIN,n)):FONT_DEFAULT}
  function applyFontSize(n){const value=Math.min(FONT_MAX,Math.max(FONT_MIN,Number(n)||FONT_DEFAULT));document.documentElement.style.setProperty("--portal-font-root",value+"px"); document.documentElement.style.setProperty("--lms-text-scale", String(value / FONT_DEFAULT));localStorage.setItem(FONT_KEY,String(value));const el=document.getElementById("fontSizeValue");if(el)el.textContent=value===FONT_DEFAULT?"Default":String(value);return value}
  let portalFontSize=applyFontSize(readFontSize());

  function renderShell(){
    const links = navItems.map(([href,label,icon]) => `<a href="${href}"${href === "lms-documents.html" ? ' class="active" aria-current="page"' : ""}><span class="ico">${icon}</span><span>${esc(label)}</span></a>`).join("");
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
              <div class="top-context"><span class="top-eyebrow">Workforce Training by screenings4u</span><span class="crumb">Documents</span></div>
            </div>
            <div class="top-right">
              <div class="top-utility-group top-time-group"><div class="portal-clock" aria-label="Current date and time"><span id="portalClockDate" class="portal-clock-date"></span><strong id="portalClockTime" class="portal-clock-time"></strong></div></div>
              <div class="top-utility-group top-accessibility-group"><span class="top-utility-label">Text size</span><div class="font-sizer" role="group" aria-label="Page font size"><button type="button" id="fontDown" aria-label="Decrease font size">A−</button><button type="button" class="font-reset" id="fontSizeValue" aria-label="Reset font size">Default</button><button type="button" id="fontUp" aria-label="Increase font size">A+</button></div></div>
              <div class="top-utility-group top-action-group"><span class="pill">LEARNER</span><a class="top-support" href="lms-support.html">Support</a><button class="signout" id="logout" type="button">Sign out</button></div>
            </div>
          </header>
          <section class="mobile-nav" id="mobileNav" aria-hidden="true" aria-label="Portal navigation"><div class="mobile-nav-inner"><div class="mobile-nav-head"><div><span>Portal navigation</span><strong>Workforce Training by screenings4u</strong></div><span class="mobile-nav-current">Documents</span></div><nav class="mobile-nav-links">${links}</nav><div class="mobile-nav-foot"><span>lms.screenings4u.com</span><small>Select a page to close this menu.</small></div></div></section>
          <div class="content">
            <section class="hero"><span class="hero-kicker">Workforce Training by screenings4u</span><h1>Documents</h1><p>View training records, review document status, and upload required course documentation.</p></section>
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
    window.__s4uLmsDocumentsClock = setInterval(update, 1000);
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

  async function call(body){const {data,error}=await db.functions.invoke("lms-learner-documents",{body});if(error)throw error;if(data?.error)throw new Error(data.error);return data||{}}
  function docTitle(row){return row?.documents?.title||""}
  function docType(row){if(row.category==="mock_training")return"Mock Training";if(row.category==="onboarding_acknowledgment")return"Acknowledgment";return row.category?String(row.category).replace(/_/g," "):""}
  function renderSelected(){const el=document.getElementById("selectedFiles");if(!el)return;el.innerHTML=files.map(f=>`<div class="selected-file"><strong>${esc(f.name)}</strong><span>${esc(fmtBytes(f.size))}</span></div>`).join("")}
  function setMessage(text,bad=false){const el=document.getElementById("documentsMessage");if(!el)return;el.textContent=text;el.className=`documents-message ${bad?"bad":"good"}`;window.setTimeout(()=>{el.className="documents-message";el.textContent=""},6000)}
  function render(){
    const issued=docs.filter(d=>d.status==="accepted"||d.status==="approved").length;
    const submitted=docs.filter(d=>d.status==="submitted"||d.status==="pending").length;
    const mock=docs.filter(d=>d.category==="mock_training").length;
    const rows=docs.map(d=>`<tr><td><span class="doc-title">${esc(docTitle(d))}</span>${d.documents?.description?`<span class="doc-sub">${esc(d.documents.description)}</span>`:""}</td><td>${esc(docType(d))}</td><td><span class="badge ${d.status==="accepted"||d.status==="approved"?"good":d.status==="submitted"||d.status==="pending"?"warn":d.status==="rejected"?"bad":""}">${esc(d.status||"")}</span></td><td>${esc(fmtDate(d.created_at||d.updated_at))}</td><td><button class="doc-action" type="button" data-open="${esc(d.id)}">View</button></td></tr>`).join("");
    const options=enrollments.map(e=>`<option value="${esc(e.id)}">${esc(e.lms_courses?.title||"")}</option>`).join("");
    document.getElementById("content").innerHTML=`<div id="documentsMessage" class="documents-message"></div><div class="metrics">${metric("Documents",docs.length,"Available records")}${metric("Approved",issued,"Accepted or approved")}${metric("Under Review",submitted,"Submitted records")}${metric("Mock Training",mock,"Learner submissions")}</div><div class="section documents-grid"><div class="panel"><div class="panel-head"><div><h2>Your Documents</h2><p>Files currently attached to your Workforce Training account.</p></div><div class="document-toolbar"><input id="documentSearch" type="search" placeholder="Search documents"><select id="documentFilter"><option value="all">All types</option><option value="mock_training">Mock Training</option><option value="onboarding_acknowledgment">Acknowledgments</option></select></div></div><div class="table-wrap"><table><thead><tr><th>Document</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody id="documentsBody">${rows}</tbody></table></div>${docs.length?"":'<div class="empty">No documents are attached to this account.</div>'}</div><div class="panel"><div class="panel-head"><div><h2>Submit Training Documents</h2><p>Upload required mock-training documentation for an enrolled course.</p></div></div><div class="upload-panel"><form id="uploadForm" class="upload-form"><div class="field"><label for="enrollmentSelect">Training course</label><select id="enrollmentSelect" required><option value=""></option>${options}</select></div><div><div class="dropzone" id="dropzone" tabindex="0" role="button"><div><strong>Choose files or drag them here</strong><span>PDF, Word, JPG, PNG, or WebP · up to 25 MB each</span></div></div><input id="fileInput" class="file-input" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"><div id="selectedFiles" class="selected-files"></div></div><button class="btn primary" id="uploadBtn" type="submit">Upload for Review</button><div id="uploadStatus" class="upload-status"></div></form></div></div></div>`;
    bindContent();renderSelected();
  }
  function bindContent(){
    document.querySelectorAll("[data-open]").forEach(btn=>btn.addEventListener("click",openDoc));
    document.getElementById("documentSearch")?.addEventListener("input",filterRows);document.getElementById("documentFilter")?.addEventListener("change",filterRows);
    const dz=document.getElementById("dropzone"),input=document.getElementById("fileInput");
    dz?.addEventListener("click",()=>input?.click());dz?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();input?.click()}});input?.addEventListener("change",()=>{files=[...(input.files||[])];renderSelected()});
    ["dragenter","dragover"].forEach(t=>dz?.addEventListener(t,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(t=>dz?.addEventListener(t,e=>{e.preventDefault();dz.classList.remove("drag")}));dz?.addEventListener("drop",e=>{files=[...(e.dataTransfer?.files||[])];renderSelected()});
    document.getElementById("uploadForm")?.addEventListener("submit",uploadFiles);
  }
  function filterRows(){const q=(document.getElementById("documentSearch")?.value||"").toLowerCase(),type=document.getElementById("documentFilter")?.value||"all";document.querySelectorAll("#documentsBody tr").forEach((tr,i)=>{const row=docs[i];const matchesText=!q||tr.textContent.toLowerCase().includes(q);const matchesType=type==="all"||row?.category===type;tr.hidden=!(matchesText&&matchesType)})}
  async function openDoc(e){const btn=e.currentTarget;btn.disabled=true;try{const data=await call({action:"signed",id:btn.dataset.open});if(data.url)window.open(data.url,"_blank","noopener") }catch(err){setMessage(err?.message||"Unable to open document.",true)}finally{btn.disabled=false}}
  async function uploadFiles(e){e.preventDefault();const enrollmentId=document.getElementById("enrollmentSelect")?.value||"";const status=document.getElementById("uploadStatus"),btn=document.getElementById("uploadBtn");if(!enrollmentId){status.textContent="Select a training course.";status.className="upload-status bad";return}if(!files.length){status.textContent="Choose at least one file.";status.className="upload-status bad";return}btn.disabled=true;status.textContent="Uploading…";status.className="upload-status good";try{for(const file of files){const prep=await call({action:"prepare_mock_upload",enrollmentId,file:{name:file.name,mimeType:file.type,size:file.size}});const up=await db.storage.from(prep.bucket).uploadToSignedUrl(prep.path,prep.token,file,{contentType:file.type});if(up.error)throw up.error;await call({action:"finalize_mock_upload",enrollmentId,path:prep.path,file:{name:file.name,mimeType:file.type,size:file.size}})}files=[];await load();setMessage("Training document upload completed.");}catch(err){status.textContent=err?.message||"Unable to upload document.";status.className="upload-status bad"}finally{btn.disabled=false}}
  async function load(){const [d,e]=await Promise.all([call({action:"list"}),call({action:"enrollments"})]);docs=Array.isArray(d.documents)?d.documents:[];enrollments=Array.isArray(e.enrollments)?e.enrollments:[];render()}
  async function init(){renderShell();bindShell();startClock();const {data,error}=await db.auth.getSession();if(error)throw error;if(!data?.session?.user?.id){location.replace("https://lms.screenings4u.com/training-login.html?returnTo=%2Flms-documents.html");return}try{await load()}catch(err){console.error("[LMS Documents]",err);document.getElementById("content").innerHTML=`<div class="panel"><div class="empty">${esc(err?.message||"Unable to load documents.")}</div></div>`}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
