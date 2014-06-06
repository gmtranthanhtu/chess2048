function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");
  this.titleContainer   = document.querySelector(".title-container");

  this.score = 0;
  this.mastertitle = "Beginner";
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    //grid.empty();
    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    self.updateTitle(self.score);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var valueMap = {
    2 :    'Black Pawn',
    4 :    'White Pawn',
    8 :    "Black Knight",
    16 :   "White Knight",
    32 :   'Black Bishop',
    64 :   'White Bishop',
    128 :  'Black Rook',
    256 :  'White Rook',
    512 :  'Black Queen',
    1024 : 'White Queen',
    2048 : 'The King',
    4096 : 'Super Grandmaster'
  }
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  //inner.textContent = tile.value;
  inner.textContent = valueMap[tile.value];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    //tile.mergedFrom.forEach(function (merged) {
     // self.addTile(merged);
   // });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateTitle = function (score) {
  //document.getElementById("test").innerHTML = "Test " + score;
  //this.clearContainer(this.titleContainer);

  var t = "";

  //alert("shit");
  if(score < 500) t = "Beginner";
  else if(score < 3000) t = "Candidate Master";
  else if(score < 6000) t = "FIDE Master";
  else if(score < 10000) t = "Intl. Master";
  else if(score < 50000) t = "Grandmaster";
  else t = "Super Grandmaster"
  //document.getElementById("test").innerHTML = "Test " + t;
  //var curTitle = this.mastertitle;
  this.mastertitle = t;

  this.titleContainer.textContent = this.mastertitle;

  /*if (curTitle != t) {
    var addition = document.createElement("div");
    addition.classList.add("title-addition");
    addition.textContent = "+" + t;

    this.titleContainer.appendChild(addition);
  }*/
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You saved the king!" : "You got checkmated!";

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton(won));
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function (won) {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.textContent = "Tweet";

  if(!won){
    var text = "I've just got " + this.score + " points and the title of " + this.mastertitle +  " in Chess 2048! Try at http://goo.gl/ZofZGk #2048game #chess2048";
  //var text2 = "I've just saved the King and got " + this.score + " in Chess 2048! Try at http://gmtranthanhtu.github.io/chess2048 #2048game #chess2048"
  //if (metadata.won) tweet.setAttribute("data-text", text2);
    tweet.setAttribute("data-text", text);
  }
  else {
    var text = "I've just saved the King and got " + this.score + " in Chess 2048! Try at http://goo.gl/ZofZGk #2048game #chess2048";
    tweet.setAttribute("data-text", text);
  }

  return tweet;
};
