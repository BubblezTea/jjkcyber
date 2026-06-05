const Combat = {
  active: false,
  turnOrder: [],
  enemy: null,
  playerObj: null,

  start(enemyGradeStr) {
    this.active = true;
    
    // Procedural Enemy Gen
    const isRival = enemyGradeStr === 'rival';
    const gradeNum = isRival ? State.grade : parseInt(enemyGradeStr);
    
    const hpBase = isRival ? 150 : (5 - gradeNum) * 100;
    const statBase = isRival ? State.str : (5 - gradeNum) * 8;

    this.enemy = {
      id: 'enemy',
      name: isRival ? `${FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)]} (Rival)` : `Grade ${gradeNum} Curse`,
      hp: hpBase, maxHp: hpBase,
      str: statBase, spd: statBase, end: statBase,
      status: [],
      domainActive: false
    };

    this.playerObj = {
      id: 'player',
      hp: State.hp, maxHp: State.maxHp,
      ce: State.ce, maxCe: State.maxCe,
      str: State.str, spd: State.spd, end: State.end, mst: State.mst,
      status: [],
      domainActive: false
    };

    document.getElementById('combat-overlay').classList.add('active');
    document.getElementById('cb-enemy-name').innerText = this.enemy.name;
    document.getElementById('combat-log').innerHTML = '';
    
    this.log(`Combat engaged against ${this.enemy.name}!`, 'sys');
    this.updateUI();
    this.calcTurnOrder();
  },

  log(msg, cls = 'sys') {
    const el = document.getElementById('combat-log');
    el.insertAdjacentHTML('beforeend', `<div class="cl-line ${cls}">${msg}</div>`);
    el.scrollTop = el.scrollHeight;
  },

  updateUI() {
    const p = this.playerObj;
    const e = this.enemy;
    
    // Player
    document.getElementById('cb-player-name').innerText = `${State.firstName} ${State.lastName}`;
    document.getElementById('cb-player-hp-f').style.width = `${Math.max(0, (p.hp/p.maxHp)*100)}%`;
    document.getElementById('cb-player-hp-t').innerText = `${Math.floor(p.hp)}/${p.maxHp}`;
    document.getElementById('cb-player-ce-f').style.width = `${Math.max(0, (p.ce/p.maxCe)*100)}%`;
    document.getElementById('cb-player-ce-t').innerText = `${Math.floor(p.ce)}/${p.maxCe}`;
    
    // Enemy
    document.getElementById('cb-enemy-hp-f').style.width = `${Math.max(0, (e.hp/e.maxHp)*100)}%`;
    document.getElementById('cb-enemy-hp-t').innerText = `${Math.floor(e.hp)}/${e.maxHp}`;

    // Status rendering
    const rStat = arr => arr.map(s => `<span class="status-chip" style="border-color:var(--cyan); color:var(--cyan);">${s.type.toUpperCase()}(${s.dur})</span>`).join('');
    document.getElementById('cb-player-status').innerHTML = rStat(p.status);
    document.getElementById('cb-enemy-status').innerHTML = rStat(e.status);

    // Skills
    const actBox = document.getElementById('combat-actions');
    actBox.innerHTML = '';
    State.techniques.forEach((sk, idx) => {
      const canCast = p.ce >= sk.cost && sk.currentCd === 0;
      actBox.insertAdjacentHTML('beforeend', `
        <button class="c-skill-btn" ${canCast ? '' : 'disabled'} onclick="Combat.playerAct(${idx})">
          <span class="c-skill-name">${sk.name}</span>
          <span class="c-skill-meta">${sk.cost} CE | ${sk.currentCd > 0 ? sk.currentCd+' CD' : 'READY'}</span>
        </button>
      `);
    });
  },

  calcTurnOrder() {
    const pSpd = this.getStat(this.playerObj, 'spd');
    const eSpd = this.getStat(this.enemy, 'spd');
    this.turnOrder = pSpd >= eSpd ? ['player', 'enemy'] : ['enemy', 'player'];
    this.processTurn();
  },

  getStat(entity, statName) {
    let base = entity[statName];
    entity.status.forEach(s => {
      if(s.type === 'buff' && s.stat === statName) base += s.value;
      if(s.type === 'debuff' && s.stat === statName) base -= s.value;
    });
    return base;
  },

  processTurn() {
    if(!this.active) return;
    
    const currentId = this.turnOrder[0];
    const currentEnt = currentId === 'player' ? this.playerObj : this.enemy;
    
    document.getElementById('combat-turn-display').innerText = `TURN: ${currentEnt === this.playerObj ? 'PLAYER' : 'ENEMY'}`;

    // Tick Statuses
    let skip = false;
    currentEnt.status.forEach(s => {
      if(s.type === 'stun') skip = true;
      s.dur--;
    });
    currentEnt.status = currentEnt.status.filter(s => s.dur > 0);
    if(currentEnt.domainActive) {
      const dom = currentEnt.status.find(s=>s.type === 'domain');
      if(!dom) {
        currentEnt.domainActive = false;
        document.getElementById('combat-overlay').classList.remove('domain-active');
        this.log(`${currentEnt === this.playerObj ? State.firstName : this.enemy.name}'s Domain collapsed.`, 'sys');
      }
    }

    // Cooldown ticks for player
    if(currentId === 'player') {
      State.techniques.forEach(sk => { if(sk.currentCd > 0) sk.currentCd--; });
    }
    
    this.updateUI();

    if(skip) {
      this.log(`${currentId === 'player' ? 'You are' : 'Enemy is'} stunned and skips the turn!`, 'dmg');
      this.nextTurn();
      return;
    }

    if(currentId === 'enemy') {
      setTimeout(() => this.enemyAct(), 1000);
    }
  },

  playerAct(skillIdx) {
    const sk = State.techniques[skillIdx];
    this.playerObj.ce -= sk.cost;
    sk.currentCd = sk.cd;
    
    this.log(`You used <span class="txt-cyan">[${sk.name}]</span>!`, 'sys');
    this.executeEffects(this.playerObj, this.enemy, sk.effects);
    this.checkWin();
  },

  enemyAct() {
    if(!this.active) return;
    
    const dmg = Math.floor(this.getStat(this.enemy, 'str') * 1.5);
    this.log(`The ${this.enemy.name} attacks!`, 'sys');
    
    // Dodge calc
    const dodgeChance = Math.max(0, (this.getStat(this.playerObj, 'spd') - this.getStat(this.enemy, 'spd')) * 2);
    if(Math.random()*100 < dodgeChance && !this.enemy.domainActive) {
      this.log(`You dodged the attack!`, 'heal');
    } else {
      const def = this.getStat(this.playerObj, 'end');
      const finalDmg = Math.max(1, dmg - Math.floor(def * 0.5));
      this.playerObj.hp -= finalDmg;
      this.log(`You took ${finalDmg} damage!`, 'dmg');
    }
    this.checkWin();
  },

  executeEffects(caster, target, effects) {
    effects.forEach(eff => {
      // Domain guaranteed hit logic wrapper
      const isSureHit = caster.domainActive;
      
      if(eff.type === 'damage') {
        let base = eff.value + Math.floor(this.getStat(caster, 'str') * 0.5) + Math.floor(this.getStat(caster, 'mst') * 0.5);
        let evade = Math.max(0, (this.getStat(target, 'spd') - this.getStat(caster, 'spd')) * 2);
        if(isSureHit) evade = 0;
        
        if(Math.random()*100 < evade) {
          this.log(`${target === this.enemy ? target.name : 'You'} dodged the technique!`, 'sys');
        } else {
          // Crit
          let isCrit = Math.random() < 0.1;
          if(isCrit) base = Math.floor(base * 2.5);
          
          let def = this.getStat(target, 'end');
          let fDmg = Math.max(1, base - Math.floor(def * 0.5));
          target.hp -= fDmg;
          this.log(`Dealt ${fDmg} damage! ${isCrit?'<span class="txt-red">BLACK FLASH!</span>':''}`, 'dmg');
        }
      }
      if(eff.type === 'heal') {
        let amt = eff.value + this.getStat(caster, 'mst');
        caster.hp = Math.min(caster.maxHp, caster.hp + amt);
        this.log(`Restored ${amt} HP.`, 'heal');
      }
      if(eff.type === 'buff') {
        caster.status.push({ type: 'buff', stat: eff.stat, value: eff.value, dur: eff.duration });
        this.log(`Buffed ${eff.stat.toUpperCase()} by ${eff.value} for ${eff.duration}T.`, 'heal');
      }
      if(eff.type === 'debuff') {
        let evade = Math.max(0, (this.getStat(target, 'spd') - this.getStat(caster, 'spd')) * 2);
        if(isSureHit) evade = 0;
        if(Math.random()*100 > evade) {
          target.status.push({ type: 'debuff', stat: eff.stat, value: eff.value, dur: eff.duration });
          this.log(`Debuffed target ${eff.stat.toUpperCase()} by ${eff.value} for ${eff.duration}T.`, 'dmg');
        }
      }
      if(eff.type === 'stun') {
        if(isSureHit || Math.random() > 0.5) {
          target.status.push({ type: 'stun', dur: eff.value });
          this.log(`Target stunned!`, 'dmg');
        }
      }
      if(eff.type === 'domain') {
        caster.domainActive = true;
        caster.status.push({ type: 'domain', dur: eff.duration });
        document.getElementById('combat-overlay').classList.add('domain-active');
        this.log(`<span class="txt-purple" style="font-size:18px;">DOMAIN EXPANSION!</span>`, 'sys');
      }
    });
  },

  checkWin() {
    this.updateUI();
    if(this.enemy.hp <= 0) {
      this.end(true);
    } else if(this.playerObj.hp <= 0) {
      this.end(false);
    } else {
      this.nextTurn();
    }
  },

  nextTurn() {
    this.turnOrder.reverse();
    this.processTurn();
  },

  end(win) {
    this.active = false;
    setTimeout(() => {
      document.getElementById('combat-overlay').classList.remove('active');
      document.getElementById('combat-overlay').classList.remove('domain-active');
      
      State.hp = Math.max(1, this.playerObj.hp);
      State.ce = this.playerObj.ce;
      
      if(win) {
        Engine.log(`Victory! Exorcised the target. Gained experience and yen.`, 'sys');
        State.yen += 50000;
        State.mst += 1;
        State.karma += 1;
      } else {
        Engine.log(`DEFEAT. You barely escaped with your life. Heavy injuries sustained.`, 'cbt');
        State.hp = 10;
        State.str = Math.max(1, State.str - 1);
      }
      Engine.updateUI();
    }, 1500);
  }
};