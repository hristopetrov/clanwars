 /**
  * Selecting the cards and putting into data-possible attribute in the Next step button.
  * Maximum number of cards selected 40
  */
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
        var selectedCards = {};
           $(this).children().first().removeClass('active');
              $('.active').parent().each(function () {
                  selectedCards[$(this).attr("data-hash")] = $(this).attr("data-elixir");
              });          
          var query = Url.stringify(selectedCards);
              $('#next_step').attr('data-possible',query);
       }
   }

  });
/**
 * Show all selected cards and attach them into the Check combinations and search buttons
 */
  $(document).on('click','#next_step',function(e){
      if($('.active').length <= 9){
        $('#minCards').remove();
        $('#secondstep').append('<h2 id="minCards" class="alert alert-danger"> Select at least 10 cards</h2>');
        e.preventDefault();
        return;
      }
      $('#minCards').remove();
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
      if($('.card-link-mandatory').length > 0){
        $('.constCards').empty();
      }    
     var  button = Url.parseQuery($('#next_step').attr('data-possible'));
      $.each(button, function (index, value) {
          $('.constCards').append('<a href="#" class="card-link-mandatory" data-hash-const="'+index+'" data-elixir-const="'+value+'"><img src="cards-images/'+index+'.png" class="cr-card-const"></a> '); 
      })  
    
      button['sumElixirMandatoryCards'] = 0;
      button['minElixir'] = (Number)($('#slider-snap-value-lower').text());
      button['maxElixir'] = (Number)($('#slider-snap-value-upper').text());
      var query = Url.stringify(button);
       $('#check-combos').attr('data-combos',query);
       $('#start-search').attr('data-combos',query);
  });
