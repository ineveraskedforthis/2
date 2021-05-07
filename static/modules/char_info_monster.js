export class CharInfoMonster {
    constructor() {

        // this.name =                 document.getElementById('name');

        this.hp =                   document.getElementById('hp_data');
        this.hp_display =           document.getElementById('hp_value_display');

        // this.exp =                  document.getElementById('exp_current');  
        // this.exp_req =              document.getElementById('exp_required');  
        // this.exp_display =          document.getElementById('exp_value_display');


        this.level =                document.getElementById('level_data');
        this.points =               document.getElementById('skill_points_data');

        // this.savings =              document.getElementById('savings_data');

        this.rage =                 document.getElementById('rage_data');
        this.rage_display =         document.getElementById('rage_value_display');

        this.blood =                document.getElementById('blood_data');
        this.blood_display =        document.getElementById('blood_value_display');

        this.stress =               document.getElementById('stress_data');
        this.stress_display =       document.getElementById('stress_value_display');
    }

    update_name(data) {
        // this.name.innerHTML = data;
    }


    update_savings(savings) {
        // console.log('savings', savings);
        // this.savings.innerHTML = savings;
    }

    update_status(data) {
        // console.log(data)

        this.hp.innerHTML = `${data.c.hp}/${data.m.hp}`
        this.hp_display.style.width = `${Math.floor(data.c.hp/data.m.hp * 100)}%`;

        this.rage.innerHTML = data.c.rage;
        this.rage_display.style.width = `${Math.floor(data.c.rage)}%`;

        this.blood.innerHTML = data.c.blood;
        this.blood_display.style.width = `${Math.floor(data.c.blood)}%`;

        this.stress.innerHTML = data.c.stress;
        this.stress_display.style.width = `${Math.floor(data.c.stress)}%`;
    }
}