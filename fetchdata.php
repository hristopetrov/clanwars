<?php
require 'vendor/autoload.php';
include('simple_html_dom.php');


use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Psr7\Request;
use Tuna\CloudflareMiddleware;
use GuzzleHttp\Cookie\FileCookieJar;

//$client = new Client();
$client = new Client(['cookies' => new FileCookieJar('cookies.txt')]);

$client->getConfig('handler')->push(CloudflareMiddleware::create());


$deckParams = isset($_POST) ? ($_POST['deckParams']) : '';
$deckFromUrls = [];

function filterinfo($wholePage) {
    /**
     * The count of warnings and problems found in deck tips
     */
    preg_match("'<span class=\"badge badge-danger text-black font-weight-bold\">(.*?)</span>'si", $wholePage, $problemsArr);
    preg_match("'<span class=\"badge badge-warning text-black font-weight-bold\">(.*?)</span>'si", $wholePage, $warningsArr);
    !empty($problemsArr) ? $problems = $problemsArr[1] : $problems = 0;
    !empty($warningsArr) ? $warnings = $warningsArr[1] : $warnings = 0;
    preg_match("'<table class=\"table table-inverse mb-3\">(.*?)</table>'si", $wholePage, $dataArray);
    $data = $dataArray[1];

    // preg_match_all("'text-right\">(.*?)</td>'si",$data,$rating);
    // $deckRating = $rating[1];

    $html = str_get_html($data);
  
    $tdText=[];
    foreach($html->find('td') as $element){
        $tdText[] = $element->plaintext;
    } 
    $deckRating = array();
    foreach ($tdText as $k => $v) {
        if ($k % 2 !== 0) {
            $deckRating[] = $v;
        }
    }

    /**
     * The count of godly, great .. etc. found in the deck rating
     */
    $godly = substr_count($data,'>Godly!<');
    $great = substr_count($data,'>Great!<');
    $good = substr_count($data,'>Good<');
    $mediocre = substr_count($data,'>Mediocre<');
    $rip = substr_count($data,'>RIP<');
    $bad = substr_count($data,'>Bad<');
    
    /**
     * If rip bad or mediocre is found - skip.
     */
    if($rip || $bad || $mediocre){
            return false;
        }else{
            $points = (3 * $godly) + (2 * $great) + (1 * $good) ;
            $deckInfo =  [
                'recommendations'=>[
                    'problems'=>$problems,
                    'warnings'=>$warnings
                ],
                'deffense'=>$deckRating[0],
                'offense'=>$deckRating[1],
                'versatility' => $deckRating[2],
                'synergy' =>$deckRating[3]
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
$requestArr = [];
foreach ($deckParams as $params){
    $decksFromParam[] = explode('-',$params);
    $requestArr[] = $client->getAsync('https://www.deckshop.pro/check/?deck='.$params);
}
$responses = Promise\unwrap($requestArr); 
$returnData = [];
foreach($responses as $key => $response){
     $returnData[$key] = filterinfo($response->getBody());
     $returnData[$key]['deck'] =  $decksFromParam[$key];
}

echo json_encode($returnData);

