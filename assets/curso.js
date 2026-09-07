/* formato-curso v4 — curso em PÁGINA ÚNICA (trilha + aulas, um só estado).
   Robusto a preview que isola localStorage por página: aqui é tudo um documento. */
(function(){
  "use strict";
  var CK=((document.querySelector('meta[name="curso"]')||{}).content)||"v4:curso";
  var today=Math.floor(Date.now()/86400000);

  document.body.insertAdjacentHTML('afterbegin',
    '<div class="grain"></div><div class="prog" id="prog"></div>'+
    '<div class="seltb" id="seltb"><button data-a="hl">grifar</button><button data-a="card">grifar + cartão</button></div>');
  document.body.insertAdjacentHTML('beforeend',
    '<div class="scrim" id="scrim"></div>'+
    '<aside class="panel" id="jornada"><button class="close" data-close>&#10005;</button><h3>Minha jornada</h3><div class="body">'+
      '<div class="block"><p class="lbl">Progresso do curso</p><div class="pbar"><i id="jpbar"></i></div>'+
      '<p class="stat"><span id="jpct">0</span><small>% lido &middot; <span id="jread">0</span>/<span id="jtotal">0</span> se&ccedil;&otilde;es</small></p></div>'+
      '<div class="block"><p class="lbl">O que voc&ecirc; j&aacute; consegue fazer</p><ul class="capacidades" id="jcap"></ul></div>'+
      '<div class="block"><p class="lbl">Tempo</p><div class="timeinvest" id="jtime">'+
        '<div class="ti-block"><span class="ti-num" id="jtinvest">~0min</span><span class="ti-lbl">investido</span></div>'+
        '<div class="ti-block"><span class="ti-num" id="jtrest">~0min</span><span class="ti-lbl">restante</span></div></div></div>'+
      '<div class="block"><p class="lbl">Cart&otilde;es</p><p class="stat"><span id="jcards">0</span><small>cart&otilde;es</small></p>'+
      '<p class="pendentes-tone" id="jpendtone"></p></div>'+
      '<div class="block"><p class="lbl">Pr&aacute;ticas conclu&iacute;das</p><div class="praticas-check" id="jprat"></div></div>'+
      '<div class="block"><p class="lbl">Meus grifos</p><div id="jmarks"></div></div>'+
      '<p class="trilha-sintese" id="jsintese" style="display:none"></p>'+
      '<div class="btnrow"><button id="expbtn">exportar .json</button><button id="impbtn">importar</button><button id="resetbtn">zerar</button></div>'+
      '<input type="file" id="impfile" accept="application/json" style="display:none"></div></aside>'+
    '<aside class="panel" id="revisar"><button class="close" data-close>&#10005;</button><h3>Revisar</h3><div class="rev" id="revbody"></div></aside>'+
    '<aside class="panel" id="exercicios"><button class="close" data-close>&#10005;</button><h3>Exerc&iacute;cios</h3><div class="exlist" id="exlist"></div></aside>'+
    '<div class="cedit" id="cedit"><button class="close" data-close>&#10005;</button><h3>Novo cart&atilde;o</h3>'+
      '<label>Frente (pergunta)</label><textarea id="cefront"></textarea>'+
      '<label>Verso (resposta)</label><textarea id="ceback"></textarea>'+
      '<p class="cehint">Reformule a frente como uma <b>pergunta</b> &mdash; recordar fixa mais do que reconhecer.</p>'+
      '<div class="cerow"><button id="cesave" class="big">salvar cart&atilde;o</button><button id="cecancel">cancelar</button></div></div>'+
    '<div class="prefs" id="prefs">'+
      '<div class="prow"><span>Tamanho do texto</span><span class="pbtns"><button data-pf="size" data-d="-1" aria-label="diminuir">A&minus;</button><button data-pf="size" data-d="1" aria-label="aumentar">A+</button></span></div>'+
      '<div class="prow"><span>Largura</span><span class="pbtns"><button data-pf="width" data-d="-1" aria-label="mais estreita">&minus;</button><button data-pf="width" data-d="1" aria-label="mais larga">+</button></span></div>'+
      '<div class="prow"><span>Entrelinha</span><span class="pbtns"><button data-pf="leading" data-d="-1" aria-label="menos">&minus;</button><button data-pf="leading" data-d="1" aria-label="mais">+</button></span></div>'+
      '<button class="preset" data-pf="reset">restaurar padr&atilde;o</button></div>'+
    '<div id="routestatus" class="sronly" role="status" aria-live="polite"></div>'+
    '<div class="welcome" id="welcome"><button class="close" data-close>&#10005;</button>'+
      '<p class="wk">Bem-vindo</p><h3>Como este curso funciona</h3>'+
      '<ul class="wlist">'+
        '<li><b>Aumente a letra</b> &mdash; toque no <b>Aa</b> no topo para ajustar tamanho e largura; a p&aacute;gina foi feita pra isso.</li>'+
        '<li><b>Leia com calma</b> &mdash; uma ideia por se&ccedil;&atilde;o, sem pressa.</li>'+
        '<li><b>Grife</b> qualquer trecho e ele vira um <b>cart&atilde;o de revis&atilde;o</b> (voc&ecirc; reformula a pergunta).</li>'+
        '<li><b>Revisar</b> traz as perguntas de volta sozinho, na hora certa de lembrar.</li>'+
        '<li><b>Pratique agora</b>, no fim de cada aula: m&atilde;o na massa, passo a passo, sempre seguro.</li>'+
        '<li><b>Jornada</b> mostra o que voc&ecirc; j&aacute; consegue fazer. Tudo salva sozinho no seu navegador.</li>'+
      '</ul><button class="big" id="wstart">come&ccedil;ar a estudar</button></div>');

  function $(id){ return document.getElementById(id); }
  function el(t,c){ var e=document.createElement(t); if(c) e.className=c; return e; }

  var aulaEls={};
  document.querySelectorAll('.view[data-aula]').forEach(function(v){ aulaEls[v.getAttribute('data-aula')]=v; });
  var KEYS=Object.keys(aulaEls).sort();

  // ---- estado ----
  var state=load();
  function load(){ try{ var s=JSON.parse(localStorage.getItem(CK)); if(s&&typeof s==='object') return norm(s); }catch(e){} return norm({}); }
  function norm(s){
    s.prefs=s.prefs||{}; if(!s.prefs.theme) s.prefs.theme='dark'; if(!s.prefs.read) s.prefs.read={size:2,width:2,leading:2}; s.aulas=s.aulas||{};
    KEYS.forEach(function(k){ var total=aulaEls[k].querySelectorAll('.step').length; var a=s.aulas[k]=s.aulas[k]||{}; a.read=a.read||{}; a.marks=a.marks||[]; a.cards=a.cards||{}; a.tasks=a.tasks||{}; a.reflect=a.reflect||{}; a.total=total; });
    return s;
  }
  function save(){ try{ localStorage.setItem(CK, JSON.stringify(state)); }catch(e){} }

  /* ==== DELTA v5 — funções isoladas (spec §13, lista fechada de 6 mudanças) ==== */
  // mudança 4: merge não-destrutivo do import (função pura isolada — não toca norm()/estado base)
  function mergeState(oldS,impS){
    var out=norm(JSON.parse(JSON.stringify(oldS)));
    var imp=norm(JSON.parse(JSON.stringify(impS)));
    KEYS.forEach(function(k){
      var o=out.aulas[k], i=imp.aulas[k]; if(!o||!i) return;
      Object.keys(i.read||{}).forEach(function(s){ if(i.read[s]) o.read[s]=true; });
      (i.marks||[]).forEach(function(m){ if(!o.marks.some(function(x){ return x.id===m.id; })) o.marks.push(m); });
      Object.keys(i.cards||{}).forEach(function(id){ if(!o.cards[id]) o.cards[id]=i.cards[id]; else if((i.cards[id].reps||0)>(o.cards[id].reps||0)) o.cards[id]=i.cards[id]; });
      Object.keys(i.tasks||{}).forEach(function(id){ if(i.tasks[id]) o.tasks[id]=true; });
      Object.keys(i.reflect||{}).forEach(function(s){ if(i.reflect[s]&&!o.reflect[s]) o.reflect[s]=i.reflect[s]; });
    });
    return out;
  }
  // mudança 2: teto de exibição "9+" (revn/pendências)
  function fmtCount(n){ return n>9?'9+':String(n); }
  // mudança 5: leitura de data-tempo (fonte única no view da aula) + agregação
  function tempoOf(k){ var v=aulaEls[k]; return v?(v.getAttribute('data-tempo')||''):''; }
  function tempoMinutes(t){ var m=/([0-9]+)/.exec(t||''); return m?parseInt(m[1],10):0; }
  function tempoStats(){
    var total=0, feito=0;
    KEYS.forEach(function(k){ var a=state.aulas[k], n=readCount(k), tot=a.total||1, mins=tempoMinutes(tempoOf(k));
      total+=mins; feito += (n>=tot) ? mins : Math.round(mins*(tot?n/tot:0));
    });
    return { total:total, feito:feito, restante:Math.max(0,total-feito) };
  }
  function renderTempoBadge(k){ var v=aulaEls[k]; if(!v) return; var t=tempoOf(k); if(!t) return;
    var b=v.querySelector('.tempo-badge'); if(!b){ var anchor=v.querySelector('.why')||v.querySelector('.promise'); if(!anchor) return; b=el('span','tempo-badge'); anchor.parentNode.insertBefore(b,anchor.nextSibling); }
    b.textContent=t;
  }
  function renderStatcards(){ var box=document.querySelector('#v-trilha .statcards'); if(!box) return;
    var doneAulas=0; KEYS.forEach(function(k){ var a=state.aulas[k]; if(readCount(k)>=(a.total||1)) doneAulas++; });
    var ts=tempoStats();
    box.innerHTML='<div class="statcard"><span class="sc-num">'+doneAulas+'/'+KEYS.length+'</span><span class="sc-lbl">aulas concluídas</span></div>'+
      '<div class="statcard"><span class="sc-num">~'+ts.restante+'min</span><span class="sc-lbl">faltam</span></div>';
  }
  // práticas concluídas por aula (checkmarks compactos do painel D-09)
  function praticaDone(k){ var v=aulaEls[k], pr=v&&v.querySelector('.practice'); if(!pr) return false;
    var boxes=[].slice.call(pr.querySelectorAll('input[data-ptask]')); if(!boxes.length) return false;
    var tasks=(state.aulas[k]||{}).tasks||{}; return boxes.every(function(b){ return !!tasks[b.getAttribute('data-ptask')]; });
  }
  /* ==== fim das funções isoladas do delta v5 ==== */

  KEYS.forEach(function(k){ var node=$('cards-'+k); if(!node) return;
    try{ JSON.parse(node.textContent).forEach(function(c,i){ var cs=state.aulas[k].cards, id='a'+i; if(!cs[id]) cs[id]={front:c.front,back:c.back,due:today,interval:0,ease:2.5,reps:0,src:'autor'}; }); }catch(e){}
  });
  save();

  // ---- tema ----
  var THEMES=[['dark','escuro'],['papel','papel'],['sepia','sépia']];
  var themeBtn=$('themebtn');
  function applyTheme(t){ document.documentElement.setAttribute('data-theme',t); var l=(THEMES.filter(function(x){return x[0]===t})[0]||THEMES[0])[1]; if(themeBtn) themeBtn.textContent='tema: '+l; state.prefs.theme=t; save(); }
  if(themeBtn) themeBtn.addEventListener('click',function(){ var i=0; for(var j=0;j<THEMES.length;j++){ if(THEMES[j][0]===state.prefs.theme){ i=j; break; } } applyTheme(THEMES[(i+1)%THEMES.length][0]); });
  applyTheme(state.prefs.theme);

  // ---- preferências de leitura (clampa só a prosa) ----
  var PF_SIZE=[16,17,18,20,22], PF_WIDTH=[52,56,60,66,72], PF_LEAD=[1.55,1.65,1.75,1.85,1.95];
  function clampIdx(i){ i=parseInt(i,10); if(isNaN(i)) i=2; return Math.max(0,Math.min(4,i)); }
  function applyRead(){ var r=state.prefs.read, d=document.documentElement.style; r.size=clampIdx(r.size); r.width=clampIdx(r.width); r.leading=clampIdx(r.leading); d.setProperty('--prose-size',PF_SIZE[r.size]+'px'); d.setProperty('--read',PF_WIDTH[r.width]+'ch'); d.setProperty('--prose-lh',PF_LEAD[r.leading]); }
  applyRead();
  var prefsBtn=$('prefsbtn');
  if(prefsBtn) prefsBtn.addEventListener('click',function(e){ e.stopPropagation(); var p=$('prefs'); if(p) p.classList.toggle('on'); });
  document.querySelectorAll('#prefs [data-pf]').forEach(function(b){ b.addEventListener('click',function(){ var pf=b.getAttribute('data-pf'); if(pf==='reset'){ state.prefs.read={size:2,width:2,leading:2}; } else { state.prefs.read[pf]=clampIdx(state.prefs.read[pf]+parseInt(b.getAttribute('data-d'),10)); } save(); applyRead(); }); });
  document.addEventListener('click',function(e){ var p=$('prefs'); if(p&&p.classList.contains('on')&&!p.contains(e.target)&&e.target!==prefsBtn){ p.classList.remove('on'); } });

  // ---- roteador ----
  var active=null;
  function show(route){
    if(!/^(trilha|aula-[1-9])$/.test(route)) route='trilha';
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    var view=$(route==='trilha'?'v-trilha':'v-'+route); if(view) view.classList.add('active');
    window.scrollTo(0,0);
    if(view){ var hd=view.querySelector('h1'); if(hd){ hd.setAttribute('tabindex','-1'); try{ hd.focus({preventScroll:true}); }catch(e){} } var lr=$('routestatus'); if(lr) lr.textContent=(hd?hd.textContent.replace(/\s+/g,' ').trim():route); }
    var back=document.querySelector('.bar .back');
    if(route==='trilha'){ active='trilha'; renderTrilha(); if($('pill')) $('pill').style.display='none'; if(back) back.style.display='none'; }
    else { active=route.split('-')[1]; if($('pill')) $('pill').style.display=''; if(back) back.style.display=''; updatePill(); renderTempoBadge(active); }
    document.querySelectorAll('.subnav a').forEach(function(a){});
    refreshRevn();
  }
  window.addEventListener('hashchange',function(){ show((location.hash||'#trilha').slice(1)); });

  // ---- trilha ----
  function readCount(k){ var a=state.aulas[k], n=0; for(var s in a.read){ if(a.read[s]) n++; } return n; }
  function renderTrilha(){
    KEYS.forEach(function(k){ var a=state.aulas[k], n=readCount(k), total=a.total||1;
      var bar=document.querySelector('.au[data-aula="'+k+'"] .prog i'), meta=document.querySelector('.au[data-aula="'+k+'"] .meta');
      if(bar) bar.style.transform='scaleX('+(total?n/total:0)+')';
      var tempo=tempoOf(k), tempoTxt=tempo?tempo+' · ':'';
      if(meta) meta.textContent = tempoTxt + (n>=total ? 'concluída ✓' : (n>0 ? 'em andamento · '+n+'/'+total : total+' seções · abrir →'));
    });
    renderStatcards();
  }

  function updatePill(){ if(active==='trilha'||!active) return; if($('pill')) $('pill').textContent=readCount(active)+'/'+state.aulas[active].total+' lido'; }

  // ---- marcar lido ----
  function aulaOf(node){ var v=node.closest('.view[data-aula]'); return v?v.getAttribute('data-aula'):null; }
  document.querySelectorAll('.readbtn').forEach(function(b){ b.addEventListener('click',function(){ var k=aulaOf(b); if(!k) return; var sec=b.getAttribute('data-read'); state.aulas[k].read[sec]=!state.aulas[k].read[sec]; save(); refreshReadBtns(); updatePill(); refreshMaps(); }); });
  function refreshReadBtns(){ document.querySelectorAll('.readbtn').forEach(function(b){ var k=aulaOf(b), sec=b.getAttribute('data-read'), done=k&&state.aulas[k].read[sec]; b.classList.toggle('done',!!done); b.textContent=done?'✓ lido':'marcar como lido'; }); }
  function refreshMaps(){ document.querySelectorAll('.view[data-aula]').forEach(function(v){ var k=v.getAttribute('data-aula'), steps=[].slice.call(v.querySelectorAll('.step')), map=v.querySelector('.aulamap'); if(!map) return; [].slice.call(map.children).forEach(function(r,i){ var rb=steps[i]&&steps[i].querySelector('.readbtn'), key=rb?rb.getAttribute('data-read'):null, done=key&&state.aulas[k].read[key]; r.classList.toggle('done',!!done); }); }); }
  refreshReadBtns();

  // ---- pratique agora (checklist com estado + copiar código) ----
  function flashBtn(btn,msg){ var o=btn.getAttribute('data-o'); if(o===null){ o=btn.textContent; btn.setAttribute('data-o',o); } btn.textContent=msg; setTimeout(function(){ btn.textContent=btn.getAttribute('data-o'); },1400); }
  function execCopy(t,btn){ var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); flashBtn(btn,'copiado ✓'); }catch(e){} document.body.removeChild(ta); }
  function copyText(t,btn){ try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){ flashBtn(btn,'copiado ✓'); },function(){ execCopy(t,btn); }); return; } }catch(e){} execCopy(t,btn); }
  var practiceRefreshers={};
  document.querySelectorAll('.practice').forEach(function(pr){ var k=aulaOf(pr); if(!k) return; var tasks=state.aulas[k].tasks, boxes=[].slice.call(pr.querySelectorAll('input[data-ptask]')), cnt=pr.querySelector('.pcount');
    function refresh(){ var done=0; boxes.forEach(function(b){ var id=b.getAttribute('data-ptask'); b.checked=!!tasks[id]; if(tasks[id]) done++; }); if(cnt) cnt.textContent=done+'/'+boxes.length+' feito'; pr.classList.toggle('done', boxes.length>0&&done===boxes.length); }
    boxes.forEach(function(b){ b.addEventListener('change',function(){ tasks[b.getAttribute('data-ptask')]=b.checked; save(); refresh(); }); });
    var cp=pr.querySelector('.pcopy'), code=pr.querySelector('.pcode'); if(cp&&code) cp.addEventListener('click',function(){ copyText(code.textContent,cp); });
    practiceRefreshers[k]=refresh;
    refresh();
  });
  function resetPractice(k,scroll){
    var tasks=state.aulas[k].tasks; if(!tasks) return;
    Object.keys(tasks).forEach(function(id){ tasks[id]=false; });
    save();
    if(practiceRefreshers[k]) practiceRefreshers[k]();
    if(scroll){ var v=aulaEls[k], pr=v&&v.querySelector('.practice'); if(pr) pr.scrollIntoView({behavior:'smooth',block:'start'}); }
  }

  // copiar em qualquer bloco de código
  document.querySelectorAll('.view[data-aula] .col pre').forEach(function(pre){ if(pre.closest('.pcodewrap')||pre.closest('.codewrap')) return; var wrap=el('div','codewrap'); pre.parentNode.insertBefore(wrap,pre); wrap.appendChild(pre); var b=el('button','pcopy'); b.type='button'; b.textContent='copiar'; wrap.insertBefore(b,pre); b.addEventListener('click',function(){ copyText(pre.textContent,b); }); });

  // ---- termdemo (demo real de comando: clique-pra-revelar + toggle certo/erro) ----
  document.querySelectorAll('.termdemo-reveal').forEach(function(b){
    b.addEventListener('click',function(){
      var body=b.nextElementSibling; if(!body) return;
      body.hidden=false; b.style.display='none';
    });
  });
  document.querySelectorAll('.termdemo-toggle').forEach(function(b){
    b.addEventListener('click',function(){
      var body=b.closest('.termdemo-body'); if(!body) return;
      var cmds=[].slice.call(body.querySelectorAll('.termdemo-cmd'));
      var okCmd=cmds.filter(function(c){ return c.getAttribute('data-variant')==='ok'; })[0];
      var errCmd=cmds.filter(function(c){ return c.getAttribute('data-variant')==='erro'; })[0];
      if(!okCmd||!errCmd) return;
      var showingOk=okCmd.classList.contains('on');
      cmds.forEach(function(c){ c.classList.remove('on'); });
      if(showingOk){ errCmd.classList.add('on'); b.textContent='ver o certo'; }
      else { okCmd.classList.add('on'); b.textContent='ver o erro comum'; }
    });
  });

  // ---- reflexão / nota por seção (self-explanation) ----
  document.querySelectorAll('.view[data-aula] .step').forEach(function(s){ var rb=s.querySelector('.readbtn'); if(!rb||s.querySelector('.reflect')) return; var k=aulaOf(s), key=rb.getAttribute('data-read'); if(!k||!key) return;
    var d=el('details','reflect'), sum=el('summary'); sum.textContent='Reflita — explique com suas palavras, ou anote uma dúvida'; d.appendChild(sum);
    var ta=el('textarea','reflecta'); ta.setAttribute('placeholder','Escrever com suas palavras fixa mais do que reler.'); ta.value=state.aulas[k].reflect[key]||''; if(ta.value.trim()) d.classList.add('has'); d.appendChild(ta);
    ta.addEventListener('input',function(){ state.aulas[k].reflect[key]=ta.value; save(); d.classList.toggle('has',!!ta.value.trim()); });
    rb.parentNode.insertBefore(d, rb.nextSibling);
  });

  // ---- recap ativo no fim da aula (fecha com recordação) ----
  document.querySelectorAll('.view[data-aula] .col').forEach(function(col){ var k=aulaOf(col); if(!k||col.querySelector('.recap')) return;
    var box=el('div','recap'); box.innerHTML='<p class="rk">Feche a aula</p><p class="rtext">Revise agora, com recorda&ccedil;&atilde;o ativa &mdash; depois estes cart&otilde;es voltam sozinhos na hora certa. A revis&atilde;o da trilha (bot&atilde;o <b>revisar</b> no topo) mistura as perguntas de <b>todas</b> as aulas.</p>';
    var actions=el('div','recap-actions');
    var b=el('button','big'); b.textContent='revisar os cartões desta aula'; b.addEventListener('click',function(){ reviewAula(k); }); actions.appendChild(b);
    if(aulaEls[k]&&aulaEls[k].querySelector('.practice')){
      var b2=el('button','big'); b2.textContent='refazer exercício desta aula'; b2.addEventListener('click',function(){ resetPractice(k,true); }); actions.appendChild(b2);
    }
    box.appendChild(actions);
    col.appendChild(box);
  });

  // ---- teste-se ----
  document.querySelectorAll('.quiz').forEach(function(q){ var ans=q.getAttribute('data-answer'), fb=q.querySelector('.qfb'), done=false;
    q.querySelectorAll('.opt').forEach(function(o){ o.addEventListener('click',function(){ if(done) return; done=true; var kk=o.getAttribute('data-k');
      q.querySelectorAll('.opt').forEach(function(x){ if(x.getAttribute('data-k')===ans) x.classList.add('right'); });
      var rt=q.querySelector('.opt[data-k="'+ans+'"]'), rfb=rt?(rt.getAttribute('data-fb')||''):'', mine=o.getAttribute('data-fb')||'';
      if(kk===ans){ fb.innerHTML='<b>Certo.</b> '+rfb; } else { o.classList.add('wrong'); fb.innerHTML='<b>Quase.</b> '+(mine?mine+' ':'')+'A certa está destacada.'+(rfb?' '+rfb:''); } fb.classList.add('on');
    }); }); });

  // ---- trilho vivo (IO global, escopo por view) ----
  document.querySelectorAll('.view[data-aula]').forEach(function(v){
    var figs=v.querySelectorAll('.figstage .fig'), ind=v.querySelector('.steps-ind');
    if(ind){ ind.innerHTML=''; figs.forEach(function(_,i){ var ii=el('i'); if(i===0) ii.className='on'; ind.appendChild(ii); }); }
    var cap=v.querySelector('.railcap'), f1=v.querySelector('.figstage .fig[data-fig="1"]'); if(cap&&f1) cap.innerHTML=f1.getAttribute('data-cap')||'';
    v.querySelectorAll('.mobfig').forEach(function(m){ var n=m.getAttribute('data-mobfig'); var src=v.querySelector('.figstage .fig[data-fig="'+n+'"] svg'); if(src&&!m.firstChild) m.appendChild(src.cloneNode(true)); });
    var sticky=v.querySelector('.railsticky'), steps=[].slice.call(v.querySelectorAll('.step'));
    if(sticky&&steps.length&&!v.querySelector('.aulamap')){ var map=el('nav','aulamap'); map.setAttribute('aria-label','Seções da aula');
      steps.forEach(function(s,i){ var h=s.querySelector('h2'), nEl=h&&h.querySelector('.n'), num=nEl?nEl.textContent:(''+(i+1)); var title=h?h.textContent.replace(num,'').trim():('Seção '+(i+1));
        var a=el('button','amrow'); a.type='button'; a.innerHTML='<span class="amn"></span><span class="amt"></span><span class="amck">✓</span>'; a.querySelector('.amn').textContent=num; a.querySelector('.amt').textContent=title; a.title=title;
        a.addEventListener('click',function(){ s.scrollIntoView({behavior:'smooth',block:'start'}); }); map.appendChild(a); });
      var sn=sticky.querySelector('.sidenote'); if(sn) sticky.insertBefore(map,sn); else sticky.appendChild(map);
    }
  });
  refreshMaps();
  function activateFor(step){ var v=step.closest('.view'); if(!v) return; var fign=step.getAttribute('data-fig'); if(!fign) return;
    v.querySelectorAll('.figstage .fig').forEach(function(f){ f.classList.toggle('on', f.getAttribute('data-fig')===fign); });
    var ind=v.querySelector('.steps-ind'); if(ind){ [].slice.call(ind.children).forEach(function(i,ix){ i.classList.toggle('on', String(ix+1)===fign); }); }
    var cap=v.querySelector('.railcap'); if(cap){ var fig=v.querySelector('.figstage .fig[data-fig="'+fign+'"]'); cap.innerHTML=fig?(fig.getAttribute('data-cap')||''):''; }
    var map=v.querySelector('.aulamap'); if(map){ var ssteps=[].slice.call(v.querySelectorAll('.step')), idx=ssteps.indexOf(step); [].slice.call(map.children).forEach(function(r,ri){ r.classList.toggle('on',ri===idx); }); }
  }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) activateFor(e.target); }); },{rootMargin:'-45% 0px -45% 0px',threshold:0});
  document.querySelectorAll('.view[data-aula] .step').forEach(function(s){ io.observe(s); });

  // ---- grifo + flashcard ----
  var tb=$('seltb'), pending=null;
  function closestBlock(node,col){ while(node&&node!==col){ if(node.nodeType===1&&/^(P|LI|H2)$/.test(node.tagName)) return node; node=node.parentNode; } return null; }
  document.addEventListener('mouseup',function(){ setTimeout(function(){
    var sel=window.getSelection(); if(!sel||sel.rangeCount===0){ hideTB(); return; }
    var text=sel.toString().trim(); if(text.length<4||text.length>160){ hideTB(); return; }
    var range=sel.getRangeAt(0), sc=range.startContainer, scEl=sc.nodeType===1?sc:sc.parentNode, col=scEl?scEl.closest('.col'):null;
    if(!col){ hideTB(); return; }
    var k=aulaOf(col), block=closestBlock(sc,col); if(!k||!block){ hideTB(); return; }
    pending={ text:text, blockText:block.textContent, aula:k, col:col };
    var r=range.getBoundingClientRect(); tb.style.left=(window.scrollX+r.left+r.width/2-70)+'px'; tb.style.top=(window.scrollY+r.top-46)+'px'; tb.classList.add('on');
  },10); });
  function hideTB(){ tb.classList.remove('on'); }
  document.addEventListener('scroll',hideTB,{passive:true});
  tb.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){ if(!pending) return; var makeCard=b.getAttribute('data-a')==='card', pend=pending;
    wrapFirst(pending.col,pending.text); state.aulas[pending.aula].marks.push({ id:'m'+Date.now(), text:pending.text });
    save(); hideTB(); window.getSelection().removeAllRanges(); refreshRevn();
    if(makeCard) openCardEditor(pend);
  }); });
  function wrapFirst(col,text){ var w=document.createTreeWalker(col,NodeFilter.SHOW_TEXT,null), node;
    while((node=w.nextNode())){ if(node.parentNode&&node.parentNode.classList&&node.parentNode.classList.contains('hl')) continue;
      var idx=node.nodeValue.indexOf(text); if(idx>=0){ var range=document.createRange(); range.setStart(node,idx); range.setEnd(node,idx+text.length);
        var m=el('mark'); m.className='hl'; try{ range.surroundContents(m); }catch(e){ m.appendChild(range.extractContents()); range.insertNode(m); } return; } } }
  KEYS.forEach(function(k){ var col=aulaEls[k].querySelector('.col'); if(col) state.aulas[k].marks.forEach(function(mk){ wrapFirst(col,mk.text); }); });

  // ---- revisão espaçada (todo o curso) ----
  function allDue(){ var arr=[]; KEYS.forEach(function(k){ var cs=state.aulas[k].cards; for(var id in cs){ if(cs[id].due<=today) arr.push({k:k,id:id}); } }); return arr; }
  function dueCount(){ return allDue().length; }
  function refreshRevn(){ if($('revn')) $('revn').textContent=fmtCount(dueCount()); }
  function grade(c,g){ if(g==='again'){ c.reps=0; c.interval=0; c.due=today; } else { c.reps=(c.reps||0)+1; if(c.reps===1) c.interval=1; else if(c.reps===2) c.interval=3; else c.interval=Math.round((c.interval||1)*(c.ease||2.5)); if(g==='easy'){ c.interval=Math.max(1,Math.round(c.interval*1.3)); c.ease=(c.ease||2.5)+0.15; } c.due=today+c.interval; } }
  var rq=[], ri=0;
  function openReview(){ rq=allDue(); ri=0; renderReview(); openPanel('revisar'); }
  function reviewAula(k){ rq=[]; var cs=state.aulas[k].cards; for(var id in cs){ rq.push({k:k,id:id}); } ri=0; renderReview(); openPanel('revisar'); }
  function renderReview(){ var body=$('revbody'); if(ri>=rq.length){ body.innerHTML='<p class="revempty">Nada para revisar agora. Volte amanhã &mdash; ou grife mais trechos.</p>'; refreshRevn(); return; }
    var ref=rq[ri], c=state.aulas[ref.k].cards[ref.id]; body.innerHTML='';
    var card=el('div','card'), fr=el('div','side'); fr.textContent=c.front; card.appendChild(fr);
    var bk=el('div','side back'); bk.textContent=c.back; bk.style.display='none'; card.appendChild(bk); body.appendChild(card);
    var sb=el('button','big'); sb.textContent='mostrar resposta'; body.appendChild(sb);
    var gr=el('div','grade'); gr.style.display='none';
    [['again','de novo'],['good','bom'],['easy','fácil']].forEach(function(g){ var gb=el('button',''); gb.textContent=g[1]; gb.addEventListener('click',function(){ grade(c,g[0]); save(); ri++; renderReview(); }); gr.appendChild(gb); });
    body.appendChild(gr); sb.addEventListener('click',function(){ bk.style.display='block'; sb.style.display='none'; gr.style.display='grid'; });
    var pos=el('p',''); pos.style.cssText='text-align:center;color:var(--faint);font-family:var(--mono);font-size:11px;margin-top:14px'; pos.textContent=(ri+1)+' / '+rq.length; body.appendChild(pos);
    var hint=el('p','revhint'); hint.textContent='espaço revela · 1 de novo · 2 bom · 3 fácil'; body.appendChild(hint);
  }

  // ---- jornada (curso) ----
  function renderJornada(){ var rd=0,tt=0,cards=0; KEYS.forEach(function(k){ rd+=readCount(k); tt+=state.aulas[k].total; var cs=state.aulas[k].cards; for(var id in cs) cards++; });
    var pct=tt?Math.round(rd/tt*100):0; $('jpbar').style.transform='scaleX('+(tt?rd/tt:0)+')'; $('jpct').textContent=pct; $('jread').textContent=rd; $('jtotal').textContent=tt; $('jcards').textContent=cards;

    // pendências — teto "9+" e cópia acolhedora (mudança 1+2)
    var due=dueCount();
    if($('jdue')) $('jdue').textContent=fmtCount(due);
    if($('jpendtone')) $('jpendtone').textContent = due>0 ? ('sem pressa — '+fmtCount(due)+' esperando por você') : 'nada esperando por você agora';

    // capacidades — progresso em capacidade: a promessa de cada aula concluída (mudança 1)
    var cap=$('jcap');
    if(cap){ var caps=[]; KEYS.forEach(function(k){ var a=state.aulas[k], total=a.total||1; if(readCount(k)>=total){ var v=aulaEls[k], p=v&&v.querySelector('.promise'); if(p) caps.push(p.textContent.trim()); } });
      if(!caps.length) cap.innerHTML='<li class="capacidades-empty">ainda nenhuma aula concluída</li>';
      else { cap.innerHTML=''; caps.forEach(function(c){ var li=el('li'); li.textContent=c; cap.appendChild(li); }); }
    }

    // tempo investido/restante (mudança 1+5)
    var ts=tempoStats();
    if($('jtinvest')) $('jtinvest').textContent='~'+ts.feito+'min';
    if($('jtrest')) $('jtrest').textContent='~'+ts.restante+'min';

    // práticas concluídas por aula, checkmarks compactos (mudança 1)
    var pratBox=$('jprat');
    if(pratBox){ pratBox.innerHTML=''; KEYS.forEach(function(k){ var s=el('span',''); if(praticaDone(k)) s.classList.add('done'); s.textContent=k; s.title='Aula '+k+(praticaDone(k)?' · prática concluída':' · prática pendente'); pratBox.appendChild(s); }); }

    // síntese de fim de trilha (mudança 1)
    var sint=$('jsintese');
    if(sint){ var allDone=KEYS.length>0 && KEYS.every(function(k){ var a=state.aulas[k]; return readCount(k)>=(a.total||1); });
      if(allDone){ sint.style.display='block'; sint.textContent='Você concluiu a trilha inteira — o que estava no papel agora está no seu trabalho.'; } else { sint.style.display='none'; }
    }

    var mk=$('jmarks'), all=[]; KEYS.forEach(function(k){ state.aulas[k].marks.forEach(function(m){ all.push(m); }); });
    if(!all.length) mk.innerHTML='<p style="color:var(--muted);font-size:14px">Nenhum grifo ainda.</p>'; else { mk.innerHTML=''; all.slice().reverse().forEach(function(m){ var d=el('div','mk'); d.textContent='“'+m.text+'”'; mk.appendChild(d); }); }
  }

  // ---- exercícios (refazer, trilha inteira) ----
  function renderExercicios(){
    var box=$('exlist'); if(!box) return; box.innerHTML='';
    KEYS.forEach(function(k){
      var v=aulaEls[k], pr=v&&v.querySelector('.practice'); if(!pr) return;
      var h=pr.querySelector('.ph'), title=h?h.textContent.trim():('Aula '+k);
      var row=el('div','exrow');
      var info=el('div','exinfo');
      var t=el('p','ext'); t.textContent='Aula '+k+' — '+title; info.appendChild(t);
      var done=praticaDone(k);
      var st=el('p','exstat'+(done?' done':'')); st.textContent=done?'feito':'pendente'; info.appendChild(st);
      row.appendChild(info);
      var actions=el('div','exactions');
      var go=el('button','exgo'); go.type='button'; go.textContent='ir até ela'; go.addEventListener('click',function(){ closePanels(); location.hash='aula-'+k; });
      var rs=el('button','exreset'); rs.type='button'; rs.textContent='resetar'; rs.addEventListener('click',function(){ resetPractice(k,false); renderExercicios(); });
      actions.appendChild(go); actions.appendChild(rs);
      row.appendChild(actions);
      box.appendChild(row);
    });
    if(!box.children.length) box.innerHTML='<p style="color:var(--muted);font-size:14px">Nenhum exercício nesta trilha.</p>';
  }
  if($('exbtn')) $('exbtn').addEventListener('click',function(){ renderExercicios(); openPanel('exercicios'); });

  // ---- painéis ----
  var scrim=$('scrim');
  function openPanel(id){ $(id).classList.add('on'); scrim.classList.add('on'); }
  function closePanels(){ document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('on'); }); if($('cedit')) $('cedit').classList.remove('on'); if($('prefs')) $('prefs').classList.remove('on'); if($('welcome')) $('welcome').classList.remove('on'); scrim.classList.remove('on'); }
  scrim.addEventListener('click',closePanels);
  document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',closePanels); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closePanels(); hideTB(); } });
  // atalhos da revisão: espaço/enter revela, 1/2/3 avalia
  document.addEventListener('keydown',function(e){ var rev=$('revisar'); if(!rev||!rev.classList.contains('on')) return; var body=$('revbody'); if(!body) return;
    if(e.key===' '||e.key==='Enter'){ var sb=body.querySelector('.big'); if(sb&&sb.style.display!=='none'){ e.preventDefault(); sb.click(); } return; }
    var m={'1':0,'2':1,'3':2}; if(e.key in m){ var gr=body.querySelector('.grade'); if(gr&&gr.style.display!=='none'){ var bts=gr.querySelectorAll('button'); if(bts[m[e.key]]){ e.preventDefault(); bts[m[e.key]].click(); } } }
  });
  if($('jorbtn')) $('jorbtn').addEventListener('click',function(){ renderJornada(); openPanel('jornada'); });
  if($('revbtn')) $('revbtn').addEventListener('click',openReview);

  // ---- onboarding de 1º uso ----
  function showWelcome(){ if($('welcome')){ $('welcome').classList.add('on'); scrim.classList.add('on'); } }
  if($('helpbtn')) $('helpbtn').addEventListener('click',showWelcome);
  if($('wstart')) $('wstart').addEventListener('click',closePanels);
  if(!state.prefs.onboarded){ showWelcome(); state.prefs.onboarded=true; save(); }

  // ---- editor de cartão (reformular o grifo em pergunta antes de salvar) ----
  var cePending=null;
  function openCardEditor(p){ cePending=p; var sug=(p.blockText||'').replace(p.text,'________'); if($('cefront')) $('cefront').value=sug; if($('ceback')) $('ceback').value=p.text; if($('cedit')){ $('cedit').classList.add('on'); scrim.classList.add('on'); } var cf=$('cefront'); if(cf) setTimeout(function(){ cf.focus(); },30); }
  if($('cesave')) $('cesave').addEventListener('click',function(){ if(!cePending) return; var f=($('cefront').value||'').trim(), bk=($('ceback').value||'').trim(); if(!f||!bk) return; state.aulas[cePending.aula].cards['h'+Date.now()]={ front:f, back:bk, due:today, interval:0, ease:2.5, reps:0, src:'grifo' }; save(); cePending=null; closePanels(); refreshRevn(); });
  if($('cecancel')) $('cecancel').addEventListener('click',closePanels);

  if($('expbtn')) $('expbtn').addEventListener('click',function(){ var b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); var a=el('a'); a.href=URL.createObjectURL(b); var slug=String(CK||'curso').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'curso'; a.download='curso-'+slug+'.json'; a.click(); });
  if($('impbtn')) $('impbtn').addEventListener('click',function(){ $('impfile').click(); });
  if($('impfile')) $('impfile').addEventListener('change',function(e){ var f=e.target.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var parsed=JSON.parse(r.result); if(!parsed||typeof parsed!=='object'||typeof parsed.aulas!=='object') throw new Error('schema inválido'); state=mergeState(state,parsed); save(); location.reload(); }catch(err){ alert('Arquivo inválido.'); } }; r.readAsText(f); });
  if($('resetbtn')) $('resetbtn').addEventListener('click',function(){ if(!confirm('Zerar todo o progresso do curso?')) return; try{ localStorage.removeItem(CK); }catch(e){} location.reload(); });

  // ---- barra de progresso + fundo ----
  var prog=$('prog'), topbar=document.querySelector('.bar');
  function onScroll(){ var h=document.documentElement, max=h.scrollHeight-h.clientHeight; prog.style.transform='scaleX('+(max>0?(h.scrollTop/max):0)+')'; if(topbar) topbar.classList.toggle('scrolled', h.scrollTop>40); }
  document.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  show((location.hash||'#trilha').slice(1));
})();
