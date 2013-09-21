/**
 * Demo using Pixi.js as renderer
 * @class PixiDemo
 * @constructor
 * @extends Demo
 * @param {World}   world                       The world to render.
 * @param {Object}  [options]
 * @param {Number}  options.lineWidth
 * @param {Number}  options.scrollFactor
 * @param {Number}  options.pixelsPerLengthUnit
 * @param {Number}  options.width               Num pixels in horizontal direction
 * @param {Number}  options.height              Num pixels in vertical direction
 */
function PixiDemo(world,options){
    options = options || {};

    var settings = {
        lineWidth : 2,
        scrollFactor : 0.1,
        pixelsPerLengthUnit : 128,
        width : 1280, // Pixi screen resolution
        height : 720,
        w:100, h:100
    };
    for(var key in options)
        settings[key] = options[key];

    this.settings = settings;
    this.pixelsPerLengthUnit =  settings.pixelsPerLengthUnit;
    this.lineWidth =            settings.lineWidth;
    this.scrollFactor =         settings.scrollFactor;

    this.sprites = [],
    this.springSprites = [];
    this.w = settings.w;
    this.h = settings.h;
    this.mousePos = {x:2000, y:0};
    

    Demo.call(this,world);
};
PixiDemo.prototype = Object.create(Demo.prototype);

/**
 * Initialize the renderer and stage
 */
PixiDemo.prototype.init = function(){
    var w = this.w,
        h = this.h,
        s = this.settings;

    var that = this;

    var renderer =  this.renderer =     PIXI.autoDetectRenderer(s.width, s.height);
    var stage =     this.stage =        new PIXI.DisplayObjectContainer();
    var container = this.container =    new PIXI.Stage(0x333333,true);
    document.body.appendChild(this.renderer.view);

    this.container.addChild(stage);

    stage.position.x = renderer.width*0.5; // center at origin
    stage.position.y = -renderer.height*0.5;

    var lastX, lastY, lastMoveX, lastMoveY, startX, startY, down=false;


    container.mousedown = function(e){
        lastX = e.global.x;
        lastY = e.global.y;
        startX = stage.position.x;
        startY = stage.position.y;
        down = true;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
        that.mousePos = {x:e.global.x, y:e.global.y}
    };
    container.mousemove = function(e){
        if(down){
            stage.position.x = e.global.x-lastX+startX;
            stage.position.y = e.global.y-lastY+startY;
        }
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
        that.mousePos = {x:e.global.x, y:e.global.y}
    };
    container.mouseup = function(e){
        down = false;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
        that.mousePos = {x:e.global.x, y:e.global.y}

    };

    /*$(window).bind('mousewheel', function(e){
        var scrollFactor = that.scrollFactor,
            stage = that.stage;
        if (e.originalEvent.wheelDelta >= 0){
            // Zoom in
            stage.scale.x *= (1+scrollFactor);
            stage.scale.y *= (1+scrollFactor);
            stage.position.x += (scrollFactor) * (stage.position.x - lastMoveX);
            stage.position.y += (scrollFactor) * (stage.position.y - lastMoveY);
        } else {
            // Zoom out
            stage.scale.x *= (1-scrollFactor);
            stage.scale.y *= (1-scrollFactor);
            stage.position.x -= (scrollFactor) * (stage.position.x - lastMoveX);
            stage.position.y -= (scrollFactor) * (stage.position.y - lastMoveY);
        }
        stage.updateTransform();
    });*/
};

PixiDemo.prototype.wheel = function(e){
    var scrollFactor = this.scrollFactor,
    stage = this.stage;
    var delta;
    if (e.wheelDelta) delta = e.wheelDelta;
    if (e.detail) delta = e.detail * -40;
    
    if (delta >= 0){
        // Zoom in
        stage.scale.x *= (1+scrollFactor);
        stage.scale.y *= (1+scrollFactor);
        stage.position.x += (scrollFactor) * (stage.position.x - this.mousePos.x);
        stage.position.y += (scrollFactor) * (stage.position.y - this.mousePos.y);
    } else {
        // Zoom out
        stage.scale.x *= (1-scrollFactor);
        stage.scale.y *= (1-scrollFactor);
        stage.position.x -= (scrollFactor) * (stage.position.x - this.mousePos.x);
        stage.position.y -= (scrollFactor) * (stage.position.y - this.mousePos.y);
    }
    stage.updateTransform();
}

