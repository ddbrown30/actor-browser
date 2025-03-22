import { Utils } from "./utils.js";
import { SETTING_KEYS, DEFAULT_CONFIG } from "./module-config.js";
import { ActorBrowserDialog } from "./actor-browser-dialog.js";
import { Swade } from "./systems/swade.js";
import { BaseSystem } from "./systems/base-system.js";
import { DnD5e } from "./systems/dnd5e.js";
import { PF2e } from "./systems/pf2e.js";

export class ActorBrowser {

    static async createSystemHandler() {
        if (game.system.id == "swade") {
            game.actorBrowser.systemHandler = new Swade();
        } else if (game.system.id == "dnd5e") {
            game.actorBrowser.systemHandler = new DnD5e();
        } else if (game.system.id == "pf2e") {
            game.actorBrowser.systemHandler = new PF2e();
        } else {
            game.actorBrowser.systemHandler = new BaseSystem();
        }
    }

    static async onRenderActorDirectory(app, html, data) {
        if (!Utils.getSetting(SETTING_KEYS.showOnActorDirectory)) return;

        let header = html[0].querySelector(".directory-header");
        const browserButton = await renderTemplate(DEFAULT_CONFIG.templates.actorBrowserButton);
        header.insertAdjacentHTML("beforeend", browserButton);

        //Respond to the open button
        const button = html.find(".open-actor-browser-button");
        button.click(ev => {
            new ActorBrowserDialog().render(true);
        });
    }
} 