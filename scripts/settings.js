import * as MODULE_CONFIG from "./module-config.js";
import { Utils } from "./utils.js";

export function registerSettings() {

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.showOnActorDirectory, {
        name: "ACTOR_BROWSER.Settings.ShowOnActorDirectoryN",
        hint: "ACTOR_BROWSER.Settings.ShowOnActorDirectoryH",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: s => {
            ui.actors.render(true);
        }
    });

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.useSmallButton, {
        name: "ACTOR_BROWSER.Settings.UseSmallButtonN",
        hint: "ACTOR_BROWSER.Settings.UseSmallButtonH",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: s => {
            ui.actors.render(true);
        }
    });
}