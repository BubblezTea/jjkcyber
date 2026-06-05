// --- MASSIVE DATA EXPANSION ---
const CLANS = {
    random: { name: "Random / Unknown Origin", cost: 0, desc: "No predefined lineage. Fate will decide." },
    zenin: { name: "Zenin Clan", cost: 25, desc: "Elite physical prowess and strict martial traditions." },
    gojo: { name: "Gojo Clan", cost: 40, desc: "Immense cursed energy, descendants of Sugawara no Michizane." },
    kamo: { name: "Kamo Clan", cost: 20, desc: "Traditionalists specializing in blood manipulation and mastery." },
    inumaki: { name: "Inumaki Clan", cost: 15, desc: "Bearers of the snake and fangs seal. Fragile bodies, lethal voices." },
    sugawara: { name: "Sugawara Lineage", cost: 35, desc: "One of the Three Great Vengeful Spirits' bloodlines. Massive CE pools." },
    abe: { name: "Abe Clan", cost: 25, desc: "Masters of barriers and deep jujutsu sorcery." },
    fujiwara: { name: "Fujiwara Clan", cost: 20, desc: "Aristocratic sorcerers with vast political and cursed resources." },
    itadori: { name: "Itadori Lineage", cost: 30, desc: "Anomalous genetic structure. Superhuman physicals naturally." },
    fushiguro: { name: "Fushiguro Family", cost: 20, desc: "An offshoot bearing lethal potential and hidden shadows." },
    hoshi: { name: "Hoshi Clan", cost: 15, desc: "Star-gazers and masters of spatial distortion techniques." },
    ashyia: { name: "Ashiya Clan", cost: 15, desc: "Masters of simple domains and anti-domain techniques." }
};

const TECHNIQUES = {
    random: { name: "Natural Awakening (Random)", cost: 0 },
    blood: { name: "Blood Manipulation", cost: 15 },
    shadow: { name: "Ten Shadows", cost: 25 },
    ratio: { name: "Ratio Technique", cost: 10 },
    speech: { name: "Cursed Speech", cost: 15 },
    shrine: { name: "Shrine", cost: 30 },
    limitless: { name: "Limitless", cost: 35 },
    boogie: { name: "Boogie Woogie", cost: 10 },
    idle: { name: "Idle Transfiguration", cost: 30 },
    star: { name: "Star Rage", cost: 25 },
    straw: { name: "Straw Doll Technique", cost: 10 },
    projection: { name: "Projection Sorcery", cost: 20 },
    disaster_flames: { name: "Disaster Flames", cost: 25 },
    disaster_tides: { name: "Disaster Tides", cost: 25 },
    disaster_plants: { name: "Disaster Plants", cost: 25 },
    construction: { name: "Construction", cost: 30 },
    ice: { name: "Ice Formation", cost: 20 },
    sky: { name: "Sky Manipulation", cost: 20 },
    seance: { name: "Seance Technique", cost: 15 },
    tool: { name: "Tool Manipulation", cost: 5 },
    comedian: { name: "Comedian", cost: 35 },
    copy: { name: "Copy", cost: 40 }
};

// --- STATE MANAGEMENT ---
const basePts = 100;
let isGodMode = false;
let isCustomClan = false;
let isCustomTech = false;

let st = {
    name: 'Subject-001',
    height: 170,
    weight: 65,
    clan: 'random',
    tech: 'random',
    pts: basePts
};

const el = id => document.getElementById(id);

// Populate Dropdowns dynamically
function initDropdowns() {
    const clanSelect = el('skbClan');
    const techSelect = el('skbTech');
    
    clanSelect.innerHTML = '';
    for (const [key, data] of Object.entries(CLANS)) {
        clanSelect.innerHTML += `<option value="${key}">${data.name} ${data.cost > 0 ? `(-${data.cost} PTS)` : '(0 PTS)'}</option>`;
    }
    
    techSelect.innerHTML = '';
    for (const [key, data] of Object.entries(TECHNIQUES)) {
        techSelect.innerHTML += `<option value="${key}">${data.name} ${data.cost > 0 ? `(-${data.cost} PTS)` : '(0 PTS)'}</option>`;
    }
}

