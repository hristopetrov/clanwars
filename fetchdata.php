<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Psr7\Request;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\RequestException;
 
$client = new Client();

$urlArray = isset($_POST) ? ($_POST['urlsArray']) : '';

$deckFromUrls = [];

function filterinfo($wholePage) {
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
$requestArr = [];
foreach ($urlArray as $url){
    $decksFromUrl[] = explode('-',$url);
    $requestArr[] = $client->getAsync('https://www.deckshop.pro/check/?deck='.$url);
}
$responses = Promise\unwrap($requestArr); 
$returnData = [];
foreach($responses as $key => $response){

     $returnData[$key] = filterinfo($response->getBody());
     $returnData[$key]['deck'] =  $decksFromUrl[$key];
}
echo json_encode($returnData);

