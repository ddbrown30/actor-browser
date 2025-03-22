import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class Swade extends BaseSystem {

    getActorListTemplate() {        
        return `${PATH}/templates/partials/actor-list-swade.hbs`;
    }

    getIndexFields() {
        return [
            "system.stats.size",
            "system.attributes",
        ];
    }

    getActorTypes() {
        return ["character", "npc"];
    }

    buildRowData(actors) {
        let rowData = [];
        for (const actor of actors) {
            let data = {
                uuid: actor.uuid,
                img: { display: actor.img, sortValue: undefined},
                name: { display: actor.name, sortValue: actor.name},
                size: { display: actor.system.stats.size, sortValue: actor.system.stats.size},
                agi: this.getDieColumnData(actor.system.attributes.agility.die),
                sma: this.getDieColumnData(actor.system.attributes.smarts.die),
                spi: this.getDieColumnData(actor.system.attributes.spirit.die),
                str: this.getDieColumnData(actor.system.attributes.strength.die),
                vig: this.getDieColumnData(actor.system.attributes.vigor.die),
            };

            rowData.push(data);
        }

        return rowData;
    }

    getDieColumnData(die) {
        let display = "d" + die.sides;
        let sortValue = die.sides + die.modifier;
        if (die.modifier) {
            if (die.modifier > 0) {
                display += "+";
            }
            display += die.modifier;
        }

        return {display, sortValue};
    }
}