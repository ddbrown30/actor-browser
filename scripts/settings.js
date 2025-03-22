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
        requiresReload: true,
    });

}