GG.Object3D = function (geometry, material, spec) {
    spec               = spec || {};
    spec.usesColors    = spec.usesColors != undefined ? spec.usesColors : false;
    spec.usesNormals   = spec.usesNormals != undefined ? spec.usesNormals : false;
    spec.usesTexCoords = spec.usesTexCoords != undefined ? spec.usesTexCoords : false;
    spec.usesTangents  = spec.usesTangents != undefined ? spec.usesTangents : false;
    
    this.geometry      = geometry;
    this.material      = material;       
    this.pos           = [0.0, 0.0, 0.0];
    this.rotation      = [0.0, 0.0, 0.0];
    this.scale         = [1.0, 1.0, 1.0];
    this.renderMode    = GG.RENDER_TRIANGLES;

    if (spec.positionsBuffer != undefined) {
        this.positionsBuffer = spec.positionsBuffer;
    } else {
        if (this.geometry != null && this.geometry.getVertices() != null) {
            this.positionsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getVertices(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
        } else {
            this.positionsBuffer = null;
        }
    }

    if (spec.normalsBuffer != undefined) {
        this.normalsBuffer = spec.normalsBuffer;
    } else {
        if (this.geometry != null && spec.usesNormals && this.geometry.getNormals() != null) {
            this.normalsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getNormals(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
        } else {
            this.normalsBuffer = null;
        }
    }

    if (spec.texCoordsBuffer != undefined) {
            this.texCoordsBuffer = spec.texCoordsBuffer;
    } else {
        if (this.geometry != null && spec.usesTexCoords && this.geometry.getTexCoords() != null) {
            this.texCoordsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getTexCoords(), 'itemSize' : 2, 'itemType' : gl.FLOAT });
        } else {
            this.texCoordsBuffer = null;
        }
    }

    if (spec.colorsBuffer != undefined) {
            this.colorsBuffer = spec.colorsBuffer;
    } else {
        if (this.geometry != null && spec.usesColors && this.geometry.getColors() != null) {
            this.colorsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getColors(), 'itemSize' : 3, 'itemType' : gl.UNSIGNED_BYTE });
        } else {
            this.colorsBuffer = null; // GG.AttributeDataBuffer.newEmptyDataBuffer();
        }
    }

    if (spec.tangentsBuffer != undefined) {
            this.tangentsBuffer = spec.tangentsBuffer;
    } else {
        if (this.geometry != null && spec.usesTangents && this.geometry.getTangents() != null) {
            this.tangentsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getTangents(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
        } else {
            this.tangentsBuffer = null;
        }
    }

    // TODO: abstract the following in a VertexIndexBuffer class
    if (spec.indexBuffer != undefined) {
            this.indexBuffer = spec.indexBuffer;
    } else {
        if (this.geometry != null && this.geometry.indices != undefined) {
            this.indexBuffer          = gl.createBuffer(1);
            this.indexBuffer.numItems = this.geometry.getIndices().length;
            this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
        } else {
            this.indexBuffer = null;
        }
    }
};

GG.Object3D.prototype.getGeometry = function() {
    return this.geometry;
};

GG.Object3D.prototype.getPositionsBuffer = function() {
    return this.positionsBuffer;
};

GG.Object3D.prototype.getNormalsBuffer = function() {
    return this.normalsBuffer;
};

GG.Object3D.prototype.getTexCoordsBuffer = function() {
    return this.texCoordsBuffer;
};

GG.Object3D.prototype.getColorsBuffer = function () {
    return this.colorsBuffer;
};

GG.Object3D.prototype.getTangentsBuffer = function () {
    return this.tangentsBuffer;
};

GG.Object3D.prototype.getIndexBuffer = function() {
    return this.indexBuffer;
};

GG.Object3D.prototype.getVertexCount = function() {
    return this.positionsBuffer != null ? this.positionsBuffer.getItemCount() : 0;
};

GG.Object3D.prototype.setColorData = function(typedArray) {
    if (this.colorsBuffer != null) this.colorsBuffer.destroy();
    this.colorsBuffer = new GG.AttributeDataBuffer({
        normalize : true, 
        arrayData : typedArray, 
        itemSize : 3, 
        itemType : gl.UNSIGNED_BYTE, 
        itemCount : this.getVertexCount() 
    });
};


GG.Object3D.prototype.getPosition = function () {
    return this.pos;
};

GG.Object3D.prototype.setPosition = function (p) {
    this.pos = p;
};

GG.Object3D.prototype.getRotation = function () {
    return this.rotation;
};

GG.Object3D.prototype.setRotation = function (o) {
    this.rotation = o;
};

GG.Object3D.prototype.setScale = function (s) {
    this.scale = s;
};

GG.Object3D.prototype.getScale = function () {
    return this.scale;
};

GG.Object3D.prototype.getMode = function () {
    return this.mode;
};

GG.Object3D.prototype.setMode = function () {
    return this.mode;
};

GG.Object3D.prototype.getModelMatrix=function() {
	var model = mat4.create();
	mat4.identity(model);

	mat4.translate(model, this.pos);	
	mat4.rotate(model, this.rotation[1], [0, 1, 0]);
	mat4.rotate(model, this.rotation[0], [1, 0, 0]);
	mat4.rotate(model, this.rotation[2], [0, 0, 1]);
	mat4.scale(model, this.scale);
	return model;
};

GG.Object3D.prototype.getMaterial = function () {
	return this.material;
};

GG.Object3D.prototype.setMaterial = function (m) {
	this.material = m;
	return this;
};