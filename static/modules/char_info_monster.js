export class CharInfoMonster {
    constructor() {

        this.name =                 document.getElementById('name');

        this.hp =                   document.getElementById('hp_data');
        this.hp_display =           document.getElementById('hp_value_display');

        this.exp =                  document.getElementById('exp_current');  
        this.exp_req =              document.getElementById('exp_required');  
        this.exp_display =          document.getElementById('exp_value_display');


        this.level =                document.getElementById('level_data');
        this.points =               document.getElementById('skill_points_data');

        this.savings =              document.getElementById('savings_data');

        this.rage =                 document.getElementById('rage_data');
        this.rage_display =         document.getElementById('rage_value_display');

        this.blood =                document.getElementById('blood_data');
        this.blood_display =        document.getElementById('blood_value_display');

        this.stress =               document.getElementById('stress_data');
        this.stress_display =       document.getElementById('stress_value_display');
    }

    update_name(data) {
        this.name.innerHTML = data;
    }

    update_hp(data) {
        this.hp.innerHTML = `${data.hp}/${data.mhp}`
        this.hp_display.style.width = `${Math.floor(data.hp/data.mhp * 100)}%`;
    }

    update_exp(data) {
        this.exp.innerHTML = data.exp;
        this.exp_req.innerHTML = data.mexp
        this.exp_display.style.width = `${Math.floor(data.exp/data.mexp * 100)}%`;

        this.level.innerHTML = data.level;
        this.points.innerHTML = data.points;
    }

    update_savings(savings) {
        console.log('savings', savings);
        this.savings.innerHTML = savings;
    }

    update_status(data) {
        this.rage.innerHTML = data.rage;
        this.rage_display.style.width = `${Math.floor(data.rage)}%`;

        this.blood.innerHTML = data.blood_covering;
        this.blood_display.style.width = `${Math.floor(data.blood_covering)}%`;

        this.stress.innerHTML = data.stress;
        this.stress_display.style.width = `${Math.floor(data.stress)}%`;
    }
}