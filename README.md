# Actor Browser

This module for Foundry VTT adds a button to the Actors tab that opens an Actor Browser. The browser allows you to see all actors from the world as well as all compendiums. Users can only see actors for which they have Observer ownership or higher.

The browser shows a summary of information for each actor and the list can be filtered by string, source, and other system specific methods.

Selecting an actor opens its actor sheet and the browser supports drag and drop.

The browser will work for all systems but has specific support for swade, dnd5e, and pf2e. If you are interested in adding support for a new system, check out the guide below.

<img src="https://github.com/ddbrown30/actor-browser/blob/main/actor_browser.webp" width="700">

## API Use

The browser is also exposed to the API allowing module makers to leverage it to allow the user to select actors.

To do so, you just need to call the following function:

```let result = await new game.actorBrowser.ActorBrowserDialog({selector: true}).wait();```

The result will contain the UUID of the selected actor. The `selector: true` option tells the browser to select and return an actor rather than using the default behaviour of opening the actor sheet.

### Options

- `actorTypes` This is an array of strings that allows you to limit the valid actor types e.g. `{ actorType: ["npc"] }`
- `worldActorsOnly` If set to true, World Actors will be set as the default source filter and will be the only option in the list  

## Adding a New System

If you would like to add support for a new system, the process is relatively straightforward. I would suggest having a look at swade.js as an example.

A system requires two new files with an optional third. The first is the system handler file. This class is responsible for preparing the data that will be used to render the actor list. The second is the actor list template. This is creates the html used to display the actor list. The final optional file is the additional filters template. This allows you to add additional filters to the left side of the browser.

### System Handler

- `getActorListTemplate - Required` This returns the name of the .hbs file that we will use when rendering the list. Check out `actor-list-swade.hbs` for an example.
- `buildRowData - Required` This function takes the list of actors and processes it into row data to be used when rendering. A uuid and name property are required. The rest of the properties are dependent on the system but should follow the format of {display, sortValue}. - - `display` is the string that will be shown to the user and `sortValue` is what we use when sorting by that column. For example, size in dnd5e ranges from Tiny to Gargantuan but we don't want to sort that alphabetically, so we set the sortValue for Tiny to 0 and increase from there.
- `getIndexFields - Optional` This is a list of additional field to request when getting the index from the compendiums. This allows you to grab additional stats for the actor without having to fully load the document (which is slow, especially when you have a lot of actors).
- `getActorTypes - Optional` This is the list of supported actor types. If you want to support all actor types for your system, you do not need to override this function.
- `filterActors - Optional` This allows you to do additional filtering which is covered more later.
- `getAdditionalFiltersTemplate - Optional` This returns the name of the .hbs file that we will use when rendering the additional filters. Check out `additional-filters-swade.hbs` for an example.
- `getAdditionalFiltersData - Optional` If using additional filters, this is where you can prepare data to be used when rendering.
- `activateListeners - Optional` This allows you to activate html listeners on any elements in the dialog. This is mainly used for hooking into elements in the additional filters but could be used for other elements.

### Actor List Template

The actor list template is the Handlebars definition of the actor list. It must follow the format of a set of table headers followed by the collection of table rows for each actor. Check out any of the existing actor list files for examples.

By adding a `data-sort-id` value to a table header entry, you mark that as a sortable column. The id value should match the name of the column you created in `buildRowData`. For example, if you have a column of `size: { display, sortValue }`, your `data-sort-id` should be `size`.

Be sure to copy exactly the `tr` elements. Failure to do so will cause bugs with the selection logic.

### Additional Filters

If you would like to add additional filters, you can optionally create another .hbs file to do this. Check out `additional-filters-swade.hbs` for an example. In there, we are adding another drop down the filters based on the actor type (PC, NPC, or Vehicle). The logic for this is then implemented in `getAdditionalFiltersData` and `activateListeners` in the Swade handler class.

### Hooking it Up

The final step to adding the a new system is to add it to `createSystemHandler` in `actor-browser.js`. Just add your system to the if/else tree and instantiate your system handler. If you've done everything else correctly, everything else should be handled for you automatically.

If you have any questions or issues, feel free to reach out.
