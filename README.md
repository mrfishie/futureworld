FutureWorld
===========

My creation for '[The World in the Future](http://codegolf.stackexchange.com/questions/38030/the-world-in-the-future)' code golf challenge... before it was modified to be more specific.

To run it, you first need to install [NodeJS](http://nodejs.org/).

While you are waiting, clone the FutureWorld repo into a folder.

	$ git clone git://github.com/mrfishie/futureworld.git

Once Node has installed, enter the directory that the repo has been cloned to, and install all Node packages.

	$ npm install

You can now run the FutureWorld program:

	$ node ./index.js <year> [seed]

`<year>` should be a positive integer. If the year is bigger than 10^11, the 'big crunch' will begin, and will last for 10^2 years.

`[seed]` is an optional positive float that can be used to seed the random generator. If the same seed and year is used, you will get the same result.

## How it works

A future can be either good or bad. A good future means that both parks and buildings will continue to be generated until the universe dies. A bad future means that, over time, more and more buildings will be generated, meaning that less and less parks will exist.

The background (any character that does not have a park or building) is a tile of squares, with each square having a random amount of sides missing. This is to represent roads.