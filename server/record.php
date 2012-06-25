<?php

$block = array();
$block["owner"] = null;
$block["booked"] = null;
$block["building"] = 0;
$block["callback"] = null;

$x = $_GET["x"];
$y = $_GET["y"];
$block["x"] = $x;
$block["y"] = $y;

$step = $_GET["step"];
$block["step"] = $step;

$blockid = $_GET["blockid"];
$block["id"] = $blockid;

$mask = 0;
$next = array();
$up = $_GET["up"];
if (isset($up) && $up != "") {
    $next[1] = $up;
    $mask |= 1;
}
$down = $_GET["down"];
if (isset($down) && $down != "") {
    $next[2] = $down;
    $mask |= 2;
}
$left = $_GET["left"];
if (isset($left) && $left != "") {
    $next[4] = $left;
    $mask |= 4;
}
$right = $_GET["right"];
if (isset($right) && $right != "") {
    $next[8] = $right;
    $mask |= 8;
}
$block["next"] = $next;
$block["mask"] = $mask;

$type = $_GET["type"];
if (type == 15) {
    $city = $_GET["city"];
    
}
$block["type"] = $type;

file_put_contents("mapinfo.txt", json_encode($block) . "\n", FILE_APPEND | LOCK_EX);

?>