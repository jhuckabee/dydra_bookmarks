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
  var data = Dydra.bookmarks.bookmarkToNtriples(options.url, options.title, options.notes, options.tags);
  Dydra.uploadData({
    account: localStorage['account'],
    repository: Dydra.bookmarks.getOption('repository'),
    base_uri: Dydra.bookmarks.getOption('base_uri'),
    context: Dydra.bookmarks.getOption('context'),
    data: data,
    format: 'ntriples',
    success: options.success,
    error: options.error
  });
};

/*
 * Convert bookmark data to valid ntriples for upload into a repository
 * TODO: Find or make a simple library to handle the rdf serialization
 */
Dydra.bookmarks.bookmarkToNtriples = function(url, title, notes, tags) {
  var base = Dydra.bookmarks.getOption('base_uri'),
      uri = '<' + url + '>',
      rssItem = '<http://purl.org/rss/1.0/item>',
      rdfA = '<http://www.w3.org/2000/01/rdf-schema#a>',
      rdfsComment = '<http://www.w3.org/2000/01/rdf-schema#comment>',
      dcTitle = '<http://purl.org/dc/terms/title>',
      tagsTaggedWithTag = '<http://www.holygoat.co.uk/owl/redwood/0.1/tags/taggedWithTag>',
      tagsTaggedOn = '<http://www.holygoat.co.uk/owl/redwood/0.1/tags/taggedOn>',
      tagsTag = '<http://www.holygoat.co.uk/owl/redwood/0.1/tags/Tag>',
      tagsTagName = '<http://www.holygoat.co.uk/owl/redwood/0.1/tags/tagName>',
      xmlsDatetime = '<http://www.w3.org/2001/XMLSchema#datetime>',
      statements = [],
      statement = function(s, p, o) {
        statements.push([s, p, o, '.'].join(' '));
      },
      padStr = function(s) {
        s = s+'';
        if(s.length < 2) {
          s = '0' + s;
        }
        return s;
      },
      literal = function(s, dataType) {
        s = '"'+s+'"';
        if (typeof(dataType) !== 'undefined' && dataType.length > 0) {
          s = s + '^^' + dataType;
        }
        return s;
      },
      taggedOn = function() {
        var d = new Date(),
            Y = d.getFullYear(),
            M = padStr(d.getMonth()+1),
            D = padStr(d.getDate()),
            H = padStr(d.getHours()),
            M = padStr(d.getMinutes()),
            S = padStr(d.getSeconds()),       
            O = (d.getTimezoneOffset() / 60),
            Z, sign;

        sign = (O > 0 ? '-' : '+'); 
        Z = padStr(O);
        Z = sign + Z + '00';

        return literal((Y + '-' + M + '-' + D + ' ' + H + ':' + M + ':' + S + ' ' + Z), xmlsDatetime);
      };
  
  statement(uri, rdfA, rssItem);
  statement(uri, dcTitle, literal(title));

  if (notes.length > 0) {
    statement(uri, rdfsComment, literal(notes));
  }

  statement(uri, tagsTaggedOn, taggedOn());

  if (tags.length > 0) {
    tags.split(' ').forEach(function(tag) {
      var tagURI = '<'+base+'#'+tag+'>';
      statement(tagURI, rdfA, tagsTag);
      statement(tagURI, tagsTagName, literal(tag));
      statement(uri, tagsTaggedWithTag, tagURI);
    });
  }
   
  return statements.join("\n");
};
