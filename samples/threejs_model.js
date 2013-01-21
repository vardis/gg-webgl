ThreeJsModelSample = function (spec) {
	this.jsonMesh      = null;
	this.wireframeTechnique     = null;
	this.phong         = null;
	this.light         = null;
	this.camera        = null;
	this.material      = null;
	this.renderContext = null;
	this.mouseHandler  = null;
	this.normalsDebug  = null;
	this.wireframe     = null;
	this.y_rot         = 0.0;
	GG.SampleBase.call(this, spec);
};

ThreeJsModelSample.prototype = new GG.SampleBase();
ThreeJsModelSample.prototype.constructor = ThreeJsModelSample;

ThreeJsModelSample.prototype.initializeAssets = function () {
	this.material = new GG.BaseMaterial();
	this.material.shininess = 120;
	this.material.flatShade = true;

	var self = this;	
	GG.Loader.loadJSON('teapot', '../assets/models/monkey.js', function (jsonObj) {
        self.jsonMesh = new GG.TriangleMesh(GG.Geometry.fromThreeJsJSON(jsonObj));
        self.jsonMesh.material = self.material;
        self.jsonMesh.setScale([3,3,3]);
        self.jsonMesh.setPosition([0,0,-2]);
        self.jsonMesh.material.wireOffset = 0.01;

        self.wireframe = self.jsonMesh.asWireframeMesh();
        self.wireframe.setScale([3,3,3]);

        self.assetsLoaded = true;
    });
};


ThreeJsModelSample.prototype.initializeWithAssetsLoaded = function () {
	
	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 9.8]);	
	this.camera.getViewport().setWidth(gl.viewportWidth);
	this.camera.getViewport().setHeight(gl.viewportHeight);

	this.wireframeTechnique = new GG.WireframeTechnique();
	this.phong = new GG.PhongShadingTechnique();
	this.normalsDebug = GG.NormalsVisualizationTechnique.create();

	this.light = new GG.Light({
        name:'red',
        type:GG.LT_POINT,
        position:[0.0, 1.0, 25.0],
        direction:[0.0, 0.0, 0.90],
        diffuse:[0.30, 0.20, 0.70],
        cosCutOff:0.9
    });

	this.mouseHandler = new GG.SphericalCameraController();
	this.mouseHandler.setCamera(this.camera);

	this.renderContext = new GG.RenderContext({ camera : this.camera, light : this.light });
	this.initialized = true;
};

ThreeJsModelSample.prototype.update = function () {
	GG.SampleBase.prototype.update.call(this);

	if (this.initialized) {
        this.y_rot += GG.clock.deltaTime() * 0.001;
		//this.jsonMesh.setRotation([0.0, this.y_rot, 0.0]);
	}
};

ThreeJsModelSample.prototype.draw = function () {
    var vp = this.camera.getViewport();
    vp.setClearColor([0,0,0]);
    gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
    gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor()[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);

    this.phong.render(this.jsonMesh, this.renderContext);
    this.wireframeTechnique.render(this.wireframe, this.renderContext);

    this.normalsDebug.normalsScale = 10.35;
    //this.normalsDebug.render(this.jsonMesh, this.renderContext);
};
