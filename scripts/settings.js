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

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.useProgressiveRendering, {
        name: "ACTOR_BROWSER.Settings.UseProgressiveRenderingN",
        hint: "ACTOR_BROWSER.Settings.UseProgressiveRenderingH",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });

    Utils.registerSetting(MODULE_CONFIG.SETTING_KEYS.progressiveRenderSize, {
        name: "ACTOR_BROWSER.Settings.ProgressiveRenderSizeN",
        hint: "ACTOR_BROWSER.Settings.ProgressiveRenderSizeH",
        scope: "client",
        config: true,
        type: Number,
        default: MODULE_CONFIG.DEFAULT_CONFIG.progressiveRenderSize,
    });
}