/**
 * Draw a circle onto a graphics object
 * @method drawCircle
 * @static
 * @param  {PIXI.Graphics} g
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} radius
 * @param  {Number} color
 * @param  {Number} lineWidth
 */
PixiDemo.drawCircle = function(g,x,y,angle,radius,color,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)!="undefined" ? color : 0xffffff;
    g.lineStyle(lineWidth, 0x000000, 1);
    g.beginFill(color, 1.0);
    g.drawCircle(x, y, radius);
    g.endFill();

    // line from center to edge
    g.moveTo(x,y);
    g.lineTo(   x + radius*Math.cos(-angle),
                y + radius*Math.sin(-angle) );
};

PixiDemo.drawSpring = function(g,restLength,color,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, color, 1);
    var M = 12;
    var dx = restLength/M;
    g.moveTo(-restLength/2,0);
    for(var i=1; i<M; i++){
        var x = -restLength/2 + dx*i;
        var y = 0;
        if(i<=1 || i>=M-1 ){
            // Do nothing
        } else if(i % 2 === 0){
            y -= 0.1*restLength;
        } else {
            y += 0.1*restLength;
        }
        g.lineTo(x,y);
    }
    g.lineTo(restLength/2,0);
};

/**
 * Draw a finite plane onto a PIXI.Graphics.
 * @method drawPlane
 * @param  {Graphics} g
 * @param  {Number} x0
 * @param  {Number} x1
 * @param  {Number} color
 * @param  {Number} lineWidth
 * @param  {Number} diagMargin
 * @param  {Number} diagSize
 * @todo Should consider an angle
 */
PixiDemo.drawPlane = function(g, x0, x1, color, lineWidth, diagMargin, diagSize){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw the actual plane
    g.moveTo(x0,0);
    g.lineTo(x1,0);

    // Draw diagonal lines
    for(var i=0; x0 + i*diagMargin < x1; i++){
        g.moveTo(x0 + i*diagMargin,            0);
        g.lineTo(x0 + i*diagMargin +diagSize,  +diagSize);
    }
};


PixiDemo.drawLine = function(g, len, color, lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw the actual plane
    g.moveTo(-len/2,0);
    g.lineTo( len/2,0);
};

// Todo angle
PixiDemo.drawRectangle = function(g,x,y,angle,w,h,color,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);
    g.drawRect(x-w/2,y-h/2,w,h);
};

PixiDemo.drawConvex = function(g,verts,triangles,color,fillColor,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);
    g.beginFill(fillColor);
    for(var i=0; i<verts.length; i++){
        var v = verts[i],
            x = v[0],
            y = v[1];
        if(i==0)
            g.moveTo(x,y);
        else
            g.lineTo(x,y);
    }
    g.lineTo(verts[0][0],verts[0][1]);
    g.endFill();

    // Draw triangles
    for(var i=0; i<triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];
        g.moveTo(a[0],a[1]);
        g.lineTo(b[0],b[1]);
        g.lineTo(c[0],c[1]);
        g.lineTo(a[0],a[1]);
    }
};

var X = vec2.fromValues(1,0);
var distVec = vec2.fromValues(0,0);
PixiDemo.prototype.render = function(){
    var w = this.renderer.width,
        h = this.renderer.height,
        pixelsPerLengthUnit = this.pixelsPerLengthUnit,
        springSprites = this.springSprites,
        sprites = this.sprites;

    // Update body transforms
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i],
            s = this.sprites[i];
        s.position.x =     b.position[0] * pixelsPerLengthUnit;
        s.position.y = h - b.position[1] * pixelsPerLengthUnit;
        s.rotation = -b.angle;
    }

    // Update spring transforms
    for(var i=0; i<this.springs.length; i++){
        var s = this.springs[i],
            sprite = springSprites[i],
            bA = s.bodyA,
            bB = s.bodyB;
        sprite.scale.y = 1;
        if(bA.position[1] < bB.position[1]){
            var tmp = bA;
            bA = bB;
            bB = tmp;
            sprite.scale.y = -1;
        }
        sprite.position.x = ( (     bA.position[0] * pixelsPerLengthUnit ) + (     bB.position[0] * pixelsPerLengthUnit ) ) / 2;
        sprite.position.y = ( ( h - bA.position[1] * pixelsPerLengthUnit ) + ( h - bB.position[1] * pixelsPerLengthUnit ) ) / 2;
        distVec[0] = (     bA.position[0] * pixelsPerLengthUnit ) - (     bB.position[0] * pixelsPerLengthUnit );
        distVec[1] = ( h - bA.position[1] * pixelsPerLengthUnit ) - ( h - bB.position[1] * pixelsPerLengthUnit );
        sprite.rotation = -Math.acos( vec2.dot(X, distVec) / vec2.length(distVec) );
        sprite.scale.x = vec2.length(distVec) / (s.restLength * pixelsPerLengthUnit);
    }

    this.renderer.render(this.container);
}

