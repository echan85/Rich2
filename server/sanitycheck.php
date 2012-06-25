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

var_dump($blockList);

function checkOverlay($blockList) {
    $set = array();
    foreach ($blockList as $block) {
        $x = $block["x"];
        $y = $block["y"];
        if (isset($set[$x * 1000 + $y])) {
            echo $block["id"]. ": " . $x . " " . $y . "\n";
            return false;
        }
        $set[$x * 1000 + $y] = true;
    }
    return true;
}

if (!checkOverlay(&$blockList)) {
    echo "Overlay check failed\n";
    exit(1);
}

function checkIdContinuation($blockList) {
    $ids = array();
    foreach ($blockList as $block) {
        $id = $block["id"];
        if (isset($ids[$id])) {
            echo "duplicated id found " . $id . "\n";
            return false;
        }
        $ids[$id] = true;
    }
    echo "count: " . count($ids) . "\n";
    $i = 1;
    while ($i < count($ids)) {
        if (!isset($ids[$i + ""])) {
            echo "missing id " . $i . "\n";
            return false;
        }
        ++$i;
    }
    echo "last id " . $i - 1;
    return true;
}

if (!checkIdContinuation(&$blockList)) {
    echo "ID continuation check failed\n";
}

function checkMask($blockList) {
    foreach ($blockList as $block) {
        $id = $block["id"];
        $nextarray = $block["next"];
        $mask = intval($block["mask"]);
        $in = 0;
        foreach ($nextarray as $key => $value) {
            $in |= intval($key);
        }
        if ($in !== $mask) {
            echo "mismatch mask " . $id . "\n";
            return false;
        }
    }
    return true;
}

if (!checkMask(&$blockList)) {
    echo "mask mismatch\n";
    exit(1);
}

?>