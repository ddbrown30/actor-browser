import { PATH } from "../module-config.js";


export class BaseSystem {

    getAdditionalFiltersTemplate() {
        return "";
    }

    getActorListTemplate() {
        return `${PATH}/templates/partials/actor-list-base.hbs`;
    }

    getIndexFields() {
        return [
            "prototypeToken.randomImg",
            "prototypeToken.texture",
        ];
    }

    getActorTypes() {
        return [];
    }

    filterActors(actors) {
        return actors;
    }

    async buildRowData(actors, browserDialog) {
        let rowData = [];
        for (const actor of actors) {
            let data = (await this.buildCommonRowData(actor, browserDialog));
            rowData.push(data);
        }

        return rowData;
    }

    async buildCommonRowData(actor, browserDialog) {
        let img = actor.img;
        if (browserDialog.showToken) {
            if (actor.prototypeToken.randomImg) {
                if (actor._lastWildcard) {
                    img = actor._lastWildcard;
                } else if (actor instanceof Actor) {
                    img = (await actor.getTokenDocument()).texture.src ?? actor.img;
                }
            } else if (actor.prototypeToken.texture.src) {
                img = actor.prototypeToken.texture.src;
            }
        }

        let data = {
            uuid: actor.uuid,
            tooltip: this.getTooltip(actor),
            img: { display: img, sortValue: undefined },
            name: { display: actor.name, sortValue: actor.name },
        };

        return data;
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
            } while (folder = folder.folder);
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