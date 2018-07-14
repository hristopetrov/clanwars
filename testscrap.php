<?php
require_once 'cardtypes.php';

$url = 'Hunter-PEKKA-eWiz-Lava-3M-Giant-MM-Tombstone';
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


function file_get_contents_curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);       

    $wholePage = curl_exec($ch);
    curl_close($ch);

    $problemsArr = getContents($wholePage,'<span class="badge badge-danger text-black font-weight-bold">','</span>');
    $warningsArr = getContents($wholePage,'<span class="badge badge-warning text-black font-weight-bold">','</span');
    if(!empty($problemsArr)){
        $problems = $problemsArr[0];
    }else{
        $problems = 0;
    }
    if(!empty($warningsArr)){
        $warnings = $warningsArr[0];
    }else{
        $warnings = 0;
    }
    $dataArray = getContents($wholePage,'<table class="table table-inverse mb-3">','</table>');
    $data = $dataArray[0];

    $godly = substr_count($data,'>Godly!<');
    $great = substr_count($data,'>Great!<');
    $good = substr_count($data,'>Good<');
    $mediocre = substr_count($data,'>Mediocre<');
    $rip = substr_count($data,'>RIP<');
    $bad = substr_count($data,'>Bad<');
    
    return ['problems'=> $problems,'warnings'=>$warnings ];
}
    $deckFromUrl = explode('-',$url);

    $deck = explode('-',$url);

    $data = file_get_contents_curl("https://www.deckshop.pro/check/?deck=".$url);

    print_r($data);
   