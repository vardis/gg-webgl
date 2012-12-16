VertexColorsSample = function (spec) {
    this.camera        = null;
    this.sphereMesh      = null;
    this.y_rot         = 0.0;
    this.mouseHandler  = null;
    this.light         = null;
    this.technique     = null;

    GG.SampleBase.call(this, spec);
};

VertexColorsSample.prototype = new GG.SampleBase();
VertexColorsSample.prototype.constructor = VertexColorsSample;

VertexColorsSample.prototype.initializeAssets = function () {
    this.assetsLoaded = true;
};

VertexColorsSample.prototype.initializeWithAssetsLoaded = function () {

    this.camera       = new GG.PerspectiveCamera();
    this.camera.setPosition([0.0, 0.0, 59.8]);
    this.camera.getViewport().setWidth(gl.viewportWidth);
    this.camera.getViewport().setHeight(gl.viewportHeight);

    this.technique  = new GG.VertexColorsTechnique();

    var radius = 20.0;
    this.sphereMesh = new GG.TriangleMesh(new GG.SphereGeometry(radius, 64, 64), new GG.BaseMaterial());

    var vertices = this.sphereMesh.getPositionsBuffer();
    var numVertices = this.sphereMesh.getVertexCount();
    var colorsArray = [];
    for (var i = 0; i < numVertices; i+=3) {
        var v = vertices.getElementAt(i);
        if (i == 6000) {
            console.log('here');
        }
        //TODO: make getElementAt return a generic VectorData which can be accessed by indices or x,y,z, etc. components
        //var rgb = GG.Color.fromHSV(360*( v[1] / radius + 1 ) / 2, 1.0, 1.0);
        var rgb = GG.Color.fromHSV(360 * (i)/numVertices, 1.0, 1.0 );
        colorsArray.push(rgb.r, rgb.g, rgb.b);

        v = vertices.getElementAt(i + 1);
        //rgb = GG.Color.fromHSV(0.0, ( v[1] / radius + 1 ) / 2, 1.0);
        rgb = GG.Color.fromHSV(360 * (i+1)/numVertices, 1.0, 1.0 );
        colorsArray.push(rgb.r, rgb.g, rgb.b);

        rgb = GG.Color.fromHSV(360 * (i+2)/numVertices, 1.0, 1.0 );
        colorsArray.push(rgb.r, rgb.g, rgb.b);
    }
    this.sphereMesh.setColorData(new Uint8Array(colorsArray));

    this.renderContext = new GG.RenderContext({ camera : this.camera });
    this.initialized = true;
};

VertexColorsSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);

    if (this.initialized) {
        this.sphereMesh.setPosition([0.0, 0.0, -2.0]);
        this.sphereMesh.setRotation([0.0, this.y_rot, 0.0]);
        this.y_rot += GG.clock.deltaTime() * 0.001;
    }
};

VertexColorsSample.prototype.draw = function () {
    var vp = this.camera.getViewport();
    gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
    gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);

    this.technique.render(this.sphereMesh, this.renderContext);
};
