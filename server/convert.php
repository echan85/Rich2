<?php

$filename = "mapinfo.txt";
$fp = fopen($filename, "r") or die("Couldn't open $filename");

$blockList = array();

while (!feof($fp)) {
   $line = fgets($fp, 1024);
   if ($line == "") continue;
   $array = json_decode($line, true);
   array_push($blockList, $array);
}

$retJsonArray = array();

foreach ($blockList as $block) {
    $bid = intval($block["id"]);
    $jsonObj = array();
    $jsonObj["x"] = intval($block["x"]);
    $jsonObj["y"] = intval($block["y"]);
    $jsonObj["step"] = intval($block["step"]);
    $jsonObj["mask"] = intval($block["mask"]);
    $jsonObj["type"] = intval($block["type"]);
    $next = $block["next"];
    $na = array();
    if (isset($next[1])) {
        $na[1] = intval($next[1]);
    }
    if (isset($next[2])) {
        $na[2] = intval($next[2]);
    }
    if (isset($next[4])) {
        $na[4] = intval($next[4]);
    }
    if (isset($next[8])) {
        $na[8] = intval($next[8]);
    }
    $jsonObj["next"] = $na;
    $retJsonArray[$bid] = $jsonObj;
}

var_dump($retJsonArray);

$handle = fopen("mapinfo.json", "w");
fwrite($handle, json_encode($retJsonArray));
fclose($handle);

?>