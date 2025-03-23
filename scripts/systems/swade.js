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
            "items",
        ];
    }

    getActorTypes() {
        return ["character", "npc", "vehicle"];
    }

    filterActors(actors) {
        let filtered = super.filterActors(actors);

        //Filter by type
        if (this.typeFilter) {
            filtered = filtered.filter((a) => a.type == this.typeFilter);
        }

        //Filter by edge
        if (this.edgeFilter) {
            filtered = filtered.filter((a) => a.items.find((i) => i.name == this.edgeFilter));
        }

        //Filter by edge
        if (this.abilityFilter) {
            filtered = filtered.filter((a) => a.items.find((i) => i.name == this.abilityFilter));
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

    getAdditionalFiltersData(browserDialog, actors) {
        let actorTypes = [];
        actorTypes.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.FilterAllTypes") });
        actorTypes.push({ id: "character", label: game.i18n.localize("ACTOR_BROWSER.FilterPCs") });
        actorTypes.push({ id: "npc", label: game.i18n.localize("ACTOR_BROWSER.FilterNPCs") });
        actorTypes.push({ id: "vehicle", label: game.i18n.localize("ACTOR_BROWSER.FilterVehicles") });

        let edges = this.buildItemList(actors, "edge", "ACTOR_BROWSER.FilterAllEdges");
        let abilities = this.buildItemList(actors, "ability", "ACTOR_BROWSER.FilterAllAbilities");

        return {
            actorTypes: actorTypes,
            typeFilter: this.typeFilter,
            edges: edges,
            edgeFilter: this.edgeFilter,
            abilities: abilities,
            abilityFilter: this.abilityFilter,
        };
    }

    buildItemList(actors, type, firstLabel) {
        let items = [];
        for (let actor of actors) {
            let actorItems = actor.items.filter((i) => i.type == type).map((item) => ({ id: item.name, label: item.name }));
            items = items.concat(...actorItems);
        }

        items = items.filter((item, idx) => items.findIndex((i) => i.id == item.id) === idx);
        items = items.sort((a, b) => a.label.localeCompare(b.label));
        items.unshift({ id: "", label: game.i18n.localize(firstLabel) });

        return items;
    }

    activateListeners(browserDialog) {
        //Add the listener to the type dropdown
        const filterSelector = browserDialog.element.querySelector('select[id="type-filter"]');
        filterSelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.typeFilter = selection.val();
            browserDialog.render();
        });

        //Add the listener to the edge dropdown
        const edgeSelector = browserDialog.element.querySelector('select[id="edge-filter"]');
        edgeSelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.edgeFilter = selection.val();
            browserDialog.render();
        });

        //Add the listener to the ability dropdown
        const abilitySelector = browserDialog.element.querySelector('select[id="ability-filter"]');
        abilitySelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.abilityFilter = selection.val();
            browserDialog.render();
        });
    }
}