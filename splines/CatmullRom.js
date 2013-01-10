/**
 * A Catmull-Rom spline is a Hermite cubic degree Bezier spline where the tangents
 * are defined by the formula:
 * tangent[i] = sharpness * (point[i+1] - point[i-1])
 *
 * It has the useful property of passing through each of its control points.

 * where sharpness is typically set to 0.5, although this can be controlled through
 * the CatmullRom.sharpness field.
 *
 * The spline is constructed by repeatedly calling the addPoint(p: vec3) until
 * for each point that is to be interpolated by the spline.
 * Each pair of points define a segment of the spline and for each segment we
 * assign an approximated ratio of its length over the total length of the spline.
 *
 * To sample the spline at a time offset t which lies in [0, 1], use the method CatmullRom.point(t: float).
 * This will return the x,y,z coordinates of the spline point. Internally, the method uses
 * the passed time value as a ratio in order to determine the segment that corresponds
 * to that time value. Then the ratio of the starting point of the segment is subtracted
 * from the time and divided by the ratio of the length of the segment in order to determine
 * the point within the segment that corresponds to the passed time.
 */
GG.CatmullRom = function (spec) {
    spec = spec || {};
    this.points = spec.points != null ? spec.points : [];
    this.tangents = [];

    // contains the running sum of the segment ratios
    this.segmentRatios = [];
    this.sharpness = spec.sharpness != null ? spec.sharpness : 0.5;
};

GG.CatmullRom.prototype.constructor = GG.CatmullRom;

GG.CatmullRom.prototype.addPoint = function (p) {
    this.points.push(p);
    this.calculateSegmentsRatios();
    this.calculateTangents();
};

/**
 * Samples the spline at the given time value.
 * The time value should lie between [0, 1].
 */
GG.CatmullRom.prototype.point = function (t) {
    // check corner cases, t == 0, t == 1
    if (t == 0) {
        return this.points[0];
    } else if (t == 1.0) {
        return this.points[this.points.length - 1];
    } else {
        var idx = this.getSegmentForTime(t);
        var startSegment = this.segmentRatios[idx];
        if (idx == this.segmentRatios.length-1) {
            var endSegment = 1;
        } else {
            var endSegment = this.segmentRatios[idx + 1];
        }        
        var segmentTime = (t - startSegment) / (endSegment - startSegment);
        return this.hermiteInterpolation(idx, segmentTime);   
    }    
};

/**
 * Performs the Hermite interpolation for a given segment and a segment local
 * time.
 */
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

/**
 * Calculates the tangent vectors from the current list of spline points.
 */
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

/**
 * For each spline segment, it calculates the ratio of its length over
 * the total length of the spline.
 * This is just an approximation, as the length of a segment we use the
 * distance between its two endpoints. While the total length of the
 * spline is the sum of the lengths of all the segments.
 */
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
        this.segmentRatios = [];
        this.segmentRatios[0] = 0;
        this.segmentRatios[segmentsLengths.length-1] = 1;

        for (var j = 1; j < segmentsLengths.length-1; j++) {
            this.segmentRatios[j] = segmentsLengths[j] / total;
            if (j > 0) {
                this.segmentRatios[j] += this.segmentRatios[j - 1];
            }
        }
    } else {
        this.segmentRatios = [];
    }    
};

/**
 * Returns the index of the spline segment that corresponds to the given
 * time value.
 */
GG.CatmullRom.prototype.getSegmentForTime = function (t) {
    for (var j = 0; j < this.segmentRatios.length; j++) {
        if (t < this.segmentRatios[j]) return j-1;
    }
    return this.segmentRatios.length - 1;
};


