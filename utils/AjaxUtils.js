GG.AjaxUtils = function() {
	return {
		asyncRequest : function (request, successCallback, errorCallback) {
			request.onload = function() {				
				var response = null;
				if (request.readyState == 4) {     
					// HTTP reports success with a 200 status. 
					// The file protocol reports success with zero.
					var success = request.status == 200 || request.status == 0;      
					if (success && successCallback) {
						if (request.hasOwnProperty('expectedType')) {
							if (request.getResponseHeader("Content-Type").indexOf(request.expectedType) < 0) {
								if (errorCallback) {
									errorCallback("Expected content type of " + expectedType 
										+ " but received " + request.getResponseHeader());
								}
								success = false;
							}
						} 

						if (success) {
							successCallback(request.response); 
						}
						
					} else if (!success && errorCallback) {
						errorCallback(request.status);
					}
			    }
				
			};
			request.send();
		},

		/**
		 * Creates an asynchronous request that reads binary data in the form of an ArrayBuffer object.
		 * https://developer.mozilla.org/en/javascript_typed_arrays
		 *
		 * E.g. 
		 * GG.AjaxUtils.arrayBufferRequest('http://localhost/data/array.bin', on_my_load);
		 */
		arrayBufferRequest : function(url, callback) {
			var request = new XMLHttpRequest();
  			request.open("GET", url, true);
  			request.responseType = "arraybuffer";  			
  			GG.AjaxUtils.asyncRequest(request, function(arraybuffer, url) {								
				callback(arraybuffer, url);
			});
		},

		getRequest : function (url, type, callback) {
			var request = new XMLHttpRequest();
  			request.open("GET", url, true);
  			request.expectedType = type;
  			GG.AjaxUtils.asyncRequest(request, function(response) {								
				callback(response, url);
			});
		}
	};
}();