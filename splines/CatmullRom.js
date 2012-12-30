GG.CatmullRom = function (spec) {
    spec = spec || {};
    this.points = spec.points != null ? spec.points : [];
    this.tangents = [];
    this.ratios = [];
    this.cp1 = spec.cp1 != null ? spec.cp1 : [0, 0, 0];
    this.sharpness = spec.sharpness != null ? spec.sharpness : 0.5;
};

GG.CatmullRom.prototype.constructor = GG.CatmullRom;

GG.CatmullRom.prototype.addPoint = function (p) {
    this.points.push(p);
    this.calculateSegmentsRatios();
    this.calculateTangents();
};

GG.CatmullRom.prototype.point = function (t) {
    // check corner cases, t == 0, t == 1
    if (t == 0) {
        return this.points[0];
    } else if (t == 1.0) {
        return this.points[this.points.length - 1];
    } else {
        var idx = this.getSegmentForTime(t);
        var start = this.ratios[idx];
        var end = this.ratios[idx + 1];
        var segmentTime = (t - start) / (end - start);
        return this.hermiteInterpolation(idx, segmentTime);   
    }    
};

GG.CatmullRom.prototype.hermiteInterpolation = function (segment, t) {
    var t1 = 1 - t;
    var t2 = t1 * t1;
    var timeSquared = t * t;
    var timeCubic = t * timeSquared;

    var f0 = 2 * timeCubic - 3 * timeSquared + 1;
    var f1 = timeCubic - 2*timeSquared + t; //t * t2;
    var f2 = -2*timeCubic + 3*timeSquared; //(3 * timeSquared - 2 * timeSquared);
    var f3 = timeCubic - timeSquared ; //-timeSquared * t1;

    var cp0 = this.points[segment];
    var cp1 = this.points[segment + 1];
    var tangent0 = this.tangents[segment];
    var tangent1 = this.tangents[segment + 1];
    var pt = [0, 0, 0];
    pt[0] = f0 * cp0[0] + f1 * tangent0[0] + f2 * cp1[0] + f3 * tangent1[0];
    pt[1] = f0 * cp0[1] + f1 * tangent0[1] + f2 * cp1[1] + f3 * tangent1[1];
    pt[2] = f0 * cp0[2] + f1 * tangent0[2] + f2 * cp1[2] + f3 * tangent1[2];
    return pt;
};

GG.CatmullRom.prototype.calculateTangents = function () {
    if (this.points.length > 2) {
        for (var i = 0; i < this.points.length; i++) {
            var t = vec3.create();
            if (i == 0) {
                vec3.subtract(this.points[i + 1], this.points[i], t);
            } else if (i == this.points.length - 1) {
                vec3.subtract(this.points[i], this.points[i - 1], t);
            } else {
                vec3.subtract(this.points[i + 1], this.points[i - 1], t);              
            }
            vec3.scale(t, this.sharpness);
            this.tangents.push(t);
        }
    } else {
        this.tangents = [];
    }
};

GG.CatmullRom.prototype.calculateSegmentsRatios = function () {
    var numPoints = this.points.length;    
    if (numPoints >= 2) {
        var total = 0;
        
        var segmentsLengths = [];
        for (var i = 0; i < numPoints; i++) {
            if (i == 0) {
                segmentsLengths.push(0);
            //} else if (i == numPoints - 1) {
             //   segmentsLengths.push(1);
            } else {
                var v = vec3.create();
                vec3.subtract(this.points[i], this.points[i-1], v);
                var len = vec3.length(v);
                total += len;
                segmentsLengths.push(len);
            }
        }

        // set ratio for each curve of the spline
        this.ratios = [];
        this.ratios[0] = 0;
        this.ratios[segmentsLengths.length-1] = 1;

        for (var j = 1; j < segmentsLengths.length-1; j++) {
            this.ratios[j] = segmentsLengths[j] / total;
            if (j > 0) {
                this.ratios[j] += this.ratios[j - 1];
            }
        }
    } else {
        this.ratios = [];
    }    
};

GG.CatmullRom.prototype.getSegmentForTime = function (t) {
    for (var j = 0; j < this.ratios.length; j++) {
        if (t < this.ratios[j]) return j-1;
    }
    return this.ratios.length - 1;
};


