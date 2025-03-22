import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class DnD5e extends BaseSystem {

    getActorListTemplate() {
        return `${PATH}/templates/partials/actor-list-dnd5e.hbs`;
    }

    getIndexFields() {
        return [
            "system.details",
            "system.traits",
        ];
    }

    getActorTypes() {
        return ["character", "npc"];
    }

    buildRowData(actors) {
        let rowData = [];
        
        for (const actor of actors) {
            let cr =  actor.system.details.cr ?? actor.system.details.level ?? 0;
            let data = {
                uuid: actor.uuid,
                img: { display: actor.img, sortValue: undefined },
                name: { display: actor.name, sortValue: actor.name },
                cr: { display: cr, sortValue: cr },
                type: this.getTypeColumnData(actor.system.details.type?.value),
                size: this.getSizeColumnData(actor.system.traits.size),
                alignment: { display: actor.system.details.alignment, sortValue: actor.system.details.alignment },
            };

            rowData.push(data);
        }

        return rowData;
    }

    getSizeColumnData(size) {
        let display = game.i18n.localize(CONFIG.DND5E.actorSizes[size].label);
        let sizeOrder = ["tiny", "sm", "med", "lg", "huge", "grg"];
        let sortValue = sizeOrder.indexOf(size);

        return { display, sortValue };
    }

    getTypeColumnData(type) {
        let display = game.i18n.localize(CONFIG.DND5E.creatureTypes[type]?.label);
        if (!display) {
            display = game.i18n.localize("ACTOR_BROWSER.None");
        }
        let sortValue = display;

        return { display, sortValue };
    }
}