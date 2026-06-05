const Forge = {
  blocks: [],
  blockId: 0,

  init() {
    document.getElementById('fClanType').addEventListener('change', this.onClanChange);
    document.getElementById('timeSlider').addEventListener('input', e => {
      document.getElementById('timeVal').innerText = e.target.value;
    });
    
    // Sliders
    ['fCeFlat','fCePerc','fStr','fSpd','fEnd','fMst'].forEach(id => {
      document.getElementById(id).addEventListener('input', e => {
        let val = e.target.value;
        if(id==='fCePerc') val += '%';
        document.getElementById(id.replace('f', 'v')).innerText = val;
      });
    });

    document.getElementById('btn-awaken').addEventListener('click', this.awaken);
    
    // Initial validation loop
    setInterval(this.validate, 500);
  },

  onClanChange(e) {
    const val = e.target.value;
    const box = document.getElementById('custom-clan-box');
    box.style.display = val === 'custom' ? 'flex' : 'none';
  },

  addAtomic(type) {
    this.blockId++;
    const id = this.blockId;
    let content = '';

    if(type === 'damage') content = `<label>DMG</label><input type="number" id="ab-val-${id}" value="20" style="width:60px;"> <label>TYPE</label><select id="ab-dtype-${id}"><option value="physical">Physical</option><option value="cursed">Cursed Energy</option></select>`;
    if(type === 'heal') content = `<label>HEAL</label><input type="number" id="ab-val-${id}" value="25" style="width:60px;"> <label>TARGET</label><select id="ab-tgt-${id}"><option value="self">Self</option></select>`;
    if(type === 'buff' || type === 'debuff') content = `<label>STAT</label><select id="ab-stat-${id}"><option value="str">STR</option><option value="spd">SPD</option><option value="end">END</option></select> <label>AMT</label><input type="number" id="ab-val-${id}" value="5" style="width:60px;"> <label>DUR(T)</label><input type="number" id="ab-dur-${id}" value="3" style="width:50px;">`;
    if(type === 'stun') content = `<label>SKIP TURNS</label><input type="number" id="ab-val-${id}" value="1" style="width:50px;" disabled>`;
    if(type === 'domain') content = `<label>SURE-HIT BUFF</label><input type="text" value="Active" disabled style="width:60px;"> <label>DUR(T)</label><input type="number" id="ab-dur-${id}" value="3" style="width:50px;">`;

    const html = `
      <div class="atomic-block" id="ab-${id}" data-type="${type}">
        <button class="del-btn" onclick="Forge.remAtomic(${id})">✕</button>
        <div style="font-size:12px; color:var(--cyan); font-weight:bold;">${type.toUpperCase()}</div>
        <div class="atomic-row">${content}</div>
      </div>
    `;
    
    document.getElementById('atomic-blocks').insertAdjacentHTML('beforeend', html);
    this.blocks.push({ id, type });
  },

  remAtomic(id) {
    document.getElementById(`ab-${id}`).remove();
    this.blocks = this.blocks.filter(b => b.id !== id);
  },

  validate() {
    const fn = document.getElementById('fName').value.trim();
    const tn = document.getElementById('fTechName').value.trim();
    const valid = fn.length > 0 && tn.length > 0 && Forge.blocks.length > 0;
    document.getElementById('btn-awaken').disabled = !valid;
  },

  awaken() {
    // 1. Setup Identity
    State.firstName = document.getElementById('fName').value.trim();
    const clanType = document.getElementById('fClanType').value;
    
    if(clanType === 'none') {
      State.lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    } else if(clanType === 'custom') {
      State.lastName = document.getElementById('fCustomClanName').value.trim() || 'Unknown';
      State.bloodlineTrait = document.getElementById('fClanTrait').value.trim();
      State.maxCe += parseInt(document.getElementById('fCeFlat').value);
      State.maxCe = Math.floor(State.maxCe * (parseInt(document.getElementById('fCePerc').value)/100));
      State.str += parseInt(document.getElementById('fStr').value);
      State.spd += parseInt(document.getElementById('fSpd').value);
      State.end += parseInt(document.getElementById('fEnd').value);
      State.mst += parseInt(document.getElementById('fMst').value);
    } else {
      State.lastName = clanType.charAt(0).toUpperCase() + clanType.slice(1);
      if(clanType === 'zenin') { State.str+=5; State.spd+=5; }
      if(clanType === 'gojo') { State.maxCe+=200; State.mst+=10; State.bloodlineTrait="Six Eyes (Dormant)"; }
      if(clanType === 'kamo') { State.mst+=5; State.end+=5; }
    }
    
    State.clan = State.lastName;
    State.hp = State.maxHp = 100 + (State.end * 5);
    State.ce = State.maxCe;

    // 2. Setup Technique
    const skill = {
      name: document.getElementById('fTechName').value.trim(),
      desc: document.getElementById('fTechDesc').value.trim(),
      cost: parseInt(document.getElementById('fTechCost').value),
      cd: parseInt(document.getElementById('fTechCd').value),
      currentCd: 0,
      effects: []
    };

    Forge.blocks.forEach(b => {
      const type = b.type;
      const valEl = document.getElementById(`ab-val-${b.id}`);
      const statEl = document.getElementById(`ab-stat-${b.id}`);
      const durEl = document.getElementById(`ab-dur-${b.id}`);
      
      skill.effects.push({
        type: type,
        value: valEl ? parseInt(valEl.value) : 0,
        stat: statEl ? statEl.value : null,
        duration: durEl ? parseInt(durEl.value) : 0
      });
    });

    State.techniques.push(skill);
    
    // Baseline Basic Attack
    State.techniques.push({
      name: "Cursed Strike",
      desc: "A basic physical blow enhanced with CE.",
      cost: 5, cd: 0, currentCd: 0,
      effects: [{ type: "damage", value: 10, stat: null, duration: 0 }]
    });

    // 3. Transition UI
    document.getElementById('screen-forge').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    Engine.updateUI();
    Engine.log(`Initialization complete. Vessel ${State.firstName} ${State.lastName} has awakened.`, 'sys');
  }
};

window.onload = () => Forge.init();