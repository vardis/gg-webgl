GG.Loader = {
	/** 
	 * Loads an image asynchronously 
	 * The callback must accept two parameters: the request id and the resulting Image object.
	 * The returned Image will be null in case of error.
	 */
	loadImage : function(requestId, url, callback) {
		var img = new Image();
		img.onload = function(ev, exception) {
			if (callback) {
				callback(requestId, ev.target);
			}
		};
		img.src = url;
	},

	loadImages : function(urls, callback) {
		var loaded = 0;
		var images = [];
		for (var i = 0; i < urls.length; i++) {
			GG.Loader.loadImage("dummy", urls[i], new function(index) {
				return function(req, img) {
					loaded++;
					images[index] = img;
					if (loaded == urls.length) {
						callback(images);	
					}				
				}
			}(i));
		}
	},

	loadHDRImage : function(requestId, url, callback) {
		GG.AjaxUtils.arrayBufferRequest(url, function(image, exception) {
			if (callback) {
				callback(requestId, exception ? null : image);
			}						
		});
	},

	/**
	 * Loads a JSON document from the given url and invokes the callback
	 * upon success.
	 * The callback will receive the parsed JSON object.
	 */
	loadJSON : function (requestId, url, callback) {
		GG.AjaxUtils.getRequest(url, "application/x-javascript", function (jsonData) {
			if (callback) {
				callback(JSON.parse(jsonData));
			}
		});
	}
}