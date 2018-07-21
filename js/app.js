  $(document).on('click','.btn-outline-secondary',function(e){
    e.preventDefault();
    $('#card_picker').show();
    $('#btn_edit').hide();
    $('#next_step').show();
  });
  $(document).on('click','.card_link',function(e){
    e.preventDefault();
    if( $('.active').length < 40 ){
      var selectedCards = {};
      $(this).children().first().toggleClass('active');
          $('.active').parent().each(function () {
              selectedCards[$(this).attr("data-hash")] = $(this).attr("data-elixir");
      });
      var query = Url.stringify(selectedCards);
      $('#next_step').attr('data-possible',query);
    }else{
       if($(this).children().first().hasClass('active')){
           $(this).children().first().removeClass('active');
              $('.active').parent().each(function () {
                  selectedCards[$(this).attr("data-hash")] = $(this).attr("data-elixir");
              });          
          var query = Url.stringify(selectedCards);
              $('#next_step').attr('data-possible',query);
       }
   }

  });

  $(document).on('click','#next_step',function(e){
      e.preventDefault();
      $('#card_picker').hide();
      $('#btn_edit').show();
      $('#next_step').hide();
      $('#range-elixir').show();
      $('html, body').animate({scrollTop:$(document).height()}, 'slow');
      if($('.chosen').find(".jumbotron").length == 0){
      $('.chosen').prepend('<div class="jumbotron bg-dark"><h2 class="text-white">Select card(s) if you want to implicitly include in all deck combinations.</h2></div>');
      $('#thirdstep').css('display','');
      }
      if($('.card_link-const').length > 0){
        $('.constCards').empty();
      }    
     var  button = Url.parseQuery($('#next_step').attr('data-possible'));
      $.each(button, function (index, value) {
          $('.constCards').append('<a href="#" class="card_link-const" data-hash-const="'+index+'" data-elixir-const="'+value+'"><img src="cards-images/'+index+'.png" class="cr-card-const" id="card_MegaKnight"></a> '); 
      })  
    
      button['sumElixirConstantCards'] = 0;
      button['minElixir'] = (Number)($('#slider-snap-value-lower').text());
      button['maxElixir'] = (Number)($('#slider-snap-value-upper').text());
      var query = Url.stringify(button);
       $('#check-combos').attr('data-combos',query);
       $('#start-search').attr('data-combos',query);
  });

  $(document).on('click','.card_link-const',function(e){
      e.preventDefault();    
      $(this).children().first().toggleClass('active1');
      var searchableCards = {};
      searchableCards['sumElixirConstantCards'] = 0;
      $('.card_link-const').each(function(){
          if($(this).children().first().hasClass('active1')){
              searchableCards[$(this).attr('data-hash-const')] = 'constant';
              searchableCards['sumElixirConstantCards'] += (Number)($(this).attr("data-elixir-const"));
          }else{
              searchableCards[$(this).attr('data-hash-const')] = $(this).attr('data-elixir-const');
          }         
      })
      searchableCards['minElixir'] = (Number)($('#slider-snap-value-lower').text());
      searchableCards['maxElixir'] = (Number)($('#slider-snap-value-upper').text());  
       var query = Url.stringify(searchableCards);
        $('#check-combos').attr('data-combos',query);
        $('#start-search').attr('data-combos',query);
  });

  

  $('#start-search').click(function(e){
    e.preventDefault(); 
    $('#stop-search').show();
    $('#fourthstep').hide();
    $('#btn_edit').hide();
    $('#nodecks').remove();
    $('.list-greatest-decks').children().remove();
    var urlstring =  $('#start-search').attr('data-combos');
    var data = Url.parseQuery(urlstring);
    startSearchingDecks(data);
  })
  

  $('#check-combos').click(function(e){
    e.preventDefault();  
     $('#stop-search').hide();
    $('.list-greatest-decks').children().remove();
      $('.progress').css('display','');
     $('#fourthstep').css('display','');
    var urlstring =  $('#start-search').attr('data-combos');
    var data = Url.parseQuery(urlstring);
    data['howmany'] = true;
    checkNumberCombos(data);
  })

function startSearchingDecks(answer){
    var searching = $.ajax({
        type:"POST",
        url:"howmany.php",
        data:answer,
        dataType: 'json',
        success:function(result){     
        processUrl(result);
        },
        error: function (e) {
        }
    });
}
function processUrl(data){
   var urlsArray = data;
   var chunkedArray = chunkArray(urlsArray,10); 
    fetchUrl(chunkedArray,0); 
 }

function fetchUrl(chunkedArray,position){
    if(position < chunkedArray.length){ 
      fetchDeck(chunkedArray[position],chunkedArray,position)
    }
}
var stopSearching = false;

function fetchDeck(urlsArray,wholeArray,position){  
         
    $.ajax({
        type:"POST",
        url:"fetchdata.php",
        data:{urlsArray},
        dataType: 'JSON',
        success:function(data){
            //console.log(data);
            if(stopSearching) {
                stopSearching = false;
                return;
            }
        var totalCombos = wholeArray.length;
       
        renderDeck(data,position);
        fetchUrl(wholeArray,++position) 
        progressBar(position,totalCombos);
        }
    });
        
}


function checkNumberCombos(answer){
    $.ajax({
        type:"POST",
        url:"howmany.php",
        data:answer,
        dataType: 'json',
        success:function(result){
            renderNumberCombos(result);
        },
        error: function (e) {
            $('#ncombos').text('Too many combinations! Please choose less cards or put mandatory of the chosen one.').addClass('alert alert-danger');;
        }
    });
}

