import * as MODULE_CONFIG from "./module-config.js";

/**
 * Provides helper methods for use elsewhere in the module
 */
export class Utils {

    /**
     * Get a single setting using the provided key
     * @param {*} key
     * @returns {Object} setting
     */
    static getSetting(key) {
        return game.settings.get(MODULE_CONFIG.NAME, key);
    }

    /**
     * Sets a single game setting
     * @param {*} key
     * @param {*} value
     * @param {*} awaitResult
     * @returns {Promise | ClientSetting}
     */
    static async setSetting(key, value, awaitResult=false) {
        if (!awaitResult) {
            return game.settings.set(MODULE_CONFIG.NAME, key, value);
        }

        await game.settings.set(MODULE_CONFIG.NAME, key, value).then(result => {
            return result;
        }).catch(rejected => {
            throw rejected;
        });
    }

    /**
     * Register a single setting using the provided key and setting data
     * @param {*} key
     * @param {*} metadata
     * @returns {ClientSettings.register}
     */
    static registerSetting(key, metadata) {
        return game.settings.register(MODULE_CONFIG.NAME, key, metadata);
    }

    /**
     * Register a menu setting using the provided key and setting data
     * @param {*} key
     * @param {*} metadata
     * @returns {ClientSettings.registerMenu}
     */
    static registerMenu(key, metadata) {
        return game.settings.registerMenu(MODULE_CONFIG.NAME, key, metadata);
    }

    /**
     * Loads templates for partials
     */
    static async loadTemplates() {
        let listPartial = await foundry.applications.handlebars.loadTemplates([MODULE_CONFIG.DEFAULT_CONFIG.templates.actorList]);
        Handlebars.registerPartial("actorBrowserListPartial", listPartial[0]);

        let filtersTemplate = game.actorBrowser.systemHandler.constructor.ADDITIONAL_FILTERS_TEMPLATE;
        if (filtersTemplate) {
            let filtersPartial = await foundry.applications.handlebars.loadTemplates([filtersTemplate]);
            Handlebars.registerPartial("actorBrowserAdditionalFiltersPartial", filtersPartial[0]);
        }

        let searchesTemplate = game.actorBrowser.systemHandler.constructor.ADDITIONAL_SEARCHES_TEMPLATE;
        if (searchesTemplate) {
            let searchesPartial = await foundry.applications.handlebars.loadTemplates([searchesTemplate]);
            Handlebars.registerPartial("actorBrowserAdditionalSearchesPartial", searchesPartial[0]);
        }
    }

    static showNotification(type, message, options) {
        const msg = `${MODULE_CONFIG.SHORT_TITLE} | ${message}`;
        return ui.notifications[type](msg, options);
    }

    static consoleMessage(type, {objects=[], message="", subStr=[]}) {
        const msg = `${MODULE_CONFIG.TITLE} | ${message}`;
        const params = [];
        if (objects && objects.length) params.push(objects);
        if (msg) params.push(msg);
        if (subStr && subStr.length) params.push(subStr);
        return console[type](...params);
    }

    static hasModuleFlags(obj) {
        if (!obj.flags) {
            return false;
        }

        return obj.flags[MODULE_CONFIG.NAME] ? true : false;
    }

    static getModuleFlag(obj, flag) {
        if (!Utils.hasModuleFlags(obj)) {
            return;
        }

        return obj.flags[MODULE_CONFIG.NAME][flag];
    }

    static async setModuleFlag(obj, flag, data) {
        return await obj.setFlag(MODULE_CONFIG.NAME, flag, data);
    }
}