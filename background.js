chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "get_options") {
		// Fetch the options object from local storage
		var options = {};
		for (var key in localStorage) {
			if(localStorage.hasOwnProperty(key) && key.indexOf('option_')==0) {
				options[key] = localStorage[key];
			}
		}
		options['exclude_domains'] = localStorage['exclude_domains'];
		sendResponse(options);
	}
});