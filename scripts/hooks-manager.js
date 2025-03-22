import { Utils } from "./utils.js";
import { registerSettings } from "./settings.js";
import { ActorBrowser } from "./actor-browser.js";
import { ActorBrowserDialog } from "./actor-browser-dialog.js";

export class HooksManager {
    /**
     * Registers hooks
     */
    static registerHooks() {
        /* ------------------- Init/Ready ------------------- */

        Hooks.on("init", async () => {
            game.actorBrowser = game.actorBrowser ?? {};

            // Expose API
            game.actorBrowser.ActorBrowserDialog = ActorBrowserDialog;

            registerSettings();

            ActorBrowser.createSystemHandler();
            
            Utils.loadTemplates();
        });

        Hooks.on("renderActorDirectory", async (app, html, data) => {
            await ActorBrowser.onRenderActorDirectory(app, html, data);
        });
    }
} 