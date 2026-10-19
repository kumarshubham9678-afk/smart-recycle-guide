(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORE = 'smartRecyclingGuide.v1';
  const defaults = {sorted:0, points:0, bestScore:0, achievements:[], recent:[], dailyDone:false, gameCount:0};
  function loadState(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch{return {...defaults}}}
  let state=loadState();
  function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}}
  function toast(message){let region=$('.toast-region');if(!region){region=document.createElement('div');region.className='toast-region';region.setAttribute('aria-live','polite');document.body.append(region)}const t=document.createElement('div');t.className='toast';t.textContent=message;region.append(t);setTimeout(()=>t.remove(),3200)}
  function addActivity(label,emoji='♻️'){state.recent.unshift({label,emoji,date:new Date().toLocaleDateString()});state.recent=state.recent.slice(0,8);save()}
  function award(id,label,emoji){if(!state.achievements.includes(id)){state.achievements.push(id);save();toast('Achievement unlocked: '+label+' '+emoji)}}
  function recordSorted(label){state.sorted++;state.points+=2;addActivity('Explored '+label,'♻️');if(state.sorted>=1)award('first','First Sort','🌱');if(state.sorted>=5)award('explorer','Eco Explorer','🧭');save()}
  const tips=[
    'Rinse containers before recycling them, but avoid wasting lots of water.',
    'Keep paper and cardboard dry so they are easier to recycle.',
    'Reuse a sturdy shopping bag before reaching for a disposable one.',
    'Batteries and electronics may need special collection. Keep them out of ordinary bins.',
    'When in doubt, check your local recycling provider instead of wish-cycling.',
    'Reduce and reuse first; recycling is one part of a bigger waste solution.',
    'Separate food scraps for a suitable compost or organic-waste programme if available.'
  ];
  function initTheme(){let theme=localStorage.getItem('srg-theme')||'light';document.documentElement.dataset.theme=theme;let b=$('[data-theme-toggle]');if(b)b.textContent=theme==='dark'?'☀️':'🌙';}
  function toggleTheme(){let next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('srg-theme',next);let b=$('[data-theme-toggle]');if(b)b.textContent=next==='dark'?'☀️':'🌙'}
  function initNav(){const current=location.pathname.split('/').pop()||'index.html';$$('[data-nav]').forEach(a=>{if(a.getAttribute('href')===current){a.classList.add('active');a.setAttribute('aria-current','page')}});const toggle=$('.menu-toggle'),links=$('.nav-links');if(toggle&&links)toggle.addEventListener('click',()=>{let open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'✕':'☰'});const theme=$('[data-theme-toggle]');if(theme)theme.addEventListener('click',toggleTheme);const tip=$('[data-daily-tip]');if(tip){const day=Math.floor(Date.now()/86400000);tip.textContent=tips[day%tips.length]}const year=$('[data-year]');if(year)year.textContent=new Date().getFullYear();}
  const API_BASE = (typeof location !== 'undefined' && location.port === '3000') ? '' : 'http://localhost:3000';
  async function checkApiHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }
  function initAssistant(){const log=$('#chat-log'),form=$('#chat-form'),input=$('#chat-input');if(!log||!form||!input)return;
    const statusNote = $('.chat-shell .status-note');
    const statusLabel = $('.chat-top .small-note');
    checkApiHealth().then(health => {
      if (health?.apiKeyConfigured) {
        if (statusLabel) statusLabel.textContent = '● Gemini AI Connected ✨';
        if (statusNote) statusNote.textContent = '✨ Gemini AI is connected and ready! Ask any recycling or waste sorting question.';
      } else if (health) {
        if (statusLabel) statusLabel.textContent = '● Server Running · Missing API Key';
        if (statusNote) statusNote.textContent = '⚠️ Backend is running, but GEMINI_API_KEY is not configured in server/.env.';
      } else {
        if (statusLabel) statusLabel.textContent = '● Local Demo Mode (Server Offline)';
        if (statusNote) statusNote.textContent = 'ℹ️ Backend server is offline. Using local educational knowledge base. (Run "npm start" to enable Gemini AI).';
      }
    });
    const kb=[
      {keys:['banana peel','banana skin','apple core','food scraps','organic','compost','peel'],name:'Organic / compostable',answer:'🍌 CATEGORY: Organic or compostable waste\nPreparation: Put food scraps in your local food-waste collection or a compost system that accepts them. Avoid adding packaging.\nSafety: Follow your compost provider’s rules; not every system accepts all food waste.'},
      {keys:['pizza box','greasy cardboard','greasy paper'],name:'Paper / cardboard — check condition',answer:'🍕 CATEGORY: Paper and cardboard, with a contamination check\nPreparation: Clean, dry cardboard is often recyclable. Greasy or food-soiled sections may need to be separated and disposed of according to local rules.\nSafety: Do not assume a greasy box is accepted in every paper stream.'},
      {keys:['battery','batteries','lithium'],name:'E-waste / special disposal',answer:'🔋 CATEGORY: Battery collection / special disposal\nPreparation: Keep batteries separate from household rubbish and use an authorised battery drop-off or take-back programme.\nSafety: Do not puncture, crush, dismantle or burn batteries. If a battery is swollen, leaking or hot, avoid handling it and contact local hazardous-waste guidance.'},
      {keys:['plastic bottle','water bottle','pet bottle','empty bottle'],name:'Plastic — local acceptance varies',answer:'🧴 CATEGORY: Plastic recycling, if accepted locally\nPreparation: Empty and rinse the bottle. Check the resin type and local rules; cap instructions vary by provider.\nSafety: Do not put chemical containers into ordinary recycling unless local guidance explicitly allows it.'},
      {keys:['newspaper','paper','magazine'],name:'Paper',answer:'📰 CATEGORY: Paper recycling, where accepted\nPreparation: Keep it clean and dry; remove non-paper items where practical.\nSafety: Wet, greasy or heavily contaminated paper may not be accepted.'},
      {keys:['glass jar','glass bottle','glass'],name:'Glass',answer:'🍾 CATEGORY: Glass collection, where available\nPreparation: Empty and rinse. Check whether your area accepts glass curbside or requires a drop-off.\nSafety: Wrap broken glass securely and follow local instructions; never put loose sharp glass where it could injure someone.'},
      {keys:['charger','phone','laptop','electronics','electronic','e-waste','computer'],name:'Electronic waste',answer:'📱 CATEGORY: E-waste / special collection\nPreparation: Use an authorised e-waste drop-off or retailer take-back programme. Back up and erase personal data on devices where appropriate.\nSafety: Do not dismantle devices or batteries. Keep damaged electronics away from children and follow local collection guidance.'},
      {keys:['chemical','paint','pesticide','cleaner','hazardous'],name:'Household hazardous waste',answer:'⚠️ CATEGORY: Household hazardous waste\nPreparation: Keep it in its original labelled container when safe and follow the product label and local hazardous-waste service instructions.\nSafety: Do not pour unknown chemicals into drains or mix products. Contact your local waste authority for safe collection.'},
      {keys:['clothes','clothing','textile','jeans','shirt'],name:'Textiles',answer:'👕 CATEGORY: Reuse or textile collection\nPreparation: Reuse, donate clean wearable items, or find a textile collection programme. Damaged textiles may have separate rules.\nSafety: Check donation requirements and keep wet or contaminated textiles out of donation bins.'},
      {keys:['light bulb','bulb','fluorescent'],name:'Special disposal',answer:'💡 CATEGORY: Special collection may be required\nPreparation: Identify the bulb type and follow local retailer or hazardous-waste collection guidance.\nSafety: Some bulbs contain hazardous materials and can break easily. Do not dismantle them.'}
    ];
    function respond(q){const text=q.toLowerCase();for(const item of kb){if(item.keys.some(k=>text.includes(k)))return item.answer}if(/hello|hi|hey|thanks/.test(text))return 'Hi, eco-hero! 🌿 I can help with recycling categories, preparation and safe disposal. Try asking about a plastic bottle, pizza box, battery or banana peel.';if(/bin|where.*throw|where.*put|which.*bin|dispose|recycl/.test(text))return 'I can help you narrow it down. What exact item is it made of, and is it clean or contaminated? Local collection rules vary, so check your municipality or waste provider for the final decision.';return 'I’m Eco-Buddy in demo mode, using a local educational knowledge base rather than a live AI model. Try asking about a banana peel, pizza box, plastic bottle, newspaper, battery, electronics or household chemicals.'}
    function bubble(text,who){const b=document.createElement('div');b.className='bubble '+who;b.textContent=text;log.append(b);log.scrollTop=log.scrollHeight}
    async function send(q){
      q=q.trim();if(!q)return;
      bubble(q,'user');input.value='';
      const typing=document.createElement('div');
      typing.className='bubble bot typing';
      typing.setAttribute('aria-label','Eco-Buddy is thinking');
      typing.innerHTML='<i></i><i></i><i></i>';
      log.append(typing);log.scrollTop=log.scrollHeight;
      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: q })
        });
        const data = await res.json().catch(() => null);
        typing.remove();
        if (res.ok && data?.reply) {
          bubble(data.reply, 'bot');
          recordSorted('AI Chat: ' + q.slice(0, 15));
          return;
        }
        if (data?.error) {
          bubble('⚠️ ' + data.error + '\n\n(Local KB answer):\n' + respond(q), 'bot');
          return;
        }
        bubble(respond(q), 'bot');
      } catch (err) {
        typing.remove();
        bubble(respond(q), 'bot');
      }
    }
    form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.prompt)));const clear=$('#clear-chat');if(clear)clear.addEventListener('click',()=>{log.replaceChildren();bubble('Chat cleared! 🌱 What would you like to recycle today?','bot');toast('Chat cleared')});
  }
  const items=[
    {name:'Banana peel',emoji:'🍌',cat:'Organic',detail:'Food scraps may go into an accepted compost or food-waste programme.',prep:'Remove stickers and packaging; use a suitable compost or collection bin.',safe:'Follow your local compost programme rules.'},
    {name:'Apple core',emoji:'🍎',cat:'Organic',detail:'Organic waste, if your collection or compost system accepts it.',prep:'Remove wrappers and stickers.',safe:'Avoid adding it to recycling bins.'},
    {name:'Dry leaves',emoji:'🍂',cat:'Organic',detail:'Often accepted in garden-waste or compost programmes.',prep:'Keep free of plastic and non-organic litter.',safe:'Check local garden-waste rules.'},
    {name:'Newspaper',emoji:'📰',cat:'Paper',detail:'Commonly recyclable when clean and dry.',prep:'Keep dry and remove plastic wrapping.',safe:'Wet or greasy paper may be rejected.'},
    {name:'Cardboard box',emoji:'📦',cat:'Paper',detail:'Often accepted when clean and dry.',prep:'Flatten; remove food-soiled sections and excess packing material.',safe:'Check rules for waxed or coated cardboard.'},
    {name:'Paper envelope',emoji:'✉️',cat:'Paper',detail:'Often recyclable; window and padded envelopes vary.',prep:'Remove plastic padding if separable.',safe:'Check local rules for mixed materials.'},
    {name:'Plastic bottle',emoji:'🧴',cat:'Plastic & Metal',detail:'May be recyclable depending on resin type and local collection.',prep:'Empty and rinse; follow local cap instructions.',safe:'Never use recycling for chemical containers unless explicitly accepted.'},
    {name:'Aluminium can',emoji:'🥫',cat:'Plastic & Metal',detail:'Commonly accepted in metal recycling streams.',prep:'Empty and rinse.',safe:'Handle sharp edges carefully.'},
    {name:'Plastic food tub',emoji:'🥡',cat:'Plastic & Metal',detail:'Acceptance varies by plastic type and provider.',prep:'Scrape clean and check resin/collection rules.',safe:'Black plastics and mixed materials may not be accepted.'},
    {name:'Glass jar',emoji:'🫙',cat:'Glass',detail:'Often recyclable where glass collection is provided.',prep:'Empty and rinse; remove lids if local rules require it.',safe:'Wrap broken glass securely and follow local disposal guidance.'},
    {name:'Glass bottle',emoji:'🍾',cat:'Glass',detail:'May be accepted in a glass bank or curbside programme.',prep:'Empty and rinse.',safe:'Some ceramics, mirrors and heat-resistant glass are not accepted with bottle glass.'},
    {name:'Old battery',emoji:'🔋',cat:'E-waste & Special',detail:'Requires appropriate battery collection in many areas.',prep:'Keep separate and use an authorised drop-off.',safe:'Do not puncture, crush, burn or place loose batteries in ordinary bins.'},
    {name:'Old charger',emoji:'🔌',cat:'E-waste & Special',detail:'Electronic waste; use an authorised e-waste collection service.',prep:'Bundle cables neatly; use retailer take-back if available.',safe:'Do not cut cables or dismantle adapters.'},
    {name:'Mobile phone',emoji:'📱',cat:'E-waste & Special',detail:'Use an authorised e-waste or take-back programme.',prep:'Back up and erase personal data where appropriate.',safe:'Do not remove a built-in battery yourself.'},
    {name:'Light bulb',emoji:'💡',cat:'E-waste & Special',detail:'Rules depend on bulb type; special collection may be needed.',prep:'Identify the bulb type and check local instructions.',safe:'Avoid breakage; some types contain hazardous materials.'},
    {name:'Worn-out T-shirt',emoji:'👕',cat:'Textiles',detail:'Reuse, textile collection or residual waste depending on condition.',prep:'Donate only clean, wearable clothes to suitable services.',safe:'Wet or contaminated textiles should not go in donation bins.'},
    {name:'Old jeans',emoji:'👖',cat:'Textiles',detail:'Textile reuse or recycling programmes may accept them.',prep:'Check programme condition requirements.',safe:'Not all charity donation points accept damaged clothing.'},
    {name:'Leftover paint',emoji:'🎨',cat:'Household Hazardous',detail:'May require a household hazardous-waste service.',prep:'Keep in its labelled container and consult local guidance.',safe:'Do not pour into drains or mix with other chemicals.'},
    {name:'Cleaning chemical',emoji:'🧴',cat:'Household Hazardous',detail:'Follow label and local hazardous-waste instructions.',prep:'Keep in original labelled packaging where safe.',safe:'Never mix unknown products or pour them into drains.'},
    {name:'Greasy pizza box',emoji:'🍕',cat:'Check Local Rules',detail:'Clean cardboard may be recyclable; greasy portions may not be.',prep:'Separate clean sections only if local rules allow.',safe:'Food contamination can spoil a paper recycling batch.'}
  ];
  function initGuide(){const grid=$('#guide-grid');if(!grid)return;const search=$('#guide-search'),filterButtons=$$('[data-filter]'),lookup=$('#bin-lookup'),lookupResult=$('#lookup-result');let filter='All';function render(){const q=(search?.value||'').trim().toLowerCase();const visible=items.filter(x=>(filter==='All'||x.cat===filter)&&(!q||(x.name+' '+x.cat+' '+x.detail).toLowerCase().includes(q)));grid.replaceChildren();visible.forEach(x=>{const card=document.createElement('article');card.className='card material-card';const icon=document.createElement('div');icon.className='material-emoji';icon.textContent=x.emoji;const h=document.createElement('h3');h.textContent=x.name;const tag=document.createElement('span');tag.className='tag';tag.textContent=x.cat;const p=document.createElement('p');p.textContent=x.detail;const b=document.createElement('button');b.className='btn ghost';b.textContent='View disposal steps';b.addEventListener('click',()=>{const detail=document.createElement('div');detail.className='result-panel';detail.textContent='Preparation: '+x.prep+' Safety: '+x.safe;const old=card.querySelector('.result-panel');if(old)old.remove();else card.append(detail);recordSorted(x.name)});card.append(icon,h,tag,p,b);grid.append(card)});if(!visible.length){const e=document.createElement('div');e.className='empty-state';e.textContent='No matching items. Try another search or category.';grid.append(e)}}search?.addEventListener('input',render);filterButtons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;filterButtons.forEach(x=>x.classList.toggle('active',x===b));render()}));if(lookup){lookup.addEventListener('submit',e=>{e.preventDefault();const q=$('#lookup-query').value.trim().toLowerCase();if(!q){toast('Enter an item to look up');return}const found=items.find(x=>x.name.toLowerCase().includes(q));lookupResult.hidden=false;lookupResult.textContent=found?found.emoji+' '+found.name+' — '+found.cat+'. '+found.prep+' Safety: '+found.safe:'No exact match in this demo guide. Search by material and check local collection rules.';if(found)recordSorted(found.name)});}render()}
  function initScanner(){
    const input=$('#scan-file');if(!input)return;
    const preview=$('#scan-preview'),result=$('#scan-result'),identify=$('#identify-waste'),type=$('#scan-type'),error=$('#scan-error');
    let fileUrl='';
    input.addEventListener('change',()=>{
      result.hidden=true;error.hidden=true;
      const f=input.files?.[0];
      if(!f){preview.hidden=true;return}
      if(!f.type.startsWith('image/')){error.textContent='Please select an image file (JPG, PNG, GIF or WebP).';error.hidden=false;input.value='';preview.hidden=true;return}
      if(f.size>8*1024*1024){error.textContent='This image is larger than 8 MB. Choose a smaller image.';error.hidden=false;input.value='';preview.hidden=true;return}
      if(fileUrl)URL.revokeObjectURL(fileUrl);
      fileUrl=URL.createObjectURL(f);
      preview.src=fileUrl;
      preview.alt='Preview of selected waste item';
      preview.hidden=false;
    });

    identify?.addEventListener('click',()=>{
      const f=input.files?.[0];
      if(!f){error.textContent='Upload an image first, then click identify.';error.hidden=false;return}
      error.hidden=true;
      result.hidden=false;
      result.replaceChildren();
      const loading=document.createElement('p');
      loading.className='status-note';
      loading.textContent='Scanning and analyzing image with AI... 🔍';
      result.append(loading);

      const fallback = (noteMsg)=>{
        const item=items.find(x=>x.name===type.value)||items[0];
        result.replaceChildren();
        const h=document.createElement('h3');h.textContent=item.emoji+' '+item.name+' — '+item.cat;
        const p=document.createElement('p');p.textContent=item.detail;
        const prep=document.createElement('p');prep.textContent='Preparation: '+item.prep;
        const safe=document.createElement('p');safe.textContent='Safety: '+item.safe;
        const note=document.createElement('div');note.className='status-note';
        note.textContent=noteMsg || 'Demo classification: this result comes from your selected item type.';
        result.append(h,p,prep,safe,note);
        recordSorted(item.name);
      };

      const reader = new FileReader();
      reader.onload = async ()=>{
        try {
          const res = await fetch(`${API_BASE}/api/scan`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ image: reader.result, mimeType: f.type })
          });
          const data = await res.json().catch(()=>null);
          if(res.ok && data?.category){
            result.replaceChildren();
            const h=document.createElement('h3');h.textContent=(data.name||'Identified Item')+' — '+(data.category||'General');
            const p=document.createElement('p');p.textContent=data.detail||'';
            const prep=document.createElement('p');prep.textContent='Preparation: '+(data.prep||'Clean and sort according to local guidelines.');
            const safe=document.createElement('p');safe.textContent='Safety: '+(data.safe||'Handle with appropriate care.');
            const note=document.createElement('div');note.className='status-note';
            note.textContent='✨ Identified with Gemini Vision AI.';
            result.append(h,p,prep,safe,note);
            recordSorted(data.name || 'AI Scanned Item');
            toast('AI scan complete! ✨');
            return;
          }
          fallback(data?.error ? ('AI unavailable: ' + data.error) : 'Demo classification: selected from list.');
        } catch(err) {
          fallback('Demo classification: backend offline. Start backend with npm start for live AI.');
        }
      };
      reader.onerror = ()=>fallback('Error reading image file.');
      reader.readAsDataURL(f);
    });

    $('#reset-scan')?.addEventListener('click',()=>{input.value='';preview.hidden=true;result.hidden=true;error.hidden=true;if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl='';toast('Scanner reset')});
  }
  function initGame(){const root=$('#game-app');if(!root)return;const bins=[{id:'Organic',label:'Organic',emoji:'🍃'},{id:'Paper',label:'Paper & card',emoji:'📄'},{id:'Plastic & Metal',label:'Plastic & metal',emoji:'🥫'},{id:'Glass',label:'Glass',emoji:'🍾'},{id:'E-waste & Special',label:'E-waste / special',emoji:'🔋'}];const rounds=[
    ['Banana peel','🍌','Organic','Food scraps can go in a suitable compost or food-waste stream.'],
    ['Apple core','🍎','Organic','Organic waste, if accepted by your compost or collection service.'],
    ['Dry leaves','🍂','Organic','Use garden waste or compost collection where available.'],
    ['Newspaper','📰','Paper','Keep paper dry and clean.'],
    ['Clean cardboard','📦','Paper','Flatten clean cardboard and follow local rules.'],
    ['Paper envelope','✉️','Paper','Mixed-material envelopes may need sorting first.'],
    ['Plastic bottle','🧴','Plastic & Metal','Empty and rinse; acceptance depends on local plastic rules.'],
    ['Aluminium can','🥫','Plastic & Metal','Empty and rinse the can.'],
    ['Clean food tub','🥡','Plastic & Metal','Check the plastic type and local collection rules.'],
    ['Glass jar','🫙','Glass','Glass collection varies; check whether jars are accepted.'],
    ['Glass bottle','🍾','Glass','Empty and rinse; do not mix ceramics with bottle glass.'],
    ['Used battery','🔋','E-waste & Special','Use an authorised battery collection point. Never put loose batteries in ordinary bins.'],
    ['Old charger','🔌','E-waste & Special','Take it to an authorised e-waste collection point.'],
    ['Light bulb','💡','E-waste & Special','Bulb type matters; special collection may be needed.'],
    ['Old mobile phone','📱','E-waste & Special','Use authorised e-waste collection and protect personal data.'],
    ['Greasy pizza box','🍕','Paper','This is a tricky item: only clean, dry cardboard sections may be accepted; greasy portions may not be.'],
    ['Plastic shopping bag','🛍️','E-waste & Special','Trick question! It is not e-waste; use a dedicated film collection if available or follow residual-waste rules.'],
    ['Chemical bottle with residue','⚠️','E-waste & Special','Trick question! Treat as special/hazardous disposal, not ordinary recycling. Follow label and local guidance.'],
    ['Worn T-shirt','👕','Paper','Trick question! Textile reuse or collection is preferable; this game’s bins do not include textiles, so check local textile services.']
  ];
  let active=[],index=0,score=0,correct=0,answered=false,time=60,timer=null,muted=true,difficulty='normal';const $g=s=>$(s,root);
  function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
  function stopTimer(){if(timer)clearInterval(timer);timer=null}
  function start(){stopTimer();difficulty=$g('#difficulty').value;time=60;score=0;correct=0;index=0;answered=false;let pool=shuffle(rounds);const count=difficulty==='easy'?15:difficulty==='hard'?19:17;active=pool.slice(0,count);$g('#game-start').hidden=true;$g('#game-finish').hidden=true;$g('#game-play').hidden=false;render();timer=setInterval(()=>{time--; $g('#timer').textContent='⏱ '+time+'s';if(time<=0)finish()},1000)}
  function render(){if(index>=active.length){finish();return}const it=active[index];$g('#item-emoji').textContent=it[1];$g('#item-name').textContent=it[0];$g('#question-number').textContent='ITEM '+(index+1)+' / '+active.length;$g('#score-live').textContent=score;$g('#timer').textContent='⏱ '+time+'s';$g('#progress-fill').style.width=(index/active.length*100)+'%';$g('#feedback').textContent='';$g('#feedback').className='game-feedback';answered=false}
  function answer(cat){if(answered||index>=active.length)return;answered=true;const it=active[index],ok=cat===it[2];if(ok){score+=10;correct++;$g('#feedback').textContent='✅ Correct! '+it[3];$g('#feedback').style.color='var(--green)';if(!muted)beep(700)}else{$g('#feedback').textContent='🌱 Not quite. Best available category: '+it[2]+'. '+it[3];$g('#feedback').style.color='#b66a25';if(!muted)beep(220)}$g('#score-live').textContent=score;$$('.bin-button',root).forEach(b=>b.disabled=true);setTimeout(()=>{if(!$g('#game-play').hidden){$$('.bin-button',root).forEach(b=>b.disabled=false);index++;render()}},1050)}
  function finish(){stopTimer();$g('#game-play').hidden=true;$g('#game-start').hidden=true;$g('#game-finish').hidden=false;const total=index>=active.length?active.length:index+(answered?1:0);$g('#final-score').textContent=score;$g('#final-correct').textContent=correct+' / '+active.length;$g('#final-accuracy').textContent=Math.round(correct/Math.max(1,active.length)*100)+'%';$g('#progress-fill').style.width='100%';state.gameCount++;state.bestScore=Math.max(state.bestScore,score);state.points+=score;addActivity('Finished Waste Quest with '+score+' points','🎯');if(state.bestScore>=30)award('champion','Recycling Champion','🏆');if(state.gameCount>=1)award('first-game','First Quest','🎮');if(state.gameCount>=3)award('quest-pro','Eco Explorer','🧭');save();toast('Game finished! Your score has been saved.')}
  function beep(freq){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.value=.05;o.start();o.stop(c.currentTime+.08);o.onended=()=>c.close()}catch{}}
  $g('#start-game')?.addEventListener('click',start);$g('#replay-game')?.addEventListener('click',start);$g('#back-game')?.addEventListener('click',()=>{stopTimer();$g('#game-finish').hidden=true;$g('#game-play').hidden=true;$g('#game-start').hidden=false});$g('#mute-toggle')?.addEventListener('click',e=>{muted=!muted;e.currentTarget.textContent=muted?'🔇 Sound off':'🔊 Sound on';if(!muted)beep(520)});$g('#bins')?.addEventListener('click',e=>{const b=e.target.closest('[data-bin]');if(b)answer(b.dataset.bin)});document.addEventListener('keydown',e=>{if($g('#game-play').hidden)return;const map={'1':'Organic','2':'Paper','3':'Plastic & Metal','4':'Glass','5':'E-waste & Special'};if(map[e.key])answer(map[e.key])});}
  function initDashboard(){if(!$('#dashboard-app'))return;$('#dash-sorted').textContent=state.sorted;$('#dash-points').textContent=state.points;$('#dash-best').textContent=state.bestScore;$('#dash-games').textContent=state.gameCount;$('#progress-label').textContent=Math.min(100,Math.round(state.sorted/20*100))+'%';$('#dashboard-progress').style.width=Math.min(100,state.sorted/20*100)+'%';const recent=$('#recent-activity');recent.replaceChildren();if(!state.recent.length){const e=document.createElement('div');e.className='empty-state';e.innerHTML='<div class="emoji">🌱</div><p>No activity yet. Explore the guide, scan an item or play Waste Quest to get started.</p><a class="btn" href="guide.html">Explore recycling guide</a>';recent.append(e)}else state.recent.forEach(a=>{const row=document.createElement('div');row.className='activity-row';const icon=document.createElement('div');icon.className='activity-emoji';icon.textContent=a.emoji;const txt=document.createElement('div');const p=document.createElement('p');p.textContent=a.label;const small=document.createElement('small');small.className='small-note';small.textContent=a.date;txt.append(p,small);row.append(icon,txt);recent.append(row)});$$('[data-achievement]').forEach(a=>{if(state.achievements.includes(a.dataset.achievement))a.classList.add('unlocked')});const check=$('#daily-check');if(check){check.checked=state.dailyDone;check.addEventListener('change',()=>{if(check.checked&&!state.dailyDone){state.dailyDone=true;state.points+=5;addActivity('Completed daily eco challenge','🌞');save();toast('Daily challenge complete! +5 eco-points')}else if(!check.checked&&state.dailyDone){state.dailyDone=false;state.points=Math.max(0,state.points-5);save()}initDashboard()})}$('#reset-progress')?.addEventListener('click',()=>{if(confirm('Reset all local progress, scores and achievements on this device? This cannot be undone.')){state={...defaults};save();toast('Progress reset');location.reload()}})}
  function initHome(){const btn=$('#new-tip');if(btn)btn.addEventListener('click',()=>{const tip=$('[data-daily-tip]');const day=Math.floor(Math.random()*tips.length);tip.textContent=tips[day];toast('Here is another eco tip!')})}
  document.addEventListener('DOMContentLoaded',()=>{initTheme();initNav();initAssistant();initGuide();initScanner();initGame();initDashboard();initHome()});
})();
