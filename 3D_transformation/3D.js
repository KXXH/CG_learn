"use strict";
var canvas;
var gl;

var program;

var graph;

var positions=[
  [-100,-300],
  [3,-3],
  [3,0],
  [-3,0],
  [0,3],
  [0,-3],
  [-3,3],
  [-3,-3],
];

function main(){

  var objStr = document.getElementById('whale.obj').innerHTML;
  var mesh = new OBJ.Mesh(objStr);

    graph=new Vue({
        el:"#control_panel",
        data:{
            mesh:mesh,
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
            perspectiveSwitch:true,
            u_reverseLightDirectionLoc:0,
            lightDirection:[],
            uLightPosLoc:0,
            lightPos:[],
            scale:1,
            lkx:0,
            lky:0,
            lkz:0,
            canvas:document.getElementById("gl-canvas"),
            canvasChangeFlag:false,
            goSwitch:false,
            lookAtLock:false,
            cameraCTM:mat4(
              vec4(1,0,0,0),
              vec4(0,1,0,0),
              vec4(0,0,1,0),
              vec4(0,0,0,1)
            ),
            pointInfoChangeFlag:false,
            bias:[100,340,0],
            positions:[
              [0 ,0],
              [4,-4],
              [4,0],
              [-4,0],
              [0,4],
              [0,-4],
              [-4,4],
              [-4,-4],
            ],
            mouseDownFlag:false,
            trackMouseFlag:false,
            
        },
        methods:{
          onUp:function(){
            var t=rotateX(-this.cameraX);
            t=mult(t,rotateY(-this.cameraY));
            t=mult(t,rotateZ(-this.cameraZ));
            //t=scale(0.5,t);
            if(graph.goSwitch){
              this.cameraTz+=0.5*Math.cos(radians(this.cameraY))*Math.cos(radians(this.cameraX));
              this.cameraTy+=0.5*Math.sin(radians(this.cameraX));
              this.cameraTx+=0.5*Math.sin(radians(this.cameraY))*Math.cos(radians(this.cameraX));
            }
            else{
              this.cameraTz+=t[2][2];
              this.cameraTy+=t[2][1];
              this.cameraTx+=t[2][0];
              this.cameraCTM=mult(translate(t[2][0],t[2][1],t[2][2]),this.cameraCTM);
            }

          },
          onDown:function(){

            //this.cameraCTM=mult(translate(0,0,-1),this.cameraCTM);
            var t=rotateX(-this.cameraX);
            t=mult(t,rotateY(-this.cameraY));
            t=mult(t,rotateZ(-this.cameraZ));
            //t=scale(-0.5,t);
            if(graph.goSwitch){
              this.cameraTy-=0.5*Math.sin(radians(this.cameraX));
              this.cameraTz-=0.5*Math.cos(radians(this.cameraY))*Math.cos(radians(this.cameraX));
              this.cameraTx-=0.5*Math.sin(radians(this.cameraY))*Math.cos(radians(this.cameraX));
            }else{
              this.cameraTz-=t[2][2];
              this.cameraTy-=t[2][1];
              this.cameraTx-=t[2][0];
              this.cameraCTM=mult(translate(-t[2][0],-t[2][1],-t[2][2]),this.cameraCTM);
            }
            
            
          },
          onLeft:function(){
            //this.cameraCTM=mult(translate(-1,0,0),this.cameraCTM);
            var t=rotateX(-this.cameraX);
            t=mult(t,rotateY(-this.cameraY));
            t=mult(t,rotateZ(-this.cameraZ));
            if(graph.goSwitch){
              this.cameraTx-=0.5*Math.cos(radians(this.cameraZ))*Math.cos(radians(this.cameraY));
              this.cameraTy-=0.5*Math.sin(radians(this.cameraZ));
              this.cameraTz+=0.5*Math.cos(radians(this.cameraZ))*Math.sin(radians(this.cameraY));
            }else{
              this.cameraTz-=t[0][2];
              this.cameraTy-=t[0][1];
              this.cameraTx-=t[0][0];
              this.cameraCTM=mult(translate(-t[0][0],-t[0][1],-t[0][2]),this.cameraCTM);
            }
            

          },
          onRight:function(){
            //this.cameraCTM=mult(translate(1,0,0),this.cameraCTM);
            var t=rotateX(-this.cameraX);
            t=mult(t,rotateY(-this.cameraY));
            t=mult(t,rotateZ(-this.cameraZ));
            if(graph.goSwitch){
              this.cameraTx+=0.5*Math.cos(radians(this.cameraZ))*Math.cos(radians(this.cameraY));
              this.cameraTy+=0.5*Math.sin(radians(this.cameraZ));
              this.cameraTz-=0.5*Math.cos(radians(this.cameraZ))*Math.sin(radians(this.cameraY));
            }else{
              this.cameraTz+=t[0][2];
              this.cameraTy+=t[0][1];
              this.cameraTx+=t[0][0];
              this.cameraCTM=mult(translate(t[0][0],t[0][1],t[0][2]),this.cameraCTM);
            }
          },
          resizeCanvas:function(width,height){
            this.canvas.width=width;
            this.canvas.height=height;
            this.canvasChangeFlag=true;
            resize(graph.canvas);
            //gl.viewport( 0, 0, graph.canvas.width, graph.canvas.height );
          }

        }
        ,
        created:function(){
          document.onkeydown=function(e){
            let key = window.event.keyCode;
            console.log(key);
            switch(key){
              case 38:case 87:graph.onUp();break;
              case 40:case 83:graph.onDown();break;
              case 37:case 65:graph.onLeft();break;
              case 39:case 68:graph.onRight();break;
              case 81:graph.cameraY-=0.5;graph.cameraCTM=mult(rotateY(-0.5),graph.cameraCTM);break;
              case 69:graph.cameraY+=0.5;graph.cameraCTM=mult(rotateY(0.5),graph.cameraCTM);break;
            }
          };
        },
        watch:{
          lightPos:function(){
            gl.uniform3fv(this.uLightPosLoc,this.lightPos);
          },
          lookAtLock:function(newValue){
            if(newValue){
              this.cameraX=this.cameraY=this.cameraZ=0;
            }
          },
        },
        computed:{
          cameraMat:function(){
            
            var cameraMat = translate(this.cameraTx,this.cameraTy,this.cameraTz);
            cameraMat=mult(cameraMat,rotateX(this.cameraX));
            cameraMat=mult(cameraMat,rotateZ(this.cameraZ));
            cameraMat=mult(cameraMat,rotateY(this.cameraY));            
            return cameraMat;
          },
          viewMat:function(){
            var cameraPos=vec3([this.cameraMat[0][3],this.cameraMat[1][3],this.cameraMat[2][3]]);
            //cameraPos=[graph.cameraTx,graph.cameraTy,graph.cameraTz];
            var up=vec3([0,1,0]);
            var at=vec3([graph.lkx,graph.lky,graph.lkz]);
            var lkMat = lookAt(cameraPos,at,up);
            console.log('lookAt');
            console.log(lkMat);
            
            var viewMat=inverse4(this.cameraMat);
            
            //viewMat=inverse4(lkMat);
            
            if(graph.lookAtLock) viewMat=lkMat;

            return viewMat;
          },
          pointsCount:function(){
            var c=0;
            for(var i=0;i<graph.vertex.length;i++){
              c+=graph.vertex[i].length;
            }
            return c;
          },
          worldMat:function(){
            var ans=[];
            for(var i=0;i<this.positions.length;i++){
              var worldMat=translate(this.positions[i][0],this.positions[i][1],100);
              worldMat = mult(worldMat,translate(this.tx,this.ty,this.tz));
              worldMat = mult(worldMat,rotateX(this.angleX));
              worldMat = mult(worldMat,rotateY(this.angleY));
              worldMat = mult(worldMat,rotateZ(this.angleZ));
              worldMat = mult(worldMat,scalem(this.scale,this.scale,this.scale));
              worldMat = mult(worldMat,translate(-this.center[0],-this.center[1],-this.center[2]));
              ans.push(worldMat);
            }
            return ans;
          },
          projectionMat:function(){
            var projectionMat=ortho(-1,1,-1,1,-1,1);
            var ratio=this.canvas.width/this.canvas.height;
            if(this.canvasChangeFlag) this.canvasChangeFlag=false;
            if(this.perspectiveSwitch){
              //projectionMat=ortho(-100,100,-100,100,0,300);
              projectionMat=mult(perspective(90,ratio,0.1,1000),projectionMat);
            }
            else{
              projectionMat=ortho(-100,100,-100,100,-300,300);
            }
              
            return projectionMat;
          },
          worldMatIT:function(){
            var ans=[];
            for(var i=0;i<this.worldMat.length;i++){
              var worldMat=translate(this.positions[i][0],this.positions[i][1],10);
              worldMat = mult(worldMat,translate(this.tx,this.ty,this.tz));
              worldMat = mult(worldMat,rotateX(this.angleX));
              worldMat = mult(worldMat,rotateY(this.angleY));
              worldMat = mult(worldMat,rotateZ(this.angleZ));
              worldMat = mult(worldMat,scalem(this.scale,this.scale,this.scale));
              worldMat = mult(worldMat,translate(-this.center[0],-this.center[1],-this.center[2]));
              var inv=inverse4(worldMat);
              var trans=transpose(inv);
              ans.push(trans);
            }
            return ans;
          },
          mat:function(){
            var ans=[];
            for(var i=0;i<this.worldMat.length;i++){
              var projectionMat=this.projectionMat;
              var mat = mult(projectionMat,graph.viewMat);
              var worldMat=this.worldMat[i];

              mat = mult(mat,worldMat);
              ans.push(mat);
            }
            return ans;
          },
          center:function(){
            var minX=Number.MAX_VALUE;
            var maxX=Number.MIN_VALUE;
            var minY=Number.MAX_VALUE;
            var maxY=Number.MIN_VALUE;
            var minZ=Number.MAX_VALUE;
            var maxZ=Number.MIN_VALUE;
            
            for(var i=0;i<this.mesh.indices.length;i++){
              var idx=this.mesh.indices[i];
              if(minX>parseFloat(this.mesh.vertices[idx*3])){
                minX=parseFloat(this.mesh.vertices[idx*3]);
              }else if(maxX<parseFloat(this.mesh.vertices[idx*3])){
                maxX=parseFloat(this.mesh.vertices[idx*3]);
              }
              if(minY>parseFloat(this.mesh.vertices[idx*3+1])){
                minY=parseFloat(this.mesh.vertices[idx*3+1]);
              }else if(maxY<parseFloat(this.mesh.vertices[idx*3+1])){
                maxY=parseFloat(this.mesh.vertices[idx*3+1]);
              }
              if(minZ>parseFloat(this.mesh.vertices[idx*3+2])){
                minZ=parseFloat(this.mesh.vertices[idx*3+2]);
              }else if(maxZ<parseFloat(this.mesh.vertices[idx*3+2])){
                maxZ=parseFloat(this.mesh.vertices[idx*3+2]);
              }
            }
            return [(minX+maxX)/2,(minY+maxY)/2,(minZ+maxZ)/2];
          }
        }
    });

    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );

    program=initShaders( gl, "vertex-shader", "fragment-shader" );;

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
}

