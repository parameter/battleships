const _ = require('underscore');

const Cols = 10;
const Rows = 10;

const isCollision = function(ships,x,y) {
    var collision = false;
    for (var i = 0; i < ships.length; i++) {
        for (var ii = 0; ii < ships[i].length; ii++) {

            if ((ships[i][ii].x === x-1 && ships[i][ii].y === y-1) ||   // above left
                (ships[i][ii].x === x && ships[i][ii].y === y-1) ||     // above
                (ships[i][ii].x === x+1 && ships[i][ii].y === y-1) ||   // above right
                (ships[i][ii].x === x-1 && ships[i][ii].y === y) ||     // left 
                (ships[i][ii].x === x && ships[i][ii].y === y) ||      // center
                (ships[i][ii].x === x+1 && ships[i][ii].y === y) ||     // right
                (ships[i][ii].x === x-1 && ships[i][ii].y === y+1) ||   // below left
                (ships[i][ii].x === x && ships[i][ii].y === y+1) ||     // below
                (ships[i][ii].x === x+1 && ships[i][ii].y === y+1)) {   // below right
                    collision = true;
                    break;
            }
        }
    }
    return collision;
}

const createShip = function(shipSize, standingOrLaying, ships) {

    var ii = 0;
    var shipReady = false;
    var should_ship_be_placed = true;
    var ship = [];

    while (ii < 2000 && shipReady === false) {
        should_ship_be_placed = true;
        ship = [];

        if (standingOrLaying === 1) {
            var x = _.random(0, (Cols-1)-shipSize);
            var y = _.random(0, (Rows-1));
        } else {
            x = _.random(0, (Cols-1));
            y = _.random(0, (Rows-1)-shipSize);
        }

        for (var i = 0; i < shipSize; i++) {
            
            if (isCollision(ships,x,y)) {
                should_ship_be_placed = false;
            }

            ship.push({
                x: x,
                y: y 
            });

            if (standingOrLaying === 1) {
                x++;
            } else {
                y++;
            }
        }

        if (should_ship_be_placed === true) {
            shipReady = true;
        }

        ii++;
    }

    ships.push(ship);   
}

const standingOrLaying = function() {
    return _.random(0, 1);
} 

const generateShips = function() {
    var ships = [];
    
    createShip(4, standingOrLaying(), ships);
    createShip(3, standingOrLaying(), ships);
    createShip(3, standingOrLaying(), ships);
    createShip(2, standingOrLaying(), ships);
    createShip(2, standingOrLaying(), ships);
    createShip(2, standingOrLaying(), ships);
    createShip(1, standingOrLaying(), ships);
    createShip(1, standingOrLaying(), ships);
    createShip(1, standingOrLaying(), ships);
    createShip(1, standingOrLaying(), ships);
    
    return ships;
}

export default generateShips;
