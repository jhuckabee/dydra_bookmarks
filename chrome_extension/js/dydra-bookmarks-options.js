Dydra.bookmarks.options = {};

Dydra.bookmarks.options.onload = function() {
  var that = this;
  chrome.extension.sendRequest({action: Dydra.actions.GET_AUTH}, function(response) {
    if (response.signedIn === true) {
      that.initializeForm();
    }
    else {
      $('#signedOut').show();
      $('a.login').click(function(e) {
        e.preventDefault();
        chrome.tabs.create({url: Dydra.HOST + 'login'});
      });
      $('a.reload').click(function(e) {
        e.preventDefault();
        window.location.reload();
      });
    }
  });
};

Dydra.bookmarks.options.initializeForm = function() {
  $('#save').click(Dydra.bookmarks.options.save);
  repos = Dydra.repositories({
    account: localStorage['account'],
    success: function(data) {
      $.each(data, function(i, repo) {
        $('#repository').append(['<option value="', repo.name, 
          (Dydra.bookmarks.getOption('repository') === repo.name ? '" selected="selected"' : '"'), '>', 
          repo.name, '</option>'].join(''));
      });
      $('#signedIn').show();
    }
  });
  $('#base_uri').val(Dydra.bookmarks.getOption('base_uri'));
  $('#context').val(Dydra.bookmarks.getOption('context'));
};

/* 
 * Options form submit handler
 */
Dydra.bookmarks.options.save = function(event) {
  event.preventDefault();
  Dydra.bookmarks.setOption('repository', $('#repository').val());
  Dydra.bookmarks.setOption('base_uri', $('#base_uri').val());
  Dydra.bookmarks.setOption('context', $('#context').val());
  $('#messages').html("Your settings have been saved").show();
  setTimeout(function() {
    $('#messages').hide();
  }, 5000);
};
