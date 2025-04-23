import { CONST } from "../module-config.js";

export class BaseSystem {

    static ADDITIONAL_FILTERS_TEMPLATE = "";
    static ADDITIONAL_SEARCHES_TEMPLATE = "";
    static INDEX_FIELDS = [];
    static ACTOR_TYPES = [];
    static HEADER_CONFIG = {};

    filterActors(actors) {
        return actors;
    }

    getDefaultRowData() {
        let rowData = {};
        for (let column of Object.keys(HEADER_CONFIG)) {
            rowData[column] = CONST.unusedValue;
        }
        return rowData;
    }

    async buildRowData(actors, headerData) {
        let rowData = [];
        for (const actor of actors) {
            let data = this.buildCommonRowData(actor);
            rowData.push(data);
        }

        this.buildRowHtml(rowData, headerData);

        return rowData;
    }

    buildCommonRowData(actor) {
        let data = {
            uuid: actor.uuid,
            tooltip: this.getTooltip(actor),
            img: { display: actor.img, sortValue: undefined},
            name: { display: actor.name, sortValue: actor.name},
        };

        return data;
    }

    buildRowHtml(rowData, headerData) {
        for (let row of rowData) {
            row.rowHtml = this.getRowHtml(row, headerData);
        }
    }

    getRowHtml(rowData, headerData) {
        let rowHtml = "";
        for (let [prop, val] of Object.entries(headerData)) {
            rowHtml += `
            <td class="${val.class}">
                <p class="actor-row-text">${rowData[prop].display}</p>
            </td>
            `;
        }
        return rowHtml;
    }

    getTooltip(actor) {
        let tooltip = "";
        let parsedUuid = foundry.utils.parseUuid(actor.uuid);
        if (parsedUuid.collection.name == "CompendiumCollection") {
            tooltip = "Compendium: " + parsedUuid.collection.metadata.label + " (" + parsedUuid.collection.metadata.name + ")";
        } else {
            tooltip = this.getFolderPath(actor);
        }

        return tooltip;
    }

    getFolderPath(actor) {
        let folder = actor.folder;
        let path = "";
        if (folder) {
            do {
                path = folder.name + "/" + path;
            } while(folder = folder.folder);
        }

        path = "World/" + path;
        return path;
    }

    getAdditionalFiltersData(browserDialog, actors) {
        return {};
    }

    getAdditionalSearchesData(browserDialog, actors) {
        return {};
    }

    activateListeners(browserDialog) {
    }

    addDropdownListener(type, filterProperty, browserDialog) {
        let selectorString = 'select[id="' + type + '-filter"]';
        const selector = browserDialog.element.querySelector(selectorString);
        if (selector) {
            selector.addEventListener("change", async event => {
                const selection = $(event.target).find("option:selected");
                this.filters[filterProperty] = selection.val();
                let data = await browserDialog._prepareContext();
                browserDialog.renderActorList(data);
            });
        }
    }

    clearFilters() {
        this.filters = {};
    }

    clearSearches() {
        this.searches = {};
    }
}