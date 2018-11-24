# Todopia

**What is this thing?**

A fantasy rpg pretending to be a productivity tool!

**What, like [Habitica](https://habitica.com/static/home)?**

Yes!

**Why are you remaking Habitica?**

For fun! And it gets worse--this isn't even [the first time I've done this](https://www.github.com/davwards/elementals).

**How do I build it?**

1. Clone the repository
1. Make sure you have node installed (I'm using version 9.4, you could probably get away with a few versions older than that?)
1. Make sure you have yarn installed (for that sweet sweet multi-workspace goodness)
1. At the root of the repository, run: `yarn install`
1. Then build from source: `yarn run tsc`
1. Then run the tests! `yarn workspaces run test`

**How do I play?**

At the moment, you can only play on the command line.
Once you've built the project and ensured the tests can run,
you can run the CLI from the root directory of the repository like so:

```
$ node ./packages/applications/cli/bin/todopia.js #(and then a command; see below)
```

(I created a bash alias for that first bit so I didn't have to type it out all the time.)

I haven't created a nice usage guide for the CLI yet, but here are some commands you can use:

`player create Raven` will create a player named Raven.

`player login` will log you in as the player you've created, or give you a choice if you've created several players.

`player info` will show you stats for the currently logged in player.

`task create "Steal fire"` will create a task with no deadline titled "Steal fire".

`task create "Visit the underworld" --deadline 2019-11-05T12:15:00` will create a task titled "Visit the underworld" due on November 5, 2019, at 12:15pm local time.

`task list` will show you all the tasks which the currently logged in player needs to complete.

`task complete` will show you your task list and let you choose one to mark as completed. Run `player info` to see how your stats have changed afterward!