function getElixir(url){
    var arr = url.split("-");
    var sumElixir = 0;
    $.each(arr,function(index,value){
        sumElixir += parseInt($('a[data-hash="'+value+'"]').attr('data-elixir'));
    });
    return (sumElixir/8).toFixed(1);
}
function renderNumberCombos(result){
    if((result > 100000)){
        $('#ncombos').html('Too many combinations - '+result+'! Please choose less cards or put mandatory of the chosen one.').removeAttr('class').addClass('alert alert-danger');
       }
       if((result > 50000) && (result <=100000)){
           $('#ncombos').html('This will take a while - '+result+' combinations! It will take about '+Math.round(result*1.5/600)+' minutes!').removeAttr('class').addClass('alert alert-warning');
       }
       if(result <= 50000){
           $('#ncombos').html('There are '+result+' possible combinations! It will take about '+Math.round(result*1.5/600)+' minutes!').removeAttr('class').addClass('alert alert-success');
       }
}

function renderDeck(data,position){
    $.each(data,function(deckNumber,deck){
        if(deck.type){
            console.log(deck.deck)
            var recomendationsKindCnt = 0;
            $.each(deck.recomendations,function(index,value){
                if(value){
                    recomendationsKindCnt++;
                }
            });
            $('.list-greatest-decks').append('<div class="col-md-3 col-sm-6 deck-container"><div data-deck="'+position+deckNumber+'" class="deck '+deck.type+'"></div></div>');
                $('.deck[data-deck="'+position+deckNumber+'"]').append('<div class="info-deck"><div class="elixir">'+getElixir(deck.deck.join('-'))+' <img src="cards-images/elixirdrop.png" height="20" style="margin-top: -4px;"></div><a target="_blank" href="https://www.deckshop.pro/check/?deck='+deck.deck.join('-')+'"><div class="type-deck-'+deck.type+' recomendations-cnt-'+recomendationsKindCnt+'">More Info</div></a></div>'); 
                $.each(deck.deck,function(index,value){
                    if(index === 4){
                        $('.deck[data-deck="'+position+deckNumber+'"]').append('</br>');   
                    }
                    $('.deck[data-deck="'+position+deckNumber+'"]').append('<span><img class="deck-card" src="cards-images/'+value+'.png"></span>');
                });
                
                $.each(deck.recomendations,function(index,value){
                    if (value){
                        $('[data-deck='+position+deckNumber+'] a').append('<span class="pull-right '+index+'">'+value+'</span>');
                    }
                });
        }
    })
    
}

function progressBar(position,totalCombos){
    if (position === totalCombos){
        $('#stop-search').hide();
        $('#fourthstep').show();
        $('#btn_edit').show();
        checkForDecks();
    }
    $('.progress-bar').attr('aria-valuenow',position*100/totalCombos); 
    $('.progress-bar').css('width',position*100/totalCombos+'%');
    $('.progress-bar-title').text(parseInt(position*100/totalCombos)+'% complete');
  }

  $('#stop-search').click(function(e){
    e.preventDefault(); 
    $('#stop-search').hide();
    $('#fourthstep').show();
     $('#btn_edit').show();
    stopSearching = true;
  })
  function checkForDecks(){
    if($('.list-greatest-decks').children().length === 0){
        $('.list-greatest-decks').append('<h2 id="nodecks" class="alert alert-danger">No useful decks were found</h2>');
    }
  }
  var snapSlider = document.getElementById('slider-snap');

  noUiSlider.create(snapSlider, {
	start: [ 3.5, 4.2 ],
    step: 0.1,
	connect: true,
	range: {
		'min': [2.1],
		'max': [6]
	}
});
$('.noUi-handle-lower').append('<span id="slider-snap-value-lower"></span>');
$('.noUi-handle-upper').append('<span id="slider-snap-value-upper"></span>');

var snapValues = [
	document.getElementById('slider-snap-value-lower'),
	document.getElementById('slider-snap-value-upper')
];

snapSlider.noUiSlider.on('update', function( values, handle ) {
	snapValues[handle].innerHTML = values[handle];
});

$('#slider-snap-value-lower').on('DOMSubtreeModified',function(e){
    var minElixir = (Number)($('#slider-snap-value-lower').text());
    var  button = Url.parseQuery($('#check-combos').attr('data-combos'));
    button['minElixir'] = minElixir;
    var query = Url.stringify(button);
        $('#check-combos').attr('data-combos',query);
        $('#start-search').attr('data-combos',query);
  })

  $('#slider-snap-value-upper').on('DOMSubtreeModified',function(e){
    var maxElixir = (Number)($('#slider-snap-value-upper').text());
    var  button = Url.parseQuery($('#check-combos').attr('data-combos'));
    button['maxElixir'] = maxElixir;
    var query = Url.stringify(button);
        $('#check-combos').attr('data-combos',query);
        $('#start-search').attr('data-combos',query);
  })

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);
    }

    return tempArray;
}

$(document).ready(function() {
    $('.js-example-basic-multiple').select2({
        placeholder: "Select hiding criteria",
        width: '30%'
    });
});

$( ".js-example-basic-multiple" ).change(function() {
    var selectedElements = $( ".js-example-basic-multiple" ).select2('data');
    $('.deck-container').show();
   $.each(selectedElements,function(index,value){
       var sel = value.text;
       $('.'+sel).parents('.deck-container').hide();
    });

});