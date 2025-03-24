import { PATH } from "../module-config.js";


export class BaseSystem {

    getAdditionalFiltersTemplate() {
        return "";
    }

    getActorListTemplate() {        
        return `${PATH}/templates/partials/actor-list-base.hbs`;
    }

    getIndexFields() {
        return [];
    }

    getActorTypes() {
        return [];
    }

    filterActors(actors) {        
        return actors;
    }

    buildRowData(actors) {
        let rowData = [];
        for (const actor of actors) {
            let data = this.buildCommonRowData(actor);
            rowData.push(data);
        }

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

    getTooltip(actor) {
        let tooltip = "";
        let parsedUuid = parseUuid(actor.uuid);
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

    activateListeners(browserDialog) {
    }

    addDropdownListener(type, filterProperty, browserDialog) {
        let selectorString = 'select[id="' + type + '-filter"]';
        const selector = browserDialog.element.querySelector(selectorString);
        selector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.filters[filterProperty] = selection.val();
            browserDialog.render();
        });
    }

    onOpenBrowser() {
        this.filters = {}; 
    }
} 