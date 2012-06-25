
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
        Players.dice();
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
      mapInfo: {"1":{"x":20,"y":7,"step":0,"mask":2,"type":2,"next":{"2":2}},
      "2":{"x":20,"y":8,"step":1,"mask":2,"type":15,"next":{"2":3}},"3":{"x":20,"y":9,"step":1,"mask":2,"type":15,"next":{"2":4}},"4":{"x":20,"y":10,"step":1,"mask":2,"type":15,"next":{"2":5}},"5":{"x":20,"y":11,"step":1,"mask":10,"type":3,"next":{"2":6,"8":97}},"6":{"x":19,"y":12,"step":0,"mask":3,"type":3,"next":{"1":5,"2":7}},"7":{"x":19,"y":13,"step":1,"mask":3,"type":15,"next":{"1":6,"2":8}},"8":{"x":19,"y":14,"step":1,"mask":3,"type":15,"next":{"1":7,"2":9}},"9":{"x":19,"y":15,"step":1,"mask":3,"type":15,"next":{"1":8,"2":10}},"10":{"x":19,"y":16,"step":1,"mask":15,"type":12,"next":{"1":9,"2":11,"4":98,"8":126}},"11":{"x":19,"y":17,"step":0,"mask":3,"type":12,"next":{"1":10,"2":12}},"126":{"x":20,"y":16,"step":0,"mask":12,"type":12,"next":{"4":10,"8":127}},"12":{"x":19,"y":18,"step":1,"mask":3,"type":15,"next":{"1":11,"2":13}},"13":{"x":19,"y":19,"step":1,"mask":3,"type":15,"next":{"1":12,"2":14}},"14":{"x":19,"y":20,"step":1,"mask":3,"type":15,"next":{"1":13,"2":15}},"15":{"x":19,"y":21,"step":0,"mask":5,"type":2,"next":{"1":14,"4":16}},"16":{"x":18,"y":21,"step":1,"mask":14,"type":2,"next":{"2":26,"4":17,"8":15}},"26":{"x":18,"y":22,"step":0,"mask":3,"type":2,"next":{"1":16,"2":27}},"17":{"x":17,"y":21,"step":1,"mask":4,"type":15,"next":{"4":18}},"18":{"x":16,"y":21,"step":1,"mask":4,"type":15,"next":{"4":19}},"19":{"x":15,"y":21,"step":1,"mask":4,"type":15,"next":{"4":20}},"20":{"x":14,"y":21,"step":1,"mask":2,"type":5,"next":{"2":22}},"21":{"x":13,"y":21,"step":0,"mask":8,"type":5,"next":{"8":20}},"22":{"x":14,"y":22,"step":1,"mask":9,"type":6,"next":{"1":20,"8":23}},"23":{"x":15,"y":22,"step":1,"mask":8,"type":15,"next":{"8":24}},"24":{"x":16,"y":22,"step":1,"mask":8,"type":15,"next":{"8":25}},"25":{"x":17,"y":22,"step":1,"mask":8,"type":15,"next":{"8":26}},"27":{"x":18,"y":23,"step":1,"mask":3,"type":15,"next":{"1":26,"2":28}},"28":{"x":18,"y":24,"step":1,"mask":3,"type":15,"next":{"1":27,"2":29}},"29":{"x":18,"y":25,"step":1,"mask":3,"type":15,"next":{"1":28,"2":30}},"30":{"x":18,"y":26,"step":1,"mask":3,"type":15,"next":{"1":29,"2":31}},"31":{"x":18,"y":27,"step":0,"mask":3,"type":13,"next":{"1":30,"2":32}},"32":{"x":19,"y":28,"step":1,"mask":3,"type":13,"next":{"1":31,"2":33}},"33":{"x":19,"y":29,"step":1,"mask":3,"type":15,"next":{"1":32,"2":34}},"34":{"x":19,"y":30,"step":1,"mask":3,"type":15,"next":{"1":33,"2":35}},"35":{"x":19,"y":31,"step":1,"mask":3,"type":15,"next":{"1":34,"2":36}},"36":{"x":19,"y":32,"step":1,"mask":9,"type":2,"next":{"1":35,"8":37}},"37":{"x":20,"y":32,"step":0,"mask":12,"type":2,"next":{"4":36,"8":38}},"38":{"x":21,"y":32,"step":0,"mask":12,"type":9,"next":{"4":37,"8":39}},"39":{"x":22,"y":32,"step":1,"mask":5,"type":9,"next":{"1":40,"4":38}},"40":{"x":22,"y":31,"step":1,"mask":3,"type":15,"next":{"1":41,"2":39}},"41":{"x":22,"y":30,"step":1,"mask":3,"type":15,"next":{"1":42,"2":40}},"42":{"x":22,"y":29,"step":1,"mask":3,"type":15,"next":{"1":43,"2":41}},"43":{"x":22,"y":28,"step":0,"mask":10,"type":4,"next":{"2":42,"8":44}},"44":{"x":23,"y":27,"step":1,"mask":12,"type":4,"next":{"4":43,"8":45}},"45":{"x":24,"y":27,"step":1,"mask":12,"type":8,"next":{"4":44,"8":46}},"46":{"x":25,"y":27,"step":0,"mask":5,"type":8,"next":{"1":47,"4":45}},"47":{"x":25,"y":26,"step":1,"mask":3,"type":15,"next":{"1":48,"2":46}},"48":{"x":25,"y":25,"step":1,"mask":3,"type":15,"next":{"1":49,"2":47}},"49":{"x":25,"y":24,"step":1,"mask":3,"type":15,"next":{"1":50,"2":48}},"50":{"x":25,"y":23,"step":1,"mask":3,"type":15,"next":{"1":51,"2":49}},"51":{"x":25,"y":22,"step":1,"mask":3,"type":3,"next":{"1":52,"2":50}},"52":{"x":25,"y":21,"step":0,"mask":3,"type":3,"next":{"1":53,"2":51}},"53":{"x":25,"y":20,"step":1,"mask":3,"type":15,"next":{"1":54,"2":52}},"54":{"x":25,"y":19,"step":1,"mask":3,"type":15,"next":{"1":55,"2":53}},"55":{"x":25,"y":18,"step":1,"mask":3,"type":15,"next":{"1":56,"2":54}},"56":{"x":25,"y":17,"step":1,"mask":14,"type":7,"next":{"2":55,"4":130,"8":57}},"130":{"x":24,"y":16,"step":0,"mask":12,"type":7,"next":{"4":129,"8":56}},"57":{"x":26,"y":17,"step":1,"mask":12,"type":15,"next":{"4":56,"8":58}},"58":{"x":27,"y":17,"step":1,"mask":12,"type":15,"next":{"4":57,"8":59}},"59":{"x":28,"y":17,"step":1,"mask":12,"type":15,"next":{"4":58,"8":60}},"60":{"x":29,"y":17,"step":0,"mask":5,"type":2,"next":{"1":61,"4":59}},"61":{"x":30,"y":16,"step":1,"mask":3,"type":2,"next":{"1":62,"2":60}},"62":{"x":30,"y":15,"step":1,"mask":3,"type":15,"next":{"1":63,"2":61}},"63":{"x":30,"y":14,"step":1,"mask":3,"type":15,"next":{"1":64,"2":62}},"64":{"x":30,"y":13,"step":1,"mask":3,"type":15,"next":{"1":65,"2":63}},"65":{"x":30,"y":12,"step":1,"mask":3,"type":15,"next":{"1":66,"2":64}},"66":{"x":30,"y":11,"step":0,"mask":3,"type":3,"next":{"1":67,"2":65}},"67":{"x":31,"y":10,"step":1,"mask":3,"type":3,"next":{"1":68,"2":66}},"68":{"x":31,"y":9,"step":1,"mask":3,"type":15,"next":{"1":69,"2":67}},"69":{"x":31,"y":8,"step":1,"mask":3,"type":15,"next":{"1":70,"2":68}},"70":{"x":31,"y":7,"step":1,"mask":3,"type":15,"next":{"1":71,"2":69}},"71":{"x":31,"y":6,"step":1,"mask":3,"type":15,"next":{"1":72,"2":70}},"72":{"x":31,"y":5,"step":1,"mask":3,"type":6,"next":{"1":73,"2":71}},"73":{"x":31,"y":4,"step":0,"mask":3,"type":6,"next":{"1":74,"2":72}},"74":{"x":31,"y":3,"step":1,"mask":6,"type":2,"next":{"2":73,"4":75}},"75":{"x":30,"y":3,"step":1,"mask":12,"type":15,"next":{"4":76,"8":74}},"76":{"x":29,"y":3,"step":1,"mask":12,"type":15,"next":{"4":77,"8":75}},"77":{"x":28,"y":3,"step":1,"mask":12,"type":15,"next":{"4":78,"8":76}},"78":{"x":27,"y":3,"step":0,"mask":12,"type":8,"next":{"4":79,"8":77}},"79":{"x":26,"y":4,"step":1,"mask":10,"type":8,"next":{"2":80,"8":78}},"80":{"x":26,"y":5,"step":1,"mask":5,"type":7,"next":{"1":79,"4":81}},"81":{"x":25,"y":5,"step":1,"mask":4,"type":15,"next":{"4":82}},"82":{"x":24,"y":5,"step":1,"mask":4,"type":15,"next":{"4":83}},"83":{"x":23,"y":5,"step":1,"mask":4,"type":15,"next":{"4":84}},"84":{"x":22,"y":5,"step":1,"mask":4,"type":15,"next":{"4":85}},"85":{"x":21,"y":5,"step":1,"mask":2,"type":1,"next":{"2":88}},"88":{"x":21,"y":6,"step":1,"mask":10,"type":2,"next":{"2":1,"8":89}},"93":{"x":21,"y":7,"step":0,"mask":1,"type":2,"next":{"1":88}},"94":{"x":21,"y":8,"step":1,"mask":1,"type":15,"next":{"1":93}},"95":{"x":21,"y":9,"step":1,"mask":1,"type":15,"next":{"1":94}},"96":{"x":21,"y":10,"step":1,"mask":1,"type":15,"next":{"1":95}},"97":{"x":21,"y":11,"step":1,"mask":1,"type":4,"next":{"1":96}},"98":{"x":18,"y":16,"step":1,"mask":12,"type":15,"next":{"4":99,"8":10}},"99":{"x":17,"y":16,"step":1,"mask":12,"type":15,"next":{"4":100,"8":98}},"100":{"x":16,"y":16,"step":1,"mask":12,"type":15,"next":{"4":101,"8":99}},"101":{"x":15,"y":16,"step":0,"mask":12,"type":8,"next":{"4":102,"8":100}},"102":{"x":14,"y":16,"step":1,"mask":14,"type":8,"next":{"2":139,"4":103,"8":101}},"139":{"x":14,"y":17,"step":1,"mask":3,"type":15,"next":{"1":102,"2":140}},"140":{"x":14,"y":18,"step":1,"mask":3,"type":15,"next":{"1":139,"2":141}},"141":{"x":14,"y":19,"step":1,"mask":3,"type":15,"next":{"1":140,"2":142}},"142":{"x":14,"y":20,"step":0,"mask":3,"type":5,"next":{"1":141,"2":20}},"103":{"x":13,"y":16,"step":0,"mask":4,"type":14,"next":{"4":104}},"104":{"x":12,"y":16,"step":1,"mask":4,"type":14,"next":{"4":105}},"105":{"x":11,"y":16,"step":1,"mask":4,"type":14,"next":{"4":106}},"106":{"x":10,"y":16,"step":1,"mask":4,"type":14,"next":{"4":107}},"107":{"x":9,"y":16,"step":1,"mask":4,"type":14,"next":{"4":108}},"108":{"x":8,"y":16,"step":1,"mask":4,"type":14,"next":{"4":109}},"109":{"x":7,"y":16,"step":1,"mask":4,"type":14,"next":{"4":110}},"110":{"x":6,"y":16,"step":1,"mask":4,"type":14,"next":{"4":111}},"116":{"x":3,"y":18,"step":1,"mask":8,"type":14,"next":{"8":117}},"117":{"x":4,"y":19,"step":1,"mask":8,"type":14,"next":{"8":118}},"118":{"x":5,"y":20,"step":1,"mask":8,"type":14,"next":{"8":119}},"119":{"x":6,"y":21,"step":1,"mask":8,"type":14,"next":{"8":120}},"120":{"x":7,"y":21,"step":1,"mask":8,"type":14,"next":{"8":121}},"121":{"x":8,"y":21,"step":1,"mask":8,"type":14,"next":{"8":122}},"122":{"x":9,"y":21,"step":1,"mask":8,"type":14,"next":{"8":123}},"123":{"x":10,"y":21,"step":1,"mask":8,"type":14,"next":{"8":124}},"124":{"x":11,"y":21,"step":1,"mask":8,"type":14,"next":{"8":125}},"125":{"x":12,"y":21,"step":0,"mask":8,"type":14,"next":{"8":21}},"111":{"x":5,"y":16,"step":1,"mask":4,"type":15,"next":{"4":112}},"112":{"x":4,"y":16,"step":1,"mask":4,"type":15,"next":{"4":113}},"113":{"x":3,"y":16,"step":1,"mask":4,"type":15,"next":{"4":114}},"114":{"x":2,"y":16,"step":0,"mask":2,"type":8,"next":{"2":115}},"115":{"x":2,"y":17,"step":1,"mask":8,"type":8,"next":{"8":116}},"127":{"x":21,"y":16,"step":1,"mask":12,"type":15,"next":{"4":126,"8":128}},"128":{"x":22,"y":16,"step":1,"mask":12,"type":15,"next":{"4":127,"8":129}},"129":{"x":23,"y":16,"step":1,"mask":12,"type":15,"next":{"4":128,"8":130}},"131":{"x":24,"y":14,"step":0,"mask":0,"type":11,"next":[]},"132":{"x":25,"y":14,"step":0,"mask":0,"type":11,"next":[]},"133":{"x":24,"y":13,"step":0,"mask":0,"type":11,"next":[]},"134":{"x":25,"y":13,"step":0,"mask":0,"type":11,"next":[]},"135":{"x":22,"y":25,"step":0,"mask":0,"type":10,"next":[]},"136":{"x":23,"y":25,"step":0,"mask":0,"type":10,"next":[]},"137":{"x":22,"y":24,"step":0,"mask":0,"type":10,"next":[]},"138":{"x":23,"y":24,"step":0,"mask":0,"type":10,"next":[]},"86":{"x":20,"y":5,"step":1,"mask":2,"type":1,"next":{"2":87}},"87":{"x":20,"y":6,"step":1,"mask":2,"type":2,"next":{"2":1}},"89":{"x":22,"y":6,"step":1,"mask":8,"type":15,"next":{"8":90}},"90":{"x":23,"y":6,"step":1,"mask":8,"type":15,"next":{"8":91}},"91":{"x":24,"y":6,"step":1,"mask":8,"type":15,"next":{"8":92}},"92":{"x":25,"y":6,"step":1,"mask":8,"type":15,"next":{"8":80}},"143":{"x":20,"y":4,"step":1,"mask":2,"type":1,"next":{"2":86}}},
      
      mapImg: loadImage("taiwan.png"),
      mapSize: 36, // There are 36x36 blocks in the map
      startPos: [{bid: 1, d: 2}, {bid: 87, d: 2}, {bid: 86, d: 2}, {bid: 143, d: 2}],
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
        },
        jiayi: {
          price: 1500,
          blockIDs: [],
          display: "嘉義市"
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
      name: "阿土仔",
      description: "",
      cash: 25000,
      deposit: 25000,
      direction: 0, // 0: down, 1: right, 2: up, 3: left
      headimg: loadImage("atuzaihead.png"),
      bodyimg: loadImage("carright.png"),
      status: 0,
      deity: 0,
      position: {x:0,y:0},
      gamePos: {bid:0, d:0},
      viewPos: {x:GridLength*4,y:GridLength*4},
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      land: [],
    },
    isMoving: false, // use this boolean to block keyboard interupts
    dice: function() {
      this.path = new Array();
      var dice = Game.dice() + Game.dice(); // throw two dices
      var steps = dice;
      console.log("steps " + steps);
      var player = Players[Game.currentPlayer];
      console.log("name " + player.name);
      var bid = player.gamePos.bid;
      var dir = player.gamePos.d;
      var nextbid = null;
      var nextdir = null;
      while (steps) {
        // TODO: This is a stupid way of picking a route
        var block = Levels.taiwan.mapInfo[bid];
        var nextlist = block["next"];
        var mask = block["mask"];
        var ways = (mask & 1 > 0) + (mask & 2 > 0) + (mask & 4 > 0) + (mask & 8 > 0);
        console.log("ways: " + ways + " mask: " + mask );
        if (ways == 1) {
          nextdir = nextlist[mask];
          console.log("direct " + mask);
        } else {
          var bck;
          if (dir == 1 || dir == 2) {
            bck = 3 - dir;
          } else {
            bck = 12 - dir;
          }
          var set = [];
          for (var key in nextlist) {
            if (key == bck) continue;
            set.push(key);
          }
          nextdir = set[Math.floor(Math.random() * set.length)];
          console.log("random");
        }
        nextbid = block["next"][nextdir];
        this.path.push(nextbid);
        bid = nextbid;
        dir = nextdir;
        console.log("bid " + bid + " dir " + dir);
        steps -= Levels.taiwan.mapInfo[nextbid]["step"];
      }
      console.log(this.path);
      this.isMoving = true;
      Players[Game.currentPlayer].gamePos = {bid:bid, d:dir};
    },
    move: function() {
      if (this.path == null || this.path.length == 0) {
        this.isMoving = false;
        return;
      }
      var position = Players[Game.currentPlayer].position;
      var x = position.x;
      var y = position.y;
      var bid = this.path[0];
      //console.log("bid " + bid);
      var tx = Levels.taiwan.mapInfo[bid].x * GridLength;
      var ty = Levels.taiwan.mapInfo[bid].y * GridLength;
      var dx = (tx - x) > 0 ? 1 : ((tx == x) ? 0 : -1);
      var dy = (ty - y) > 0 ? 1 : ((ty == y) ? 0 : -1);
      x += dx * SpeedDelta;
      y += dy * SpeedDelta;
      Players[Game.currentPlayer].position = {x: x, y: y};
      //console.log(Players[Game.currentPlayer].position);
      if (x == tx && y == ty) this.path.shift();
    },
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
        var bid = Players[playerid].gamePos.bid;
        Players[playerid].position.x = Levels.taiwan.mapInfo[bid].x * GridLength;        
        Players[playerid].position.y = Levels.taiwan.mapInfo[bid].y * GridLength;
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
    dice: function() {
      return Math.floor(Math.random() * 6) + 1;
    }
  }
  
  function animate() {
    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    if (Players.isMoving) {
      Players.move();
    }
    // Draw seen map: 9x9 blocks
    var cPlayer = Players[Game.currentPlayer];
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