// jjk_engine.js

const JP_FIRST_NAMES = [
  "Hiroshi", "Kenji", "Akira", "Yuki", "Sakura", "Mei", "Rin", "Haru", "Makoto", "Ren", 
  "Sora", "Aoi", "Hina", "Kaito", "Ryota", "Shin", "Takeshi", "Yoko", "Daiki", "Emi",
  "Taro", "Jiro", "Saburo", "Shiro", "Goro", "Satoshi", "Tadashi", "Yoshi", "Kiyoshi"
];

const JP_LAST_NAMES = [
  "Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", 
  "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto",
  "Inoue", "Kimura", "Hayashi", "Saito", "Shimizu", "Yamazaki", "Mori", "Ikeda"
];

const State = {
  name: "",
  clan: "",
  age: 15,
  months: 0,
  hp: 100, maxHp: 100,
  ce: 50, maxCe: 50,
  yen: 0,
  grade: 4,
  stats: { str: 5, spd: 5, end: 5, mst: 5 },
  upbringing: "",
  exposure: "",
  history: [],
  npcs: [],
  skills: [] // Custom built techniques land here
};

// UI Toggles
function toggleClanForge() {
  const select = document.getElementById('ccClan');
  const panel = document.getElementById('customClanPanel');
  if (select.value === 'custom') {
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
}

// Initialization
document.getElementById('btnAwaken').addEventListener('click', () => {
  const fName = document.getElementById('ccFirstName').value.trim() || JP_FIRST_NAMES[Math.floor(Math.random() * JP_FIRST_NAMES.length)];
  const clanSelection = document.getElementById('ccClan').value;
  
  let lName = "";
  if (clanSelection === 'random') {
    lName = JP_LAST_NAMES[Math.floor(Math.random() * JP_LAST_NAMES.length)];
    State.clan = "Civilian";
  } else if (clanSelection === 'custom') {
    lName = document.getElementById('ccCustomClanName').value.trim() || "Forged";
    State.clan = lName;
    
    // Apply custom trait logic
    const trait = document.getElementById('ccCustomClanTrait').value;
    if(trait === 'immense_ce') State.maxCe += 100;
    if(trait === 'heavenly') { State.maxCe = 0; State.maxHp += 150; State.stats.str += 20; }
    if(trait === 'rct_talent') { /* Flag for future training logic */ }
  } else {
    lName = clanSelection;
    State.clan = clanSelection;
    if(lName === 'Zenin') { State.stats.str += 10; State.stats.spd += 10; }
    if(lName === 'Gojo') { State.maxCe += 200; }
  }

  State.name = `${fName} ${lName}`;
  State.upbringing = document.getElementById('ccUpbringing').value;
  State.exposure = document.getElementById('ccExposure').value;
  
  // Baseline adjustments based on upbringing
  if (State.upbringing === 'slums') { State.stats.end += 5; State.yen -= 500; }
  if (State.upbringing === 'cult') { State.stats.mst += 5; }
  if (State.upbringing === 'traditional') { State.stats.mst += 10; State.maxCe += 20; }

  // Baseline adjustments based on exposure
  if (State.exposure === 'trauma') { State.maxHp -= 10; State.stats.end += 5; }
  if (State.exposure === 'ingestion') { State.maxCe += 50; State.stats.str += 5; }

  State.ce = State.maxCe;
  State.hp = State.maxHp;

  // Generate starting procedural NPCs
  generateNPC("Mentor", 35);
  generateNPC("Rival", 15);

  startGame();
});

function startGame() {
  document.getElementById('charCreateScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'flex';
  updateUI();
  
  let openingText = `You awaken to the world of Jujutsu. Raised as a ${State.upbringing.replace('_', ' ')}, your eyes were opened to the horrific reality of curses through ${State.exposure.replace('_', ' ')}. `;
  if (window._forgedInnateTechnique) {
      openingText += `Your innate technique, [${window._forgedInnateTechnique.name}], has finally manifested. Your journey begins now.`;
      State.skills.push(window._forgedInnateTechnique);
  } else {
      openingText += `You have yet to discover a specific innate technique, relying entirely on raw cursed energy manipulation. Your journey begins now.`;
      State.skills.push({ name: "Cursed Strike", damage: [5, 10], energyCost: 2 });
  }

  logEvent(openingText);
}

function updateUI() {
  document.getElementById('uiName').innerText = State.name;
  document.getElementById('uiAge').innerText = State.age;
  document.getElementById('uiHp').innerText = `${Math.floor(State.hp)}/${State.maxHp}`;
  document.getElementById('uiCe').innerText = `${Math.floor(State.ce)}/${State.maxCe}`;
  document.getElementById('uiGrade').innerText = State.grade;
  document.getElementById('uiYen').innerText = State.yen.toLocaleString();
}

function logEvent(text) {
  const log = document.getElementById('timelineLog');
  const entry = document.createElement('div');
  entry.className = 'timeline-entry';
  entry.innerHTML = `<span class="timeline-age">AGE ${State.age} (${State.months} MO)</span>${text}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// Procedural NPC Generator
function generateNPC(role, ageTarget) {
  const fName = JP_FIRST_NAMES[Math.floor(Math.random() * JP_FIRST_NAMES.length)];
  const lName = JP_LAST_NAMES[Math.floor(Math.random() * JP_LAST_NAMES.length)];
  State.npcs.push({
    id: `npc_${Date.now()}_${Math.floor(Math.random()*100)}`,
    name: `${fName} ${lName}`,
    role: role,
    age: ageTarget,
    relationship: 50,
    status: 'Alive'
  });
}

// BitLife Time Progression
document.getElementById('timeSlider').addEventListener('input', (e) => {
  document.getElementById('timeVal').innerText = `${e.target.value} MO`;
});

document.getElementById('btnPassTime').addEventListener('click', () => {
  const monthsToPass = parseInt(document.getElementById('timeSlider').value, 10);
  
  State.months += monthsToPass;
  while(State.months >= 12) {
    State.age++;
    State.months -= 12;
  }

  // Passive Growth
  if(State.maxCe > 0) State.maxCe += Math.floor(monthsToPass * 1.5);
  State.stats.mst += Math.floor(monthsToPass * 0.5);
  State.hp = State.maxHp; 
  State.ce = State.maxCe;

  // Procedural Event Generation
  let eventText = `You spent ${monthsToPass} months training and handling minor assignments.`;
  
  const r = Math.random();
  if(r < 0.25) {
    const yenGained = Math.floor(Math.random() * 50000) + 10000;
    State.yen += yenGained;
    eventText += ` Successfully exorcised a wandering curse. Gained ${yenGained.toLocaleString()} Yen.`;
  } else if (r < 0.5 && State.npcs.length > 0) {
    const npc = State.npcs[Math.floor(Math.random() * State.npcs.length)];
    if(Math.random() > 0.4) {
      npc.relationship += 10;
      eventText += ` Grew closer to your ${npc.role}, ${npc.name}.`;
    } else {
      npc.relationship -= 10;
      eventText += ` Had a disagreement with ${npc.name}. Tension rises.`;
    }
  } else if (r < 0.6) {
      generateNPC("Ally", State.age);
      eventText += ` You met a new sorcerer who seems willing to work with you.`;
  } else if (r > 0.95 && State.npcs.length > 0) {
      const npc = State.npcs[Math.floor(Math.random() * State.npcs.length)];
      if (npc.status === 'Alive') {
          npc.status = 'Dead';
          eventText += ` TRAGEDY: Your ${npc.role}, ${npc.name}, was killed in action during a mission gone wrong.`;
      }
  }

  logEvent(eventText);
  updateUI();
});

// Hook for the Forge Button
document.getElementById('btnForgeCT').addEventListener('click', () => {
    // Assuming you drop in a copy of skillBuilder.js into the same HTML file
    if (typeof SkillBuilder !== 'undefined') {
        SkillBuilder.open();
    } else {
        alert("SkillBuilder module not found! Make sure you included the script.");
    }
});
