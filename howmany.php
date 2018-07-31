<?php
 
require_once 'Math/Combinatorics.php';
require_once 'cardtypes.php';


$combinatorics = new Math_Combinatorics;

$allCards = isset($_POST) ? $_POST : '';

$sumElixirMandatoryCards = isset($_POST['sumElixirMandatoryCards']) ? $_POST['sumElixirMandatoryCards'] : 0;
$minElixir = isset($_POST['minElixir']) ? $_POST['minElixir'] : 0;
$maxElixir = isset($_POST['maxElixir']) ? $_POST['maxElixir'] : 7;
unset($allCards['minElixir']);
unset($allCards['maxElixir']);
unset($allCards['sumElixirMandatoryCards']);
unset($allCards['howmany']);

$mandatoryCards = array_filter($allCards, function($a){
    return $a === 'mandatory';
});

$allSearchableCards = array_filter($allCards, function($a){
    return $a !== 'mandatory';
});

$constDeckCards ='';
foreach($mandatoryCards as $key => $value){
    $constDeckCards .= $key.'-';
}

$numberOfRestOfSearchableInput = 8 - count($mandatoryCards);

$input = array_keys($allSearchableCards);

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
/**
 * filter decks that have maximum 4 common,epic,rare cards
 * and maximum 3 legenday in a combination
 */
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
/**
 * Filter combinations for the range of average
 * elixir and the count of card types
 */
foreach ($output as $key => $value) {
	if ((getElixir($value,$allCards,intval($sumElixirMandatoryCards)) >=$minElixir) && (getElixir($value,$allCards, intval($sumElixirMandatoryCards)) <= $maxElixir) && filterReasonableDecks($value,$allCardsType,$constDeckCards)){
        $implodedRestOfDeck = implode('-',$value);
        $elixir = getElixir($value,$allCards,$sumElixirMandatoryCards);
        $linksCombos[] = $constDeckCards.$implodedRestOfDeck;
    }    
} 

if(isset($_POST['howmany'])){
    echo json_encode(count($linksCombos));
}else{
    echo json_encode($linksCombos);
}


?>









