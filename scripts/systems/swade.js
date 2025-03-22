import { PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class Swade extends BaseSystem {

    getAdditionalFiltersTemplate() {
        return `${PATH}/templates/partials/additional-filters-swade.hbs`;
    }

    getActorListTemplate() {
        return `${PATH}/templates/partials/actor-list-swade.hbs`;
    }

    getIndexFields() {
        return [
            "system.stats.size",
            "system.size",
            "system.attributes",
        ];
    }

    getActorTypes() {
        return ["character", "npc", "vehicle"];
    }

    filterActors(actors) {
        let filtered = super.filterActors(actors);
        
        //Filter by type
        if (this.typeFilter) {
            const actorTypes = this.getActorTypes();
            if (actorTypes.length) {
                filtered = filtered.filter((a) => a.type == this.typeFilter);
            }
        }
        
        return filtered;
    }

    buildRowData(actors) {
        let rowData = [];
        for (const actor of actors) {
            let size = actor.type == "vehicle" ? actor.system.size : actor.system.stats.size;
            let unusedValue = { display: "-", sortValue: -100 };
            let data = {
                uuid: actor.uuid,
                img: { display: actor.img, sortValue: undefined },
                name: { display: actor.name, sortValue: actor.name },
                size: { display: size, sortValue: size },
                agi: actor.type == "vehicle" ? unusedValue : this.getDieColumnData(actor.system.attributes.agility.die),
                sma: actor.type == "vehicle" ? unusedValue : this.getDieColumnData(actor.system.attributes.smarts.die),
                spi: actor.type == "vehicle" ? unusedValue : this.getDieColumnData(actor.system.attributes.spirit.die),
                str: actor.type == "vehicle" ? unusedValue : this.getDieColumnData(actor.system.attributes.strength.die),
                vig: actor.type == "vehicle" ? unusedValue : this.getDieColumnData(actor.system.attributes.vigor.die),
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

        return { display, sortValue };
    }
    
    getAdditionalFiltersData(browserDialog) {
        let actorTypes = [];
        actorTypes.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.FilterAllTypes") });
        actorTypes.push({ id: "character", label: game.i18n.localize("ACTOR_BROWSER.FilterPCs") });
        actorTypes.push({ id: "npc", label: game.i18n.localize("ACTOR_BROWSER.FilterNPCs") });
        actorTypes.push({ id: "vehicle", label: game.i18n.localize("ACTOR_BROWSER.FilterVehicles") });

        return {
            actorTypes: actorTypes,
            typeFilter: this.typeFilter,
        };
    }

    activateListeners(browserDialog) {
        //Add the listener to the type dropdown
        const filterSelector = browserDialog.element.querySelector('select[id="type-filter"]');
        filterSelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.typeFilter = selection.val();
            browserDialog.render();
        });
    }
}