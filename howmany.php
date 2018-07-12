<?php
 
require_once 'Math/Combinatorics.php';
require_once 'cardtypes.php';


$combinatorics = new Math_Combinatorics;

$allCards = isset($_POST) ? $_POST : '';

$sumElixirConstantCards = isset($_POST['sumElixirConstantCards']) ? $_POST['sumElixirConstantCards'] : '';
$minElixir = isset($_POST['minElixir']) ? $_POST['minElixir'] : 0;
$maxElixir = isset($_POST['maxElixir']) ? $_POST['maxElixir'] : 7;
unset($allCards['maxElixir']);
unset($allCards['maxElixir']);
unset($allCards['sumElixirConstantCards']);
unset($allCards['howmany']);

$constantCards = array_filter($allCards, function($a){
    return $a === 'constant';
});

$allSearchableCards = array_filter($allCards, function($a){
    return $a !== 'constant';
});

//print_r($allSearchableCards);
$constDeckCards ='';
foreach($constantCards as $key => $value){
    $constDeckCards .= $key.'-';
}

$numberOfRestOfSearchableInput = 8 - count($constantCards);

$input = array_keys($allSearchableCards);
//print_r($input);
$usedCardsType = array_intersect_key($allCardsType, $allSearchableCards);

$output = $combinatorics->combinations($input, $numberOfRestOfSearchableInput); 

function getElixir($deck,$allCards,$sum){
    foreach ($deck as $k => $card) {
    $sum += $allCards[$card];
    }
    return round($sum/8,1);
}


if($constDeckCards != ''){
    $const = str_replace('-',' ',$constDeckCards);
}else{
    $const = '';
}

function filterReasonableDecks($restOfDeck, $usedCardsType, $constDeckCards){
    $implodedRestOfDeck = implode('-',$restOfDeck);
    $wholeDeck = explode('-',$constDeckCards.$implodedRestOfDeck);
    
    $filtered = array_filter(
        $usedCardsType,
        function ($key) use ($wholeDeck) {
            return in_array($key, $wholeDeck);
        },
        ARRAY_FILTER_USE_KEY
    );
   // print_r($filtered);
    $common = count(array_filter($filtered,function($a) {return $a=='common';}));
    $epic = count(array_filter($filtered,function($a) {return $a=='epic';}));
    $rare = count(array_filter($filtered,function($a) {return $a=='rare';}));
    $legendary = count(array_filter($filtered,function($a) {return $a=='legendary';}));
    if(($common <=4) && ($epic <=4) && ($rare <= 4) && ($legendary <=3)){
        return true;
    }else{
        return false;
    }
}

$linksCombos = [];

$count = 0;
foreach ($output as $key => $value) {
	if ((getElixir($value,$allCards,intval($sumElixirConstantCards)) >=$minElixir) && (getElixir($value,$allCards, intval($sumElixirConstantCards)) <= $maxElixir) && filterReasonableDecks($value,$allCardsType,$constDeckCards)){
        $implodedRestOfDeck = implode('-',$value);
        $elixir = getElixir($value,$allCards,$sumElixirConstantCards);
        $count++;
        $linksCombos[] = $constDeckCards.$implodedRestOfDeck;
    }    
} 

if(isset($_POST['howmany'])){
    echo json_encode(count($linksCombos));
}else{
    echo json_encode($linksCombos);
}


?>