PixiDemo.prototype.addRenderable = function(obj){
    var ppu = this.pixelsPerLengthUnit,
        lw = this.lineWidth;

    var zero = [0,0];

    if(obj instanceof Body && obj.shapes.length){

        var sprite = new PIXI.Graphics();
        for(var i=0; i<obj.shapes.length; i++){
            var child = obj.shapes[i],
                offset = obj.shapeOffsets[i],
                angle = obj.shapeAngles[i];
            offset = offset || zero;
            angle = angle || 0;

            if(child instanceof Circle){
                PixiDemo.drawCircle(sprite,offset[0]*ppu,offset[1]*ppu,angle,child.radius*ppu,0xFFFFFF,lw);

            } else if(child instanceof Particle){
                PixiDemo.drawCircle(sprite,offset[0]*ppu,offset[1]*ppu,angle,2*lw,0x000000,0);

            } else if(child instanceof Plane){
                // TODO use shape angle
                PixiDemo.drawPlane(sprite, -10*ppu, 10*ppu, 0x000000, lw, lw*10, lw*10);

            } else if(child instanceof Line){
                PixiDemo.drawLine(sprite, child.length*ppu, 0x000000, lw);

            } else if(child instanceof Rectangle){
                PixiDemo.drawRectangle(sprite, offset[0]*ppu, offset[1]*ppu, angle, child.width*ppu, child.height*ppu, 0x000000, lw);

            } else if(child instanceof Convex){
                // Scale verts
                var verts = [],
                    vrot = vec2.create();
                for(var j=0; j!==child.vertices.length; j++){
                    var v = child.vertices[j];
                    vec2.rotate(vrot, v, angle);
                    verts.push([(vrot[0]+offset[0])*ppu, -(vrot[1]+offset[1])*ppu]);
                }
                PixiDemo.drawConvex(sprite, verts, []/*child.triangles*/, 0x000000, 0xFFFFFF, lw);

            }
        }
        this.sprites.push(sprite);
        this.stage.addChild(sprite);

    } else if(obj instanceof Spring){
        var sprite = new PIXI.Graphics();
        var restLengthPixels = obj.restLength * ppu;
        PixiDemo.drawSpring(sprite,restLengthPixels,0x000000,lw);
        this.springSprites.push(sprite);
        this.stage.addChild(sprite);
    }
};

PixiDemo.prototype.removeRenderable = function(obj){
    if(obj instanceof Body){
        var i = this.bodies.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.sprites[i]);
            this.sprites.splice(i,1);
        }
    } else if(obj instanceof Spring){
        var i = this.springs.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.springSprites[i]);
            this.springSprites.splice(i,1);
        }
    }
};

PixiDemo.prototype.resize = function(w,h){
    var renderer = this.renderer;
    var view = renderer.view;
    view.style.position = "absolute";

    var ratio = w / h;
    var pixiRatio = renderer.width / renderer.height;

    if(ratio > pixiRatio){ // Screen is wider than our renderer
        view.style.height = h + "px";
        view.style.width =  (h * pixiRatio) +"px";
        view.style.left = ( (w - h * pixiRatio) / 2 ) +"px";
    } else { // Screen is narrower
        view.style.height =  (w / pixiRatio) +"px";
        view.style.width = w + "px";
        view.style.top = ( (h - w / pixiRatio) / 2 ) +"px";
    }
};
