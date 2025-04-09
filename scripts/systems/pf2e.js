import { CONST } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class PF2e extends BaseSystem {

    static INDEX_FIELDS = ["system.details", "system.traits"];
    static ACTOR_TYPES = ["character", "npc"];
    static HEADER_CONFIG = {
        level: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Level",
            sort: 'data-sort-id="level"',
        },
        traits: {
            class: "actor-cell-pf2etraits",
            label: "ACTOR_BROWSER.Traits",
            sort: '',
        },
        size: {
            class: "actor-cell-dndsize",
            label: "ACTOR_BROWSER.Size",
            sort: 'data-sort-id="size"',
        },
    };

    async buildRowData(actors, headerData) {
        let rowData = [];

        for (const actor of actors) {
            let level =  actor.system.details.level.value ?? 0;
            let data = {
                ...this.buildCommonRowData(actor),
                level: { display: level, sortValue: level },
                traits: this.getTraitColumnData(actor.system.traits?.value),
                size: this.getSizeColumnData(actor.system.traits?.size.value),
            };

            rowData.push(data);
        }

        this.buildRowHtml(rowData, headerData);

        return rowData;
    }

    getSizeColumnData(size) {
        if (!CONFIG.PF2E.actorSizes[size]) {
            return CONST.unusedValue;
        }

        let display = game.i18n.localize(CONFIG.PF2E.actorSizes[size]);
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