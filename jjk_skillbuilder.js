// jjk_skillBuilder.js

const SkillBuilder = (() => {

    function open() {
        inject(); 
        setTimeout(() => {
            const ov = document.getElementById('skbOverlay');
            if (ov) ov.classList.add('open');
            bindEvents();
        }, 10);
    }

    function close() {
        const ov = document.getElementById('skbOverlay');
        if (ov) {
            ov.classList.remove('open');
            setTimeout(() => ov.remove(), 300);
        }
    }

    function inject() {
        const ex = document.getElementById('skbOverlay');
        if (ex) ex.remove();

        // Simplified UI for forging a technique
        const div = document.createElement('div');
        div.id = 'skbOverlay';
        // Basic CSS embedded for the overlay so it works standalone
        div.style.cssText = "display:none; position:fixed; inset:0; background:rgba(2,4,3,.92); z-index:4000; align-items:center; justify-content:center; backdrop-filter:blur(2px);";
        
        div.innerHTML = `
        <div style="background:#05070a; border:1px solid #00e5ff; width:600px; max-width:90vw; padding:20px; font-family:'Share Tech Mono', monospace; color:#d0e0f0; box-shadow:0 0 40px rgba(0,229,255,0.3);">
            <h2 style="color:#00e5ff; font-family:'VT323'; letter-spacing:2px; margin-top:0;">// FORGE CURSED TECHNIQUE //</h2>
            
            <div style="margin-bottom:15px;">
                <label style="font-size:10px; color:#008b99;">TECHNIQUE NAME</label>
                <input type="text" id="forgeName" style="width:100%; background:#020304; border:1px solid #151d29; color:#d0e0f0; padding:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="font-size:10px; color:#008b99;">DESCRIPTION</label>
                <textarea id="forgeDesc" rows="3" style="width:100%; background:#020304; border:1px solid #151d29; color:#d0e0f0; padding:8px; box-sizing:border-box;"></textarea>
            </div>

            <div style="display:flex; gap:15px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-size:10px; color:#008b99;">BASE DAMAGE</label>
                    <input type="number" id="forgeDmg" value="10" style="width:100%; background:#020304; border:1px solid #151d29; color:#d0e0f0; padding:8px; box-sizing:border-box;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:10px; color:#008b99;">CE COST</label>
                    <input type="number" id="forgeCost" value="15" style="width:100%; background:#020304; border:1px solid #151d29; color:#d0e0f0; padding:8px; box-sizing:border-box;">
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <label style="font-size:10px; color:#008b99;">ATOMIC EFFECT</label>
                <select id="forgeEffect" style="width:100%; background:#020304; border:1px solid #151d29; color:#d0e0f0; padding:8px; box-sizing:border-box;">
                    <option value="none">Pure Damage Focus</option>
                    <option value="dot">Residual Burn (Damage over time)</option>
                    <option value="skip">Stun/Paralysis (Skip Turn)</option>
                    <option value="heal">Cursed Reversal (Heal on hit)</option>
                    <option value="debuff">Lethargy (Reduce Agility/Speed)</option>
                </select>
            </div>

            <div style="display:flex; justify-content:space-between;">
                <button id="forgeCancel" style="background:transparent; border:1px solid #151d29; color:#525a66; padding:10px 20px; cursor:pointer;">CANCEL</button>
                <button id="forgeConfirm" style="background:rgba(191,0,255,0.1); border:1px solid #bf00ff; color:#bf00ff; padding:10px 20px; cursor:pointer;">FINALIZE TECHNIQUE</button>
            </div>
        </div>
        `;
        document.body.appendChild(div);
    }

    function bindEvents() {
        document.getElementById('forgeCancel').addEventListener('click', close);
        document.getElementById('forgeConfirm').addEventListener('click', () => {
            const name = document.getElementById('forgeName').value.trim();
            if (!name) { alert("Technique needs a name!"); return; }

            const skill = {
                name: name,
                description: document.getElementById('forgeDesc').value,
                damage: [Math.floor(document.getElementById('forgeDmg').value * 0.8), Math.floor(document.getElementById('forgeDmg').value * 1.2)],
                energyCost: parseInt(document.getElementById('forgeCost').value, 10),
                cooldown: 0,
                statusEffect: null
            };

            const effectType = document.getElementById('forgeEffect').value;
            if (effectType !== 'none') {
                skill.statusEffect = {
                    name: "Innate Effect",
                    type: effectType,
                    duration: 2,
                    value: effectType === 'heal' ? 15 : 5
                };
            }

            // Save to global space for the Engine to pick up
            window._forgedInnateTechnique = skill;
            
            // Update the UI in the character creator
            const statusLabel = document.getElementById('ctStatus');
            if (statusLabel) {
                statusLabel.innerHTML = `<span style="color:#bf00ff;">✓ Forged: ${skill.name.toUpperCase()}</span>`;
            }

            close();
        });
    }

    return { open, close };
})();
