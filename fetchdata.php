<?php
require_once 'cardtypes.php';
function getContents($str, $startDelimiter, $endDelimiter) {
    $contents = array();
    $startDelimiterLength = strlen($startDelimiter);
    $endDelimiterLength = strlen($endDelimiter);
    $startFrom = $contentStart = $contentEnd = 0;
    while (false !== ($contentStart = strpos($str, $startDelimiter, $startFrom))) {
      $contentStart += $startDelimiterLength;
      $contentEnd = strpos($str, $endDelimiter, $contentStart);
      if (false === $contentEnd) {
        break;
      }
      $contents[] = substr($str, $contentStart, $contentEnd - $contentStart);
      $startFrom = $contentEnd + $endDelimiterLength;
    }
  
    return $contents;
  }
function getPoints($godly,$great,$good){
    $points =  (3 * $godly) + (2 * $great) + (1 * $good);
    return $points; 
}

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

    $dataArray = getContents($wholePage,'<table class="table table-inverse mb-3">','</table>');
    $data = $dataArray[0];

    $godly = substr_count($data,'>Godly!<');
    $great = substr_count($data,'>Great!<');
    $good = substr_count($data,'>Good<');
    $mediocre = substr_count($data,'>Mediocre<');
    $rip = substr_count($data,'>RIP<');
    $bad = substr_count($data,'>Bad<');
    
    
   if($rip || $bad || $mediocre){
        return false;
    }else{
        $points = getPoints($godly,$great,$good);
        if($points >= 9){
            return 'gold';
        }
        if(($points < 9)&&($points > 6)){
            return 'silver';
        }
        if($points <= 6){
            return 'bronze';
        }
        return false;
    }
}
    $deckFromUrl = explode('-',$url);

    $deck = explode('-',$url);

    $data = file_get_contents_curl("https://www.deckshop.pro/check/?deck=".$url);
    
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