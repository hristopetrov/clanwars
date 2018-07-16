<?php

$url = 'Zap-Hunter-PEKKA-Hog-Guards-eWiz-SpearGobs-Lava';
// function getContents($str, $startDelimiter, $endDelimiter) {
//     $contents = array();
//     $startDelimiterLength = strlen($startDelimiter);
//     $endDelimiterLength = strlen($endDelimiter);
//     $startFrom = $contentStart = $contentEnd = 0;
//     while (false !== ($contentStart = strpos($str, $startDelimiter, $startFrom))) {
//       $contentStart += $startDelimiterLength;
//       $contentEnd = strpos($str, $endDelimiter, $contentStart);
//       if (false === $contentEnd) {
//         break;
//       }
//       $contents[] = substr($str, $contentStart, $contentEnd - $contentStart);
//       $startFrom = $contentEnd + $endDelimiterLength;
//     }
  
//     return $contents;
//   }


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

    //$problemsArr = getContents($wholePage,'<span class="badge badge-danger text-black font-weight-bold">','</span>');
    //$warningsArr = getContents($wholePage,'<span class="badge badge-warning text-black font-weight-bold">','</span');
    !empty($problemsArr) ? $problems = $problemsArr[1] : $problems = 0;
    !empty($warningsArr) ? $warnings = $warningsArr[1] : $warnings = 0;

    // if(!empty($problemsArr)){
    //     $problems = $problemsArr[1];
    // }else{
    //     $problems = 0;
    // }
    // if(!empty($warningsArr)){
    //     $warnings = $warningsArr[1];
    // }else{
    //     $warnings = 0;
    // }
    preg_match("'<table class=\"table table-inverse mb-3\">(.*?)</table>'si", $wholePage, $dataArray);
    //$dataArray = getContents($wholePage,'<table class="table table-inverse mb-3">','</table>');
    $data = $dataArray[1];

    $godly = substr_count($data,'>Godly!<');
    $great = substr_count($data,'>Great!<');
    $good = substr_count($data,'>Good<');
    $mediocre = substr_count($data,'>Mediocre<');
    $rip = substr_count($data,'>RIP<');
    $bad = substr_count($data,'>Bad<');
    
     
    return ['problems'=> $problems,
            'warnings'=>$warnings,
            'godly' => $godly,
            'great' => $great,
            'good' => $good,
            'mediocre' =>$mediocre,
            'rip' =>$rip,
            'bad' => $bad
     ];
}
    $deckFromUrl = explode('-',$url);

    $deck = explode('-',$url);

    $data = file_get_contents_curl("https://www.deckshop.pro/check/?deck=".$url);

    print_r($data);
   