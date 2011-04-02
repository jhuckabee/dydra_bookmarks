Dydra.bookmarks = {};

/*
 * Return an option for the currently logged in account
 * from localStorage
 */
Dydra.bookmarks.getOption = function(optionName) {
  return localStorage[localStorage['account'] + '_' + optionName];
};

/*
 * Store an option to localStorage
 */
Dydra.bookmarks.setOption = function(optionName, value) {
  localStorage[localStorage['account'] + '_' + optionName] = value;
};

/*
 * Check to see whether or not a given url has already been bookmarked
 */
Dydra.bookmarks.get = function(url, options) {
  Dydra.query({
    account: localStorage['account'],
    repository: Dydra.bookmarks.getOption('repository'),
    query: 'select * where { <'+url+'> ?p ?o }',
    success: function(results) {
      if (results && results.total && results.total > 0) {
        if (typeof(options.found) === 'function') {
          options.found(results);
        }
      }
      else {
        if (typeof(options.notFound) === 'function') {
          options.notFound();
        }
      }
    },
    error: function(e) {
      if (typeof(options.notFound) === 'function') {
        options.notFound();
      }
    }
  });
};

/*
 * Saves a bookmark to Dydra
 */
Dydra.bookmarks.save = function(options) {
  Dydra.uploadData({
    account: localStorage['account'],
    repository: Dydra.bookmarks.getOption('repository'),
    base_uri: Dydra.bookmarks.getOption('base_uri'),
    context: Dydra.bookmarks.getOption('context'),
    data: options.data,
    format: options.dataFormat,
    success: options.success,
    error: options.error
  });
};

function CSRFProtection(fn) {
  var token = $('meta[name="csrf-token"]').attr('content');
  if (token) fn(function(xhr) { xhr.setRequestHeader('X-CSRF-Token', token) });
}
var factory = $.ajaxSettings.xhr;
$.ajaxSettings.xhr = function() {
  var xhr = factory();
  var open = xhr.open;
  CSRFProtection(function(setHeader) {
    var open = xhr.open;
    xhr.open = function() { open.apply(this, arguments); setHeader(this) };
  })
  return xhr;
};
