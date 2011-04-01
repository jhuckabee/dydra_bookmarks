Dydra.bookmarks.background = function() {
  this.signedIn = false;
  this.accountName = '';
  this.baseURI = '';
  this.repository = '';

  this.initializeState();
  this.initializeCommunications();
};

Dydra.bookmarks.background.prototype.initializeState = function() {
  var that = this;
  this.checkAuth();
};

Dydra.bookmarks.background.prototype.loadOptions = function() {
  this.accountName = localStorage['account'];
  this.baseURI = Dydra.bookmarks.getOption('base_uri');
  this.repository = Dydra.bookmarks.getOption('repository');
};

Dydra.bookmarks.background.prototype.initializeCommunications = function() {
  var that = this;

  // Listen for any changes to the URL of any tab.
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    that.checkURL(tabId, changeInfo, tab)
  });

  // Listen for messages and dispatch accordingly
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
      case Dydra.actions.GET_AUTH:
        var respond = function() {
          sendResponse({signedIn: that.signedIn, token: localStorage['token']});
        };
        that.checkAuth({
          success: respond,
          error: respond
        });
        break; 
    }
  });
};

/*
 * Checks to see if the user is logged in.
 * Displays the bookmark form if so, otherwise
 * displays a message prompting to login
 */
Dydra.bookmarks.background.prototype.checkAuth = function(options) {
  var options = options || {},
      that = this;

  Dydra.my_account({
    success: function(name, token) {
      if(name.length > 0) {
        localStorage['account'] = name;
        localStorage['token'] = token;
        that.signedIn = true;
        that.loadOptions();
        if(typeof(options.success) === 'function') {
          options.success();
        }
      }
      else {
        localStorage['account'] = '';
        localStorage['token'] = '';
        that.signedIn = false;
        that.loadOptions();
        if(typeof(options.error) === 'function') {
          options.error();
        }
      }
    },
    error: function(e) {
      localStorage['account'] = '';
      localStorage['token'] = '';
      that.signedIn = false;
      that.loadOptions();
      if(typeof(options.error) === 'function') {
        options.error();
      }
    }
  });
};

Dydra.bookmarks.background.prototype.checkURL = function(tabId, changeInfo, tab) {
  var that = this;
  if(changeInfo.status === 'loading' && typeof(changeInfo.url) !== 'undefined') {
    Dydra.bookmarks.get(changeInfo.url, {
      found: function(bookmark) {
        that.currentBookmark = bookmark;
        // TODO: Interpret results and auto-fill form when it is opened again
      },
      notFound: function() {
        that.currentBookmark = null;
      }
    });
  }
};

var background = new Dydra.bookmarks.background();