// --- KONAMI CODE ENGINE ---
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a','Enter'];
let kIdx = 0;
document.addEventListener('keydown', e => {
    if (el('screen-create').style.display !== 'none') {
        if (e.key === konami[kIdx]) {
            kIdx++;
            if (kIdx === konami.length) {
                isGodMode = true; 
                el('screen-create').classList.add('god-mode-flash');
                setTimeout(() => el('screen-create').classList.remove('god-mode-flash'), 500);
                el('godModeLabel').innerHTML = "<span style='color:var(--red);'>[ROOT ACCESS] INFINITE POINTS GRANTED</span>";
                kIdx = 0; onChange();
            }
        } else { kIdx = 0; }
    }
});

// --- UI TOGGLES ---
window.toggleCustom = function(type, isCustom) {
    if(type === 'clan') {
        isCustomClan = isCustom;
        el('panel-predef-clan').style.display = isCustom ? 'none' : 'block';
        el('panel-custom-clan').style.display = isCustom ? 'block' : 'none';
        el('btn-custom-clan').classList.toggle('active-tab-btn', isCustom);
        el('btn-predef-clan').classList.toggle('active-tab-btn', !isCustom);
    } else {
        isCustomTech = isCustom;
        el('panel-predef-tech').style.display = isCustom ? 'none' : 'block';
        el('panel-custom-tech').style.display = isCustom ? 'block' : 'none';
        el('btn-custom-tech').classList.toggle('active-tab-btn', isCustom);
        el('btn-predef-tech').classList.toggle('active-tab-btn', !isCustom);
    }
    onChange();
};

// --- LOGIC ---
function readVesselState() {
    st.name = el('skbName').value.trim();
    st.height = parseInt(el('skbHeight').value) || 170;
    st.weight = parseInt(el('skbWeight').value) || 65;
    
    if(isGodMode) { st.pts = 999999; return; }

    let p = basePts;
    
    if(isCustomClan) p -= 25;
    else { st.clan = el('skbClan').value; p -= CLANS[st.clan].cost; }

    if(isCustomTech) p -= 30;
    else { st.tech = el('skbTech').value; p -= TECHNIQUES[st.tech].cost; }
    
    // Extreme physical deductions
    if(st.height > 190 || st.height < 150) p -= 10;
    if(st.weight > 90 || st.weight < 50) p -= 10;
    
    st.pts = p;
}

function validateVessel() {
    if(st.name.length < 2) return { ok: false, msg: 'DESIGNATION TOO SHORT' };
    if(isCustomClan && el('customClanName').value.trim().length < 2) return { ok: false, msg: 'CLAN NAME REQUIRED' };
    if(isCustomTech && el('customTechName').value.trim().length < 2) return { ok: false, msg: 'TECHNIQUE NAME REQUIRED' };
    if(st.pts < 0 && !isGodMode) return { ok: false, msg: 'INSUFFICIENT ALLOCATION POINTS' };
    return { ok: true, msg: '✓ MATRIX STABLE — READY TO AWAKEN' };
}

function updateVisuals() {
    el('skbHeightVal').innerText = st.height;
    el('skbWeightVal').innerText = st.weight;
    
    let hHint = "Average height."; if(st.height > 190) hHint = "Towering. Increased STR. (-10 PTS)"; else if(st.height < 150) hHint = "Compact. Increased Evasion. (-10 PTS)";
    el('skbHeightHint').innerText = hHint;
    
    let wHint = "Average weight."; if(st.weight > 90) wHint = "Heavy build. Increased HP. (-10 PTS)"; else if(st.weight < 50) wHint = "Light build. Increased SPD. (-10 PTS)";
    el('skbWeightHint').innerText = wHint;
    
    if(!isCustomClan) {
        el('skbClanHint').innerText = CLANS[st.clan].desc;
    }

    const pDisplay = el('skbPoints');
    pDisplay.innerText = st.pts;
    if(st.pts < 0 && !isGodMode) pDisplay.classList.add('error'); else pDisplay.classList.remove('error');
}

