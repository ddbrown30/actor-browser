import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class PF2e extends BaseSystem {

    getActorListTemplate() {
        return `${PATH}/templates/partials/actor-list-pf2e.hbs`;
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
            let level =  actor.system.details.level.value ?? 0;
            let data = {
                uuid: actor.uuid,
                img: { display: actor.img, sortValue: undefined },
                name: { display: actor.name, sortValue: actor.name },
                level: { display: level, sortValue: level },
                traits: this.getTraitColumnData(actor.system.traits?.value),
                size: this.getSizeColumnData(actor.system.traits?.size.value),
            };

            rowData.push(data);
        }

        return rowData;
    }

    getSizeColumnData(size) {
        let display = game.i18n.localize(CONFIG.PF2E.actorSizes[size]);
        if (!display) {
            display = game.i18n.localize("ACTOR_BROWSER.None");
        }
        let sizeOrder = ["tiny", "sm", "med", "lg", "huge", "grg"];
        let sortValue = sizeOrder.indexOf(size);

        return { display, sortValue };
    }
     
    getTraitColumnData(traits) {
        let display = "";
        if (traits) {
            for (let trait of traits) {
                let traitString = game.i18n.localize(CONFIG.PF2E.creatureTraits[trait]);
                if (!traitString) continue;

                if (display) {
                    display += ", ";
                }
                display += traitString;
            }
        }
        
        if (!display) {
            display = game.i18n.localize("ACTOR_BROWSER.None");
        }

        let sortValue = 0;
        return { display, sortValue };
    }
}