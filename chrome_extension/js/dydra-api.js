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

Dydra.my_account = function(options) {
  $.ajax({
    url: Dydra.HOST + 'my_account.json', 
    success: function(data) {
      if(typeof(options.success) === 'function') {
        options.success(data.name, data.token);
      }
    },
    error: function(e) {
      if(typeof(options.error) === 'function') {
        options.error(e);
      }
    }
  });
};

Dydra.repositories = function(options) {
  $.ajax({
    url: Dydra.HOST + options.account +'/repositories.json', 
    success: function(data) {
      if(typeof(options.success) === 'function') {
        options.success(data);
      }
    },
    error: function(e) {
      if(typeof(options.error) === 'function') {
        options.error(e);
      }
    }
  });
};

Dydra.uploadData = function(options) {
  $.ajax({
    url: Dydra.HOST + options.account + '/' + options.repository + '/uploadData',
    type: 'POST',
    data: {
      data: options.data,
      dataFormat: options.format,
      baseURI: options.base_uri,
      context: options.context
    },
    success: function(data) {
      if(typeof(options.success) === 'function') {
        options.success(data);
      }
    },
    error: function(e) {
      if(typeof(options.error) === 'function') {
        options.error(e);
      }
    }
  });
};

Dydra.query = function(options) {
  $.ajax({
    url: Dydra.HOST + options.account + '/' + options.repository + '/sparql.json',
    data: {
      query: options.query,
    },
    success: function(data) {
      if(typeof(options.success) === 'function') {
        options.success(data);
      }
    },
    error: function(e) {
      if(typeof(options.error) === 'function') {
        options.error(e);
      }
    }
  });
};
