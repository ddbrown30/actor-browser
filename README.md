# Actor Browser

This module for Foundry VTT adds a button to the Actors tab that opens an Actor Browser. The browser allows you to see all actors from the world as well as all compendiums. Users can only see actors for which they have Observer ownership or higher.

The browser shows a summary of information for each actor and the list can be filtered by string, source, and other system specific methods.

Selecting an actor opens its actor sheet and the browser supports drag and drop.

The browser will work for all systems but has specific support for swade, dnd5e, and pf2e.

<img src="https://github.com/ddbrown30/actor-browser/blob/main/actor_browser.webp" width="700">

### API Use

The browser is also exposed to the API allowing module makers to leverage it to allow the user to select actors.

To do so, you just need to call the following function:

```let result = await new game.actorBrowser.ActorBrowserDialog({selector: true}).wait();```

The result will contain the UUID of the selected actor. The `selector: true` option tells the browser to select and return an actor rather than using the default behaviour of opening the actor sheet.
