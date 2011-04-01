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
      $('#url').val(response.url);
      $('#title').val(response.title);
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
    Dydra.bookmarks.save({
      url: url,
      title: title,
      notes: notes,
      tags: tags,
      success: function() {
        $('#save').removeAttr('disabled');
        $('#cancel').removeAttr('disabled');
        window.close();
      },
      error: function() {
        $('#save').removeAttr('disabled');
        $('#cancel').removeAttr('disabled');
        $('#messages').html("Error encountered during save.").show();
        setTimeout(function() {
          $('#messages').hide();
        }, 5000);
        window.close();
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
}
