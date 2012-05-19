GG.AjaxUtils = function() {
	return {
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
			request.onload = function() {				
				var arraybuffer = null;
				if (request.readyState == 4) {
      
			      // HTTP reports success with a 200 status. 
			      // The file protocol reports success with zero.
			      var success = request.status == 200 || request.status == 0;      
			      if (success) arraybuffer = request.response;
			    }
				callback(arraybuffer, url);
			};
			request.send();
		}
	};
}();