
var CanvasWidth = 640;
var CanvasHeight = 480;
var GridLength = 48; // The width of each block in game
var MapViewLength = 432; // The partial map that player can see, the length is 9x48=432 px
var MapViewHalfLength = 192;
var MapImgLength = 216;
var MenuOptionHeight = 48;
var MenuOptionWidth = 86;
var SideBarWidth = 208; // Left side bar
var CursorMovement = 45;
var AnimationTimeout = 20; // 50 FPS
var HeadImgLength = 40;
var BodyImgLength = 52;
var HeadOffset = 27;
var SpeedDelta = 3;
var DiceWidth = 54;
var DiceHeight = 72;
var mapOffsetX = 0;
var mapOffsetY = 0;
var ChanceImgWidth = 176;
var ChanceImgHeight = 146;
var ChanceDisplayWidth = 352;
var ChanceDisplayHeight = 291;
var NumOfChances = 19;
var CoverImg = loadImage("topcoverlay.png");
var CursorImg = loadImage("mouse.png");
var DiceImg = loadImage("dice.png");
var LandLabelImg = loadImage("landlabel.png");
var LandMarkersImg = loadImage("landmarker.png");
var MenuSelectedImg = loadImage("menuselected.png");
var HeadImg = loadImage("head.png");
var CarImg = loadImage("car.png");
var BldgImg = loadImage("bldg.png");
var AbacusImg = loadImage("abacus.png");
var ChanceImg = loadImage("chance.png");
var BldgUpgradeMsg = [
  "加蓋平房","改建店鋪","擴建商場","蓋商業大樓","建摩天大廈"
];

var bag1Audio = new Audio("audio/bag1.ogg");
var bag2Audio = new Audio("audio/bag2.ogg");
bag1Audio.addEventListener('ended', function() {
  bag2Audio.play();
});
bag2Audio.addEventListener('ended', function() {
  bag1Audio.play();
});
bag1Audio.play();

var CursorPositions = [
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 251, y: 45},
  {x: 508, y: 224},
  {x: 480, y: 159}
];

function loadImage(imgURL) {
  var image = new Image();
  image.src = "image/" + imgURL;
  return image;
}

function isPtInside(x, y, dx, dy, px, py) {
  if (px < x || px >= x + dx || py < y || py >= y + dy) {
    return false;
  }
  return true;
}

/**
 * Returns from 0 - 5
 */
function dice() {
  return Math.floor(Math.random() * 6);
}

