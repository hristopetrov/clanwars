<?php

$url = isset($_POST) ? key($_POST) : '';

function file_get_contents_curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);       

    $wholePage = curl_exec($ch);
    curl_close($ch);

    preg_match("'<span class=\"badge badge-danger text-black font-weight-bold\">(.*?)</span>'si", $wholePage, $problemsArr);
    preg_match("'<span class=\"badge badge-warning text-black font-weight-bold\">(.*?)</span>'si", $wholePage, $warningsArr);
   
    !empty($problemsArr) ? $problems = $problemsArr[1] : $problems = 0;
    !empty($warningsArr) ? $warnings = $warningsArr[1] : $warnings = 0;

    preg_match("'<table class=\"table table-inverse mb-3\">(.*?)</table>'si", $wholePage, $dataArray);
    $data = $dataArray[1];

    $godly = substr_count($data,'>Godly!<');
    $great = substr_count($data,'>Great!<');
    $good = substr_count($data,'>Good<');
    $mediocre = substr_count($data,'>Mediocre<');
    $rip = substr_count($data,'>RIP<');
    $bad = substr_count($data,'>Bad<');
    
    
   if($rip || $bad || $mediocre){
        return false;
    }else{
        $points = (3 * $godly) + (2 * $great) + (1 * $good) ;
        $deckInfo =  [
            'recomendations'=>[
                'problems'=>$problems,
                'warnings'=>$warnings
                ]
            ];
        if($points >= 10){
            $deckInfo['type'] = 'gold';
            return $deckInfo;
        }
        if(($points > 7)&&($points < 10)){
            $deckInfo['type'] = 'silver';
            return $deckInfo;
        }
        if($points === 7){
            $deckInfo['type'] = 'bronze';
            return $deckInfo;
        }
        return false;
    }
}
    $deckFromUrl = explode('-',$url);

    $deck = explode('-',$url);

    $data = file_get_contents_curl("https://www.deckshop.pro/check/?deck=".$url);

    if($data === false){
        echo json_encode(false);
    }else{
        $data['deck'] = $deck;
        echo json_encode($data);
    }
    
  