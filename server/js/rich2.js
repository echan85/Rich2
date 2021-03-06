
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
      playerList: ["atuzai"], // atuzai, dalaoqian, sunxiaomei, diana
      mapInfo: null, // TODO: Generate the map info
      mapImg: loadImage("taiwan.png"),
      mapSize: 36, // There are 36x36 blocks in the map
      startPos: [{x: 20, y: 7}, {x: 20, y:6}, {x: 20, y: 5}, {x: 20, y: 4}],
      cityList: {
        nantou: {
          price: 500,
          blockIDs: [],
          display: "南投縣"
        },
        taidong: {
          price: 1000,
          blockIDs: [],
          display: "台東縣"
        },
        taizhong: {
          price: 1400,
          blockIDs: [],
          display: "台中市"
        },
        taipei: {
          price: 2500,
          blockIDs: [],
          display: "台北市"
        },
        tainan: {
          price: 2000,
          blockIDs: [],
          display: "台南市"
        },
        jilong: {
          price: 2000,
          blockIDs: [],
          display: "基隆市"
        },
        tailuge: {
          price: 900,
          blockIDs: [],
          display: "太魯閣"
        },
        yilan: {
          price: 1200,
          blockIDs: [],
          display: "宜蘭縣"
        },
        pingdong: {
          price: 1400,
          blockIDs: [],
          display: "屏東縣"
        },
        xinzhu: {
          price: 1600,
          blockIDs: [],
          display: "新竹市"
        },
        taoyuan: {
          price: 2200,
          blockIDs: [],
          display: "桃園縣"
        },
        penghu: {
          price: 600,
          blockIDs: [],
          display: "澎湖"
        },
        hualian: {
          price: 1500,
          blockIDs: [],
          display: "花蓮縣"
        },
        suao: {
          price: 800,
          blockIDs: [],
          display: "蘇澳"
        },
        yunlin: {
          price: 1600,
          blockIDs: [],
          display: "雲林縣"
        },
        gaoxiong: {
          price: 2300,
          blockIDs: [],
          display: "高雄市"
        },
        eluanbi: {
          price: 700,
          blockIDs: [],
          display: "鹅栾鼻"
        }
      },
    }
  };

  /**
   * Deity
   * 0: none
   * 1: Wealth attached
   * 2: Mascot attached
   * 3: Poverty attached
   * 4: Badluck attached
   * Status
   * 0: active/good
   * 1: in hospital
   * 2: in jail
   * 3: hibernant
   * 4: frozen
   * 5: sealed
   * 6: asleep
   * 7: stay
   */
  var Players = {
    "atuzai": {
      isMoving: false, // use this boolean to block keyboard interupts
      name: "阿土仔",
      description: "",
      cash: 25000,
      deposit: 25000,
      direction: 0, // 0: down, 1: right, 2: up, 3: left
      headimg: loadImage("atuzaihead.png"),
      bodyimg: loadImage("carright.png"),
      status: 0,
      deity: 0,
      path: null,
      position: {x:0,y:0},
      gamePos: {x:0,y:0},
      viewPos: {x:GridLength*4,y:GridLength*4},
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      land: [],
      dice: function() {
        if (Game.debug) {
          this.path = new Array();
          this.path.push({x: 28 * GridLength, y: 14 * GridLength});
          this.isMoving = true;
        }
      },
      move: function() {
        if (this.path == null || this.path.length == 0) {
          this.isMoving = false;
          return;
        }
        var x = this.position.x;
        var y = this.position.y;
        var tx = this.path[0].x;
        var ty = this.path[0].y;
        var dx = (tx - x) > 0 ? 1 : ((tx == x) ? 0 : -1);
        var dy = (ty - y) > 0 ? 1 : ((ty == y) ? 0 : -1);
        x += dx * SpeedDelta;
        y += dy * SpeedDelta;
        this.position.x = x;
        this.position.y = y;
        if (x == this.path[0].x && y == this.path[0].y) this.path.shift();
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
      // If the animation is playing, then disable keyboard intrupt
      if (Players[Game.currentPlayer].isMoving) return;
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
      context.drawImage(Game.coverImg, 0, 0);
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
    // Draw sidebar
    Game.drawSidebar();
    // If the animation is playing, then disable keyboard intrupt
    if (cPlayer.isMoving) return;
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