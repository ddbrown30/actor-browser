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
        let listPartial = await loadTemplates([game.actorBrowser.systemHandler.getActorListTemplate()]);
        Handlebars.registerPartial("actorListPartial", listPartial[0]);
        
        let filtersTemplate = game.actorBrowser.systemHandler.getAdditionalFiltersTemplate();
        if (filtersTemplate) {
            let filtersPartial = await loadTemplates([filtersTemplate]);
            Handlebars.registerPartial("additionalFiltersPartial", filtersPartial[0]);
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

    static parseJson(str) {
        try {
            str = str.replace("<p>", "");
            str = str.replace("</p>", "");
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    static getSelected() {
        let targets = Array.from(game.user.targets);
        return targets.length ? targets : canvas.tokens.controlled;
    }

    static getDocumentOwners(document) {
        const permissions = document.ownership ?? document.data?.ownership;
        if (!permissions) return null;
        const owners = [];
        for (const userId in permissions) {
            if (permissions[userId] === foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
                let user = game.users.get(userId);
                if (!user.isGM) {
                    owners.push(user);
                }
            } 
        }
        return owners;
    }

    /**
     * Retrieves a key using the given value
     * @param {Object} object -- the object that contains the key/value
     * @param {*} value 
     */
    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}