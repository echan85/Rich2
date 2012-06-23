
var CanvasWidth = 640;
var CanvasHeight = 480;
var GridLength = 48; // The width of each block in game
var MapViewSize = 11; // The seen map is a 9x9 matrix with each block 48x48 px
var MapViewLength = 432; // The partial map that player can see, the length is 9x48=432 px
var MenuOptionHeight = 48;
var MenuOptionWidth = 86;
var SideBarWidth = 208; // Left side bar
var CursorMovement = 45;
var AnimationTimeout = 20;
var HeadImgLength = 40;
var BodyImgLength = 52;
var HeadOffset = 30;
var SpeedDelta = 2;
 
$(function() {
  
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext('2d');
  var currentPlayer = "atuzai";
  var playAni = false;
  
  var MenuOptions = [
    {
      type: "menu",
      name: "moveon",
      selected: loadImage("moveonselected.png"),
      x: SideBarWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log(currentPlayer + " invoked dice");
        Players[currentPlayer].dice();
        playAni = true;
      }
    },
    {
      type: "menu",
      name: "search",
      selected: loadImage("searchselected.png"),
      x: SideBarWidth + MenuOptionWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Search");
      }
    },
    {
      type: "menu",
      name: "cards",
      selected: loadImage("cardsselected.png"),
      x: SideBarWidth + MenuOptionWidth * 2,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Cards");
      }
    },
    {
      type: "menu",
      name: "progress",
      selected: loadImage("progselected.png"),
      x: SideBarWidth + MenuOptionWidth * 3,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Progress");
      }
    },
    {
      type: "menu",
      name: "others",
      selected: loadImage("othersselected.png"),
      x: SideBarWidth + MenuOptionWidth * 4,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Others");
      }
    }
  ];

  var Levels = {
    taiwan: {
      map: null,   // TODO: Generate the map info
      mapSize: 36, // There are 36x36 blocks in the map
    }
  };

  var Players = {
    "atuzai": {
      name: "阿土仔",
      cash: 25000,
      deposite: 25000,
      headimg: loadImage("atuzaihead.png"),
      bodyimg: loadImage("carright.png"),
      position: {x: 5 * GridLength, y: 5 * GridLength},
      status: 0,
      towards: null,
      dice: function() {
        if (Game.debug) {
          this.towards = new Array();
          this.towards.push({x: 8 * GridLength, y: 4 * GridLength});
          this.move();
        }
      },
      move: function() {
        if (this.towards == null || this.towards.length == 0) {
          playAni = false;
          return;
        }
        var x = this.position.x;
        var y = this.position.y;
        var tx = this.towards[0].x;
        var ty = this.towards[0].y;
        var dx = (tx - x) > 0 ? 1 : ((tx == x) ? 0 : -1);
        var dy = (ty - y) > 0 ? 1 : ((ty == y) ? 0 : -1);
        x += dx * SpeedDelta;
        y += dy * SpeedDelta;
        this.position.x = x;
        this.position.y = y;
        if (x == this.towards[0].x && y == this.towards[0].y) this.towards.shift();
      }
    }
  }

  var Game = {
    debug: true,
    coverImg: null,
    cursorImg: null,
    cursorPos: {x: 251, y: 45},
    overObjects: null,
    enterAction: null,
    keyPressed: function(e) {
      var kc = e.keyCode;
      //console.log("KeyPressed " + kc);
      switch (kc) {
      case 37: // left
        this.cursorPos.x -= CursorMovement;
        if (this.cursorPos.x < 0) this.cursorPos.x = 0;
        break;
      case 38: // up
        this.cursorPos.y -= CursorMovement;
        if (this.cursorPos.y < 0) this.cursorPos.y = 0;
        break;
      case 39: // right
        this.cursorPos.x += CursorMovement;
        if (this.cursorPos.x >= CanvasWidth) this.cursorPos.x = CanvasWidth - 1;
        break;
      case 40: // down
        this.cursorPos.y += CursorMovement;
        if (this.cursorPos.y >= CanvasHeight) this.cursorPos.y = CanvasHeight - 1;
        break;
      case 32: // space
      case 13: // enter
        if (this.enterAction) {
          console.log("Call enterAction");
          this.enterAction();
        }
        break;
      }
    },
    checkOverObject: function() {
      var obj = null;
      var objList = this.overObjects;
      for (var i=0; i<objList.length; ++i) {
        if (isPtInside(objList[i].x, objList[i].y, objList[i].width, objList[i].height,
                       this.cursorPos.x, this.cursorPos.y)) {
          obj = objList[i];
          break;
        }
      }
      if (obj) {
        switch (obj.type) {
        case "menu":
          context.drawImage(obj.selected, obj.x, obj.y);
          this.enterAction = obj.action;
          break;
        }
      }
    },
    drawMap: function(cx, cy) {
      var gx = Math.floor(cx / GridLength);
      var gy = Math.floor(cy / GridLength);
      var ms = Levels.taiwan.mapSize; // 36
      var leftmost = cx - 5; if (leftmost < 0) leftmost = 0;
      var rightmost = cx + 5; if (rightmost >= ms) rightmost = ms - 1;
      var topmost = cy - 5; if (topmost < 0) topmost = 0;
      var bottommost = cy + 5; if (bottommost >= ms) bottommost = ms - 1;
      for (var i=0; i<9; ++i) for (var j=0; j<9; ++j) {
          context.drawImage(this.squares, Levels.taiwan.map[i * ms + j] * GridLength, 0, GridLength, GridLength, 
                            SideBarWidth + i * GridLength, MenuOptionHeight + j * GridLength, GridLength, GridLength);
      }
    },
    drawPlayer: function(name) {
      var player = Players[name];
      var x = SideBarWidth + player.position.x;
      var y = MenuOptionHeight + player.position.y;
      //var x = SideBarWidth + GridLength * 4;
      //var y = MenuOptionHeight + GridLength * 4;
      context.drawImage(player.bodyimg, x, y);
      context.drawImage(player.headimg, x, y - HeadOffset);
    },
    load: function() {
      this.coverImg = loadImage("topcoverlay.png");
      this.cursorImg = loadImage("mouseup.png");
      $(document).keypress(function(e) {
        Game.keyPressed(e);
      });
      // Initialise objects
      this.overObjects = new Array();
      // Menu options
      for (var i=0; i<MenuOptions.length; ++i) {
        this.overObjects.push(MenuOptions[i]);
      }
      if (this.debug) {
        Levels.taiwan.map = new Array();
        var ms = Levels.taiwan.mapSize;
        for (var i=0; i<ms; ++i) for (var j=0; j<ms; ++j) {
          Levels.taiwan.map[i * ms + j] = Math.floor(Math.random() * 4);
        }
      }
      this.squares = loadImage("mapelements.png");
    },
    AnimateLoop: null,
    run: function() {
      this.AnimateLoop = setInterval(animate, AnimationTimeout);
    }
  }
  
  
  
  function animate() {
    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    if (playAni) {
      Players[currentPlayer].move();
    }
    // Draw seen map: 9x9 blocks
    Game.drawMap(Players[currentPlayer].position.x, Players[currentPlayer].position.y);
    // Draw players
    Game.drawPlayer("atuzai");
    // Draw overlay: menus, sidebar
    context.drawImage(Game.coverImg, 0, 0);
    // Check if cursor is pointing at sth
    Game.checkOverObject();
    // Draw cursor
    context.drawImage(Game.cursorImg, Game.cursorPos.x, Game.cursorPos.y);
  }
  
  function isPtInside(x, y, dx, dy, px, py) {
    if (px < x || px >= x + dx || py < y || py >= y + dy) {
      return false;
    }
    return true;
  }

  function loadImage(imgURL) {
    var image = new Image();
    image.src = "image/" + imgURL;
    return image;
  }
  
  Game.load();
  Game.run();

});