function renderPreview() {
    const prevEl = el('skbPreviewArea');
    const validLine = el('skbValidLine');
    const btn = el('skbForgeBtn');
    
    const v = validateVessel();
    btn.disabled = !v.ok;
    validLine.textContent = v.msg;
    validLine.className = 'skb-valid-line ' + (v.ok ? 'ok' : 'err');

    let hp = 100 + (st.weight - 65);
    let str = 10 + Math.floor((st.height - 170)/5);
    let spd = 10 - Math.floor((st.weight - 65)/5);
    let ce = 50; let mst = 5;

    let cName = isCustomClan ? (el('customClanName').value || 'UNNAMED CLAN') : CLANS[st.clan].name;
    let tName = isCustomTech ? (el('customTechName').value || 'SYNTHESIZED ART') : TECHNIQUES[st.tech].name;

    // Apply some logic to preview stats based on clan
    if(!isCustomClan) {
        if(st.clan === 'gojo' || st.clan === 'sugawara') { ce += 100; mst += 20; }
        if(st.clan === 'zenin' || st.clan === 'itadori') { hp += 30; str += 20; spd += 15; }
    } else {
        let trait = el('customClanTrait').value;
        if(trait === 'hp_ce') { hp += 30; ce += 30; }
        if(trait === 'str_spd') { str += 10; spd += 10; }
        if(trait === 'mst') { mst += 20; }
    }

    prevEl.innerHTML = `
    <div class="skb-prev-card">
      <div class="skb-prev-top">
        <span class="skb-prev-name">${st.name || '[ UNNAMED ]'}</span>
        <span class="skb-prev-scale">${cName.toUpperCase()}</span>
      </div>
      <div class="skb-prev-desc">Projected physicals and baseline cursed energy reading prior to trait awakening.</div>
      <div class="skb-prev-stats">
        <div class="skb-prev-stat"><span class="skb-ps-lbl">HP</span><span class="skb-ps-val lit">${hp}</span></div>
        <div class="skb-prev-stat"><span class="skb-ps-lbl">CE</span><span class="skb-ps-val lit">${ce}</span></div>
        <div class="skb-prev-stat"><span class="skb-ps-lbl">STR</span><span class="skb-ps-val">${str}</span></div>
        <div class="skb-prev-stat"><span class="skb-ps-lbl">SPD</span><span class="skb-ps-val">${spd}</span></div>
      </div>
      <div class="skb-prev-fx">
        <span style="font-size:18px;">🔮</span>
        <div style="display:flex; flex-direction:column; gap:2px;">
           <span class="skb-prev-fx-name">${tName.toUpperCase()}</span>
           <span style="font-size:9px; color:var(--text-lo);">PROJECTED INNATE TECHNIQUE</span>
        </div>
      </div>
      <div class="skb-prev-scanline"></div>
    </div>`;
}

function onChange() {
    readVesselState();
    updateVisuals();
    renderPreview();
}

function forgeVessel() {
    if(!validateVessel().ok) return;
    el('forgeIcon').innerText = '✓';
    el('forgeText').innerText = 'AWAKENING...';
    el('skbForgeBtn').classList.add('success');
    
    setTimeout(() => {
        el('screen-create').style.display = 'none';
        el('screen-game').classList.add('active');
    }, 800);
}

// Init
initDropdowns();
const inputs = ['skbName', 'skbHeight', 'skbWeight', 'skbClan', 'skbTech', 'customClanName', 'customClanTrait', 'customTechName', 'customTechTrait'];
inputs.forEach(id => el(id).addEventListener('input', onChange));
el('skbForgeBtn').addEventListener('click', forgeVessel);

onChange();