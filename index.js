var clc = require('cli-color'), random = require('seedable-random');

var years = parseInt(process.argv[2]), seed = process.argv.length > 3 ? parseFloat(process.argv[3]) : Math.random();

random.seed(seed);

function randomInt(min, max) {
    return Math.floor(random() * (max - min + 1) + min);
}

// Is it a future with lots of parks or just buildings
var goodFuture = random() > 0.5;
console.log(clc.yellow("Using seed " + seed + ", ") + (goodFuture ? clc.greenBright("It's a good future!") : clc.redBright("It's a bad future :(")));

function generate(mapWidth, mapHeight, deadYear) {
    var map = [];

    function makeBorders(cornerTopLeft, cornerTopRight, borderVert, borderHoriz, xPos, yPos, width, height) {
        map[yPos][xPos] = map[yPos + height][xPos + width] = cornerTopLeft;
        map[yPos][xPos + width] = map[yPos + height][xPos] = cornerTopRight;

        for (var x = 1; x < width; x++) {
            map[yPos][xPos + x] = map[yPos + height][xPos + x] = borderHoriz;
        }
        for (var y = 1; y < height; y++) {
            map[yPos + y][xPos] = map[yPos + y][xPos + width] = borderVert;
        }
    }

    function fill(xPos, yPos, width, height, char) {
        for (var y = 1; y < height; y++) {
            for (var x = 1; x < width; x++) {
                map[y + yPos][x + xPos] = (typeof char === "function") ? char() : char;
            }
        }
    }

    function generateBuilding(xPos, yPos, width, height, disallowSections) {
        // Buildings sometimes have multiple sections
        var sections = disallowSections ? 1 : randomInt(1, Math.floor(Math.min(width, height) / 5));

        var bg = clc.whiteBright.bgBlackBright;

        makeBorders(bg("+"), bg("+"), bg("|"), bg("-"), xPos, yPos, width, height);

        fill(xPos, yPos, width, height, bg(" "));

        // Place an antennae on the top
        var centerX = xPos + Math.floor(width / 2),
            centerY = yPos + Math.floor(height / 2);

        var antBg = clc.yellowBright.bgBlackBright;
        makeBorders(antBg("/"), antBg("\\"), antBg("|"), antBg("-"), centerX - 1, centerY - 1, 1, 1);

        var sectionIteration = sections - 1, xOffset = xPos, yOffset = yPos, lastWidth = width, lastHeight = height;
        for (var i = 0; i < sectionIteration; i++) {
            var xChange = randomInt(1, width / sections), yChange = randomInt(1, height / sections);
            xOffset += xChange;
            yOffset += yChange;

            lastWidth -= xChange + randomInt(0, 2);
            lastHeight -= yChange + randomInt(0, 2);

            generateBuilding(xOffset, yOffset, lastWidth, lastHeight, true);
        }
    }

    function generatePark(xPos, yPos, width, height) {
        // Generate borders
        makeBorders(clc.red("/"), clc.red("\\"), clc.red("|"), clc.red("-"), xPos, yPos, width, height);

        fill(xPos, yPos, width, height, function () {
            return random() > 0.5 ? clc.green("*") : clc.greenBright("~");
        })
    }

    // Setup map
    for (var y = 0; y < mapHeight; y++) {
        map[y] = [];
        for (var x = 0; x < mapWidth; x++) {
            map[y][x] = ".";
        }
    }

    // Find if something is already in a space
    function inSpace(xPos, yPos, width, height) {
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                if (map[yPos + y][xPos + x] !== ".") return false;
            }
        }
        return true;
    }

    // Create something with a function
    function createSomething(min, max, minWidth, maxWidth, minHeight, maxHeight, func) {
        var totalCount = randomInt(min, max);
        for (var p = 0; p < totalCount; p++) {
            var xPos, yPos, width, height, isValid = false;

            var tries = 0, canGenerate = true;
            while (!isValid) {
                width = randomInt(minWidth, maxWidth);
                height = randomInt(minHeight, maxHeight);
                xPos = Math.floor(random() * (mapWidth - width));
                yPos = Math.floor(random() * (mapHeight - height));

                isValid = inSpace(xPos, yPos, width, height);
                tries++;

                // Give up to avoid infinite loops
                if (tries > 100) {
                    canGenerate = false;
                    break;
                }
            }
            if (canGenerate) func(xPos, yPos, width, height);
        }
    }

    function getBuildingCount(yrs, noLimit) {
        var count = Math.max(yrs / 100, 5);
        if (!noLimit) count = Math.min(Math.min(mapWidth, mapHeight) / 5, count);
        return count;
    }

    if (goodFuture) {
        var goodBuildingCount = getBuildingCount(years);
        // If the future is 'good', parks stay at the same amount but we get more buildings
        createSomething(goodBuildingCount, goodBuildingCount * 1.5, 5, 50, 2, 25, generateBuilding);
        createSomething(20, 50, 5, 160, 5, 40, generatePark);
    } else {
        // If the future is 'bad', parks start going away and we get a lot more buildings
        var badBuildingCount = getBuildingCount(years, true);
        createSomething(badBuildingCount, badBuildingCount * 2, 5, 50, 2, 25, generateBuilding);
        var maxBuildingCount = getBuildingCount(deadYear), parkCount = maxBuildingCount - badBuildingCount;
        createSomething(parkCount * 0.5, parkCount, 5, 50, 2, 25, generatePark);
    }

    // Generate some things
    //createSomething(5, 10, 5, 20, 5, 10, generatePark);
    //createSomething(10, 15, 5, 50, 2, 25, generateBuilding);

    var roadTemplate = [
        ["#", "-", "-", "-", "-"],
        ["|", " ", " ", " ", " "],
        ["|", " ", " ", " ", " "]
    ];

    // In the remaining space, make some roads
    function makeRoads() {
        var segmentWidth = 5, segmentHeight = 3;
        var mapRoadWidth = Math.floor(mapWidth / segmentWidth),
            mapRoadHeight = Math.floor(mapHeight / segmentHeight);

        for (var y = 0; y < mapRoadHeight; y++) {
            for (var x = 0; x < mapRoadWidth; x++) {

                var openTop = random() > 0.5,
                    openLeft = random() > 0.5;

                for (var ry = 0; ry < segmentHeight; ry++) {
                    for (var rx = 0; rx < segmentWidth; rx++) {
                        var realX = x * segmentWidth + rx,
                            realY = y * segmentHeight + ry;

                        if (map[realY][realX] === ".") {
                            if (openLeft && ry !== 0 && rx === 0) map[realY][realX] = " ";
                            else if (openTop && ry === 0 && rx !== 0) map[realY][realX] = " ";
                            else map[realY][realX] = roadTemplate[ry][rx];

                            map[realY][realX] = map[realY][realX] === "#" ? clc.cyanBright(map[realY][realX]) : clc.cyan(map[realY][realX]);
                        }
                    }
                }
            }
        }
    }

    makeRoads();

    return map;
}

var mapWidth = 270, mapHeight = 57;

// Assume the death lasts for 10^2 years
var deathYear = Math.pow(10, 11), deathLength = Math.pow(10, 5), deadYear = deathYear + deathLength, isDying = false,
    radius = Math.ceil(Math.sqrt(Math.pow(mapWidth / 2, 2) + Math.pow(mapHeight / 2, 2)));

var map = generate(mapWidth, mapHeight, deadYear);

if (years > deathYear) {
    isDying = true;

    // How much would we decrement per year?
    var pastYears = years - deathYear,
        decrement = radius / deathLength;

    radius = radius - pastYears * decrement;
    if (radius < 0) radius = 0;
}
var circleX = Math.floor(mapWidth / 2), circleY = Math.floor(mapHeight / 2);

// Output map
function output() {
    for (var y = 0; y < mapHeight; y++) {
        var line = "";
        for (var x = 0; x < mapWidth; x++) {
            var inCircle = !isDying || (Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2) < (radius * radius));
            if (inCircle) line += map[y][x];
            else line += " ";
        }
        console.log(line);
    }
}
output();