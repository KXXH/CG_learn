"use strict";
var canvas;
var gl;

var program;

var graph;

function main(){

    graph=new Vue({
        el:"#control_panel",
        data:{
            points:[],
            vertex:[],
            colors:[],
            vPositionBuffer:0,
            vColorBuffer:0,
            vPositionBufferLoc:0,
            vColorBufferLoc:0,
            uMatrixLoc:0,
            angleX:0,
            angleY:0,
            angleZ:0
        },
        watch:{
            points:function(){
                //redraw();
            },
            vertex:function(){
                //redraw();
            },
            angleX:function(){redraw();},
            angleY:function(){redraw();},
            angleZ:function(){redraw();}
        }
    });

    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );

    program=webglUtils.createProgramFromScripts(gl,["vertex-shader","fragment-shader"]);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    var points=[vec3(-0.5,-0.5,0),vec3(-0.5,0.5,0),vec3(-0.0,0.5,0.0)];

    graph.vPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);

    graph.vPositionBufferLoc=gl.getAttribLocation(program,"vPosition");
    gl.vertexAttribPointer(graph.vPositionBufferLoc,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(graph.vPositionBufferLoc);

    graph.vColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten([vec4(1.0,1.0,1.0,1.0),vec4(1.0,1.0,1.0,1.0),vec4(1.0,1.0,1.0,1.0)]),gl.STATIC_DRAW);
    
    graph.vColorBufferLoc=gl.getAttribLocation(program,"vColor");
    gl.vertexAttribPointer(graph.vColorBufferLoc,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(graph.vColorBufferLoc);
    
    graph.uMatrixLoc = gl.getUniformLocation(program,"uMatrix");

    configPositionData(gl,graph);
 
    redraw();
    /*
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten([vec4(1.0,1.0,1.0,1.0),vec4(1.0,1.0,1.0,1.0),vec4(1.0,1.0,1.0,1.0)]),gl.STATIC_DRAW);

    //var colors=[];
    
    //gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
    console.log(points);
    gl.drawArrays(gl.TRIANGLES,0,points.length);
    */
}

function redraw(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var points=[];
    var colors=[];
    for(var i=0;i<graph.vertex.length;i++){
        for(var j=0;j<graph.vertex[i].length;j++){
            points.push(graph.points[graph.vertex[i][j]]);
            colors.push(graph.colors[Math.ceil(i/2)]);
        }
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
      
    

    var mat=mat4();
    mat[0][0]=mat[1][1]=mat[2][2]=mat[3][3]=1;
    //mat=m4.xRotate(mat,graph.angleX);
    //mat=m4.yRotate(mat,graph.angleY);
    //mat=m4.zRotate(mat,graph.angleZ);
    mat = mult(mat,rotateX(graph.angleX));
    mat = mult(mat,rotateY(graph.angleY));
    mat = mult(mat,rotateZ(graph.angleZ));
    console.log(mat);
    gl.uniformMatrix4fv(graph.uMatrixLoc,false,flatten(mat));

    gl.drawArrays(gl.TRIANGLES,0,points.length);
    //requestAnimationFrame(redraw);
} 

function configPositionData(gl,graph){
    graph.points=[
        vec3(-0.5,-0.5,-0.5),
        vec3(-0.5,-0.5,0.5),
        vec3(-0.5,0.5,-0.5),
        vec3(-0.5,0.5,0.5),
        vec3(0.5,-0.5,-0.5),
        vec3(0.5,-0.5,0.5),
        vec3(0.5,0.5,-0.5),
        vec3(0.5,0.5,0.5)    
    ];
    graph.vertex=[
        //1
        [6,7,5],
        [6,5,4],
        //2
        [2,3,7],
        [2,7,6],
        //3
        [4,0,6],
        [6,0,2],
        //4
        [4,5,0],
        [0,5,1],
        //5
        [5,1,7],
        [7,1,3],
        //6
        [2,0,1],
        [3,2,1]
    ];
    graph.colors=[
        vec4(1.0,1.0,1.0,1.0),
        vec4(1.0,1.0,0.0,1.0),
        vec4(1.0,0.0,1.0,1.0),
        vec4(1.0,0.0,0.0,1.0),
        vec4(0.0,1.0,1.0,1.0),
        vec4(0.0,1.0,0.0,1.0),
        vec4(0.0,0.0,1.0,1.0),
        vec4(0.0,0.0,0.0,1.0),
    ]
}

window.onload=function init(){
    this.main();
}

function projection(width, height, depth) {
    // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  }

  var m4 = {
    multiply: function(m1,m2){
        var ans=[
            0,0,0,0,
            0,0,0,0,
            0,0,0,0,
            0,0,0,0,
        ];
        for(var i=0;i<4;i++){
            var t=0;
            for(var j=0;j<4;j++){
                t+=m1[i]*m2[j];
            }
        }
    },
    translate: function(m, tx, ty, tz) {
        return mult(m, m4.translation(tx, ty, tz));
      },

    xRotate: function(m, angleInRadians) {
    return mult(m, m4.xRotation(angleInRadians));
    },
    
    yRotate: function(m, angleInRadians) {
    return mult(m, m4.yRotation(angleInRadians));
    },
    
    zRotate: function(m, angleInRadians) {
        console.log('ZR');
        console.log(m4.zRotation(angleInRadians));
    return mult(m, m4.zRotation(angleInRadians));
    },
    
    scale: function(m, sx, sy, sz) {
    return mult(m, m4.scaling(sx, sy, sz));
    },

    translation: function(tx, ty, tz) {
      return [
         1,  0,  0,  0,
         0,  1,  0,  0,
         0,  0,  1,  0,
         tx, ty, tz, 1,
      ];
    },
   
    xRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
   
      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },
   
    yRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
   
      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },
   
    zRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
        return [
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ];
    },
   
    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },
  };