var dydraBookmarksPageURL = document.location.href;
var dydraBookmarksPageTitle = document.title;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if(request.action === Dydra.actions.GET_TITLE_AND_URL) {
    sendResponse({url: dydraBookmarksPageURL, title: dydraBookmarksPageTitle});
  }
});

chrome.extension.sendRequest({action: Dydra.actions.PAGE_LOADED, url: dydraBookmarksPageURL, title: dydraBookmarksPageTitle}, function(response) {});