function redraw(){
    resize(graph.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    //gl.viewport( 0, 0, graph.canvas.width, graph.canvas.height );
    if(graph.canvas.height>graph.canvas.width){
      gl.viewport( 0, graph.canvas.height/2-graph.canvas.width/2, graph.canvas.width,  graph.canvas.width);
    }else{
      gl.viewport(  graph.canvas.width/2-graph.canvas.height/2, 0, graph.canvas.height, graph.canvas.height);
    }
    gl.viewport( 0, 0, graph.canvas.width, graph.canvas.height );
    if(graph.pointInfoChangeFlag){
      var points=[];
      var new_points=[];
      var colors=[];
      var normals=[];
      /*
      for(var i=0;i<graph.vertex.length;i++){
          for(var j=0;j<graph.vertex[i].length;j++){
              points.push(graph.points[graph.vertex[i][j]]);
              colors.push(graph.colors[Math.floor(i/2)]);
              normals.push(graph.normals[Math.floor(i/2)]);
          }
      }
      */
     const NUM_COMPONENTS_FOR_VERTS = 3;
      for(var i=0;i<graph.mesh.indices.length;i++){
        var elemIdx=graph.mesh.indices[i];
        var xyz=[];
        for(var j=0;j<NUM_COMPONENTS_FOR_VERTS;j++){
          xyz.push(parseFloat(graph.mesh.vertices[(elemIdx*NUM_COMPONENTS_FOR_VERTS)+j]));
          points.push(parseFloat(graph.mesh.vertices[(elemIdx*NUM_COMPONENTS_FOR_VERTS)+j]));
          normals.push(parseFloat(graph.mesh.vertexNormals[(elemIdx*NUM_COMPONENTS_FOR_VERTS)+j]));
        }
        xyz.push(1);
        var mat=mult(graph.mat[0],xyz);
        colors.push(vec4(1,0.5,0.0,1));
      }
      console.log(new_points);
      gl.bindBuffer(gl.ARRAY_BUFFER,graph.vPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER,graph.vColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
        
      gl.bindBuffer(gl.ARRAY_BUFFER,graph.a_normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,flatten(normals),gl.STATIC_DRAW);

      
      graph.pointInfoChangeFlag=false;
    }
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    for(var i=0;i<8;i++){
      gl.uniformMatrix4fv(graph.uWorldLoc,false,flatten(graph.worldMatIT[i]));
      gl.uniformMatrix4fv(graph.uMatrixLoc,false,flatten(graph.mat[i]));
      gl.drawArrays(gl.TRIANGLES,0,graph.mesh.indices.length);
      break;
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
    graph.lightPos=[10,10,-10];
    graph.pointInfoChangeFlag=true;
}

window.onload=function init(){
    this.main();
    document.getElementById('resizeBtn').onmousedown=function(e){
      graph.mouseDownFlag=true;
    }
    
    document.getElementById('resizeBtn').onmouseup=function(e){
      graph.mouseDownFlag=false;
    }
    
    document.getElementById('resizeBtn').onmouseleave=function(e){
      graph.mouseDownFlag=false;
    }

    document.getElementById('resizeBtn').onmousemove=function(e){
      if(graph.mouseDownFlag){
        if((graph.canvas.height+e.movementY)/(graph.canvas.width+e.movementX)>=1.5){
          if(e.movementX<0)
            graph.resizeCanvas(graph.canvas.width,graph.canvas.height+e.movementY);
          else if(e.movementY>0)
          graph.resizeCanvas(graph.canvas.width+e.movementX,graph.canvas.height);
        }else
          graph.resizeCanvas(graph.canvas.width+e.movementX,graph.canvas.height+e.movementY);
        document.getElementById("resizeBtn").style.marginRight=(600-graph.canvas.width)+"px";
      }
    }

    this.document.getElementById('gl-canvas').onmousedown=function(e){
      var bbox = graph.canvas.getBoundingClientRect();
		  var x = 2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
		  var y = 2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
    }
}

function resize(canvas) {
  // 获取浏览器中画布的显示尺寸
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  // 检尺寸是否相同
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // 设置为相同的尺寸
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

