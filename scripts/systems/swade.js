import { CONST, PATH } from "../module-config.js";
import { BaseSystem } from "./base-system.js";

export class Swade extends BaseSystem {

    static ADDITIONAL_FILTERS_TEMPLATE = `${PATH}/templates/partials/additional-filters-swade.hbs`;
    static ADDITIONAL_SEARCHES_TEMPLATE = `${PATH}/templates/partials/additional-searches-swade.hbs`;
    static INDEX_FIELDS = ["system.stats.size", "system.size", "system.pace", "system.attributes", "system.details", "items"];
    static ACTOR_TYPES = ["character", "npc", "vehicle"];
    static HEADER_CONFIG = {
        wildcard: {
            class: "actor-cell-attr",
            label: `<img src="systems/swade/assets/ui/wildcard-dark.svg" class="actor-header-wildcard"></img>`,
            sort: 'data-sort-id="wildcard"',
        },
        size: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Size",
            sort: 'data-sort-id="size"',
        },
        agi: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Agi",
            sort: 'data-sort-id="agi"',
        },
        sma: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Sma",
            sort: 'data-sort-id="sma"',
        },
        spi: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Spi",
            sort: 'data-sort-id="spi"',
        },
        str: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Str",
            sort: 'data-sort-id="str"',
        },
        vig: {
            class: "actor-cell-attr",
            label: "ACTOR_BROWSER.Vig",
            sort: 'data-sort-id="vig"',
        },
    };

    filterActors(actors) {
        let filtered = super.filterActors(actors);

        //Filter by the search desc string
        if (this.searches.searchDesc) {
            const searchDesc = this.searches.searchDesc;
            filtered = filtered.filter(function (a) {
                if (a.type == "vehicle") {
                    return a.system.description?.toLowerCase().includes(searchDesc.toLowerCase());
                } else {
                    return a.system.details?.biography?.value.toLowerCase().includes(searchDesc.toLowerCase());
                }
            });
        }

        //Filter by type
        if (this.filters.typeFilter) {
            filtered = filtered.filter((a) => a.type == this.filters.typeFilter);
        }

        //Filter by wildcard
        if (this.filters.wildcardFilter) {
            filtered = filtered.filter((i) => {
                if (this.filters.wildcardFilter == "no") {
                    return !i.system.wildcard;
                } else {
                    return !!i.system.wildcard;
                }
            });
        }

        //Filter by edge
        if (this.filters.edgeFilter) {
            filtered = filtered.filter((a) => a.items.find((i) => i.name == this.filters.edgeFilter));
        }

        //Filter by edge
        if (this.filters.abilityFilter) {
            filtered = filtered.filter((a) => a.items.find((i) => i.name == this.filters.abilityFilter));
        }

        //Filter by pace
        if (this.filters.paceFilter) {
            let paceFilter = this.filters.paceFilter;
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            filtered = filtered.filter(function (a) {
                //If we have no pace value, it means we're looking at something from a compendium that has not been migrated
                //As ground was previously the only pace, we'll assume that this actor has a ground pace
                if (!a.system.pace && paceFilter == "ground") return true;

                if (a.system.pace?.[paceFilter] > 0) return true;

                if (paceFilter == "fly") {
                    //If we don't have a fly pace but we do have a Flight ability, consider us as having a fly pace
                    return a.items.find((i) => i.name.toLowerCase().includes("flight"));
                }
                if (paceFilter == "swim") {
                    //If we don't have a swim pace but we do have a Aquatic ability, consider us as having a swim pace
                    return a.items.find((i) => i.name.toLowerCase().includes("aquatic"));
                }
                if (paceFilter == "burrow") {
                    //If we don't have a fly pace but we do have a Burrow ability, consider us as having a burrow pace
                    return a.items.find((i) => i.name.toLowerCase().includes("burrow"));
                }
                return false;
            });
        }

        return filtered;
    }

    async buildRowData(actors, headerData) {
        let rowData = [];
        for (const actor of actors) {
            let size = actor.type == "vehicle" ? actor.system.size : actor.system.stats.size;
            let data = {
                ...this.buildCommonRowData(actor),
                wildcard: { display: game.i18n.localize(actor.system.wildcard ? "ACTOR_BROWSER.Yes" : "ACTOR_BROWSER.No"), sortValue: actor.system.wildcard },
                size: { display: size, sortValue: size },
                agi: actor.type == "vehicle" ? CONST.unusedValue : this.getDieColumnData(actor.system.attributes.agility.die),
                sma: actor.type == "vehicle" ? CONST.unusedValue : this.getDieColumnData(actor.system.attributes.smarts.die),
                spi: actor.type == "vehicle" ? CONST.unusedValue : this.getDieColumnData(actor.system.attributes.spirit.die),
                str: actor.type == "vehicle" ? CONST.unusedValue : this.getDieColumnData(actor.system.attributes.strength.die),
                vig: actor.type == "vehicle" ? CONST.unusedValue : this.getDieColumnData(actor.system.attributes.vigor.die),
            };

            rowData.push(data);
        }

        this.buildRowHtml(rowData, headerData);

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

    getAdditionalSearchesData(browserDialog, actors) {
        this.searches.searchDesc = this.searches.searchDesc ?? "";

        return {
            searchDesc: this.searches.searchDesc,
        };
    }

    getAdditionalFiltersData(browserDialog, actors) {
        let actorTypes = [];
        actorTypes.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.All") });
        actorTypes.push({ id: "character", label: game.i18n.localize("ACTOR_BROWSER.Filter.Values.PCs") });
        actorTypes.push({ id: "npc", label: game.i18n.localize("ACTOR_BROWSER.Filter.Values.NPCs") });
        actorTypes.push({ id: "vehicle", label: game.i18n.localize("ACTOR_BROWSER.Filter.Values.Vehicles") });

        let wildcards = [];
        wildcards.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.All") });
        wildcards.push({ id: "yes", label: game.i18n.localize("ACTOR_BROWSER.Yes") });
        wildcards.push({ id: "no", label: game.i18n.localize("ACTOR_BROWSER.No") });

        let edges = this.buildItemList(actors, "edge", "ACTOR_BROWSER.All");
        let abilities = this.buildItemList(actors, "ability", "ACTOR_BROWSER.All");

        let paces = [];
        paces.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.All") });
        paces.push({ id: "ground", label: game.i18n.localize("SWADE.Movement.Pace.Ground.Label") });
        paces.push({ id: "fly", label: game.i18n.localize("SWADE.Movement.Pace.Fly.Label") });
        paces.push({ id: "swim", label: game.i18n.localize("SWADE.Movement.Pace.Swim.Label") });
        paces.push({ id: "burrow", label: game.i18n.localize("SWADE.Movement.Pace.Burrow.Label") });

        return {
            actorTypes: actorTypes,
            wildcards: wildcards,
            edges: edges,
            abilities: abilities,
            paces: paces,
            filters: this.filters,
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
        super.addDropdownListener("type", "typeFilter", browserDialog);
        super.addDropdownListener("wildcard", "wildcardFilter", browserDialog);
        super.addDropdownListener("edge", "edgeFilter", browserDialog);
        super.addDropdownListener("ability", "abilityFilter", browserDialog);
        super.addDropdownListener("pace", "paceFilter", browserDialog);

        //Add a keyup listener on the search desc input so that we can filter as we type
        const searchDescSelector = browserDialog.element.querySelector('input.search-desc');
        searchDescSelector?.addEventListener("keyup", async event => {
            this.searches.searchDesc = event.target.value;
            let data = await browserDialog._prepareContext();
            await browserDialog.renderActorList(data);
        });
    }
}