(() => {
  "use strict";
  const STORAGE_KEY = "libradesk_descriptive_analytics_v1";
  const colors = ["#6b5ce7", "#20a779", "#e99b42", "#4b8de8", "#df6b9a", "#8c98a9", "#42b7c8"];
  const today = () => new Date().toISOString().slice(0, 10);
  const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
  const initialData = () => ({
    books: [
      {id:1,title:"Atomic Habits",author:"James Clear",isbn:"9780735211292",category:"Self-help",copies:5,borrowCount:8},
      {id:2,title:"The Alchemist",author:"Paulo Coelho",isbn:"9780061122415",category:"Fiction",copies:4,borrowCount:6},
      {id:3,title:"Clean Code",author:"Robert C. Martin",isbn:"9780132350884",category:"Technology",copies:3,borrowCount:5},
      {id:4,title:"Thinking, Fast and Slow",author:"Daniel Kahneman",isbn:"9780374533557",category:"Psychology",copies:3,borrowCount:4},
      {id:5,title:"Data Science for Business",author:"Foster Provost",isbn:"9781449361327",category:"Technology",copies:4,borrowCount:7},
      {id:6,title:"Ikigai",author:"Héctor García",isbn:"9780143130727",category:"Self-help",copies:4,borrowCount:3},
      {id:7,title:"The Great Gatsby",author:"F. Scott Fitzgerald",isbn:"9780743273565",category:"Fiction",copies:2,borrowCount:2},
      {id:8,title:"Introduction to Statistics",author:"Ronald E. Walpole",isbn:"9780135189399",category:"Education",copies:3,borrowCount:1}
    ],
    students: [
      {id:1,name:"Aarav Sharma",studentId:"STU-1001",email:"aarav@example.com"},
      {id:2,name:"Priya Singh",studentId:"STU-1002",email:"priya@example.com"},
      {id:3,name:"Rahul Kumar",studentId:"STU-1003",email:"rahul@example.com"},
      {id:4,name:"Ananya Das",studentId:"STU-1004",email:"ananya@example.com"},
      {id:5,name:"Rohan Verma",studentId:"STU-1005",email:"rohan@example.com"}
    ],
    transactions: [
      {id:1,bookId:1,studentId:1,issueDate:dateOffset(-7),dueDate:dateOffset(7),returnDate:"",status:"Issued"},
      {id:2,bookId:3,studentId:2,issueDate:dateOffset(-5),dueDate:dateOffset(9),returnDate:"",status:"Issued"},
      {id:3,bookId:5,studentId:3,issueDate:dateOffset(-15),dueDate:dateOffset(-1),returnDate:dateOffset(-2),status:"Returned"},
      {id:4,bookId:2,studentId:4,issueDate:dateOffset(-12),dueDate:dateOffset(2),returnDate:"",status:"Issued"},
      {id:5,bookId:5,studentId:1,issueDate:dateOffset(-25),dueDate:dateOffset(-11),returnDate:dateOffset(-10),status:"Returned"},
      {id:6,bookId:4,studentId:5,issueDate:dateOffset(-3),dueDate:dateOffset(11),returnDate:"",status:"Issued"},
      {id:7,bookId:1,studentId:2,issueDate:dateOffset(-35),dueDate:dateOffset(-21),returnDate:dateOffset(-20),status:"Returned"}
    ],
    nextIds:{book:9,student:6,transaction:8}
  });

  let data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData(); }
  catch { data = initialData(); }
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const bookById = id => data.books.find(b => b.id === Number(id));
  const studentById = id => data.students.find(s => s.id === Number(id));
  const activeCount = bookId => data.transactions.filter(t => t.bookId === Number(bookId) && t.status === "Issued").length;
  const availableCount = book => Math.max(0, Number(book.copies) - activeCount(book.id));
  const fmtDate = d => d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); renderAll(); };
  let toastTimer;
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
  function emptyRow(cols, title, message){return `<tr><td colspan="${cols}"><div class="empty-state"><b>${esc(title)}</b>${esc(message)}</div></td></tr>`;}
  function studentIssued(id){return data.transactions.filter(t=>t.studentId===Number(id)&&t.status==="Issued").length;}
  function totalCopies(){return data.books.reduce((sum,b)=>sum+Number(b.copies||0),0);}
  function totalAvailable(){return data.books.reduce((sum,b)=>sum+availableCount(b),0);}
  function totalActive(){return data.transactions.filter(t=>t.status==="Issued").length;}
  function getBookTitle(id){return bookById(id)?.title || "Book removed";}
  function getStudentName(id){return studentById(id)?.name || "Student removed";}

  function drawDonut(canvas, items){
    if(!canvas)return;
    const ctx=canvas.getContext("2d"), ratio=window.devicePixelRatio||1, w=canvas.clientWidth||220, h=canvas.clientHeight||180;
    canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
    const total=items.reduce((s,x)=>s+Math.max(0,x.value),0), cx=w/2,cy=h/2,r=Math.min(w,h)*.38,inner=r*.62;
    if(!total){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="#efeff6";ctx.lineWidth=r-inner;ctx.stroke();ctx.fillStyle="#999bb0";ctx.font="11px DM Sans";ctx.textAlign="center";ctx.fillText("No data yet",cx,cy+4);return;}
    let angle=-Math.PI/2;
    items.forEach((item,i)=>{const val=Math.max(0,item.value);if(!val)return;const next=angle+(val/total)*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,r,angle,next);ctx.arc(cx,cy,inner,next,angle,true);ctx.closePath();ctx.fillStyle=item.color||colors[i%colors.length];ctx.fill();angle=next;});
    ctx.fillStyle="#20223a";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="800 21px Manrope";ctx.fillText(String(total),cx,cy-3);ctx.fillStyle="#999bb0";ctx.font="10px DM Sans";ctx.fillText("total",cx,cy+15);
  }
  function drawBars(canvas, items){
    if(!canvas)return;
    const ctx=canvas.getContext("2d"), ratio=window.devicePixelRatio||1, w=canvas.clientWidth||420,h=canvas.clientHeight||250;
    canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
    const pad={l:34,r:14,t:15,b:43},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    const max=Math.max(1,...items.map(x=>x.value)), ticks=4;
    ctx.font="10px DM Sans";ctx.textAlign="right";ctx.textBaseline="middle";
    for(let i=0;i<=ticks;i++){const y=pad.t+ch-(ch*i/ticks);ctx.strokeStyle="#f0f0f6";ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillStyle="#a0a1b2";ctx.fillText(String(Math.round(max*i/ticks)),pad.l-8,y);}
    if(!items.length){ctx.fillStyle="#999bb0";ctx.textAlign="center";ctx.fillText("No data yet",w/2,h/2);return;}
    const slot=cw/items.length,bw=Math.min(38,slot*.58);
    items.forEach((it,i)=>{const bh=(Math.max(0,it.value)/max)*ch,x=pad.l+i*slot+(slot-bw)/2,y=pad.t+ch-bh;ctx.fillStyle=it.color||colors[i%colors.length];ctx.beginPath();ctx.roundRect(x,y,bw,Math.max(0,bh),[5,5,0,0]);ctx.fill();ctx.fillStyle="#85879d";ctx.textAlign="center";ctx.textBaseline="top";let label=it.label; if(label.length>10)label=label.slice(0,9)+"…";ctx.fillText(label,x+bw/2,pad.t+ch+11);});
  }
  function legendHtml(items){return items.map((it,i)=>`<div class="legend-item"><span class="legend-swatch" style="background:${it.color||colors[i%colors.length]}"></span><span>${esc(it.label)}</span><b>${it.value}</b></div>`).join("");}
  function categoryData(){const map={};data.books.forEach(b=>{map[b.category||"Uncategorized"]=(map[b.category||"Uncategorized"]||0)+Number(b.copies||0);});return Object.entries(map).map(([label,value],i)=>({label,value,color:colors[i%colors.length]})).sort((a,b)=>b.value-a.value);}
  function statusData(){return [{label:"Issued",value:totalActive(),color:colors[2]},{label:"Returned",value:data.transactions.filter(t=>t.status==="Returned").length,color:colors[1]}];}
  function popularData(){return [...data.books].map(b=>({...b,borrowCount:Math.max(Number(b.borrowCount)||0,data.transactions.filter(t=>t.bookId===b.id).length)})).sort((a,b)=>b.borrowCount-a.borrowCount||a.title.localeCompare(b.title));}

  function renderDashboard(){
    $("#statTotalBooks").textContent=data.books.length;$("#statAvailable").textContent=totalAvailable();$("#statIssued").textContent=totalActive();$("#statStudents").textContent=data.students.length;
    const cats=categoryData(),statuses=statusData();drawDonut($("#categoryChart"),cats);$("#categoryLegend").innerHTML=legendHtml(cats.slice(0,5));
    drawDonut($("#statusChart"),statuses);$("#statusLegend").innerHTML=legendHtml(statuses);
    const recent=[...data.transactions].sort((a,b)=>b.issueDate.localeCompare(a.issueDate)).slice(0,5);
    $("#recentTransactions").innerHTML=recent.length?recent.map(t=>`<tr><td>${esc(getBookTitle(t.bookId))}</td><td>${esc(getStudentName(t.studentId))}</td><td>${fmtDate(t.issueDate)}</td><td><span class="pill ${t.status==="Issued"?"pill-issued":"pill-returned"}">${t.status}</span></td></tr>`).join(""):emptyRow(4,"No transactions yet","Issue a book to see recent activity.");
    const popular=popularData().slice(0,4);$("#popularBooks").innerHTML=popular.length?popular.map((b,i)=>`<div class="popular-item"><span class="rank">${i+1}</span><div class="popular-info"><b>${esc(b.title)}</b><small>${esc(b.category)} · ${Number(b.borrowCount)} borrow${Number(b.borrowCount)===1?"":"s"}</small></div><span class="borrow-count">${Number(b.borrowCount)}</span></div>`).join(""):`<div class="empty-state">Add books to see popular titles.</div>`;
  }
  function renderBooks(){
    const q=($("#bookSearch")?.value||"").toLowerCase(),cat=$("#categoryFilter")?.value||"";
    const categories=[...new Set(data.books.map(b=>b.category).filter(Boolean))].sort(),select=$("#categoryFilter"),prev=select.value;
    select.innerHTML='<option value="">All categories</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");if(categories.includes(prev))select.value=prev;
    const rows=data.books.filter(b=>(!cat||b.category===cat)&&[b.title,b.author,b.isbn,b.category].some(v=>String(v||"").toLowerCase().includes(q)));
    $("#bookCount").textContent=`${rows.length} title${rows.length===1?"":"s"}`;
    $("#booksTable").innerHTML=rows.length?rows.map((b,i)=>`<tr><td><div class="book-cell"><span class="book-cover c${i%4+1}">▤</span><span>${esc(b.title)}<small class="sub-cell">${esc(b.author)}</small></span></div></td><td>${esc(b.isbn||"—")}</td><td>${esc(b.category)}</td><td>${Number(b.copies)}</td><td><span class="pill ${availableCount(b)>0?"pill-available":"pill-issued"}">${availableCount(b)} available</span></td><td><button class="action-btn" data-action="edit-book" data-id="${b.id}">Edit</button><button class="action-btn danger" data-action="delete-book" data-id="${b.id}">Delete</button></td></tr>`).join(""):emptyRow(6,"No books found","Try another search or add a new book.");
  }
  function renderStudents(){
    const q=($("#studentSearch")?.value||"").toLowerCase(),rows=data.students.filter(s=>[s.name,s.studentId,s.email].some(v=>String(v||"").toLowerCase().includes(q)));
    $("#studentCount").textContent=`${rows.length} student${rows.length===1?"":"s"}`;
    $("#studentsTable").innerHTML=rows.length?rows.map((s,i)=>`<tr><td><div class="book-cell"><span class="book-cover c${i%4+1}">♙</span><span>${esc(s.name)}<small class="sub-cell">Registered reader</small></span></div></td><td>${esc(s.studentId)}</td><td>${esc(s.email)}</td><td>${studentIssued(s.id)}</td><td><button class="action-btn" data-action="edit-student" data-id="${s.id}">Edit</button><button class="action-btn danger" data-action="delete-student" data-id="${s.id}">Delete</button></td></tr>`).join(""):emptyRow(5,"No students found","Try another search or add a student.");
  }
  function renderTransactions(){
    const q=($("#transactionSearch")?.value||"").toLowerCase(),status=$("#transactionFilter")?.value||"";
    const rows=[...data.transactions].filter(t=>(!status||t.status===status)&&(`${getBookTitle(t.bookId)} ${getStudentName(t.studentId)}`.toLowerCase().includes(q))).sort((a,b)=>b.issueDate.localeCompare(a.issueDate));
    $("#txTotal").textContent=data.transactions.length;$("#txActive").textContent=totalActive();$("#txReturned").textContent=data.transactions.filter(t=>t.status==="Returned").length;
    $("#transactionsTable").innerHTML=rows.length?rows.map(t=>`<tr><td>${esc(getBookTitle(t.bookId))}</td><td>${esc(getStudentName(t.studentId))}</td><td>${fmtDate(t.issueDate)}</td><td>${fmtDate(t.dueDate)}</td><td>${fmtDate(t.returnDate)}</td><td>${t.status==="Issued"?`<button class="action-btn" data-action="return-book" data-id="${t.id}">Mark returned</button>`:'<span class="pill pill-returned">Returned</span>'}</td></tr>`).join(""):emptyRow(6,"No transactions found","Issue a book to create a transaction.");
  }
  function renderAnalytics(){
    const copies=totalCopies(),available=totalAvailable(),returned=data.transactions.filter(t=>t.status==="Returned").length;
    $("#analyticsCopies").textContent=copies;$("#availabilityRate").textContent=(copies?Math.round(available/copies*100):0)+"%";$("#returnRate").textContent=(data.transactions.length?Math.round(returned/data.transactions.length*100):0)+"%";$("#analyticsTransactions").textContent=data.transactions.length;
    const cats=categoryData(),statuses=statusData();drawBars($("#analyticsCategoryChart"),cats);drawDonut($("#analyticsStatusChart"),statuses);
    const popular=popularData().slice(0,7);$("#popularTable").innerHTML=popular.length?popular.map((b,i)=>`<tr><td><span class="rank">${i+1}</span></td><td>${esc(b.title)}</td><td>${esc(b.category)}</td><td>${Number(b.borrowCount)}</td></tr>`).join(""):emptyRow(4,"No book data","Add books and transactions to populate this table.");
    const mostCat=cats[0],mostBook=popular[0],observations=[
      `<b>${data.books.length}</b> unique book titles are currently recorded, representing <b>${copies}</b> physical copies.`,
      mostCat?`<b>${esc(mostCat.label)}</b> is the largest category with <b>${mostCat.value}</b> copies.`:"Add book categories to compare your collection.",
      mostBook?`<b>${esc(mostBook.title)}</b> is the most borrowed title in the current records (${mostBook.borrowCount} recorded borrows).`:"Issue books to identify popular titles.",
      `There are <b>${totalActive()}</b> active issue(s) and <b>${returned}</b> returned transaction(s).`,
      `The current availability rate is <b>${copies?Math.round(available/copies*100):0}%</b> of all recorded copies.`
    ];
    $("#insightsList").innerHTML=observations.map((s,i)=>`<div class="insight-item"><span class="insight-bullet">${["↗","▦","★","↩","◔"][i]}</span><span>${s}</span></div>`).join("");
  }
  function renderAll(){renderDashboard();renderBooks();renderStudents();renderTransactions();renderAnalytics();}
  function showPage(name){
    $$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));
    $$(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
    const labels={dashboard:"Dashboard",books:"Books",students:"Students",transactions:"Issue & Return",analytics:"Analytics"};
    $("#pageHeading").textContent=labels[name]||"Dashboard";$("#sidebar").classList.remove("open");
    if(name==="dashboard"||name==="analytics")setTimeout(()=>{renderDashboard();renderAnalytics();},50);
  }
  $$(".nav-link[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

  const modalBackdrop=$("#modalBackdrop"),modalForm=$("#modalForm"),modalFields=$("#modalFields");
  let modalMode="",editingId=null;
  function field(name,label,type="text",value="",opts={}) {
    const full=opts.full?" full":"",required=opts.required!==false;
    let control;
    if(type==="select"){control=`<select name="${name}" ${required?"required":""}>${opts.options.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(value)?"selected":""}>${esc(o.label)}</option>`).join("")}</select>`;}
    else control=`<input name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""} ${opts.min!==undefined?`min="${opts.min}"`:""} ${opts.max!==undefined?`max="${opts.max}"`:""} placeholder="${esc(opts.placeholder||"")}" />`;
    return `<div class="field${full}"><label for="field-${name}">${esc(label)}</label>${control.replace(`name="${name}"`,`name="${name}" id="field-${name}"`)}</div>`;
  }
  function openModal(title,fields,mode,id=null){
    modalMode=mode;editingId=id;$("#modalTitle").textContent=title;modalFields.innerHTML=fields;modalBackdrop.hidden=false;document.body.style.overflow="hidden";
  }
  function closeModal(){modalBackdrop.hidden=true;document.body.style.overflow="";modalForm.reset();editingId=null;}
  $("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);
  modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modalBackdrop.hidden)closeModal();});

  function bookForm(book={}){
    return field("title","Book title","text",book.title||"",{full:true})+
      field("author","Author","text",book.author||"")+
      field("isbn","ISBN","text",book.isbn||"",{required:false})+
      field("category","Category","select",book.category||"Fiction",{options:["Fiction","Technology","Self-help","Psychology","Education","Science","History","Other"].map(x=>({value:x,label:x}))})+
      field("copies","Total copies","number",book.copies??1,{min:1});
  }
  function studentForm(s={}){
    return field("name","Student name","text",s.name||"")+
      field("studentId","Student ID","text",s.studentId||"")+
      field("email","Email address","email",s.email||"",{full:true});
  }
  function issueForm(){
    const available=data.books.filter(b=>availableCount(b)>0);
    const books=available.map(b=>({value:b.id,label:`${b.title} (${availableCount(b)} available)`}));
    const students=data.students.map(s=>({value:s.id,label:`${s.name} · ${s.studentId}`}));
    if(!books.length||!students.length)return null;
    return field("bookId","Select book","select",books[0].value,{options:books,full:true})+
      field("studentId","Select student","select",students[0].value,{options:students,full:true})+
      field("issueDate","Issue date","date",today())+
      field("dueDate","Due date","date",dateOffset(14));
  }
  $("#addBookBtn").addEventListener("click",()=>openModal("Add a book",bookForm(),"add-book"));
  $("#addStudentBtn").addEventListener("click",()=>openModal("Add a student",studentForm(),"add-student"));
  $("#issueBookBtn").addEventListener("click",()=>{const fields=issueForm();if(!fields){toast("Add at least one available book and one student first.");return;}openModal("Issue a book",fields,"issue-book");});
  modalForm.addEventListener("submit",e=>{
    e.preventDefault();const form=Object.fromEntries(new FormData(modalForm).entries());
    if(modalMode==="add-book"||modalMode==="edit-book"){
      const copies=Number(form.copies),old=editingId?bookById(editingId):null;
      if(!form.title.trim()||!form.author.trim()||!Number.isFinite(copies)||copies<1){toast("Please enter valid book details.");return;}
      if(old&&copies<activeCount(old.id)){toast("Total copies cannot be less than the number currently issued.");return;}
      const item={id:old?old.id:data.nextIds.book++,title:form.title.trim(),author:form.author.trim(),isbn:form.isbn.trim(),category:form.category,copies,borrowCount:old?.borrowCount||0};
      if(old)data.books=data.books.map(b=>b.id===old.id?item:b);else data.books.push(item);
      closeModal();save();toast(old?"Book updated successfully.":"Book added successfully.");
    } else if(modalMode==="add-student"||modalMode==="edit-student"){
      const old=editingId?studentById(editingId):null;
      if(!form.name.trim()||!form.studentId.trim()||!form.email.trim()){toast("Please complete all student details.");return;}
      if(data.students.some(s=>s.studentId.toLowerCase()===form.studentId.trim().toLowerCase()&&s.id!==old?.id)){toast("That student ID already exists.");return;}
      const item={id:old?old.id:data.nextIds.student++,name:form.name.trim(),studentId:form.studentId.trim(),email:form.email.trim()};
      if(old)data.students=data.students.map(s=>s.id===old.id?item:s);else data.students.push(item);
      closeModal();save();toast(old?"Student updated successfully.":"Student added successfully.");
    } else if(modalMode==="issue-book"){
      const book=bookById(form.bookId);
      if(!book||!studentById(form.studentId)){toast("Please choose a valid book and student.");return;}
      if(availableCount(book)<1){toast("No copies of this book are available.");return;}
      if(form.dueDate<form.issueDate){toast("Due date cannot be before issue date.");return;}
      data.transactions.push({id:data.nextIds.transaction++,bookId:Number(form.bookId),studentId:Number(form.studentId),issueDate:form.issueDate,dueDate:form.dueDate,returnDate:"",status:"Issued"});
      book.borrowCount=(Number(book.borrowCount)||0)+1;closeModal();save();toast("Book issued successfully.");
    }
  });

  document.addEventListener("click",e=>{
    const btn=e.target.closest("[data-action]");if(!btn)return;
    const id=Number(btn.dataset.id),action=btn.dataset.action;
    if(action==="edit-book"){const b=bookById(id);if(b)openModal("Edit book",bookForm(b),"edit-book",id);}
    if(action==="delete-book"){
      const b=bookById(id);if(!b)return;
      if(activeCount(id)){toast("Return all copies of this book before deleting it.");return;}
      if(confirm(`Delete "${b.title}"?`)){data.books=data.books.filter(x=>x.id!==id);save();toast("Book deleted.");}
    }
    if(action==="edit-student"){const s=studentById(id);if(s)openModal("Edit student",studentForm(s),"edit-student",id);}
    if(action==="delete-student"){
      const s=studentById(id);if(!s)return;
      if(studentIssued(id)){toast("This student has an active issue. Return the book before deleting the student.");return;}
      if(confirm(`Delete student "${s.name}"?`)){data.students=data.students.filter(x=>x.id!==id);save();toast("Student deleted.");}
    }
    if(action==="return-book"){
      const t=data.transactions.find(x=>x.id===id);if(!t||t.status!=="Issued")return;
      if(confirm(`Mark "${getBookTitle(t.bookId)}" as returned?`)){t.status="Returned";t.returnDate=today();save();toast("Book marked as returned.");}
    }
  });
  $("#bookSearch").addEventListener("input",renderBooks);$("#categoryFilter").addEventListener("change",renderBooks);
  $("#studentSearch").addEventListener("input",renderStudents);$("#transactionSearch").addEventListener("input",renderTransactions);$("#transactionFilter").addEventListener("change",renderTransactions);
  $("#resetDemo").addEventListener("click",()=>{if(confirm("Reset all library records to the original sample data? This replaces saved data in this browser.")){data=initialData();save();showPage("dashboard");toast("Demo data has been reset.");}});
  $("#exportDataBtn").addEventListener("click",()=>{
    const rows=[["Transaction ID","Book","Student","Issue Date","Due Date","Return Date","Status"]];
    data.transactions.forEach(t=>rows.push([t.id,getBookTitle(t.bookId),getStudentName(t.studentId),t.issueDate,t.dueDate,t.returnDate,t.status]));
    const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="library_transactions.csv";a.click();URL.revokeObjectURL(url);toast("CSV export downloaded.");
  });
  let resizeTimer;window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderDashboard();renderAnalytics();},120);});
  renderAll();
})(); 
