// jjk_engine.js

const JP_FIRST_NAMES = [
  "Hiroshi", "Kenji", "Akira", "Yuki", "Sakura", "Mei", "Rin", "Haru", "Makoto", "Ren", 
  "Sora", "Aoi", "Hina", "Kaito", "Ryota", "Shin", "Takeshi", "Yoko", "Daiki", "Emi"
];

const JP_LAST_NAMES = [
  "Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", 
  "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto"
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
  skills: [] // Where your custom technique will land
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
    lName = document.getElementById('ccCustomClanName').value.trim() || "Unknown";
    State.clan = lName;
    // Apply custom trait logic here
    const trait = document.getElementById('ccCustomClanTrait').value;
    if(trait === 'immense_ce') State.maxCe += 100;
    if(trait === 'heavenly') { State.maxCe = 0; State.maxHp += 150; State.stats.str += 20; }
  } else {
    lName = clanSelection;
    State.clan = clanSelection;
    if(lName === 'Zenin') { State.stats.str += 10; State.stats.spd += 10; }
    if(lName === 'Gojo') { State.maxCe += 200; }
  }

  State.name = `${fName} ${lName}`;
  State.upbringing = document.getElementById('ccUpbringing').value;
  State.exposure = document.getElementById('ccExposure').value;
  State.ce = State.maxCe;
  State.hp = State.maxHp;

  // Generate some starting procedural NPCs
  generateNPC("Mentor", 35);
  generateNPC("Rival", 15);

  startGame();
});

function startGame() {
  document.getElementById('charCreateScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'flex';
  updateUI();
  logEvent(`You awaken to the world of Jujutsu. Born as a ${State.clan}, raised as a ${State.upbringing}, your eyes were opened to curses through ${State.exposure}. Your journey begins.`);
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
    id: `npc_${Date.now()}`,
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
  let yearsPassed = 0;
  while(State.months >= 12) {
    State.age++;
    State.months -= 12;
    yearsPassed++;
  }

  // Passive Growth
  if(State.maxCe > 0) State.maxCe += Math.floor(monthsToPass * 1.5);
  State.stats.mst += Math.floor(monthsToPass * 0.5);
  State.hp = State.maxHp; // Heal over time
  State.ce = State.maxCe;

  // Procedural Event Generation
  let eventText = `You spent ${monthsToPass} months training and handling minor assignments.`;
  
  const r = Math.random();
  if(r < 0.3) {
    State.yen += Math.floor(Math.random() * 50000) + 10000;
    eventText += ` Successfully exorcised a wandering curse. Gained bounty.`;
  } else if (r < 0.5 && State.npcs.length > 0) {
    const npc = State.npcs[Math.floor(Math.random() * State.npcs.length)];
    if(Math.random() > 0.5) {
      npc.relationship += 10;
      eventText += ` Grew closer to your ${npc.role}, ${npc.name}.`;
    } else {
      npc.relationship -= 10;
      eventText += ` Had a disagreement with ${npc.name}. Tension rises.`;
    }
  }

  logEvent(eventText);
  updateUI();
});
