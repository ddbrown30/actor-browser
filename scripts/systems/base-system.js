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
            let data = {
                uuid: actor.uuid,
                img: { display: actor.img, sortValue: undefined},
                name: { display: actor.name, sortValue: actor.name},
            };

            rowData.push(data);
        }

        return rowData;
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
            this[filterProperty] = selection.val();
            browserDialog.render();
        });
    }
} 