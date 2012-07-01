/*
* Copyright (c) 2011 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not
* use this file except in compliance with the License. You may obtain a copy of
* the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations under
* the License.
*/
var serverPath = '//translatasaurus.appspot.com/';

// The functions triggered by the buttons on the Hangout App
function countButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Button clicked.');
  var value = 0;
  var count = gapi.hangout.data.getState()['count'];
  if (count) {
    value = parseInt(count);
  }

  console.log('New count is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'count': '' + (value + 1)});
}

function resetButtonClick() {
  console.log('Resetting count to 0');
  gapi.hangout.data.submitDelta({'count': '0'});
}

    function search() 
    {
 	//var term = document.forms["search_bar"]["searchTerm"].value;
    
        var search_input = $(".search_input").val();
        	var searchLangSelect = document.getElementById('searchLang');
	var searchLang = searchLangSelect.options[searchLangSelect.selectedIndex].value;

        var keyword= encodeURIComponent(search_input);
        // Bing Search API 
        var bing_url='http://api.search.live.net/json.aspx?JsonType=callback&JsonCallback=?&Appid=5B0D22D739247C06BE7F990ECBEC1A144F9B7C39&query='+keyword+'&sources=image'; 

    $.ajax
    ({
        type: "GET",
        url: bing_url,
        dataType:"jsonp",
        success: function(response)
        {
            $("#result").html('');
            if(response.SearchResponse.Image.Results.length)
            {
                $.each(response.SearchResponse.Image.Results, function(i,data)
                {
                    var title=data.Thumbnail.Url;
                    //var dis=data.Description;
                    var url=data.MediaUrl;


                    var final="<div class='webresult'><div class='title'><img src='"+title+"'>";

                    $("#result").append(final); // Result

                });
            }
            else
            {
                $("#result").html("<div id='no'>No Results</div>");
            }
        }
    });
};

/* function search() {
	var term = document.forms["search_bar"]["searchTerm"].value;
	var langSelect = document.getElementById('langselect');
    var selectedLang = langSelect.options[langSelect.selectedIndex].value;

	var searchLangSelect = document.getElementById('searchLang');
	var searchLang = searchLangSelect.options[searchLangSelect.selectedIndex].value;
	OnLoad(term);
    //send(term, searchLang, selectedLang);	
}

function searchComplete(searcher) {
  // Check that we got results
  if (searcher.results && searcher.results.length > 0) {
    // Grab our content div, clear it.
    var contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    // Loop through our results, printing them to the page.
    var results = searcher.results;
    for (var i = 0; i < 2; i++) {
      // For each result write its image
      var result = results[i];
      var imgContainer = document.createElement('div');

      var newImg = document.createElement('img');
      // There is also a result.url property which has the escaped version
      newImg.src = result.tbUrl;

      imgContainer.appendChild(newImg);

      // Put our image in the content
        contentDiv.appendChild(imgContainer);
    }
  }
}



function OnLoad(text) {
  // Our ImageSearch instance.
  var imageSearch = new google.search.ImageSearch();

  // Here we set a callback so that anytime a search is executed, it will call
  // the searchComplete function and pass it our ImageSearch searcher.
  // When a search completes, our ImageSearch object is automatically
  // populated with the results.
  imageSearch.setSearchCompleteCallback(this, searchComplete, [imageSearch]);

  imageSearch.execute(text);
                // Include the required Google branding
        google.search.Search.getBranding('branding');
}
*/

var forbiddenCharacters = /[^a-zA-Z!0-9_\- ]/;
function setText(element, text) {
  element.innerHTML = typeof text === 'string' ?
      text.replace(forbiddenCharacters, '') :
      '';
}

