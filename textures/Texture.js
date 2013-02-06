GG.Texture = function (spec) {
	spec             = spec || {};
	this.texture     = spec.texture;
	this.textureType = gl.TEXTURE_2D;
	this.format      = spec.format != undefined ? spec.format : gl.RGBA;
	this.width       = spec.width != undefined ? spec.width : 512;
	this.height      = spec.height != undefined ? spec.height : 512;
	this.magFilter   = spec.magFilter != undefined ? spec.magFilter : gl.NEAREST;
	this.minFilter   = spec.minFilter != undefined ? spec.minFilter : gl.NEAREST;
	this.wrapS       = spec.wrapS != undefined ? spec.wrapS : gl.CLAMP_TO_EDGE;
	this.wrapT       = spec.wrapT != undefined ? spec.wrapT : gl.CLAMP_TO_EDGE;
	this.flipY       = spec.flipY != undefined ? spec.flipY : true;
	this.useMipmaps  = spec.useMipmaps != undefined ? spec.useMipmaps : true;	
	this.mipmapFiltering = spec.mipmapFiltering != undefined ? spec.mipmapFiltering : true;	
};

GG.Texture.prototype.constructor = GG.Texture;

GG.Texture.prototype.copyImageData = function (image) {
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
};

GG.Texture.prototype.bindAtUnit = function(unitIndex) {
	gl.activeTexture(GG.Texture.getGlUnitFromIndex(unitIndex));
	gl.bindTexture(this.textureType, this.texture);
};

GG.Texture.prototype.setMinFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(this.textureType, gl.TEXTURE_MIN_FILTER, filterType);
};

GG.Texture.prototype.setMagFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(this.textureType, gl.TEXTURE_MAG_FILTER, filterType);
};

GG.Texture.prototype.setWrapMode = function(wrapModeS, wrapModeT) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_S, wrapModeS);
	gl.texParameteri(this.textureType, gl.TEXTURE_WRAP_T, wrapModeT);
};

GG.Texture.prototype.isPowerOf2 = function() {
	return GG.MathUtils.isPowerOf2(this.width) && GG.MathUtils.isPowerOf2(this.height);
};

GG.Texture.prototype.handle = function() {
	return this.tex;
};

GG.Texture.getGlUnitFromIndex = function (unitIndex) {
    return eval("gl.TEXTURE" + unitIndex);
};

GG.Texture.createTexture = function (spec) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, spec.flipY != undefined ? spec.flipY : true);
	//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

	// maps a format to the triple [internalFormat, format, type] as accepted by gl.TexImage2D
	var formatDetails         = {};
	formatDetails[gl.RGB]     = [gl.RGB, gl.RGB, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA]    = [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA4]   = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4];
	formatDetails[gl.RGB5_A1] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1];
	formatDetails[gl.RGB565]  = [gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5];

	var colorFormat     = spec.colorFormat != undefined ? spec.colorFormat : gl.RGBA;
	var magFilter       = spec.magFilter != undefined ? spec.magFilter : gl.NEAREST;
	var minFilter       = spec.minFilter != undefined ? spec.minFilter : gl.NEAREST;
	var useMipmaps      = spec.useMipmaps != undefined ? spec.useMipmaps : true;
	var mipmapFiltering = spec.minFmipmapFilteringilter != undefined ? spec.mipmapFiltering : gl.NEAREST;
	var width, height;
	
	if (spec.image != undefined) {
		gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[colorFormat][0],  formatDetails[colorFormat][1], formatDetails[colorFormat][2], spec.image);	
		width = spec.width;
		heigh = spec.height;
	} else {		
		width = spec.width != undefined ? spec.width : 512;
		height = spec.height != undefined ? spec.height : 512;
		gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[colorFormat][0], width, height, 0, formatDetails[colorFormat][1], formatDetails[colorFormat][2], null);
	}

	if (useMipmaps && GG.MathUtils.isPowerOf2(width) && GG.MathUtils.isPowerOf2(height)) {
		gl.generateMipmap(gl.TEXTURE_2D);
		if (minFilter == gl.NEAREST && mipmapFiltering == gl.NEAREST) {
			minFilter = gl.NEAREST_MIPMAP_NEAREST;
		} else if (minFilter == gl.NEAREST && mipmapFiltering == gl.LINEAR) {
			minFilter = gl.NEAREST_MIPMAP_LINEAR;
		} else if (minFilter == gl.LINEAR && mipmapFiltering == gl.NEAREST) {
			minFilter = gl.LINEAR_MIPMAP_NEAREST;
		} else if (minFilter == gl.LINEAR && mipmapFiltering == gl.LINEAR) {
			minFilter = gl.LINEAR_MIPMAP_LINEAR;
		} 
	}
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS != undefined ? spec.wrapS : gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT != undefined ? spec.wrapT : gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_2D, null);

	copySpec = GG.cloneDictionary(spec);
	copySpec.texture = tex;
	return new GG.Texture(copySpec);
};