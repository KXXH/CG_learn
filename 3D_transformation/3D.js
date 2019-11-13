"use strict";
var canvas;
var gl;

var program;

var graph;

var positions=[
  [3,3],
  [3,-3],
  [3,0],
  [-3,0],
  [0,3],
  [0,-3],
  [-3,3],
  [-3,-3],
  //[0,0]
];

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
            uWorldLoc:0,
            u_fudgeFactorLoc:0,
            a_normalBuffer:0,
            a_normalBufferLoc:0,
            fudgeFactor:0,
            angleX:0,
            angleY:0,
            angleZ:0,
            tx:0,
            ty:0,
            tz:0,
            cameraX:0,
            cameraY:0,
            cameraZ:0,
            cameraTx:0,
            cameraTy:0,
            cameraTz:0,
            normals:[],
            u_reverseLightDirectionLoc:0,
            lightDirection:[],
            uLightPosLoc:0,
            lightPos:[],
    
        },
        watch:{
          
          /*
            points:function(){
                //redraw();
            },
            vertex:function(){
                //redraw();
            },
            angleX:function(){redraw();},
            angleY:function(){redraw();},
            angleZ:function(){redraw();},
            fudgeFactor:function(){redraw();},
            tx:function(){redraw();},
            ty:function(){redraw();},
            tz:function(){redraw();},
            cameraY:function(){redraw();},
            cameraX:function(){redraw();},
            cameraZ:function(){redraw();},
            cameraTx:function(){redraw();},
            cameraTy:function(){redraw();},
            cameraTz:function(){redraw();},
            */
        }
    });

    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );

    program=webglUtils.createProgramFromScripts(gl,["vertex-shader","fragment-shader"]);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
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

    graph.a_normalBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.a_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,0,gl.STATIC_DRAW);

    graph.a_normalBufferLoc=gl.getAttribLocation(program,"a_normal");
    gl.vertexAttribPointer(graph.a_normalBufferLoc,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(graph.a_normalBufferLoc);
    
    graph.uMatrixLoc = gl.getUniformLocation(program,"uMatrix");
    graph.uWorldLoc = gl.getUniformLocation(program,"uWorld");
    graph.u_fudgeFactorLoc = gl.getUniformLocation(program,"u_fudgeFactor");
    graph.u_reverseLightDirectionLoc = gl.getUniformLocation(program,"u_reverseLightDirection");
    graph.uLightPosLoc = gl.getUniformLocation(program,"uLightPos");
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
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    var points=[];
    var colors=[];
    var normals=[];
    for(var i=0;i<graph.vertex.length;i++){
        for(var j=0;j<graph.vertex[i].length;j++){
            points.push(graph.points[graph.vertex[i][j]]);
            colors.push(graph.colors[Math.floor(i/2)]);
            normals.push(graph.normals[Math.floor(i/2)]);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.vColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
      
    gl.bindBuffer(gl.ARRAY_BUFFER,graph.a_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(normals),gl.STATIC_DRAW);
    
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    /*
    var cameraMat = rotateY(graph.cameraY);
    cameraMat=mult(cameraMat,rotateX(graph.cameraX));
    cameraMat=mult(cameraMat,rotateZ(graph.cameraZ));
    cameraMat=mult(cameraMat,translate(graph.cameraTx,graph.cameraTy,graph.cameraTz));
    */
    var cameraMat = translate(graph.cameraTx,graph.cameraTy,graph.cameraTz);
    cameraMat=mult(cameraMat,rotateX(graph.cameraX));
    cameraMat=mult(cameraMat,rotateZ(graph.cameraZ));
    cameraMat=mult(cameraMat,rotateY(graph.cameraY));
    console.log('cameraMat');
    console.log(cameraMat);
    var cameraPos=vec3([cameraMat[0][3],cameraMat[1][3],cameraMat[2][3]]);
    var up=vec3([0,1,0]);
    var at=vec3([0,0,0]);
    var lkMat = lookAt(cameraPos,at,up);
    var viewMat=inverse4(cameraMat);
    
    //viewMat=inverse4(lkMat);
    console.log('viewMat');
    console.log(viewMat);
    
    //viewMat=cameraMat;
    for(var i=0;i<8;i++){
      var mat=ortho(-2,2,-2,2,-2,2);
      mat=mult(perspective(90,1,0.1,100),mat);
      mat = mult(mat,viewMat);
      var worldMat=translate(positions[i][0],positions[i][1],10);

      mat = mult(mat,translate(positions[i][0],positions[i][1],10));
      mat = mult(mat,translate(graph.tx,graph.ty,graph.tz));
      mat = mult(mat,rotateX(graph.angleX));
      mat = mult(mat,rotateY(graph.angleY));
      mat = mult(mat,rotateZ(graph.angleZ));

      worldMat = mult(worldMat,translate(positions[i][0],positions[i][1],10));
      worldMat = mult(worldMat,translate(graph.tx,graph.ty,graph.tz));
      worldMat = mult(worldMat,rotateX(graph.angleX));
      worldMat = mult(worldMat,rotateY(graph.angleY));
      worldMat = mult(worldMat,rotateZ(graph.angleZ));

      gl.uniform3fv(graph.uLightPosLoc,graph.lightPos);
      gl.uniformMatrix4fv(graph.uWorldLoc,false,flatten(worldMat));
      gl.uniformMatrix4fv(graph.uMatrixLoc,false,flatten(mat));
      gl.uniform1f(graph.u_fudgeFactorLoc,graph.fudgeFactor);
      gl.uniform4fv(graph.a_normalLoc,normals);
      gl.uniform3fv(graph.u_reverseLightDirectionLoc,graph.lightDirection);
      gl.drawArrays(gl.TRIANGLES,0,points.length);
    }
    requestAnimationFrame(redraw);
} 

function configPositionData(gl,graph){
    graph.normals=[
      vec3(1,0,0),
      vec3(0,1,0),
      vec3(0,0,-1),
      vec3(0,-1,0),
      vec3(0,0,1),
      vec3(-1,0,0)
    ];
    graph.points=[
        vec3(-1,-1,-1),//0
        vec3(-1,-1,1),//1
        vec3(-1,1,-1),//2
        vec3(-1,1,1),//3
        vec3(1,-1,-1),//4
        vec3(1,-1,1),//5
        vec3(1,1,-1),//6
        vec3(1,1,1)    //7
    ];
    graph.vertex=[
        //1
        [5,7,6],
        [4,5,6],
        //2
        [7,3,2],
        [6,7,2],
        //3
        [6,0,4],
        [2,0,6],
        //4
        [0,5,4],
        [1,5,0],
        //5
        [5,1,7],
        [7,1,3],
        //6
        [1,0,2],
        [1,2,3]
    ];
    graph.colors=[
        vec4(1.0,1.0,1.0,1.0),//白1
        vec4(1.0,1.0,0.0,1.0),//黄2
        vec4(1.0,0.0,1.0,1.0),//紫3
        vec4(1.0,0.0,0.0,1.0),//红4
        vec4(0.0,1.0,1.0,1.0),//青5
        vec4(0.0,1.0,0.0,1.0),//绿6
        vec4(0.0,0.0,1.0,1.0),//蓝7
        vec4(0.0,0.0,0.0,1.0),//黑8
    ];
    graph.lightDirection=normalize([-0.1,0.2,-0.5]);
    graph.lightPos=[0,0,10];
    
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