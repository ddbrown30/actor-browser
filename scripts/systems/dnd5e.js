import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class DnD5e extends BaseSystem {

    getAdditionalFiltersTemplate() {
        return `${PATH}/templates/partials/additional-filters-dnd5e.hbs`;
    }

    getActorListTemplate() {
        return `${PATH}/templates/partials/actor-list-dnd5e.hbs`;
    }

    getIndexFields() {
        return [
            "system.details",
            "system.traits",
            "system.attributes",
        ];
    }

    getActorTypes() {
        return ["character", "npc"];
    }

    filterActors(actors) {
        let filtered = super.filterActors(actors);

        //Filter by speed
        if (this.filters.speedFilter) {
            filtered = filtered.filter((a) => a.system.attributes.movement[this.filters.speedFilter] > 0 );
        }

        //Filter by sense
        if (this.filters.senseFilter) {
            filtered = filtered.filter((a) => a.system.attributes.senses[this.filters.senseFilter] > 0 );
        }

        return filtered;
    }

    buildRowData(actors) {
        let rowData = [];
        
        for (const actor of actors) {
            let cr =  actor.system.details.cr ?? actor.system.details.level ?? 0;
            let data = {
                ...this.buildCommonRowData(actor),
                cr: { display: cr, sortValue: cr },
                type: this.getTypeColumnData(actor.system.details.type?.value),
                size: this.getSizeColumnData(actor.system.traits.size),
                speed: this.getSpeedColumnData(actor.system.attributes.movement),
                senses: this.getSenseColumnData(actor.system.attributes.senses),
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

    getSpeedColumnData(movement) {
        let display = "";
        for (let [type, value] of Object.entries(movement)) {
            if (!value || !CONFIG.DND5E.movementTypes.hasOwnProperty(type)) continue;

            if (display) {
                display += "\n";
            }
            display += CONFIG.DND5E.movementTypes[type] + " " + value;
        }
        
        if (!display) {
            display = game.i18n.localize("ACTOR_BROWSER.None");
        }

        return { display, sortValue: undefined };
    }

    getSenseColumnData(senses) {
        let display = "";
        for (let [type, value] of Object.entries(senses)) {
            if (!value || !CONFIG.DND5E.senses.hasOwnProperty(type)) continue;

            if (display) {
                display += "\n";
            }
            display += CONFIG.DND5E.senses[type] + " " + value;
        }
        
        if (!display) {
            display = game.i18n.localize("ACTOR_BROWSER.None");
        }

        return { display, sortValue: undefined };
    }

    getAdditionalFiltersData(browserDialog, actors) {
        let speeds = [];
        speeds.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.FilterAllSpeeds") });
        for (let [type, value] of Object.entries(CONFIG.DND5E.movementTypes)) {
            speeds.push({ id: type, label: value });
        }
        
        let senses = [];
        senses.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.FilterAllSenses") });
        for (let [type, value] of Object.entries(CONFIG.DND5E.senses)) {
            senses.push({ id: type, label: value });
        }

        return {
            speeds: speeds,
            senses: senses,
            filters: this.filters,
        };
    }

    activateListeners(browserDialog) {
        super.addDropdownListener("speed", "speedFilter", browserDialog);
        super.addDropdownListener("sense", "senseFilter", browserDialog);
    }
}