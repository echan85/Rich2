
var CanvasWidth = 640;
var CanvasHeight = 480;
var GridLength = 48; // The width of each block in game
var MapViewSize = 11; // The seen map is a 9x9 matrix with each block 48x48 px
var MapViewLength = 432; // The partial map that player can see, the length is 9x48=432 px
var MapViewHalfLength = 192;
var MenuOptionHeight = 48;
var MenuOptionWidth = 86;
var SideBarWidth = 208; // Left side bar
var CursorMovement = 45;
var AnimationTimeout = 20;
var HeadImgLength = 40;
var BodyImgLength = 52;
var HeadOffset = 30;
var SpeedDelta = 2;
/**
 Elements
 1: Court
 2: Stock
 3: Chance
 4: News
 5: Tax
 6: Casino
 7: Park
 8: CommunityChest
 9: Carnival
 10: Hospital
 11: Jail
 12: Bank
 13: Market
 14: Road
 15: Road with land
*/

$(function() {
  
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext('2d');
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
        Players[Game.currentPlayer].dice();
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
      playerList: ["atuzai"],
      mapInfo: null, // TODO: Generate the map info
      mapImg: loadImage("map.png"),
      mapSize: 36, // There are 36x36 blocks in the map
      startPos: [{x: 20, y: 7}, {x: 20, y:6}, {x: 20, y: 5}, {x: 20, y: 4}],
    }
  };

  var Players = {
    "atuzai": {
      isMoving: false,
      name: "阿土仔",
      cash: 25000,
      deposit: 25000,
      headimg: loadImage("atuzaihead.png"),
      bodyimg: loadImage("carright.png"),
      status: 0,
      towards: null,
      position: {x:0,y:0},
      gamePos: {x:0,y:0},
      viewPos: {x:GridLength*4,y:GridLength*4},
      dice: function() {
        if (Game.debug) {
          this.towards = new Array();
          this.towards.push({x: 28 * GridLength, y: 14 * GridLength});
          this.isMoving = true;
        }
      },
      move: function() {
        if (this.towards == null || this.towards.length == 0) {
          this.isMoving = false;
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
      },
    }
  }

  var Game = {
    debug: true,
    coverImg: null,
    cursorImg: null,
    cursorPos: {x: 251, y: 45},
    overObjects: null,
    enterAction: null,
    currentPlayer: null,
    Months: [31,28,31,30,31,30,31,31,30,31,30,31],
    PrimeMonths: [31,29,31,30,31,30,31,31,30,31,30,31],
    year: 1993,
    month: 1,
    date: 1,

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
      mapImgSX = cx - MapViewHalfLength;
      mapImgSY = cy - MapViewHalfLength;
      context.drawImage(Levels.taiwan.mapImg, mapImgSX, mapImgSY, MapViewLength, MapViewLength, 
        SideBarWidth, MenuOptionHeight, MapViewLength, MapViewLength);
    },
    drawPlayer: function() {
      var player = Players[this.currentPlayer];
      var x = SideBarWidth + player.viewPos.x;
      var y = MenuOptionHeight + player.viewPos.y;
      context.drawImage(player.bodyimg, x, y);
      context.drawImage(player.headimg, x, y - HeadOffset);
    },
    load: function() {
      this.coverImg = loadImage("topcoverlay.png");
      this.cursorImg = loadImage("mouseup.png");
      
      $(document).keypress(function(e) {
        Game.keyPressed(e);
      });
      
      this.overObjects = new Array();
      
      for (var i=0; i<MenuOptions.length; ++i) {
        this.overObjects.push(MenuOptions[i]);
      }
      
      for (var i=0; i<Levels.taiwan.playerList.length; ++i) {
        var playerid = Levels.taiwan.playerList[i];
        Players[playerid].gamePos = Levels.taiwan.startPos[i];
        Players[playerid].position.x = Players[playerid].gamePos.x * GridLength;        
        Players[playerid].position.y = Players[playerid].gamePos.y * GridLength;
        Players[playerid].viewPos.y -= GridLength * i;        
      }
      
      this.currentPlayer = Levels.taiwan.playerList[0];
      
      console.log("Player " + this.currentPlayer + " game pos x: " 
        + Players[this.currentPlayer].gamePos.x + " y: " 
        + Players[this.currentPlayer].gamePos.y);
      console.log("Player " + this.currentPlayer + " position x: "
        + Players[this.currentPlayer].position.x + " y: " 
        + Players[this.currentPlayer].position.y);
    },
    AnimateLoop: null,
    run: function() {
      this.AnimateLoop = setInterval(animate, AnimationTimeout);
    },
    drawSidebar: function() {
      // Date
      context.font = "30px sans-serif";
      context.fillStyle = "black";
      context.fillText(this.year, 75, 48);
      context.fillText(this.month + "   " + this.date, 83, 98);
      // Name
      context.font = "53px sans-serif";
      context.fillStyle = 'gold';
      context.fillText(Players[this.currentPlayer].name, 25, 176);
      // Money
      context.font = "32px sans-serif";
      context.fillStyle = 'yellow';
      context.fillText(Players[this.currentPlayer].cash, 90, 228);
      context.fillText(Players[this.currentPlayer].deposit, 90, 275);
    },
  }
  
  function animate() {
    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    var cPlayer = Players[Game.currentPlayer];
    if (cPlayer.isMoving) {
      Players[Game.currentPlayer].move();
    }
    // Draw seen map: 9x9 blocks
    Game.drawMap(cPlayer.position.x, cPlayer.position.y);
    // Draw players
    Game.drawPlayer();
    // Draw overlay: menus, sidebar
    context.drawImage(Game.coverImg, 0, 0);
    // Draw sidebar
    Game.drawSidebar();
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