function micLoad() {
    var mic = $('$mic');
    if (mic != null) {
        mic.onfocus = mic.blur;
        mic.setAttribute('lang', selectedLang);
        mic.onwebkitspeechchange = function(event) {
	        document.getElementById('txt').value = mic.value;
	        //xmlhttpPost("/translate2.py", mic.value);
            gapi.hangoutdata.sendMessage(
                JSON.stringify([mic.value, selectedLang]));
        };
    } else {
        console.log("sadface no mic");
    }
}

function onMessageReceived(event) {
  alert("on message received");
  try {
     var data = JSON.parse(event.message);
     var langSelect = document.getElementById('langselect');
     var selectedLang = langSelect.options[langSelect.selectedIndex].value;
     document.getElementById('txt').setAttribute('lang', data[1]);
     document.getElementById('txt').value = data[0];
     getTranslatedText(data[0], data[1], selectedLang);
     alert("hey now");
  } catch (e) {
     console.log(e);
  }
}
/*
// Load the Google Transliterate API
      google.load("elements", "1", {
            packages: "transliteration"
          });

      function onLoadTransliterate() {
        if (selectedLang == "zh") {
        var options = {
            sourceLanguage:
                google.elements.transliteration.LanguageCode.ENGLISH,
            destinationLanguage:
                [google.elements.transliteration.LanguageCode.CHINESE],
            shortcutKey: 'ctrl+g',
            transliterationEnabled: true
        };

        // Create an instance on TransliterationControl with the required
        // options.
        var control =
            new google.elements.transliteration.TransliterationControl(options);

        // Enable transliteration in the textbox with id
        // 'transliterateTextarea'.
        control.makeTransliteratable(['searchTerm']);
       }
      }

google.setOnLoadCallback(onLoadTransliterate);
      
*/
function getMessageClick() {
  console.log('Requesting message from main.py');
  var http = new XMLHttpRequest();
  http.open('GET', serverPath);
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonResponse = JSON.parse(http.responseText);
      console.log(jsonResponse);

      var messageElement = document.getElementById('message');
      setText(messageElement, jsonResponse['message']);
    }
  }
  http.send();
}

function getTranslatedText(text, transfrom, transto) {
  console.log('Requesting translation from translate.py');
  var http = new XMLHttpRequest();
  http.open('POST', (serverPath + "/translate"));
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonResponse = JSON.parse(http.responseText);
      console.log(jsonResponse);

      var messageElement = document.getElementById('message');
      setText(messageElement, jsonResponse['message']);
    }
  }
  var post_data = "from=" + transfrom + "&to=" + transto + "&text=" + text;
  http.send(post_data);
}


function updateStateUi(state) {
  //var countElement = document.getElementById('count');
  var countElement = $("#count");
  if (countElement == null) {
      console.log("sadface count element");
  }
  var stateCount = state['count'];
  if (!stateCount) {
    setText(countElement, 'Probably 0');
  } else {
    setText(countElement, stateCount.toString());
  }
}

function updateParticipantsUi(participants) {
  console.log('Participants count: ' + participants.length);
  var participantsListElement = document.getElementById('participants');
  setText(participantsListElement, participants.length.toString());
}

// A function to be run at app initialization time which registers our callbacks
function init() {
  console.log('Init app.');

  var apiReady = function(eventObj) {
    if (eventObj.isApiReady) {
      console.log('API is ready');

      gapi.hangout.data.onStateChanged.add(function(eventObj) {
        updateStateUi(eventObj.state);
      });

      gapi.hangout.onParticipantsChanged.add(function(eventObj) {
        updateParticipantsUi(eventObj.participants);
      });

      updateStateUi(gapi.hangout.data.getState());
      console.log("state ui..");
      updateParticipantsUi(gapi.hangout.getParticipants());
      console.log("where i would add mic load");
      micLoad();
      console.log("complete!");

      api.hangout.onApiReady.remove(apiReady);
    }
  };

  // This application is pretty simple, but use this special api ready state
  // event if you would like to any more complex app setup.
  gapi.hangout.onApiReady.add(apiReady);
}

gadgets.util.registerOnLoadHandler(init);


