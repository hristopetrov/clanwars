<?php
require_once 'cardtypes.php';

$url = isset($_POST) ? key($_POST) : '';

function file_get_contents_curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);       

    $data = curl_exec($ch);
    curl_close($ch);

    preg_match_all('/<td class="font-weight-bold text-success h4">(.*?)<\/td>/i', $data, $matches); 
    //gold - if no recommendations about the deck, silver - if no cards are thread for the deck
    $silver = 'You should be fine against all cards!';
    $gold = 'Your deck is in good shape!';
    $positionGold = strpos($data, $gold);
    $positionSilver = strpos($data, $silver);
    //if found 4 greats - offensive potential, deffensive potential, counters and synergies
    if((count($matches[1]) === 4) && $positionSilver && $positionGold){
        return 'gold';
    }
    if((count($matches[1]) === 4) && $positionSilver){
        return 'silver';
    }
    if((count($matches[1]) === 4)){
        return 'bronze';
    }
    return false;
}
    $deckFromUrl = explode('-',$url);

    $deck = explode('-',$url);

    $data = file_get_contents_curl("https://www.deckshop.pro/check/?deck=".$url."&arena=12");
    
    if($data === 'gold'){
        echo json_encode(['type'=>'gold','deck'=>$deck]);
    }
    if($data === 'silver'){
        echo json_encode(['type'=>'silver','deck'=>$deck]);
    }
    if($data === 'bronze'){
        echo json_encode(['type'=>'bronze','deck'=>$deck]);
    }
    if($data === false){
        echo json_encode(false);
    }