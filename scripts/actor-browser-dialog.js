import { DEFAULT_CONFIG } from "./module-config.js";
import { Utils } from "./utils.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ActorBrowserDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "actor-browser-dialog",
        tag: "div",
        classes: ["actor-browser-dialog"],
        window: { title: "ACTOR_BROWSER.ActorBrowser" },
        position: { width: 1000, height: 600 },
        actions: {
            select: function (event, button) { this.select(); },
            close: function (event, button) { this.close(); }
        },
    };

    static PARTS = {
        body: {
            template: DEFAULT_CONFIG.templates.actorBrowserDialogBody,
        },
        footer: {
            template: DEFAULT_CONFIG.templates.actorBrowserDialogFooter,
        }
    };

    static ALL_ID = "all";
    static WORLD_ACTORS_ID = "worldActors";

    constructor(options = {}) {
        if (options.validFilterSources && !Array.isArray(options.validFilterSources) ) {
            Utils.showNotification("error", "validFilterSources was not an array");
            delete options.validFilterSources;
        }

        super(options);

        this.dragDrop = new foundry.applications.ux.DragDrop({
            dragSelector: '.actor-option',
            callbacks: {
                dragstart: this.onDragStart.bind(this),
            }
        });

        this.systemHandler = game.actorBrowser.systemHandler;
        this.systemHandler.clearFilters(this);
        this.systemHandler.clearSearches(this);
    }

    onDragStart(event) {
        if ('link' in event.target.dataset) return;

        let dragData = {
            type: "Actor",
            uuid: event.target.dataset.actorId,
        };

        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    async _prepareContext(_options) {
        let actors = [];
        let sources = [];

        if (this.options.worldActorsOnly) {
            this.sourceFilter = ActorBrowserDialog.WORLD_ACTORS_ID;
            sources.push({ id: ActorBrowserDialog.WORLD_ACTORS_ID, label: game.i18n.localize("ACTOR_BROWSER.Source.WorldActors") });
        } else {
            //Add an "all" default and the world actors to the sources list
            sources.push({ id: ActorBrowserDialog.ALL_ID, label: game.i18n.localize("ACTOR_BROWSER.Source.AllActors") });
            sources.push({ id: ActorBrowserDialog.WORLD_ACTORS_ID, label: game.i18n.localize("ACTOR_BROWSER.Source.WorldActors") });
        }

        //Grab the actors that are local to this world
        actors = actors.concat(...this.getWorldActors());

        if (!this.options.worldActorsOnly) {
            //Grab all actors from compendiums
            let packActors = await this.getPackActors();
            sources = sources.concat(...packActors.sources);
            actors = actors.concat(...packActors.actors);
        }

        if (this.options.validFilterSources) {
            //We have been provided a list of valid sources. Filter out what doesn't match
            let filteredSources = sources.filter((s) => this.options.validFilterSources.find((f) => f == s.id));
            if (filteredSources.length) {
                //We will only use the filtered sources if there is at least one valid source
                sources = filteredSources;
            }
        }

        if (!this.sourceFilter) {
            if (this.options.initialSourceFilter) {
                this.sourceFilter = sources.find((s) => s.id == this.options.initialSourceFilter) ? this.options.initialSourceFilter : sources[0].id;
            } else {
                this.sourceFilter = sources[0].id;
            }
        }

        let additionalFiltersData = this.systemHandler.getAdditionalFiltersData(this, actors);
        let additionalSearchesData = this.systemHandler.getAdditionalSearchesData(this, actors);

        const headerData = this.getHeaderData();

        this.searchName = this.searchName ?? "";
        this.sortColumn = this.sortColumn ?? "name";
        this.sortOrder = this.sortOrder ?? 1;

        let filteredActors = this.filterActors(actors);
        this.rowData = await this.systemHandler.buildRowData(filteredActors, headerData);
        this.rowData = this.filterRows(this.rowData);
        this.rowData = this.sortRows(this.rowData, this.sortColumn, this.sortOrder);

        let selectButtonString = this.getSelectButtonString();

        return {
            sources: sources,
            sourceFilter: this.sourceFilter,
            searchName: this.searchName,
            actors: this.rowData,
            selectedActor: this.selectedActor,
            selectButtonString: selectButtonString,
            additionalFiltersData: additionalFiltersData,
            additionalSearchesData: additionalSearchesData,
            headerData: headerData,
        };
    };

    /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
    _onRender(context, options) {
        this.activateListeners();
    }

    async renderActorList(data) {
        //Re-render just the actor list with the newly filtered list and replace the html
        const content = await renderTemplate(DEFAULT_CONFIG.templates.actorList, data);
        let listPanel = this.element.querySelector(".list-panel");
        let actorList = listPanel.querySelector(".actor-list");
        actorList.innerHTML = content;

        //We need to activate listeners again since we just stomped over the existing html
        this.activateTableListeners(this.element);
    }

    activateListeners() {
        //Add a keyup listener on the searchName input so that we can filter as we type
        const searchNameSelector = this.element.querySelector('input.search-name');
        searchNameSelector.addEventListener("keyup", async event => {
            this.searchName = event.target.value;
            let data = await this._prepareContext();
            await this.renderActorList(data);
        });

        //Add the listener to the source dropdown
        const filterSelector = this.element.querySelector('select[id="source-filter"]');
        filterSelector.addEventListener("change", async event => {
            const selection = $(event.target).find("option:selected");
            this.sourceFilter = selection.val();
            let data = await this._prepareContext();
            await this.renderActorList(data);
        });

        this.activateTableListeners(this.element);
        this.systemHandler.activateListeners(this);
    }

    activateTableListeners(element) {
        //Grab all the table header cells and add clicks to them so we can sort by column
        const columns = element.querySelectorAll("th");
        for (let column of columns) {
            let columnName = column.dataset.sortId;
            if (columnName) {
                column.addEventListener("click", async event => {
                    if (this.sortColumn == columnName) {
                        //We're clicking the same column so reverse the sort order
                        this.sortOrder *= -1;
                    }
                    else {
                        //This is a different column that we had sorted before so set our sort to 1
                        this.sortOrder = 1;
                    }
                    this.sortColumn = columnName;
                    let data = await this._prepareContext();
                    await this.renderActorList(data);
                });
            }
        }

        //Add click listeners to the table rows so we can select them
        const rows = element.querySelectorAll("tr");
        for (let row of rows) {
            if (row.rowIndex == 0) continue; //Skip the header row

            row.addEventListener("click", async event => {
                this.selectedActor = row.dataset.actorId;

                //Loop over the rows and add/remove the selected class as needed
                for (let r of rows) {
                    if (!r.dataset?.actorId) continue;
                    if (r.dataset.actorId == this.selectedActor) {
                        if (!r.classList.contains("selected")) {
                            r.classList.add("selected");
                        }
                    } else {
                        r.classList.remove("selected");
                    }
                }

                //Update the select button
                const selectButton = element.querySelector('[data-action="select"]');
                let selectButtonString = this.getSelectButtonString();
                selectButton.textContent = selectButtonString;
                selectButton.disabled = false;
            });

            row.addEventListener("dblclick", async event => {
                this.select();
            });
        }

        this.dragDrop.bind(this.element);
    }

    async getPackActors() {
        let actors = [];
        let sources = [];
        for (const pack of game.packs) {
            if (pack.documentName != "Actor") continue;
            if (!pack.testUserPermission(game.user, "OBSERVER")) continue;

            let packIndex = await pack.getIndex({ fields: this.systemHandler.constructor.INDEX_FIELDS });
            if (packIndex.size == 0) continue;

            packIndex = this.filterActorsByType(packIndex);
            if (packIndex.length == 0) continue;

            actors = actors.concat(...packIndex);
            let label = pack.title;
            if (pack.metadata.packageType == "world") {
                label += " (" + game.i18n.localize("ACTOR_BROWSER.WorldCompendium") + ")";
            } else {
                label += " (" + pack.metadata.packageName + ")";
            }
            sources.push({ id: pack.metadata.id, label: label });
        }

        return { actors, sources };
    }

    getWorldActors() {
        let actors = [];
        for (const actor of game.actors) {
            if (!actor.testUserPermission(game.user, "OBSERVER")) continue;
            actors.push(actor);
        }

        actors = this.filterActorsByType(actors);
        return actors;
    }

    getHeaderData() {
        const headerConfig = this.systemHandler.constructor.HEADER_CONFIG;
        let headerData = {};
        for (let column of Object.keys(headerConfig)) {
            headerData[column] = headerConfig[column];
        }
        return headerData;
    }

    filterActorsByType(actors) {
        let filtered = actors;

        //Remove invalid actor types
        const actorTypes = this.systemHandler.constructor.ACTOR_TYPES;
        if (actorTypes.length) {
            filtered = filtered.filter((a) => actorTypes.includes(a.type));
        }

        //If the dialog has limited the available types, remove them here
        if (this.options.actorTypes?.length) {
            filtered = filtered.filter((a) => this.options.actorTypes.includes(a.type));
        }

        return filtered;
    }

    filterActors(actors) {
        let filtered = actors;

        //Filter by source
        if (this.sourceFilter != ActorBrowserDialog.ALL_ID) {
            if (this.sourceFilter == ActorBrowserDialog.WORLD_ACTORS_ID) {
                //Actors from a compendium index will not have a documentName so we can assume that actors that do must be world actors
                filtered = filtered.filter((a) => a.documentName == "Actor");
            } else {
                filtered = filtered.filter((a) => a.uuid.includes(this.sourceFilter));
            }
        }

        //Filter transient actors
        if (game.tcal) {
            //The TCAL module is active so filter out any transient actors so they don't clutter up the list
            filtered = filtered.filter((a) => !game.tcal.isTransientActor(a));
        }

        //System specific filter
        filtered = this.systemHandler.filterActors(filtered);

        return filtered;
    }

    filterRows(rowData) {
        let filtered = rowData;

        //Filter by the search string
        if (this.searchName) {
            filtered = filtered.filter((r) => r.name.display.toLowerCase().includes(this.searchName.toLowerCase()));
        }

        //If our selected actor does not exist in our filtered list, deselect it
        if (!filtered.find((r) => r.uuid == this.selectedActor)) {
            this.selectedActor = "";
        }

        return filtered;
    }

    sortRows(rows, sortColumn, sortOrder) {
        let retVal = rows.sort(function (a, b) {
            const sortA = a[sortColumn];
            const sortB = b[sortColumn];
            if (sortA.display == sortB.display) return 0;

            if (sortA.sortValue == Number.MAX_SAFE_INTEGER || sortB.sortValue == Number.MAX_SAFE_INTEGER) {
                //If these are both max int it means they're both "invalid" values but they may be different
                //In this case, do a string compare of their display value as a tie breaker but always treat "-" as higher so it gets pushed to the bottom of the list
                if (sortA.display == "-") return sortOrder;
                if (sortB.display == "-") return -1 * sortOrder;
                return sortA.display.localeCompare(sortB.display) * sortOrder;
            }

            if (typeof sortA.sortValue == "string" && typeof sortB.sortValue == "string") {
                return sortA.sortValue.localeCompare(sortB.sortValue) * sortOrder;
            } else {
                return (sortA.sortValue - sortB.sortValue) * sortOrder;
            }
        });

        return retVal;
    }

    getSelectButtonString() {
        let selectButtonString = game.i18n.localize(this.options.selector ? "ACTOR_BROWSER.Select" : "ACTOR_BROWSER.Open");
        if (this.selectedActor) {
            let actor = this.rowData.find((a) => a.uuid == this.selectedActor);
            selectButtonString += " " + actor.name.display;
        }
        return selectButtonString;
    }

    /**
     * Renders the dialog and awaits until the dialog is submitted or closed
     */
    async wait() {
        return new Promise((resolve, reject) => {
            // Wrap submission handler with Promise resolution.
            this.select = async result => {
                resolve(this.selectedActor);
                this.close();
            };

            this.addEventListener("close", event => {
                resolve(false);
            }, { once: true });

            this.render({ force: true });
        });
    }

    async select() {
        if (this.options.selector) {
            Utils.showNotification("error", game.i18n.localize("ACTOR_BROWSER.WaitError"));
            this.close();
            return;
        }

        //If we're not a selector, we want to open the actor sheet
        let actor = await fromUuid(this.selectedActor);
        actor.sheet.render(true);
    }
}