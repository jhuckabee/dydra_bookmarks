Dydra.bookmarks.popup = {};

/*
 * This function kicks off the popup and options pages.
 */
Dydra.bookmarks.popup.onload = function(callback) {
  // Check auth
  chrome.extension.sendRequest({action: Dydra.actions.GET_AUTH}, function(response) {
    if (response.signedIn === true) {
      Dydra.bookmarks.popup.initializeForm(response.token);
    }
    else {
      $('#signedOut').show();
      $('a.login').click(function(e) {
        e.preventDefault();
        chrome.tabs.create({url: Dydra.HOST + 'login'});
      });
    }
  });
};

/*
 * Initialize the bookmarks form
 */
Dydra.bookmarks.popup.initializeForm = function(token) {
  $('meta[name="csrf-token"]').attr('content', token)
  // Hijack button click events
  $('#save').click(Dydra.bookmarks.popup.save);
  $('#cancel').click(Dydra.bookmarks.popup.cancel);

  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {action: Dydra.actions.GET_TITLE_AND_URL}, function(response) {
      $('#saveBookmark').attr('about', response.url);
      $('#url').val(response.url); 
      $('#title').val(response.title);
      $('#title').attr('content', response.title);
    });
  });


  $('#signedIn').show();
};

/*
 * Handles the cancel button of the save form
 */
Dydra.bookmarks.popup.cancel = function(event) {
  event.preventDefault();
  window.close();
};

/*
 * Handles save callback of bookmarks form
 */
Dydra.bookmarks.popup.save = function(event) {
  $('#save').attr('disabled', 'disabled');
  $('#cancel').attr('disabled', 'disabled');
  event.preventDefault();
  var url = $('#url').val(),
      title = $('#title').val(),
      notes = $('#notes').val(),
      tags = $('#tags').val();

  if (url.length > 0 && title.length > 0) {
    Dydra.bookmarks.popup.formValuesToRDFa();
    Dydra.bookmarks.save({
      url: url,
      title: title,
      notes: notes,
      data: (new XMLSerializer()).serializeToString($('body').rdf().databank.dump({format: 'application/rdf+xml'})),
      dataFormat: 'rdfxml',
      success: function() {
        $('#save').removeAttr('disabled');
        $('#cancel').removeAttr('disabled');
        //window.close();
      },
      error: function() {
        $('#save').removeAttr('disabled');
        $('#cancel').removeAttr('disabled');
        $('#messages').html("Error encountered during save.").show();
        setTimeout(function() {
          $('#messages').hide();
        }, 5000);
        //window.close();
      }
    });
  }
  else {
    $('#save').removeAttr('disabled');
    $('#cancel').removeAttr('disabled');
    $('#messages').html("You must supply a URL and a title for this bookmark.").show();
    setTimeout(function() {
      $('#messages').hide();
    }, 5000);
  }
};

/*
 * Mimic form values in valid RDFa
 */
Dydra.bookmarks.popup.formValuesToRDFa = function() {
  $('#saveBookmark').attr('about', $('#url').val());
  $('#title').attr('content', $('#url').val());
  $('#notes').attr('content', $('#notes').val());
  $('#taggedOn').html(Dydra.bookmarks.popup.taggedOnDate());

  // Tags
  $('#tagContainer').html('');
  $('#tagHolder').html('');
  $('#tags').val().split(' ').forEach(function(tag) {
    if(tag.length > 0) {
      var tagURI = 'http://dydra.com/jhuckabee/bookmarks/#'+tag,
          tagID = 'tag_'+tag,
          tagName,
          tagElement;

      tagElement = [
        '<div typeof="tags:Tag" about="', tagURI, '">',
        '<span property="tags:tagName">', tag, '</span>',
        '</div>'
      ].join('');
      $('#tagContainer').html(tagElement);
      $('#tagHolder').append($('<span>').attr('property', 'tags:taggedWithTag').html(tagURI));
    }
  });
};

Dydra.bookmarks.popup.taggedOnDate = function() {
  var padStr = function(s) {
        s = s+'';
        if(s.length < 2) {
          s = '0' + s;
        }
        return s;
      },
      d = new Date(),
      Y = d.getFullYear(),
      M = padStr(d.getMonth()+1),
      D = padStr(d.getDate()),
      h = padStr(d.getHours()),
      m = padStr(d.getMinutes()),
      s = padStr(d.getSeconds()),       
      O = (d.getTimezoneOffset() / 60),
      Z, sign;

  sign = (O > 0 ? '-' : '+'); 
  Z = padStr(O);
  Z = sign + Z + '00';

  return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s + ' ' + Z;
};
