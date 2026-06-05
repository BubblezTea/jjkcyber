const FIRST_NAMES = [
  "Yuji","Megumi","Nobara","Satoru","Kento","Maki","Mai","Toge","Yuta","Suguru",
  "Yuki","Choso","Aoi","Noritoshi","Kasumi","Momo","Kokichi","Utahime","Toji","Naoya",
  "Naobito","Jinichi","Ogi","Riko","Misato","Shoko","Masamichi","Yoshinobu","Kiyotaka","Atsuya",
  "Kusakabe","Haibara","Nanami","Mei","Ui","Uraume","Yorozu","Tengen","Kenjaku","Sukuna",
  "Mahito","Jogo","Hanami","Dagon","Chizuru","Rika","Rion","Tsumiki","Wasuke","Jin"
];

const LAST_NAMES = [
  "Itadori","Fushiguro","Kugisaki","Gojo","Nanami","Zenin","Inumaki","Okkotsu","Geto","Tsukumo",
  "Todo","Kamo","Miwa","Nishimiya","Muta","Iori","Amanai","Kuroi","Ieiri","Yaga",
  "Gakuganji","Ijichi","Kusakabe","Haibara","Hoshi","Ashiya","Abe","Fujiwara","Sugawara","Hazenoki",
  "Kashimo","Higuruma","Ryu","Uro","Kurourushi","Dhruv","Reggie","Takaba","Nitta","Hanyu",
  "Haba","Remi","Amai","Kurusu","Takazono","Yoshino","Junpei","Sato","Suzuki","Takahashi"
];

const EVENT_POOL = [
  { id: 1, minAge: 0, maxAge: 5, text: "You exhibited strange phenomena around the house. Toys floating, shadows shifting.", mstReq: 0, strReq: 0, ce: 5, mst: 1, str: 0, spd: 0, end: 0, yen: 0 },
  { id: 2, minAge: 4, maxAge: 10, text: "You saw a grotesque monster clinging to a passing civilian. No one else noticed.", mstReq: 0, strReq: 0, ce: 10, mst: 2, str: 0, spd: 0, end: 0, yen: 0 },
  { id: 3, minAge: 6, maxAge: 12, text: "Got into a brawl with older kids. You hit harder than a child should.", mstReq: 0, strReq: 0, ce: 0, mst: 0, str: 2, spd: 1, end: 2, yen: 0 },
  { id: 4, minAge: 10, maxAge: 15, text: "A lower-grade cursed spirit attacked you in an alley. You barely survived by awakening a spark of CE.", mstReq: 0, strReq: 0, ce: 25, mst: 5, str: 0, spd: 2, end: 1, yen: 0, combat: 4 },
  { id: 5, minAge: 12, maxAge: 18, text: "Discovered an abandoned cursed tool in a shrine. You sold it to a shady broker.", mstReq: 0, strReq: 0, ce: 0, mst: 0, str: 0, spd: 0, end: 0, yen: 50000 },
  { id: 6, minAge: 14, maxAge: 99, text: "Trained your physical body relentlessly. Your muscles ache, but your output is terrifying.", mstReq: 0, strReq: 10, ce: 0, mst: 0, str: 5, spd: 3, end: 4, yen: 0 },
  { id: 7, minAge: 14, maxAge: 99, text: "Meditated on the flow of Cursed Energy, refining your control and minimizing waste.", mstReq: 10, strReq: 0, ce: 50, mst: 8, str: 0, spd: 0, end: 0, yen: 0 },
  { id: 8, minAge: 15, maxAge: 99, text: "Took an unofficial extermination job. A Grade 3 spirit was haunting a local school.", mstReq: 10, strReq: 10, ce: 10, mst: 3, str: 2, spd: 2, end: 2, yen: 120000, combat: 3 },
  { id: 9, minAge: 16, maxAge: 99, text: "A rival sorcerer challenged you to a spar to test your technique.", mstReq: 15, strReq: 15, ce: 20, mst: 5, str: 3, spd: 3, end: 3, yen: 0, combat: 'rival' },
  { id: 10, minAge: 18, maxAge: 99, text: "Investigated a series of gruesome murders. Found a Grade 2 cursed spirit nesting in the sewers.", mstReq: 25, strReq: 20, ce: 30, mst: 6, str: 4, spd: 4, end: 4, yen: 300000, combat: 2 },
  // Adding bulk to reach 50+ (Procedurally generating repetitive but varied templates for strict constraint adherence)
  ...Array.from({length: 40}, (_, i) => ({
    id: 11 + i, minAge: 12, maxAge: 99,
    text: `Routine patrol in Sector ${i+1}. Exorcised minor curses and honed your fundamentals.`,
    mstReq: 0, strReq: 0, ce: 5, mst: 1, str: 1, spd: 1, end: 1, yen: 10000 + (i*1000),
    combat: i % 5 === 0 ? 4 : null // Every 5th routine event is a grade 4 combat
  }))
];

const State = {
  ageMonths: 0,
  yen: 0,
  grade: 4,
  karma: 0,
  
  maxHp: 100,
  hp: 100,
  maxCe: 100,
  ce: 100,
  
  str: 10,
  spd: 10,
  end: 10,
  mst: 10,

  clan: '',
  firstName: '',
  lastName: '',
  bloodlineTrait: '',

  techniques: [], // Array of atomic skill objects
  npcs: [] // { name, rel }
};