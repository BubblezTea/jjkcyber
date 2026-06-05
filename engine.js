const Engine = {
  
  updateUI() {
    document.getElementById('ui-name').innerText = `${State.firstName} ${State.lastName}`;
    
    const yrs = Math.floor(State.ageMonths / 12);
    const mos = State.ageMonths % 12;
    document.getElementById('ui-age').innerText = `${yrs} yrs ${mos} mo`;
    document.getElementById('ui-yen').innerText = `¥${State.yen.toLocaleString()}`;
    document.getElementById('ui-grade').innerText = `Grade ${State.grade}`;
    document.getElementById('ui-karma').innerText = State.karma;
    
    State.maxHp = 100 + (State.end * 5);
    document.getElementById('ui-hp-fill').style.width = `${Math.max(0, (State.hp/State.maxHp)*100)}%`;
    document.getElementById('ui-hp-txt').innerText = `${Math.floor(State.hp)}/${State.maxHp}`;
    
    document.getElementById('ui-ce-fill').style.width = `${Math.max(0, (State.ce/State.maxCe)*100)}%`;
    document.getElementById('ui-ce-txt').innerText = `${Math.floor(State.ce)}/${State.maxCe}`;
    
    document.getElementById('ui-str').innerText = State.str;
    document.getElementById('ui-spd').innerText = State.spd;
    document.getElementById('ui-end').innerText = State.end;
    document.getElementById('ui-mst').innerText = State.mst;
    
    this.renderNPCs();
  },

  log(msg, type='evt') {
    const tl = document.getElementById('ui-timeline');
    const yrs = Math.floor(State.ageMonths / 12);
    tl.insertAdjacentHTML('afterbegin', `
      <div class="log-entry ${type}">
        <span class="age-tag">Age ${yrs}</span>
        ${msg}
      </div>
    `);
  },

  renderNPCs() {
    const box = document.getElementById('ui-npcs');
    box.innerHTML = '';
    State.npcs.forEach(n => {
      let color = 'var(--text-dim)';
      if(n.rel > 50) color = 'var(--green)';
      if(n.rel < -50) color = 'var(--red)';
      
      box.insertAdjacentHTML('beforeend', `
        <div class="npc-card">
          <span>${n.name}</span>
          <span style="color:${color};">${n.rel > 0 ? '+'+n.rel : n.rel}</span>
        </div>
      `);
    });
  },

  passTime() {
    if(Combat.active) return;
    
    const months = parseInt(document.getElementById('timeSlider').value);
    State.ageMonths += months;
    
    // Passive regeneration and decay
    State.hp = Math.min(State.maxHp, State.hp + (10 * months));
    State.ce = Math.min(State.maxCe, State.ce + (20 * months));
    
    // NPC relationship decay
    State.npcs.forEach(n => {
      if(n.rel > 0) n.rel = Math.max(0, n.rel - (1 * months));
      if(n.rel < 0) n.rel = Math.min(0, n.rel + (1 * months));
    });

    // Generate random NPC occasionally
    if(Math.random() < 0.3) {
      const newNpc = {
        name: `${FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)]}`,
        rel: Math.floor(Math.random() * 40) - 20
      };
      State.npcs.push(newNpc);
      if(State.npcs.length > 10) State.npcs.shift(); // Keep UI clean
      this.log(`You met a sorcerer named ${newNpc.name}.`, 'sys');
    }

    // Process Events
    const yrs = Math.floor(State.ageMonths / 12);
    let validEvents = EVENT_POOL.filter(e => 
      yrs >= e.minAge && yrs <= e.maxAge && 
      State.mst >= e.mstReq && State.str >= e.strReq
    );

    if(validEvents.length > 0) {
      // Pick 1 random valid event
      const evt = validEvents[Math.floor(Math.random() * validEvents.length)];
      
      State.maxCe += evt.ce;
      State.mst += evt.mst;
      State.str += evt.str;
      State.spd += evt.spd;
      State.end += evt.end;
      State.yen += evt.yen;
      
      let statTxt = [];
      if(evt.ce) statTxt.push(`+${evt.ce} CE`);
      if(evt.mst) statTxt.push(`+${evt.mst} MST`);
      if(evt.str) statTxt.push(`+${evt.str} STR`);
      if(evt.yen) statTxt.push(`+¥${evt.yen.toLocaleString()}`);
      
      const statSpan = statTxt.length > 0 ? `<div style="font-size:10px; color:var(--cyan); margin-top:4px;">[ ${statTxt.join(' | ')} ]</div>` : '';
      
      this.log(`${evt.text} ${statSpan}`, 'evt');

      if(evt.combat) {
        setTimeout(() => Combat.start(evt.combat), 500);
      }
    } else {
      this.log(`Months passed uneventfully...`, 'sys');
    }

    // Grade promotion logic
    if(State.grade > 1) {
      if(State.str + State.mst > (6 - State.grade) * 20) {
        State.grade--;
        this.log(`PROMOTION: You have been evaluated as a Grade ${State.grade} Sorcerer!`, 'sys');
        State.yen += 100000;
      }
    }

    this.updateUI();
  }
};