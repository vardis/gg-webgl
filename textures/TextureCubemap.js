/**
 * Encapsulates a cubemap texture. 
 * Basic texture attributes are inherited from the Texture2D class.
 *
 * Example construction:
 * cubemap = GG.TextureCubemap({ 
 		'images' : [ posx, negx, posy, negy, posz, negz],
 		'size' : 1024
 * });
 */
GG.TextureCubemap = function(spec) {

	this.faces = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
	];
	this.images     = {};
	
	this.imagesSize = spec.size || 1024;
	this.hdrTexures = spec.floatTextures || false;
	
	this.gltex      = gl.createTexture();

	if (this.hdrTexures) {
		this.loadHDRTextures(spec);
	} else {
		this._initFromLDRImages(spec);
		//this.loadTextures(spec);
	}	
};

GG.TextureCubemap.prototype.constructor = GG.TextureCubemap;

GG.TextureCubemap.prototype.loadTextures = function(spec) {
	for (var i = 0; i < this.faces.length; i++) {
		var that = this;
		var f = this.faces[i];
		var img = new Image();
		img.onload = new function(face) {
			return function(ev, exception) {
				if (ev) {
					that.handleImageOnLoad(face, ev.target);
				}			
			};
		}(f);
		img.src = spec.images[i];
	}	
};

GG.TextureCubemap.prototype.loadHDRTextures = function(spec) {
	for (var i = 0; i < this.faces.length; i++) {
		var that = this;
		var f = this.faces[i];
		this.images[f] = null;
		GG.AjaxUtils.arrayBufferRequest(spec.images[i], new function(face) {
			return function(image, exception) {
				if (image) {
					that.handleImageOnLoad(face, image);
				}			
			};
		}(f));
	}	
	
};

GG.TextureCubemap.prototype._initFromLDRImages = function(spec) {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	this.images = spec.images;
	for (var ii = 0; ii < this.faces.length; ++ii) {
		gl.texImage2D(this.faces[ii], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[ii]);
	}
	
	
   	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};

GG.TextureCubemap.prototype.handleImageOnLoad = function(target, image) {
	this.images[target] = image;
	var numLoaded = 0;
	for (var ii = 0; ii < this.faces.length; ++ii) {
	    if (this.images[this.faces[ii]]) {
	      ++numLoaded;
	    }
  	}

  	if (numLoaded == 6) {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
		if (this.hdrTexures) {
			this.imagesSize = Math.sqrt(this.images[this.faces[0]].byteLength / Float32Array.BYTES_PER_ELEMENT / 3);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

			for (var ii = 0; ii < this.faces.length; ++ii) {
			    gl.texImage2D(this.faces[ii], 0, gl.RGB, this.imagesSize, this.imagesSize, 0, gl.RGB, gl.FLOAT, new Float32Array(this.images[this.faces[ii]]));
		  	}
			
		} else {
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			for (var ii = 0; ii < this.faces.length; ++ii) {
				gl.texImage2D(this.faces[ii], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[this.faces[ii]]);
			}
			
		}
	   
	   	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

  	}
	
};

GG.TextureCubemap.prototype.bind = function() {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
};

GG.TextureCubemap.prototype.unbind = function() {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};