$(function() {
  
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext('2d');
  var cursorPos = {x:CursorPositions[0].x, y:CursorPositions[0].y}; // Pointing at MenuOption "Move On" initially
  var soldLands;
  var bldgLands;
  var currentLevel;
  var mapSize;
  var mapInfo;
  var mapImg;
  var playerList;
  var currentPlayer;
  var currentPlayerIndex;
  var maxNumOfPlayers;
  var cityList;
  var passedBank = false;

  function drawMap(cx, cy) {
    var llx = cx - MapViewHalfLength;
    var rrx = currentLevel.MapLength - (cx + GridLength) - MapViewHalfLength;
    var uuy = cy - MapViewHalfLength;
    var ddy = currentLevel.MapLength - (cy + GridLength) - MapViewHalfLength;
    if (llx < 0) {
      mapOffsetX = 0;
    } else if (llx >= 0 && rrx >=0) {
      mapOffsetX = llx;
    } else {
      mapOffsetX = currentLevel.MapLength - MapViewLength;
    }
    if (uuy < 0) {
      mapOffsetY = 0;
    } else if (uuy >= 0 && ddy >=0) {
      mapOffsetY = uuy;
    } else {
      mapOffsetY = currentLevel.MapLength - MapViewLength;
    }
    context.drawImage(mapImg, mapOffsetX, mapOffsetY, MapViewLength, MapViewLength, 
        SideBarWidth, MenuOptionHeight, MapViewLength, MapViewLength);
    
    // Find which bought lands need to be displayed
    var gameX = Math.floor(cx / GridLength);
    var gameY = Math.floor(cy / GridLength);
    var lx = gameX - 5;
    if (lx < 0) {
      lx = 0;
    }
    var rx = lx + 10;
    if (rx >= mapSize) {
      rx = mapSize - 1;
      lx = rx - 10;
    }
    var ty = gameY - 5;
    if (ty < 0) {
      ty = 0;
    }
    var by = ty + 10;
    if (by >= mapSize) {
      by = mapSize - 1;
      ty = by - 10;
    }
    for (var i=lx; i<=rx; ++i) {
      var array = soldLands[i];
      for (var j in array) {
        var block = array[j];
        var ly = block.ly;
        if (ty <= ly && ly <= by) {
          var owner = block.owner;
          var x = SideBarWidth + block.mx - mapOffsetX;
          var y = MenuOptionHeight + block.my - mapOffsetY;
          context.drawImage(LandMarkersImg, owner * GridLength, 0, GridLength, GridLength,
            x, y, GridLength, GridLength);
        }
      }
    }
    for (var i=lx; i<=rx; ++i) {
      var array = bldgLands[i];
      for (var j in array) {
        var block = array[j];
        var ly = block.ly;
        if (ty <= ly && ly <= by) {
          var owner = block.owner;
          var x = SideBarWidth + block.mx - mapOffsetX;
          var y = MenuOptionHeight + block.my - mapOffsetY;
          context.drawImage(BldgImg, GridLength * (block.bldg - 1), 0, GridLength, GridLength,
            x, y, GridLength, GridLength);
        }
      }
    }
  }
  
  function drawSidebar() {
    context.drawImage(CoverImg, 0, 0);
    // Date
    context.font = "30px sans-serif";
    context.fillStyle = "black";
    context.fillText(Game.year, 75, 48);
    context.fillText(Game.month + "   " + Game.date, 83, 98);
    // Name
    context.font = "45px sans-serif";
    context.fillStyle = 'gold';
    context.fillText(currentPlayer.name, 25, 176);
    // Money
    context.font = "32px sans-serif";
    context.fillStyle = 'yellow';
    context.fillText(currentPlayer.cash, 90, 228);
    context.fillText(currentPlayer.deposit, 90, 275);
  }

  function drawPlayer() {
    for (var i=playerList.length-1; i>=0; --i) {
      var playername = playerList[i];
      var player = Players[playername];
      if (!player.alive || player === currentPlayer) continue;
      var dir = player.gamePos.d;
      var playerposition = player.position;
      var x = SideBarWidth + playerposition.x - mapOffsetX;
      var y = MenuOptionHeight + playerposition.y - mapOffsetY;
      if (mapInfo[player.gamePos.bid].t != 14) { // If player is not in the sea
        context.drawImage(CarImg, dir * 52, 0, 52, 52, x, y, 52, 52);
      }
      context.drawImage(HeadImg, i * 168 + dir * 42, 0, 42, 42, x, y - HeadOffset, 42, 42); // 168 = 42 * 4
    }
    var d = currentPlayer.gamePos.d;
    var pos = currentPlayer.position;
    var cx = SideBarWidth + pos.x - mapOffsetX;
    var cy = MenuOptionHeight + pos.y - mapOffsetY;
    if (mapInfo[currentPlayer.gamePos.bid].t == 14) {
      context.drawImage(CarImg, 208 + (d - 1) * 52, 0, 52, 52, cx, cy, 52, 52);
      return;
    }
    context.drawImage(CarImg, d * 52, 0, 52, 52, cx, cy, 52, 52);
    context.drawImage(HeadImg, currentPlayerIndex * 168 + d * 42, 0, 42, 42,
       cx, cy - HeadOffset, 42, 42); // 168 = 42 * 4
  }

  function drawCursor() {
    context.drawImage(CursorImg, cursorPos.x, cursorPos.y);
  }
  
  function drawDice(d1, d2) {
    context.drawImage(DiceImg, 54 * d1, 0, 54, 72, 55, 336, 54, 72);
    context.drawImage(DiceImg, 54 * d2, 0, 54, 72, 119, 336, 54, 72);
  } 
  
  function turnToNextPlayer() {
    do {
      currentPlayerIndex = (currentPlayerIndex + 1) % maxNumOfPlayers;
      currentPlayer = Players[playerList[currentPlayerIndex]];
    } while (!currentPlayer.alive);
    console.log("turn to next player " + currentPlayer.name);
    defaultEntered = false;
  }
  
  var OverObjects = [
  // Default: Menu Options
  [
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, 0, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth, 0, MenuOptionWidth, MenuOptionHeight);
      },
      x: SideBarWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        Players.dice();
      }
    },
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, MenuOptionWidth, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth + MenuOptionWidth, 0, MenuOptionWidth, MenuOptionHeight);        
      },
      x: SideBarWidth + MenuOptionWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Search");
      }
    },
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, MenuOptionWidth * 2, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth + MenuOptionWidth * 2, 0, MenuOptionWidth, MenuOptionHeight);
      },
      x: SideBarWidth + MenuOptionWidth * 2,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Cards");
      }
    },
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, MenuOptionWidth * 3, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth + MenuOptionWidth * 3, 0, MenuOptionWidth, MenuOptionHeight);
      },
      x: SideBarWidth + MenuOptionWidth * 3,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Progress");
      }
    },
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, MenuOptionWidth * 4, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth + MenuOptionWidth * 4, 0, MenuOptionWidth, MenuOptionHeight);        
      },
      x: SideBarWidth + MenuOptionWidth * 4,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
        console.log("[MenuAction] Others");
      }
    }
  ],
  [/*Court*/],
  [/*Stock*/],
  null, // Chance
  null, // News
  null, // Tax
  [],   // Casino
  null, // Park
  null, // CommunityChest
  null, // Carnival
  null, // Hospital
  null, // Jail
  [],   // Bank
  [],   // Market
  [
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, 0, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth, 0, MenuOptionWidth, MenuOptionHeight);
      },
      x: SideBarWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
      }
    },
    {
      drawSelected: function() {
        context.drawImage(MenuSelectedImg, 0, 0, MenuOptionWidth, MenuOptionHeight, 
          SideBarWidth, 0, MenuOptionWidth, MenuOptionHeight);
      },
      x: SideBarWidth,
      y: 0,
      width: MenuOptionWidth,
      height: MenuOptionHeight,
      action: function() {
      }
    }
  ]    
  ];

  function checkPlayerCashFlow(player) {
    if (player.cash < 0) {
      player.deposit += player.cash;
      player.cash = 0;
      if (player.deposit <= 0) {
        player.alive = false;
        console.log(player.name + " is bankrupt");
      }
    }
  }

  var Levels = {
    taiwan: {
      playerList: ["atuzai", "dalaoqian", "sunxiaomei", "qianfuren"],
      mapInfo: {"1":{"x":20,"y":7,"s":0,"t":2,"n":{"3":2}},
      "2":{"x":20,"y":8,"s":1,"t":15,"n":{"3":3},"lx":19,"ly":8,"c":"taoyuan"},
      "3":{"x":20,"y":9,"s":1,"t":15,"n":{"3":4},"lx":19,"ly":9,"c":"taoyuan"},"4":{"x":20,"y":10,"s":1,"t":15,"n":{"3":5},"lx":19,"ly":10,"c":"taoyuan"},"5":{"x":20,"y":11,"s":1,"t":3,"n":{"3":6,"2":97}},"6":{"x":19,"y":12,"s":0,"t":3,"n":{"0":5,"3":7}},"7":{"x":19,"y":13,"s":1,"t":15,"n":{"0":6,"3":8},"lx":20,"ly":13,"c":"xinzhu"},"8":{"x":19,"y":14,"s":1,"t":15,"n":{"0":7,"3":9},"lx":20,"ly":14,"c":"xinzhu"},"9":{"x":19,"y":15,"s":1,"t":15,"n":{"0":8,"3":10},"lx":20,"ly":15,"c":"xinzhu"},"10":{"x":19,"y":16,"s":1,"t":12,"n":{"0":9,"3":11,"1":98,"2":126}},"11":{"x":19,"y":17,"s":0,"t":12,"n":{"0":10,"3":12}},"126":{"x":20,"y":16,"s":0,"t":12,"n":{"1":10,"2":127}},"12":{"x":19,"y":18,"s":1,"t":15,"n":{"0":11,"3":13},"lx":20,"ly":18,"c":"jiayi"},"13":{"x":19,"y":19,"s":1,"t":15,"n":{"0":12,"3":14},"lx":20,"ly":19,"c":"jiayi"},"14":{"x":19,"y":20,"s":1,"t":15,"n":{"0":13,"3":15},"lx":20,"ly":20,"c":"jiayi"},"15":{"x":19,"y":21,"s":0,"t":2,"n":[14,16]},"16":{"x":18,"y":21,"s":1,"t":2,"n":{"3":26,"1":17,"2":15}},"26":{"x":18,"y":22,"s":0,"t":2,"n":{"0":16,"3":27}},"17":{"x":17,"y":21,"s":1,"t":15,"n":{"1":18},"lx":17,"ly":20,"c":"tainan"},"18":{"x":16,"y":21,"s":1,"t":15,"n":{"1":19},"lx":16,"ly":20,"c":"tainan"},"19":{"x":15,"y":21,"s":1,"t":15,"n":{"1":20},"lx":15,"ly":20,"c":"tainan"},"20":{"x":14,"y":21,"s":1,"t":5,"n":{"3":22}},"21":{"x":13,"y":21,"s":0,"t":5,"n":{"2":20}},"22":{"x":14,"y":22,"s":1,"t":6,"n":{"0":20,"2":23}},"23":{"x":15,"y":22,"s":1,"t":15,"n":{"2":24},"lx":15,"ly":23,"c":"tainan"},"24":{"x":16,"y":22,"s":1,"t":15,"n":{"2":25},"lx":16,"ly":23,"c":"tainan"},"25":{"x":17,"y":22,"s":1,"t":15,"n":{"2":26},"lx":17,"ly":23,"c":"tainan"},"27":{"x":18,"y":23,"s":1,"t":15,"n":{"0":26,"3":28},"lx":19,"ly":23,"c":"gaoxiong"},"28":{"x":18,"y":24,"s":1,"t":15,"n":{"0":27,"3":29},"lx":19,"ly":24,"c":"gaoxiong"},"29":{"x":18,"y":25,"s":1,"t":15,"n":{"0":28,"3":30},"lx":19,"ly":25,"c":"gaoxiong"},"30":{"x":18,"y":26,"s":1,"t":15,"n":{"0":29,"3":31},"lx":19,"ly":26,"c":"gaoxiong"},"31":{"x":18,"y":27,"s":0,"t":13,"n":{"0":30,"3":32}},"32":{"x":19,"y":28,"s":1,"t":13,"n":{"0":31,"3":33}},"33":{"x":19,"y":29,"s":1,"t":15,"n":{"0":32,"3":34},"lx":18,"ly":29,"c":"pingdong"},"34":{"x":19,"y":30,"s":1,"t":15,"n":{"0":33,"3":35},"lx":18,"ly":30,"c":"pingdong"},"35":{"x":19,"y":31,"s":1,"t":15,"n":{"0":34,"3":36},"lx":18,"ly":31,"c":"pingdong"},"36":{"x":19,"y":32,"s":1,"t":2,"n":{"0":35,"2":37}},"37":{"x":20,"y":32,"s":0,"t":2,"n":{"1":36,"2":38}},"38":{"x":21,"y":32,"s":0,"t":9,"n":{"1":37,"2":39}},"39":{"x":22,"y":32,"s":1,"t":9,"n":[40,38]},"40":{"x":22,"y":31,"s":1,"t":15,"n":{"0":41,"3":39},"lx":23,"ly":31,"c":"eluanbi"},"41":{"x":22,"y":30,"s":1,"t":15,"n":{"0":42,"3":40},"lx":23,"ly":30,"c":"eluanbi"},"42":{"x":22,"y":29,"s":1,"t":15,"n":{"0":43,"3":41},"lx":23,"ly":29,"c":"eluanbi"},"43":{"x":22,"y":28,"s":0,"t":4,"n":{"3":42,"2":44}},"44":{"x":23,"y":27,"s":1,"t":4,"n":{"1":43,"2":45}},"45":{"x":24,"y":27,"s":1,"t":8,"n":{"1":44,"2":46}},"46":{"x":25,"y":27,"s":0,"t":8,"n":[47,45]},"47":{"x":25,"y":26,"s":1,"t":15,"n":{"0":48,"3":46},"lx":26,"ly":26,"c":"taidong"},"48":{"x":25,"y":25,"s":1,"t":15,"n":{"0":49,"3":47},"lx":26,"ly":25,"c":"taidong"},"49":{"x":25,"y":24,"s":1,"t":15,"n":{"0":50,"3":48},"lx":26,"ly":24,"c":"taidong"},"50":{"x":25,"y":23,"s":1,"t":15,"n":{"0":51,"3":49},"lx":26,"ly":23,"c":"taidong"},"51":{"x":25,"y":22,"s":1,"t":3,"n":{"0":52,"3":50}},"52":{"x":25,"y":21,"s":0,"t":3,"n":{"0":53,"3":51}},"53":{"x":25,"y":20,"s":1,"t":15,"n":{"0":54,"3":52},"lx":26,"ly":20,"c":"hualian"},"54":{"x":25,"y":19,"s":1,"t":15,"n":{"0":55,"3":53},"lx":26,"ly":19,"c":"hualian"},"55":{"x":25,"y":18,"s":1,"t":15,"n":{"0":56,"3":54},"lx":26,"ly":18,"c":"hualian"},"56":{"x":25,"y":17,"s":1,"t":7,"n":{"3":55,"1":130,"2":57}},"130":{"x":24,"y":16,"s":0,"t":7,"n":{"1":129,"2":56}},"57":{"x":26,"y":17,"s":1,"t":15,"n":{"1":56,"2":58},"lx":26,"ly":16,"c":"tailuge"},"58":{"x":27,"y":17,"s":1,"t":15,"n":{"1":57,"2":59},"lx":27,"ly":16,"c":"tailuge"},"59":{"x":28,"y":17,"s":1,"t":15,"n":{"1":58,"2":60},"lx":28,"ly":16,"c":"tailuge"},"60":{"x":29,"y":17,"s":0,"t":2,"n":[61,59]},"61":{"x":30,"y":16,"s":1,"t":2,"n":{"0":62,"3":60}},"62":{"x":30,"y":15,"s":1,"t":15,"n":{"0":63,"3":61},"lx":29,"ly":15,"c":"suao"},"63":{"x":30,"y":14,"s":1,"t":15,"n":{"0":64,"3":62},"lx":29,"ly":14,"c":"suao"},"64":{"x":30,"y":13,"s":1,"t":15,"n":{"0":65,"3":63},"lx":29,"ly":13,"c":"suao"},"65":{"x":30,"y":12,"s":1,"t":15,"n":{"0":66,"3":64},"lx":29,"ly":12,"c":"suao"},"66":{"x":30,"y":11,"s":0,"t":3,"n":{"0":67,"3":65}},"67":{"x":31,"y":10,"s":1,"t":3,"n":{"0":68,"3":66}},"68":{"x":31,"y":9,"s":1,"t":15,"n":{"0":69,"3":67},"lx":30,"ly":9,"c":"yilan"},"69":{"x":31,"y":8,"s":1,"t":15,"n":{"0":70,"3":68},"lx":30,"ly":8,"c":"yilan"},"70":{"x":31,"y":7,"s":1,"t":15,"n":{"0":71,"3":69},"lx":30,"ly":7,"c":"yilan"},"71":{"x":31,"y":6,"s":1,"t":15,"n":{"0":72,"3":70},"lx":30,"ly":6,"c":"yilan"},"72":{"x":31,"y":5,"s":1,"t":6,"n":{"0":73,"3":71}},"73":{"x":31,"y":4,"s":0,"t":6,"n":{"0":74,"3":72}},"74":{"x":31,"y":3,"s":1,"t":2,"n":{"3":73,"1":75}},"75":{"x":30,"y":3,"s":1,"t":15,"n":{"1":76,"2":74},"lx":30,"ly":4,"c":"jilong"},"76":{"x":29,"y":3,"s":1,"t":15,"n":{"1":77,"2":75},"lx":29,"ly":4,"c":"jilong"},"77":{"x":28,"y":3,"s":1,"t":15,"n":{"1":78,"2":76},"lx":28,"ly":4,"c":"jilong"},"78":{"x":27,"y":3,"s":0,"t":8,"n":{"1":79,"2":77}},"79":{"x":26,"y":4,"s":1,"t":8,"n":{"3":80,"2":78}},"80":{"x":26,"y":5,"s":1,"t":7,"n":[79,81]},"81":{"x":25,"y":5,"s":1,"t":15,"n":{"1":82,"2":80},"lx":25,"ly":4,"c":"taipei"},"82":{"x":24,"y":5,"s":1,"t":15,"n":{"1":83,"2":81},"lx":24,"ly":4,"c":"taipei"},"83":{"x":23,"y":5,"s":1,"t":15,"n":{"1":84,"2":82},"lx":23,"ly":4,"c":"taipei"},"84":{"x":22,"y":5,"s":1,"t":15,"n":{"1":85,"2":83},"lx":22,"ly":4,"c":"taipei"},"85":{"x":21,"y":5,"s":1,"t":1,"n":{"3":88,"2":84}},"88":{"x":21,"y":6,"s":1,"t":2,"n":{"3":1,"2":89}},"93":{"x":21,"y":7,"s":0,"t":2,"n":[88]},"94":{"x":21,"y":8,"s":1,"t":15,"n":[93],"lx":22,"ly":8,"c":"taoyuan"},"95":{"x":21,"y":9,"s":1,"t":15,"n":[94],"lx":22,"ly":9,"c":"taoyuan"},"96":{"x":21,"y":10,"s":1,"t":15,"n":[95],"lx":22,"ly":10,"c":"taoyuan"},"97":{"x":21,"y":11,"s":1,"t":4,"n":[96]},"98":{"x":18,"y":16,"s":1,"t":15,"n":{"1":99,"2":10},"lx":18,"ly":15,"c":"taizhong"},"99":{"x":17,"y":16,"s":1,"t":15,"n":{"1":100,"2":98},"lx":17,"ly":15,"c":"taizhong"},"100":{"x":16,"y":16,"s":1,"t":15,"n":{"1":101,"2":99},"lx":16,"ly":15,"c":"taizhong"},"101":{"x":15,"y":16,"s":0,"t":8,"n":{"1":102,"2":100}},"102":{"x":14,"y":16,"s":1,"t":8,"n":{"3":139,"1":103,"2":101}},"139":{"x":14,"y":17,"s":1,"t":15,"n":{"0":102,"3":140},"lx":13,"ly":17,"c":"yunlin"},"140":{"x":14,"y":18,"s":1,"t":15,"n":{"0":139,"3":141},"lx":13,"ly":18,"c":"yunlin"},"141":{"x":14,"y":19,"s":1,"t":15,"n":{"0":140,"3":142},"lx":13,"ly":19,"c":"yunlin"},"142":{"x":14,"y":20,"s":0,"t":5,"n":{"0":141,"3":20}},"103":{"x":13,"y":16,"s":0,"t":14,"n":{"1":104}},"104":{"x":12,"y":16,"s":1,"t":14,"n":{"1":105}},"105":{"x":11,"y":16,"s":1,"t":14,"n":{"1":106}},"106":{"x":10,"y":16,"s":1,"t":14,"n":{"1":107}},"107":{"x":9,"y":16,"s":1,"t":14,"n":{"1":108}},"108":{"x":8,"y":16,"s":1,"t":14,"n":{"1":109}},"109":{"x":7,"y":16,"s":1,"t":14,"n":{"1":110}},"110":{"x":6,"y":16,"s":1,"t":14,"n":{"1":111}},"116":{"x":3,"y":18,"s":1,"t":14,"n":{"2":117}},"117":{"x":4,"y":19,"s":1,"t":14,"n":{"2":118}},"118":{"x":5,"y":20,"s":1,"t":14,"n":{"2":119}},"119":{"x":6,"y":21,"s":1,"t":14,"n":{"2":120}},"120":{"x":7,"y":21,"s":1,"t":14,"n":{"2":121}},"121":{"x":8,"y":21,"s":1,"t":14,"n":{"2":122}},"122":{"x":9,"y":21,"s":1,"t":14,"n":{"2":123}},"123":{"x":10,"y":21,"s":1,"t":14,"n":{"2":124}},"124":{"x":11,"y":21,"s":1,"t":14,"n":{"2":125}},"125":{"x":12,"y":21,"s":0,"t":14,"n":{"2":21}},"111":{"x":5,"y":16,"s":1,"t":15,"n":{"1":112},"lx":5,"ly":15,"c":"penghu"},"112":{"x":4,"y":16,"s":1,"t":15,"n":{"1":113},"lx":4,"ly":15,"c":"penghu"},"113":{"x":3,"y":16,"s":1,"t":15,"n":{"1":114},"lx":3,"ly":15,"c":"penghu"},"114":{"x":2,"y":16,"s":0,"t":8,"n":{"3":115}},"115":{"x":2,"y":17,"s":1,"t":8,"n":{"2":116}},"127":{"x":21,"y":16,"s":1,"t":15,"n":{"1":126,"2":128},"lx":21,"ly":17,"c":"nantou"},"128":{"x":22,"y":16,"s":1,"t":15,"n":{"1":127,"2":129},"lx":22,"ly":17,"c":"nantou"},"129":{"x":23,"y":16,"s":1,"t":15,"n":{"1":128,"2":130},"lx":23,"ly":17,"c":"nantou"},"131":{"x":24,"y":14,"s":0,"t":11,"n":[]},"132":{"x":25,"y":14,"s":0,"t":11,"n":[]},"133":{"x":24,"y":13,"s":0,"t":11,"n":[]},"134":{"x":25,"y":13,"s":0,"t":11,"n":[]},"135":{"x":22,"y":25,"s":0,"t":10,"n":[]},"136":{"x":23,"y":25,"s":0,"t":10,"n":[]},"137":{"x":22,"y":24,"s":0,"t":10,"n":[]},"138":{"x":23,"y":24,"s":0,"t":10,"n":[]},"86":{"x":20,"y":5,"s":1,"t":1,"n":{"3":87}},"87":{"x":20,"y":6,"s":1,"t":2,"n":{"3":1}},"89":{"x":22,"y":6,"s":1,"t":15,"n":{"2":90},"lx":22,"ly":7,"c":"taipei"},"90":{"x":23,"y":6,"s":1,"t":15,"n":{"2":91},"lx":23,"ly":7,"c":"taipei"},"91":{"x":24,"y":6,"s":1,"t":15,"n":{"2":92},"lx":24,"ly":7,"c":"taipei"},"92":{"x":25,"y":6,"s":1,"t":15,"n":{"2":80},"lx":25,"ly":7,"c":"taipei"},"143":{"x":20,"y":4,"s":1,"t":1,"n":{"3":86}}},
      mapImg: loadImage("taiwan.png"),
      mapSize: 36, // There are 36x36 blocks in the map
      MapLength: 1728, 
      startPos: [{bid: 1, d: 3}, {bid: 87, d: 3}, {bid: 86, d: 3}, {bid: 143, d: 3}],
      cityList: {
        nantou: {
          price: 500, upgrade: 80,
          rent: [100, 300, 750, 1500, 0, 0],
          blocks: [127, 128, 129],
          display: "南投縣"
        },
        taidong: {
          price: 1000, upgrade: 150,
          rent: [200, 600, 1500, 0, 0, 0],
          blocks: [47, 48, 49, 50],
          display: "台東縣"
        },
        taizhong: {
          price: 1400, upgrade: 200,
          rent: [250, 800, 0, 0, 0, 0],
          blocks: [98, 99, 100],
          display: "台中市"
        },
        taipei: {
          price: 2500, upgrade: 400,
          rent: [500, 1500, 3750, 0, 0, 0],
          blocks: [84, 83, 82, 81, 89, 90, 91, 92],
          display: "台北市"
        },
        tainan: {
          price: 2000, upgrade: 250,
          rent: [400, 1200, 3000, 8800, 0, 0],
          blocks: [17, 18, 19, 23, 24, 25],
          display: "台南市"
        },
        jilong: {
          price: 2000, upgrade: 300,
          rent: [400, 1200, 3000, 6000, 0, 16000],
          blocks: [75, 76, 77],
          display: "基隆市"
        },
        tailuge: {
          price: 900, upgrade: 100,
          rent: [160, 550, 1250, 2500, 0, 0],
          blocks: [57, 58, 59],
          display: "太魯閣"
        },
        yilan: {
          price: 1200, upgrade: 160,
          rent: [230, 700, 1600, 3000, 5000, 8000],
          blocks: [68, 69, 70, 71],
          display: "宜蘭縣"
        },
        pingdong: {
          price: 1400, upgrade: 200, 
          rent: [250, 800, 2000, 4000, 7000, 0],
          blocks: [33, 34, 35],
          display: "屏東縣"
        },
        xinzhu: {
          price: 1600, upgrade: 200,
          rent: [300, 900, 0, 0, 0, 0],
          blocks: [7, 8, 9],
          display: "新竹市"
        },
        taoyuan: {
          price: 2200, upgrade: 340,
          rent: [440, 1300, 3200, 6400, 10500, 0],
          blocks: [2, 3, 4, 96, 95, 94],
          display: "桃園縣"
        },
        penghu: {
          price: 600, upgrade: 100,
          rent: [100, 300, 0, 0, 0, 0],
          blocks: [11, 12, 13],
          display: "澎 湖"
        },
        hualian: {
          price: 1500, upgrade: 180,
          rent: [300, 900, 2000, 4200, 7000, 0],
          blocks: [53, 54, 55],
          display: "花蓮縣"
        },
        suao: {
          price: 800, upgrade: 100,
          rent: [150, 500, 1100, 2200, 0, 0],
          blocks: [62, 63, 64, 65],
          display: "蘇 澳"
        },
        yunlin: {
          price: 1600, upgrade: 200,
          rent: [300, 900, 0, 0, 0, 0],
          blocks: [139, 140, 141],
          display: "雲林縣"
        },
        gaoxiong: {
          price: 2300, upgrade: 360,
          rent: [450, 1300, 4000, 6000, 0, 0],
          blocks: [27, 28, 29, 30],
          display: "高雄市"
        },
        eluanbi: {
          price: 700, upgrade: 100,
          rent: [140, 400, 0, 0, 0, 0],
          blocks: [40, 41, 42],
          display: "鹅栾鼻"
        },
        jiayi: {
          price: 1500, upgrade: 180,
          rent: [300, 900, 2000, 0, 0, 7000],
          blocks: [12, 13, 14],
          display: "嘉義市"
        }
      },
    }
  };

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
   16: Passing Bank
  */
  var defaultEntered = false;
  function ani_default() {
    var mvg = Players.isMoving;
    if (mvg) {
      Players.move();
    }
    // Draw seen map: 9x9 blocks
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    // Draw players
    drawPlayer();
    // Draw sidebar
    drawSidebar();
    // If the animation is playing, then disable keyboard intrupt
    if (mvg) {
      drawDice(Players.dice1 - 1, Players.dice2 - 1);
      return;
    }
    if (currentPlayer.robot) {
      Players.dice();
      return;
    }
    cko_default();
    // Draw cursor
    drawCursor();
    if (!defaultEntered) {
      drawDice(dice(), dice());
    }
  }
  
  function cko_default() {
    var obj = null;
    var objList = OverObjects[0];
    for (var i=0; i<objList.length; ++i) {
      if (isPtInside(objList[i].x, objList[i].y, 
          objList[i].width, objList[i].height, 
          cursorPos.x, cursorPos.y)) {
        obj = objList[i];
        break;
      }
    }
    if (obj) {
      obj.drawSelected();
      return obj.action;
    }
  }
  
  function kp_default(e) {
    // If the animation is playing, then disable keyboard intrupt
    if (Players.isMoving) return;
    if (currentPlayer.robot) return;
    var kc = e.keyCode;
    //console.log("KeyPressed " + kc);
    switch (kc) {
    case 37: // left
      cursorPos.x -= CursorMovement;
      if (cursorPos.x < 0) cursorPos.x = 0;
      break;
    case 38: // up
      cursorPos.y -= CursorMovement;
      if (cursorPos.y < 0) cursorPos.y = 0;
      break;
    case 39: // right
      cursorPos.x += CursorMovement;
      if (cursorPos.x >= CanvasWidth) cursorPos.x = CanvasWidth - 1;
      break;
    case 40: // down
      cursorPos.y += CursorMovement;
      if (cursorPos.y >= CanvasHeight) cursorPos.y = CanvasHeight - 1;
      break;
    case 32: // space
    case 13: // enter
      defaultEntered = true;
      break;
    }
    var action = cko_default();
    if (defaultEntered) {
      if (action) {
        console.log("Call enterAction");
        action();
      } else {
        console.log("no enterAction defined");
      }
    }
  }
  
  function ani_court() {
    console.log("court callback called");
    turnToNextPlayer();
    Game.status = 0;
  }
  var obj_court = new Array();
  
  function kp_court(e) {
    console.log("court keypressed called");
  }
  
  function ani_stock() {
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("股   市", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("股   市", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function kp_stock(e) {
    console.log("stock key pressed called");
  }
  
  var chanceDelay = 0;
  var chanceImgX, chanceImgY;
  function ani_chance() {
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 130, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("運  氣", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("運  氣", 320, 140);

    drawPlayer();
    drawSidebar();
    if (chanceDelay < 150) {
      ++chanceDelay;
      if (chanceDelay == 50) {
        var pick = Math.floor(Math.random() * NumOfChances);
        chanceImgX = Math.floor(pick % 4) * ChanceImgWidth;
        chanceImgY = Math.floor(pick / 4) * ChanceImgHeight;
        Chances[pick]();
      } else if (chanceDelay > 50) {
        context.drawImage(ChanceImg, chanceImgX, chanceImgY, ChanceImgWidth, ChanceImgHeight, 
          281, 186, ChanceDisplayWidth, ChanceDisplayHeight);
      }
    } else {
      chanceDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }

  function ani_news() {
    console.log("news callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("新   聞", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("新   聞", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }

  function ani_tax() {
    console.log("tax callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("交   税", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("交   税", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }

  function ani_casino() {
    console.log("casino callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("賭   場", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("賭   場", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function kp_casino(e) {
    console.log("casino keypressed called");
  }

  var parkDelay = 0;
  function ani_park() {
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("公   園", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("公   園", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function ani_commuchest() {
    console.log("community chest callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("卡   片", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("卡   片", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function ani_carnival() {
    console.log("carnival callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("游 乐 场", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("游 乐 场", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function kp_carnival(e) {
    console.log("carnival key pressed called");
  }
  
  function ani_hospital() {
    console.log("hospital callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("医   院", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("医   院", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function ani_jail() {
    console.log("jail callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("监   狱", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("监   狱", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }

  function ani_bank() {
    console.log("bank callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    drawPlayer();
    drawSidebar();
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("銀 行", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("銀 行", 320, 140);

    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function kp_bank(e) {
    console.log("bank key pressed called");
  }

  function ani_market() {
    console.log("market callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    context.drawImage(LandLabelImg, 0, 0, 180, 75, 292, 86, 180, 75);

    context.font = "43px sans-serif";
    context.fillStyle = "black";
    context.fillText("黑   市", 322, 142);

    context.fillStyle = "yellow";
    context.fillText("黑   市", 320, 140);

    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }

  function kp_market(e) {
    console.log("market keypressed called");
  }

  function ani_road() {
    console.log("road callback called");
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    drawPlayer();
    drawSidebar();
    if (parkDelay < 50) {
      ++parkDelay;
    } else {
      parkDelay = 0;
      turnToNextPlayer();
      Game.status = 0;
    }
  }
  
  function drawUpgradePrice(param) {
    var n = param[0];
    var p = param[1];
    // Shadows
    context.fillStyle = "black";
    context.font = "35px sans-serif";
    context.fillText(n, 292, 122);

    context.font = "35px sans-serif";
    context.fillText("投入資本 ", 292, 171);
    context.font = "30px sans-serif";
    context.fillText(p, 436, 171);

    // Text
    context.font = "35px sans-serif";
    context.fillStyle = "blue";
    context.fillText(n, 290, 120);

    context.font = "35px sans-serif";
    context.fillText("投入資本 ", 290, 169);      
    context.font = "30px sans-serif";
    context.fillStyle = "yellow";
    context.fillText(p, 438, 169);

  }
  
  function drawYesNoDialog() {
    context.font = "25px sans-serif";
    if (passbyResult) {
      context.fillStyle = "orange";
    } else {    
      context.fillStyle = "black";
    }
    context.fillText("Yes", 474, 227);
    
    if (!passbyResult) {
      context.fillStyle = "orange";
    } else {    
      context.fillStyle = "black";
    }
    context.fillText("No", 474, 262);

  }
  
  function drawLandlordRental(param) {
    var n = param[0];
    var p = param[1];
    context.beginPath();
    context.rect(274, 123, 308, 87);
    context.fillStyle = '#030B80';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.stroke();  
    
    context.fillStyle = "black";
    context.font = "33px sans-serif";  
    context.fillText("本地屬於", 312, 162);
    context.fillText(n, 454, 162);
    context.fillText("付租金", 342, 201);
    context.fillText(p, 470, 203);

    context.fillStyle = "yellow";
    context.fillText("本地屬於", 310, 160);
    context.fillStyle = "blue";
    context.fillText(n, 452, 160);
    context.fillText("付租金", 340, 199);
    context.fillStyle = "orange";
    context.fillText(p, 468, 201);
  } 

  function drawPurchaseDialog() {
    context.fillStyle = "black";
    context.font = "35px sans-serif";  
    context.fillText("買下此地", 322, 249);
    context.fillStyle = "blue";
    context.fillText("買下此地", 320, 247);
    drawYesNoDialog();
  }
  
  function drawLandNamePrice(param) {
    var n = param[0];
    var p = param[1];
    context.drawImage(LandLabelImg, 312, 80);
    // Shadows
    context.fillStyle = "black";
    context.font = "35px sans-serif";
    context.fillText(n, 354, 132);
    context.fillText("地價", 334, 194);
    context.font = "30px sans-serif";
    context.fillText(p, 408, 188);

    // Text
    context.font = "35px sans-serif";
    context.fillStyle = "white";
    context.fillText(n, 352, 130);
    context.fillText("地價", 332, 192);

    context.font = "30px sans-serif";
    context.fillStyle = "red";
    context.fillText(p, 406, 186);      
  }

  function drawNotEnoughCash() {
    context.font = "35px sans-serif";
    context.fillStyle = "black";
    context.fillText("您的現金不足", 322, 147);
    context.fillStyle = "gold";
    context.fillText("您的現金不足", 320, 145);
  }
  
  function buyEmptyLand(block, price) {
    console.log(currentPlayer.name + " bought " + block.c);
    block.owner = currentPlayerIndex;
    if (block.bldg == null) {
      block.bldg = 0;
    }
    currentPlayer.cash -= price;
    currentPlayer.blocks.push(block);
    if (block.bldg > 0) {
      ++currentPlayer.building;
    }
    soldLands[block.lx].push(block);
  }
  
  function upgradeBldg(block, price) {
    console.log(currentPlayer.name + " upgraded " + block.c);
    if (block.bldg == 0) {
      ++currentPlayer.building;
    }
    ++block.bldg;
    currentPlayer.cash -= price;
    bldgLands[block.lx].push(block);
  }
  
  function payRent(rent, owner) {
    owner.deposit += rent;
    currentPlayer.cash -= rent;
    checkPlayerCashFlow(currentPlayer);
  }
    
  var passbyKeypressed = false;
  var passbyResult = true;
  var passbyDelay = 0;
  var passbyInDelay = false;
  var passbyPlayAni = null;
  var passbyPlayAniParam = null;
  function ani_passby() {
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    drawPlayer();
    drawSidebar();
    drawDice(Players.dice1 - 1, Players.dice2 - 1);
    if (passbyPlayAni) {
      passbyPlayAni(passbyPlayAniParam);
    }
    
    // Clean up
    if (passbyInDelay) {
      if (passbyDelay < 75) {
        ++passbyDelay;
      } else {
        passbyResult = true;
        passbyKeypressed = false;
        passbyPlayAni = null;
        passbyPlayAniParam = null;
        passbyInDelay = false;
        passbyDelay = 0;
        cursorPos.x = CursorPositions[0].x;
        cursorPos.y = CursorPositions[0].y;
        turnToNextPlayer();
        Game.status = 0;
      }
      return;
    }
    // No need to draw cursor if it's in delay
    drawCursor();

    var bid = currentPlayer.gamePos.bid;
    var block = mapInfo[bid];
    var bldg = block.bldg; // 0: occupied, 1: one house, 2: two houses, 3: grocery store, 
                           // 4: supermarket, 5: skyscraper
    var owner = block.owner;
    var city = cityList[block.c];
    var name = city.display;
    var cash = currentPlayer.cash;

    if (owner != null) { // The block was sold
      if (owner == currentPlayerIndex) {
        var bldg = block.bldg;
        var cost = city.upgrade;
        //console.log(bldg + " " + cost);
        if (bldg == 5 || cost > cash) { // do nothing if not enough cash or the bldg is already skyscraper
          passbyPlayAni = null;
          passbyPlayAniParam = null;
          passbyInDelay = true;
          return;
        }
        passbyPlayAniParam = [BldgUpgradeMsg[bldg], cost];
        passbyPlayAni = drawUpgradePrice;
        
        if (currentPlayer.robot) {
        // Robots have a simple strategy: just buy every empty block if they have enough cash          
          upgradeBldg(block, cost);
          passbyInDelay = true;
          return;
        } else {
          drawYesNoDialog();
          if (passbyKeypressed) {
            if (passbyResult) {
              upgradeBldg(block, cost);
            }
            passbyPlayAni = null;
            passbyPlayAniParam = null;
            passbyInDelay = true;
          }
        }
      } else { // if (owner != currentPlayerIndex)
        var rent = 0;
        var player = playerList[owner];
        var ownerObj = Players[player];
        var ownername = ownerObj.name;
        var blocks = city.blocks;
        for (var key in blocks) {
          var blockid = blocks[key];
          var blk = mapInfo[blockid];
          if (blk.owner == owner) {
            rent += city.rent[blk.bldg];
          }
        }
        passbyPlayAniParam = [ownername, rent];
        passbyPlayAni = drawLandlordRental;
        payRent(rent, ownerObj);
        passbyInDelay = true;
        console.log("total cost " + rent);
      }
    } else { // Empty block
      var price = city.price;
      if (cash < price) {
        passbyPlayAniParam = null;
        if (currentPlayer.robot) {
          passbyPlayAni = null;
        } else {
          passbyPlayAni = drawNotEnoughCash;
        }
        passbyInDelay = true;
        return;
      }
      passbyPlayAniParam = [name, price];
      passbyPlayAni = drawLandNamePrice;

      if (currentPlayer.robot) {
        // Robots have a simple strategy: just buy every empty block if they have enough cash
        buyEmptyLand(block, price);
        passbyInDelay = true;
        return;
      } else {
        drawPurchaseDialog();
        if (passbyKeypressed) {
          if (passbyResult) {
            buyEmptyLand(block, price);
          }
          passbyPlayAni = null;
          passbyPlayAniParam = null;
          passbyInDelay = true;
        }
      }
    }
  }

  function kp_passby(e) {
    // If the animation is playing, then disable keyboard intrupt
    var kc = e.keyCode;
    //console.log("KeyPressed " + kc);
    switch (kc) {
    case 38: // up
      cursorPos.y = 224;
      passbyResult = true;
      break;
    case 40: // down
      cursorPos.y = 256;
      passbyResult = false;
      break;
    case 32: // space
    case 13: // enter
      passbyKeypressed = true;
      break;
    }
  }
  
  var passbankPlayAni = null;
  var passbankPlayAniParam = 0;
  var passbankDialogLevel = 0;
  function drawBankDialog() {
    context.beginPath();
    context.rect(246, 122, 212, 86);
    context.fillStyle = '#030B80';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.stroke();  

    context.beginPath();
    context.rect(460, 122, 84, 129);
    context.fillStyle = '#030B80';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.stroke();  

    context.fillStyle = "black";
    context.font = "29px sans-serif";  
    context.fillText("路過銀行", 290, 182);
    context.fillText("存款", 474, 156);
    context.fillText("領款", 474, 201);
    context.fillText("放棄", 474, 244);

    context.fillStyle = "yellow";
    context.fillText("路過銀行", 288, 180);
    context.fillStyle = "blue";
    context.fillText("存款", 472, 154);
    context.fillText("領款", 472, 199);
    context.fillText("放棄", 472, 242);
    context.fillStyle = "yellow";
    if (level0Selection == 0) {
      context.fillText("存款", 472, 154);      
    } else if (level0Selection == 1) {
      context.fillText("領款", 472, 199);    
    } else {
      context.fillText("放棄", 472, 242);    
    }
  }
  var passbankDelay = 0;
  function drawRobotPassbank(param) {
    var choice = param[0];
    var transferMoney = param[1];
    
    context.beginPath();
    context.rect(223, 247, 340, 86);
    context.fillStyle = '#030B80';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.stroke();  
    
    context.fillStyle = "black";
    context.font = "33px sans-serif";  
    context.fillText(ATMDialog[choice], 267, 307);
    context.fillStyle = "gold";
    context.fillText(ATMDialog[choice], 265, 305);
    
    context.fillStyle = "black";
    context.font = "33px sans-serif";  
    context.fillText(transferMoney, 398, 308);
    context.fillStyle = "gold";
    context.fillText(transferMoney, 396, 306);

    if (passbankDelay < 50) {
      ++passbankDelay;
    } else {
      passbankDelay = 0;
      passbankPlayAni = null;
      Game.status = 0;
    }
  }
  
  function ani_passbank() {
    drawMap(currentPlayer.position.x, currentPlayer.position.y);
    drawPlayer();
    drawSidebar();
    drawDice(Players.dice1 - 1, Players.dice2 - 1);
    
    if (!currentPlayer.robot) {
      drawBankDialog();
    }
    //console.log("level0Selection " + level0Selection);
    if (passbankPlayAni) {
      passbankPlayAni(passbankPlayAniParam);
      return;
    }
    if (currentPlayer.robot) {
      // Right now robots have a simple strategy, try to make the ratio of cash:deposti = 2:3
      var c = currentPlayer.cash;
      var d = currentPlayer.deposit;
      if (c / d < 0.4) { // not enough cash
        var delta = Math.floor((c + d) / 5) * 2 - c;
        currentPlayer.cash += delta;
        currentPlayer.deposit -= delta;
        passbankPlayAni = drawRobotPassbank;
        passbankPlayAniParam = [1, delta];
      } else if (c / d > 1.5){
        var delta = Math.floor((c + d) / 5 * 3 - d);
        currentPlayer.cash -= delta;
        currentPlayer.deposit += delta;
        passbankPlayAni = drawRobotPassbank;
        passbankPlayAniParam = [0, delta];
      } else {
        Game.status = 0;
      }
      passedBank = true;
    } else {
      drawCursor();
    }
  }
  
  var ATMDialog = ["存入金额 ", "提出金额 "];
  var transferMoney = 0;
  var level0Selection = 0;
  function drawDepositWithdrawDialog(choice) {
    //console.log("choice " + choice);
    context.beginPath();
    context.rect(223, 247, 340, 86);
    context.fillStyle = '#030B80';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'gray';
    context.stroke();  
    
    context.fillStyle = "black";
    context.font = "33px sans-serif";  
    context.fillText(ATMDialog[choice], 267, 307);
    context.fillStyle = "gold";
    context.fillText(ATMDialog[choice], 265, 305);
    
    context.drawImage(AbacusImg, 269, 324);
    context.drawImage(AbacusImg, 246, 0, 20, 50, cursorPos.x - 10, cursorPos.y - 25, 20, 50);
    
    var money;
    if (choice == 0) {
      money = currentPlayer.cash;
    } else {
      money = currentPlayer.deposit;
    }
    transferMoney = Math.floor((cursorPos.x - 289) / 200 * money);
    context.fillStyle = "black";
    context.font = "33px sans-serif";  
    context.fillText(transferMoney, 398, 308);
    context.fillStyle = "gold";
    context.fillText(transferMoney, 396, 306);
  }
  
  function kp_passbank(e) {
    var kc = e.keyCode;
    var entered = false;
    if (passbankDialogLevel == 0) {
      switch (kc) {
      case 38: // up
        cursorPos.y -= 45;
        if (cursorPos.y < 159) {
          cursorPos.y = 159;
        }
        break;
      case 40: // down
        cursorPos.y += 45;
        if (cursorPos.y > 249) {
          cursorPos.y = 249;
        }
        break;
      case 32: // space
      case 13: // enter
        entered = true;
      }
      level0Selection = cko_passbankLevel0();
      if (entered) {
        if (level0Selection < 2) {
          passbankPlayAniParam = level0Selection;
          passbankPlayAni = drawDepositWithdrawDialog;
          passbankDialogLevel = 1;
          cursorPos.x = 289;
          cursorPos.y = 349;
        } else {
          console.log("quit");
          cursorPos.x = CursorPositions[0].x;
          cursorPos.y = CursorPositions[0].y;
          passbankPlayAni = null;
          level0Selection = 0;
          passbankDialogLevel = 0;
          passedBank = true;
          Game.status = 0;
          return;
        }        
      }
    } else {
      switch (kc) {
      case 37: // left
        --cursorPos.x;
        if (cursorPos.x < 289) {
          cursorPos.x = 289;
        }
        break;
      case 39: // right
        ++cursorPos.x;
        if (cursorPos.x > 489) {
          cursorPos.x = 489;
        }
        break;
      case 32: // space
      case 13: // enter
        cko_passbankLevel1();
        break;
      }
    }
  }
  
  function cko_passbankLevel0() {
    return Math.floor((cursorPos.y - 159) / 45);
  }
  
  function cko_passbankLevel1() {
    if (level0Selection == 0) {
      currentPlayer.cash -= transferMoney;
      currentPlayer.deposit += transferMoney;
    } else {
      currentPlayer.cash += transferMoney;
      currentPlayer.deposit -= transferMoney;
    }
    cursorPos.x = CursorPositions[0].x;
    cursorPos.y = CursorPositions[0].y;
    passbankPlayAni = null;
    level0Selection = 0;
    passedBank = true;
    passbankDialogLevel = 0;
    Game.status = 0;
  }
  
  var AnimateCallbacks = [ani_default, ani_court, ani_stock, ani_chance, ani_news, ani_tax, 
        ani_casino, ani_park, ani_commuchest, ani_carnival, ani_hospital, ani_jail, ani_bank, 
        ani_market, ani_road, ani_passby, ani_passbank];

  var Chances = [
    // 0: 内线交易获利30%
    function() {
      currentPlayer.cash = Math.floor(currentPlayer.cash * 1.3);
    },
    // 1: 举报走私得奖金二千元
    function() {
      currentPlayer.cash += 2000;
    },
    // 2: 现金被强盗抢走一半
    function() {
      currentPlayer.cash = Math.floor(currentPlayer.cash * 0.5);
    },
    // 3: 发票中奖得600元
    function() {
      currentPlayer.cash += 600;
    },
    // 4: 打工赚得一千元
    function() {
      currentPlayer.cash += 1000;
    },
    // 5: 路边拣到500元
    function() {
      currentPlayer.cash += 500;
    },
    // 6: 摆地摊赚得二千元
    function() {
      currentPlayer.cash += 2000;
    },
    // 7: 放高利贷获利40％
    function() {
      currentPlayer.cash = Math.floor(currentPlayer.cash * 1.4);
    },
    // 8: 现金被歹徒骗了20%
    function() {
      currentPlayer.cash = Math.floor(currentPlayer.cash * 0.8);
    },
    // 9: 现金投资获利20％
    function() {
      currentPlayer.cash = Math.floor(currentPlayer.cash * 1.2);
    },
    // 10: 交通违规罚三千元
    function() {
      currentPlayer.cash -= 3000;
      checkPlayerCashFlow(currentPlayer);
    },
    // 11: 制造噪音罚款600元
    function() {
      currentPlayer.cash -= 600;
      checkPlayerCashFlow(currentPlayer);
    },
    // 12: 打破玻璃赔一千元
    function() {
      currentPlayer.cash -= 1000;
      checkPlayerCashFlow(currentPlayer);
    },
    // 13: 向所有人收一千元红包
    function() {
      var money = 0;
      for (var key in playerList) {
        var name = playerList[key];
        if (Players[name].alive) {
          Players[name].cash -= 1000;
          money += 1000;
          checkPlayerCashFlow(Players[name]);
        }
      }
      currentPlayer.cash += money;
    },
    // 14: 漏税罚款二千元
    function() {
      currentPlayer.cash -= 2000;
      checkPlayerCashFlow(currentPlayer);
    },
    // 15: 赞助爱心捐款500元
    function() {
      currentPlayer.cash -= 500;
      checkPlayerCashFlow(currentPlayer);
    },
    // 16: 送每人一千元吃红
    function() {
      var money = 0;
      for (var key in playerList) {
        var name = playerList[name];
        if (Players[name].alive) {
          Players[name].cash += 1000;
          money += 1000;
        }
      }
      currentPlayer.cash -= money;
      checkPlayerCashFlow(currentPlayer);
    },
    // 17: 遗失500元
    function() {
      currentPlayer.cash -= 500;
      checkPlayerCashFlow(currentPlayer);
    },
    // 18: 妨碍风化坐牢七天
    function() {
      
    },
    // 跌入水沟住院三天
    function() {
      
    },
    // 
    function() {
      
    },
    //
    function() {
      
    },
    //
    function() {
      
    }
  ];

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
  var deltaX, deltaY, targetX, targetY, tgtBlock = null, tgtBid = null;
  var Players = {
    atuzai: {
      alive: true,
      id: 0, // unique id
      name: "阿 土 仔",
      robot: false,
      cash: 25000,
      deposit: 25000,
      status: 0,
      deity: 0,
      position: {x:0,y:0},
      gamePos: {bid:0, d:0}, // 0: up, 1: left, 2: right, 3: down
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      blocks: [],
    },
    dalaoqian: {
      alive: true,
      id: 1, // unique id
      name: "大 老 千",
      robot: true,
      cash: 30000,
      deposit: 30000,
      status: 0,
      deity: 0,
      position: {x:0,y:0},
      gamePos: {bid:0, d:0},
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      blocks: [],
    },
    sunxiaomei: {
      alive: true,
      id: 2, // unique id
      name: "孫 小 美",
      robot: true,
      cash: 25000,
      deposit: 25000,
      status: 0,
      deity: 0,
      position: {x:0,y:0},
      gamePos: {bid:0, d:0},
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      blocks: [],
    },
    qianfuren: {
      alive: true,
      id: 3, // unique id
      name: "錢 夫 人",
      robot: true,
      cash: 27500,
      deposit: 27500,
      status: 0,
      deity: 0,
      position: {x:0,y:0},
      gamePos: {bid:0, d:0},
      building: 0,
      stock: [],
      cards: [], // maximum: 9
      blocks: [],
    },
    path: [],
    isMoving: false, // use this boolean to block keyboard interupts
    dice1: 0,
    dice2: 0,
    dice: function() {
      this.dice1 = dice() + 1;
      this.dice2 = dice() + 1;
      var steps = this.dice1 + this.dice2;
      console.log(steps);
      var bid = currentPlayer.gamePos.bid, dir = currentPlayer.gamePos.d, block, nextlist, rev, set;
      do {
        block = mapInfo[bid];
        nextlist = block.n;
        rev = 3 - dir;
        set = [];
        for (var key in nextlist) {
          if (key == rev) continue;
          set.push(key);
        }
        dir = set[Math.floor(Math.random() * set.length)];
        bid = nextlist[dir];
        this.path.push([bid,dir]);
        steps -= mapInfo[bid].s;
      } while (steps);
      this.isMoving = true;
      console.log(this.path);
    },
 
    move: function() {
      // TODO: if player's status is asleep or hibernant or fronze, then return
      var position = currentPlayer.position;
      var posx = position.x;
      var posy = position.y;
      var gamepos = currentPlayer.gamePos;
      if (tgtBlock == null // haven't moved yet
          || posx == targetX && posy == targetY) { // Or reached one block
        if (posx == targetX) {
          gamepos.bid = tgtBid;
          this.path.shift();
          if (tgtBlock && tgtBlock.t == 12 && tgtBlock.s) {
            if (!passedBank) { // If passing bank
              console.log("passing bank");
              cursorPos.x = CursorPositions[16].x;
              cursorPos.y = CursorPositions[16].y;
              Game.status = 16;
              return;
            } else {
              passedBank = false;
            }
          }
        }
        // Already got the destination
        if (this.path.length == 0) {
          this.isMoving = false;
          var t = tgtBlock.t; // tgtBlock shouldnt be null
          tgtBlock = null;
          tgtBid = null;
          // set cursor position according to what game status is activated
          cursorPos.x = CursorPositions[t].x;
          cursorPos.y = CursorPositions[t].y;
          Game.status = t;
          targetX = null;
          targetY = null;
          deltaX = null;
          deltaY = null; 
          return;
        }
        tgtBid = this.path[0][0];
        var dir = this.path[0][1];
        gamepos.d = dir;
        // check the next block and update dir
        tgtBlock = mapInfo[tgtBid]; // next block
        targetX = tgtBlock.x * GridLength;
        targetY = tgtBlock.y * GridLength;
        deltaX = (targetX - posx) > 0 ? 1 : ((targetX == posx) ? 0 : -1);
        deltaY = (targetY - posy) > 0 ? 1 : ((targetY == posy) ? 0 : -1);
        console.log("tgtBid " + tgtBid + " tgtX " + targetX + " tgtY " + targetY + " dx " + deltaX + " dy " + deltaY + " posx " + posx + " posy " + posy);
      }
      posx += deltaX * SpeedDelta;
      posy += deltaY * SpeedDelta;
      position.x = posx;
      position.y = posy;
    },
  }

  var keyPressedCallbacks = [kp_default,kp_court, kp_stock, null, null, null, kp_casino, 
      null, null, kp_carnival, null, null, kp_bank, kp_market, null, kp_passby, kp_passbank];
      
  var Game = {
    status: 0,
    debug: true,
    Months: [31,28,31,30,31,30,31,31,30,31,30,31],
    PrimeMonths: [31,29,31,30,31,30,31,31,30,31,30,31],
    year: 1993,
    month: 1,
    date: 1,
    AnimateLoop: null,
    load: function() {
      // Initailize level and first player
      var cl = "taiwan"; // Only single player for now
      currentLevel = Levels[cl];
      mapSize = currentLevel.mapSize;
      mapInfo = currentLevel.mapInfo;
      mapImg = currentLevel.mapImg;
      playerList = currentLevel.playerList;
      currentPlayerIndex = 0;
      maxNumOfPlayers = playerList.length;
      currentPlayer = Players[playerList[currentPlayerIndex]];
      currentPlayer.robot = false;
      cityList = currentLevel.cityList;
      // Bind key intrupt
      $(document).keypress(function(e) {
        keyPressedCallbacks[Game.status](e);
      });
      
      // Initialize players' positions/directions in Game and Map coordinations
      for (var i=0; i<playerList.length; ++i) {
        var playerindex = playerList[i];
        Players[playerindex].gamePos = currentLevel.startPos[i];
        var bid = Players[playerindex].gamePos.bid;
        Players[playerindex].position.x = mapInfo[bid].x * GridLength;        
        Players[playerindex].position.y = mapInfo[bid].y * GridLength;
      }
      
      soldLands = new Array();
      bldgLands = new Array();
      for (var i=0; i<mapSize; ++i) {
        soldLands.push(new Array());
        bldgLands.push(new Array());
      }
      
      // Walk through mapInfo to multiply each block lx/ly with GridLength
      // Doing is to reduce the calculation in drawMap()
      for (var key in mapInfo) {
        var block = mapInfo[key];
        if (block.lx && block.ly) {
          block.mx = block.lx * GridLength;
          block.my = block.ly * GridLength;
          /*
          if (Game.debug) {
            block.owner = 0;
            block.bldg = 1;
            soldLands[block.lx].push(block);
            bldgLands[block.lx].push(block);
          }
          */
        }
      }
    },
    
    run: function() {
      this.AnimateLoop = setInterval(animate, AnimationTimeout);
    }
  }
  
  function animate() {
    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    AnimateCallbacks[Game.status]();
  }
  
  Game.load();
  Game.run();

});