/**
 * Selecting the mandatory cards and calculate the min,max Elixir 
 * and the sum of Elixir of the mandatory cards and
 * update the check and search buttons
 */
  $(document).on('click','.card-link-mandatory',function(e){
      e.preventDefault();    
      $(this).children().first().toggleClass('active1');
      var searchableCards = {};
      searchableCards['sumElixirMandatoryCards'] = 0;
      $('.card-link-mandatory').each(function(){
          if($(this).children().first().hasClass('active1')){
              searchableCards[$(this).attr('data-hash-const')] = 'mandatory';
              searchableCards['sumElixirMandatoryCards'] += (Number)($(this).attr("data-elixir-const"));
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

  /**
   * When click the check button send the data from the
   * data-combos attribute with appended howmany property
   */
  $('#check-combos').click(function(e){
    e.preventDefault();  
     $('#stop-search').hide();
    $('.list-greatest-decks').children().remove();
      $('.progress').css('display','');
     $('#fourthstep').css('display','');
    var urlstring =  $('#check-combos').attr('data-combos');
    var data = Url.parseQuery(urlstring);
    data['howmany'] = true;
    checkNumberCombos(data);
  })
  
/**
 * When clicked - the search button sends the data from the
 * data-combos attribute and resets the progress bar
 */
  $('#start-search').click(function(e){
    e.preventDefault(); 
    $('#stop-search').show();
    $('#fourthstep').hide();
    $('#btn_edit').hide();
    $('#nodecks').remove();
    $('#hideDecks').show();
    $('.list-greatest-decks').children().remove();
    var urlstring =  $('#start-search').attr('data-combos');
    var data = Url.parseQuery(urlstring);
    $('.progress-bar').attr('aria-valuenow',0); 
    $('.progress-bar').css('width','0%');
    $('.progress-bar-title').text('Start searching..');
    startSearchingDecks(data);
  })
/**
 * Receives all possible combinations 
 * @param {Object} answer Selected cards 
 */
function startSearchingDecks(answer){
    $.ajax({
        type:"POST",
        url:"howmany.php",
        data:answer,
        dataType: 'json',
        success:function(result){   
        processUrls(result);
        },
        error: function (e) {
        }
    });
}
/**
 * Chunk the data and start the search
 * @param {Array} data with all possible combinations
 */
function processUrls(data){
   var chunkedArray = chunkArray(data,20); 
    fetchUrls(chunkedArray,0); //start the search 
 }
/**
 * Check if position reach the array size and
 * fetch the Decks
 * @param {Array} chunkedArray 
 * @param {number} position 
 */
function fetchUrls(chunkedArray,position){
    if(position < chunkedArray.length){ //until the end of the array
      fetchDecks(chunkedArray[position],chunkedArray,position)// ajax call
    }
}
var stopSearching = false;
/**
 * Fetching the 20 decks at once and printing them,
 * updating the progress bar, fetching again incrementing
 * the position
 * @param {Array} deckParams 
 * @param {Array} wholeArray 
 * @param {number} position 
 */
function fetchDecks(deckParams,wholeArray,position){  
       
    $.ajax({
        type:"POST",
        url:"fetchdata.php",
        data:{deckParams},
        dataType: 'JSON',
        success:function(data){
            if(stopSearching) {
                stopSearching = false;
                return;
            }
        var totalCombos = wholeArray.length;
       
        renderDeck(data);
        fetchUrls(wholeArray,++position) 
        progressBar(position,totalCombos);
        },
        error:function(e){
           fetchUrls(wholeArray,++position);
           
        }
    });
        
}

/**
 * Receives the number of combinations. 
 * @param {Object} answer 
 */
function checkNumberCombos(answer){
    $.ajax({
        type:"POST",
        url:"howmany.php",
        data:answer,
        beforeSend:function(){
            $('#check-combos').append('<i class="fa fa-spinner fa-spin"></i>');
        },
        dataType: 'json',
        success:function(result){
            $('.fa-spinner').remove();
            renderNumberCombos(result);
        },
        error: function (e) {
            $('.fa-spinner').remove();
            $('#ncombos').text('Too many combinations! Please choose less cards or put mandatory of the chosen one.').addClass('alert alert-danger');;
        }
    });
}
/**
 * Calculate the average elixir of the deck
 * @param {Array} deck The names of the 8 cards.
 */
function getElixir(deck){    
    var sumElixir = 0;
    //Get the elixir for each card from the a-tags of the card picker and sum it.
    $.each(deck,function(index,value){
        sumElixir += parseInt($('a[data-hash="'+value+'"]').attr('data-elixir'));
    });
    return (sumElixir/8).toFixed(1);
}
/**
 * Printing the count of all combinations with the time it will took to search all of them. 
 * @param {number} result The count of all possible combinations
 */
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


/**
 * Contains collection of decks
 * @param {Object} data Info with the type, cards and recommendations
 */
function renderDeck(data){
    $.each(data,function(deckNumber,deck){
        //If the dek is gold, silver or bronze - print it
        if(deck.type){
            //Random hash for each deck
            var randomId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            $('.list-greatest-decks').append('<div class="col-md-3 col-sm-6 deck-container">\
                                                <div data-deck="'+randomId+'" class="deck '+deck.type+'">\
                                                </div>\
                                              </div>');
            //Print the average elixir, the more info link with the type of the deck color
            $('.deck[data-deck="'+randomId+'"]').append('<div class="info-deck">\
                                                            <div class="elixir">'+getElixir(deck.deck)+'\
                                                                <img src="cards-images/elixirdrop.png" height="20" style="margin-top: -4px;">\
                                                            </div>\
                                                            <a target="_blank" \
                                                            href="https://www.deckshop.pro/check/?deck='+deck.deck.join('-')+'">\
                                                                <div class="type-deck-'+deck.type+'">More Info\
                                                            </div>\
                                                            </a>\
                                                        </div>');
            $('.deck[data-deck="'+randomId+'"]').append('<div class="rating">\
                                                            <div class="deffense">Defensive potential\
                                                            <span class="'+deck.deffense+' pull-right">'+deck.deffense+'</span>\
                                                            </div>\
                                                            <div class="offense">Offensive potential\
                                                            <span class="'+deck.offense+' pull-right">'+deck.offense+'</span>\
                                                            </div>\
                                                            <div class="versatility">Versatility\
                                                            <span class="'+deck.versatility+' pull-right">'+deck.versatility+'</span>\
                                                            </div>\
                                                            <div class="synergy">Synergy\
                                                            <span class="'+deck.synergy+' pull-right">'+deck.synergy+'</span>\
                                                            </div>\
                                                        </div>');
            //Print the 8 cards i 2 rows
            $.each(deck.deck,function(index,value){
                if(index === 4){
                    $('.deck[data-deck="'+randomId+'"]').append('</br>');   
                }
                $('.deck[data-deck="'+randomId+'"]').append('<span><img class="deck-card" src="cards-images/'+value+'.png"></span>');
            });
            //Print the deck recommendations  - problems and warnings and their count.
            $.each(deck.recommendations,function(index,value){
                //If there are warnings or problems, the colors are yellow and red. If none - green.
                if (value){
                    $('[data-deck='+randomId+'] a').append('<span title="" data-original-title="'+index+'" data-toggle="tooltip"  class="white-tooltip pull-right '+index+'">'+value+'</span>');
                }else{
                    $('[data-deck='+randomId+'] a').append('<span title="" data-original-title="'+index+'" data-toggle="tooltip"  class="white-tooltip pull-right no-'+index+'">'+value+'</span>');                        
                }
            });
        }
    })
    
}
/**
 * Function to update the progress bar
 * @param {number} position 
 * @param {number} totalCombos 
 */
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
  /**
   * Check for decks and if none put a message.
   */
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
/**
 * Append minimum average Elixir of the deck to the 
 * check and search buttons
 */
$('#slider-snap-value-lower').on('DOMSubtreeModified',function(e){
    var minElixir = (Number)($('#slider-snap-value-lower').text());
    var  button = Url.parseQuery($('#check-combos').attr('data-combos'));
    button['minElixir'] = minElixir;
    var query = Url.stringify(button);
        $('#check-combos').attr('data-combos',query);
        $('#start-search').attr('data-combos',query);
  })
/**
 * Append maximum average Elixir of the deck to the 
 * check and search buttons
 */
  $('#slider-snap-value-upper').on('DOMSubtreeModified',function(e){
    var maxElixir = (Number)($('#slider-snap-value-upper').text());
    var  button = Url.parseQuery($('#check-combos').attr('data-combos'));
    button['maxElixir'] = maxElixir;
    var query = Url.stringify(button);
        $('#check-combos').attr('data-combos',query);
        $('#start-search').attr('data-combos',query);
  })
/**
 * Divide array in to chunks
 * @param {Array} myArray 
 * @param {number} chunk_size 
 */
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
/**
 * Display the input to hide decks 
 */
$(document).ready(function() {
    $('.js-example-basic-multiple').select2({
        placeholder: "Select hiding criteria",
        width: '30%'
    });
});
/**
 * Hide the  selected decks
 */
$( ".js-example-basic-multiple" ).change(function() {
    var selectedElements = $( ".js-example-basic-multiple" ).select2('data');
    $('.deck-container').show();
   $.each(selectedElements,function(index,value){
       var sel = value.text;
       $('.'+sel).parents('.deck-container').hide();
    });

});

$(document).ajaxComplete(function(){
    $('[data-toggle="tooltip"]').tooltip({placement:"top"})
});

