export const NAME = "actor-browser";

export const TITLE = "Actor Browser";
export const SHORT_TITLE = "AB";

export const PATH = "modules/actor-browser";

export const CONST = {
    unusedValue: { display: "-", sortValue: Number.MAX_SAFE_INTEGER },
}

export const DEFAULT_CONFIG = {
    templates: {
        actorBrowserButton: `${PATH}/templates/actor-browser-button.hbs`,
        actorBrowserDialogBody: `${PATH}/templates/actor-browser-dialog-body.hbs`,
        actorBrowserDialogFooter: `${PATH}/templates/actor-browser-dialog-footer.hbs`,
        actorList: `${PATH}/templates/partials/actor-list.hbs`,
        actorRows: `${PATH}/templates/partials/actor-rows.hbs`,
    },
    progressiveRenderSize: 1000,
}

export const FLAGS = {
}

export const SETTING_KEYS = {
    showOnActorDirectory: "showOnActorDirectory",
    useSmallButton: "useSmallButton",
    useProgressiveRendering: "useProgressiveRendering",
    progressiveRenderSize: "progressiveRenderSize",
}

