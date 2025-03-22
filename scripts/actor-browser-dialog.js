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

    static WORLD_ACTORS_ID = "worldActors";

    constructor(options = {}) {
        super(options);
        this.selector = !!options.selector;

        this.dragDrop = new DragDrop({
            dragSelector: '.actor-option',
            callbacks: {
                dragstart: this.onDragStart.bind(this),
            }
        });
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
        this.systemHandler = game.actorBrowser.systemHandler;

        let actors = [];
        let sources = [];

        //Add a "nothing" default and the world actors to the sources list
        sources.push({ id: "", label: game.i18n.localize("ACTOR_BROWSER.FilterAllActors") });
        sources.push({ id: ActorBrowserDialog.WORLD_ACTORS_ID, label: game.i18n.localize("ACTOR_BROWSER.FilterWorldActors") });

        //Grab the actors that are local to this world
        actors = actors.concat(...this.getWorldActors());

        //Grab all actors from compendiums
        let packActors = await this.getPackActors();
        sources = sources.concat(...packActors.sources);
        actors = actors.concat(...packActors.actors);

        this.search = this.search ?? "";
        this.sourceFilter = this.sourceFilter ?? sources[0].id;
        this.sortColumn = this.sortColumn ?? "name";
        this.sortOrder = this.sortOrder ?? 1;

        actors = this.filterActors(actors);
        this.rowData = this.systemHandler.buildRowData(actors);
        this.rowData = this.sortRows(this.rowData, this.sortColumn, this.sortOrder);

        //Filter the final rows in a transient variable so that we can refilter without requiring a render call
        let filteredRows = this.filterRows(this.rowData);

        let selectButtonString = this.getSelectButtonString();
        
        let additionalFiltersData = this.systemHandler.getAdditionalFiltersData();

        return {
            sources: sources,
            sourceFilter: this.sourceFilter,
            search: this.search,
            actors: filteredRows,
            selectedActor: this.selectedActor,
            selectButtonString: selectButtonString,
            additionalFiltersData: additionalFiltersData,
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

    async renderActorList(event) {
        let filteredRows = this.filterRows(this.rowData);
        let data = {
            actors: filteredRows,
            selectedActor: this.selectedActor,
        };

        //Re-render just the actor list with the newly filtered list and replace the html
        const content = await renderTemplate(this.systemHandler.getActorListTemplate(), data);
        let optionsBox = event.target.closest(".search-panel");
        let actorList = optionsBox.querySelector(".actor-list");
        actorList.innerHTML = content;

        //We need to activate listeners again since we just stomped over the existing html
        this.activateTableListeners(this.element);
    }

    activateListeners() {
        //Add a keyup listener on the search input so that we can filter as we type
        const searchSelector = this.element.querySelector('input.search');
        searchSelector.addEventListener("keyup", async event => {
            this.search = event.target.value;
            await this.renderActorList(event);
        });

        //Add the listener to the source dropdown
        const filterSelector = this.element.querySelector('select[id="source-filter"]');
        filterSelector.addEventListener("change", event => {
            const selection = $(event.target).find("option:selected");
            this.sourceFilter = selection.val();
            this.render();
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
                    this.render();
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

            let packIndex = await pack.getIndex({ fields: this.systemHandler.getIndexFields() });
            if (packIndex.size == 0) continue;

            packIndex = this.systemHandler.filterActors(packIndex);
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

        return actors;
    }

    filterActors(actors) {
        let filtered = actors;

        //Filter by source
        if (this.sourceFilter) {
            if (this.sourceFilter == ActorBrowserDialog.WORLD_ACTORS_ID) {
                //Actors from a compendium index will not have a documentName so we can assume that actors that do must be world actors
                filtered = filtered.filter((a) => a.documentName == "Actor");
            } else {
                filtered = filtered.filter((a) => a.uuid.includes(this.sourceFilter));
            }
        }

        //System specific filter
        filtered = this.systemHandler.filterActors(filtered);

        return filtered;
    }

    filterRows(rowData) {
        let filtered = rowData;

        //Filter by the search string
        if (this.search) {
            filtered = filtered.filter((r) => r.name.display.toLowerCase().includes(this.search.toLowerCase()));
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
            if (typeof sortA.sortValue == "string") {
                return sortA.sortValue.localeCompare(sortB.sortValue) * sortOrder;
            } else {
                return (sortA.sortValue - sortB.sortValue) * sortOrder;
            }
        });

        return retVal;
    }

    getSelectButtonString() {
        let selectButtonString = game.i18n.localize(this.selector ? "ACTOR_BROWSER.Select" : "ACTOR_BROWSER.Open");
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
        if (this.selector) {
            Utils.showNotification("error", game.i18n.localize("ACTOR_BROWSER.WaitError"));
            this.close();
            return;
        }

        //If we're not a selector, we want to open the actor sheet
        let actor = await fromUuid(this.selectedActor);
        actor.sheet.render(true);
    }
}