
var $$ = mdui.JQ;

function d2r(deg){
  return Math.PI*deg/180
}

var cat_uniforms={
  //uLightPos:[-10,10,-100],
  uWorld:twgl.m4.identity(),
  uModel:twgl.m4.identity(),
  uMVPFromLight:twgl.m4.identity(),
  v_Color:[1,0.8,0,1],
  u_texture:undefined,
  u_ambient:[0.1,0.1,0.1,1],
  u_specular:[1,1,1,1],
  u_shininess:120,
  u_mirrorWeight:0
};
var light_uniform={
  uLightPos:[-10,10,-120],
  u_ShadowMap:0.0,
  u_lightColor:[1,1,1,1],
  texelSize:1024
}
var board_uniform={
  //uLightPos:[-10,10,-100],
  uWorld:twgl.m4.identity(),
  uModel:twgl.m4.identity(),
  uMVPFromLight:twgl.m4.identity(),
  v_Color:[1,1,1,1],
  u_texture:undefined,
  u_ambient:[0.2,0.2,0.2,1],//环境光
  u_specular:[1,1,1,1],//镜面反射
  u_shininess:120,
  u_mirrorWeight:0.2,
  u_mirrorTexture:0
};

var shadow_uniform={
  uWorld:twgl.m4.identity(),
  uView:twgl.m4.identity(),
  uProjection:twgl.m4.identity(),
  uModel:twgl.m4.identity(),
  uMat:twgl.m4.identity()
};

var camera_uniform={
  u_viewWorldPosition:[0,0,-50]
};

var view_uniforms={
  uView:twgl.m4.lookAt(camera_uniform.u_viewWorldPosition,[10,10,20],[0,1,0])
};

var projection_uniforms={
  uProjection:twgl.m4.perspective(d2r(90),1,0.1,1000)
}

var gl;
var mesh;
var canvas;
var fbi,fbi2,fbi3;
var hit_programInfo;
var catBufferInfo,boardBufferInfo;

var vectorX=[80,0,0];
var vectorY=[0,80,0];
var ratioX,ratioY;
var tex,tex2,tex3;
var invMat;

var mouseFlag=false;
var lastMousePosX,lastMousePosY;

function main(){
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    var programInfo = twgl.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);
    var shadow_programInfo=twgl.createProgramInfo(gl,["vertex-shader-shadow","fragment-shader-shadow"]);
    hit_programInfo=twgl.createProgramInfo(gl,["vertex-shader","hit-fragment-shader"]);
    var mirrorProgramInfo=twgl.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);
    var objStr = document.getElementById('cat.obj').innerHTML;
    mesh = new OBJ.Mesh(objStr);
    var cat_array={
        vPosition:mesh.vertices,
        a_normal:mesh.vertexNormals,
        indices:mesh.indices,
        a_texcoord:mesh.textures
    };

    var board_size=50;
    var board_array={
        vPosition: [- board_size, - board_size, 0,  board_size, - board_size, 0, - board_size,  board_size, 0, - board_size,  board_size, 0,  board_size, - board_size, 0,  board_size,  board_size, 0],
        a_normal:[0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,],
        a_texcoord:[0,0, 1,0, 0,1 ,1,0 ,0,1 ,0,0],
    };
    const attachments = [
        { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR },
        { format: gl.DEPTH_COMPONENT16 },
    ];
    
    
    catBufferInfo=twgl.createBufferInfoFromArrays(gl,cat_array);
    boardBufferInfo=twgl.createBufferInfoFromArrays(gl,board_array);


    tex=twgl.createTexture(gl,{
      min:gl.NEAREST,
      mag:gl.NEAREST,
      src:[
        255,255,255,255,
        192,192,192,255,
        192,192,192,255,
        255,255,255,255,
      ]
    });

    tex2=twgl.createTexture(gl,{
      min:gl.NEAREST,
      mag:gl.NEAREST,
      src:[
        200,149,106,255,
      ]
    });

    tex3=twgl.createTexture(gl,{
      min:gl.NEAREST,
      mag:gl.NEAREST,
      src:[
        220,187,160,255
      ]
    });

    board_uniform.u_texture=tex;
    cat_uniforms.u_texture=tex2;

    board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
    cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
    
    shadow_uniform.uProjection=twgl.m4.perspective(d2r(70),1,1,1000);
    fbi = twgl.createFramebufferInfo(gl,attachments,1024,1024);
    fbi2 = twgl.createFramebufferInfo(gl,attachments,canvas.width,canvas.height);
    fbi3 = twgl.createFramebufferInfo(gl,attachments,512,512);
    light_uniform.u_ShadowMap=fbi.attachments[0];
    board_uniform.u_mirrorTexture=fbi3.attachments[0];
    gl.activeTexture(gl.TEXTURE0);
    twgl.setUniforms(light_uniform);
    gl.activeTexture(gl.TEXTURE1);
    twgl.setUniforms(board_uniform);
    gl.enable(gl.DEPTH_TEST);
    var camera=[0,0,100];
    function render(){
        view_uniforms.uView=twgl.m4.inverse(twgl.m4.lookAt(camera_uniform.u_viewWorldPosition,[0,0,50],[0,1,0]));
      
        //绘制阴影
        twgl.bindFramebufferInfo(gl,fbi);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shadow_programInfo.program);
        shadow_uniform.uView=twgl.m4.inverse(twgl.m4.lookAt(light_uniform.uLightPos,[0,0,1000],[0,1,0]));

        var tempMat1=twgl.m4.multiply(twgl.m4.multiply(twgl.m4.multiply(shadow_uniform.uProjection,shadow_uniform.uView),cat_uniforms.uWorld),cat_uniforms.uModel);
        var tempMat2=twgl.m4.multiply(twgl.m4.multiply(twgl.m4.multiply(shadow_uniform.uProjection,shadow_uniform.uView),board_uniform.uWorld),board_uniform.uModel);

        shadow_uniform.uWorld=board_uniform.uWorld;
        shadow_uniform.uModel=board_uniform.uModel;
        shadow_uniform.uMat=tempMat2;
        twgl.setUniforms(shadow_programInfo, board_uniform);
        twgl.setUniforms(shadow_programInfo, shadow_uniform);
        twgl.setBuffersAndAttributes(gl,shadow_programInfo,boardBufferInfo);
        twgl.drawBufferInfo(gl,boardBufferInfo);

        
        shadow_uniform.uWorld=cat_uniforms.uWorld;
        shadow_uniform.uModel=cat_uniforms.uModel;
        shadow_uniform.uMat=tempMat1;
        twgl.setBuffersAndAttributes(gl, shadow_programInfo, catBufferInfo);
        twgl.setUniforms(shadow_programInfo,cat_uniforms);
        twgl.setUniforms(shadow_programInfo, shadow_uniform);
        twgl.drawBufferInfo(gl, catBufferInfo);
        
        var temp=twgl.m4.multiply(projection_uniforms.uProjection,view_uniforms.uView);
        //ratioX=(temp[0]+temp[12])/(temp[3]+temp[15])/2+0.5;
        //ratioY=(temp[5]+temp[13])/(temp[7]+temp[15])/2+0.5;
        ratioX=twgl.m4.transformPoint(temp,[1,0,50])[0]/2+0.5;
        ratioY=twgl.m4.transformPoint(temp,[0,1,50])[1]/2+0.5;
        //console.log(twgl.m4.transformPoint(temp,[1,1,50]))
        invMat=twgl.m4.inverse(temp);
        //if(temp[12]==0) console.log("等于0");
        //console.log(twgl.m4.transformDirection(temp,vectorX));
        //var tempMat=twgl.m4.multiply(twgl.m4.multiply(twgl.m4.multiply(shadow_uniform.uProjection,shadow_uniform.uView),shadow_uniform.uWorld),shadow_uniform.uModel);
        
        
        //绘制反射帧
        twgl.bindFramebufferInfo(gl,fbi3);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(mirrorProgramInfo.program);
        twgl.setUniforms(mirrorProgramInfo,light_uniform);
        cat_uniforms.uMVPFromLight=tempMat1;
        twgl.setBuffersAndAttributes(gl, mirrorProgramInfo, catBufferInfo);
        twgl.setUniforms(mirrorProgramInfo, light_uniform);
        twgl.setUniforms(mirrorProgramInfo, cat_uniforms);
        twgl.setUniforms(mirrorProgramInfo, projection_uniforms);
        twgl.setUniforms(mirrorProgramInfo, view_uniforms);

        //camera[0]+=0.01;
        //camera[2]+=0.05;
        camera=camera_uniform.u_viewWorldPosition.slice();
        camera[2]=50-camera[2];
        var view=twgl.m4.lookAt(camera,[0,0,50],[0,1,0]);
        var d={
          uView:twgl.m4.inverse(view),
          u_viewWorldPosition:camera,
          uLightPos:[-10,10,220],
        }
        //console.log(twgl.m4.multiply(projection_uniforms.uProjection,view));
        twgl.setUniforms(mirrorProgramInfo, d);
        twgl.drawBufferInfo(gl, catBufferInfo);


        //绘制可见帧
        twgl.bindFramebufferInfo(gl,null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);

        
        twgl.setUniforms(programInfo,light_uniform);
        
        cat_uniforms.uMVPFromLight=tempMat1;
        twgl.setBuffersAndAttributes(gl, programInfo, catBufferInfo);
        twgl.setUniforms(programInfo, light_uniform);
        twgl.setUniforms(programInfo, cat_uniforms);
        twgl.setUniforms(programInfo, projection_uniforms);
        twgl.setUniforms(programInfo, view_uniforms);
        twgl.drawBufferInfo(gl, catBufferInfo);
        
        twgl.setBuffersAndAttributes(gl,programInfo,boardBufferInfo);
        board_uniform.uMVPFromLight=tempMat2;
        twgl.setUniforms(programInfo,light_uniform);
        twgl.setUniforms(programInfo, board_uniform);
        twgl.setUniforms(programInfo, projection_uniforms);
        twgl.setUniforms(programInfo, view_uniforms);
        twgl.drawBufferInfo(gl,boardBufferInfo);
        

        /*
       twgl.bindFramebufferInfo(gl,null);
       gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
       gl.useProgram(programInfo.program);
       
       shadow_uniform.uView=twgl.m4.lookAt(cat_uniforms.uLightPos,[0,0,1000],[0,1,0]);
       
       shadow_uniform.uWorld=board_uniform.uWorld;
       shadow_uniform.uWorld=board_uniform.uModel;
       twgl.setUniforms(programInfo,board_uniform);
       twgl.setUniforms(programInfo, shadow_uniform);
       twgl.setBuffersAndAttributes(gl,programInfo,boardBufferInfo);
       twgl.drawBufferInfo(gl,boardBufferInfo);

      
       shadow_uniform.uWorld=cat_uniforms.uWorld;
       shadow_uniform.uModel=cat_uniforms.uModel;
       
       twgl.setBuffersAndAttributes(gl, programInfo, catBufferInfo);
       twgl.setUniforms(programInfo,cat_uniforms);
       twgl.setUniforms(programInfo, shadow_uniform);
       twgl.drawBufferInfo(gl, catBufferInfo);
       */
       requestAnimationFrame(render);
    }

    render();
}

window.onload=function init(){
    this.main();
    var range=document.getElementById("cameraAngle");
    range.onchange=function(e){
      console.log(e);
      changeCameraY(parseFloat(e.target.value));
    }
    var shinese=this.document.getElementById("shinese");
    shinese.onchange=function(e){
      changeShinese(parseFloat(e.target.value));
    }
    var lightPosZ=this.document.getElementById("lightPosZ");
    lightPosZ.onchange=function(e){
      changeLightPosZ(parseFloat(e.target.value));
    }
    var shadowSoft=this.document.getElementById("shadow");
    shadowSoft.onchange=function(e){
      changeShadow(e.target.value);
    }
    var mirror=this.document.getElementById("mirror");
    mirror.onchange=function(e){
      changeMirrorWeight(e.target.value);
    }
    canvas.onmousedown=function(e){
      var bbox = canvas.getBoundingClientRect();
      var x = event.clientX - bbox.left;
      var y = canvas.height- (event.clientY - bbox.top);
      console.log(x,y);
      twgl.bindFramebufferInfo(gl,fbi2);
      var readout=new Uint8Array(1*1*4);
      //绘制hit帧
      twgl.bindFramebufferInfo(gl,fbi2);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
      gl.useProgram(hit_programInfo.program );
      twgl.setUniforms(hit_programInfo,light_uniform);
      twgl.setBuffersAndAttributes(gl, hit_programInfo, catBufferInfo);
      twgl.setUniforms(hit_programInfo, cat_uniforms);
      twgl.setUniforms(hit_programInfo, projection_uniforms);
      twgl.setUniforms(hit_programInfo, view_uniforms);
      twgl.drawBufferInfo(gl, catBufferInfo);

      twgl.setBuffersAndAttributes(gl,hit_programInfo,boardBufferInfo);
      board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
      twgl.setUniforms(hit_programInfo, board_uniform);
      twgl.setUniforms(hit_programInfo, projection_uniforms);
      twgl.setUniforms(hit_programInfo, view_uniforms);
      twgl.drawBufferInfo(gl,boardBufferInfo);
      gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout);
      console.log(readout);
      if(is_cat(readout)){
        console.log("你点击了猫!");
        mouseFlag=true;
        lastMousePosX=x;
        lastMousePosY=y;
        cat_uniforms.u_texture=tex3;
      }
      twgl.bindFramebufferInfo(gl,null);
    }

    canvas.addEventListener("mousemove",function(event){
      if(!mouseFlag) return;
      var bbox = canvas.getBoundingClientRect();
      var x = event.clientX - bbox.left;
      var y = canvas.height- (event.clientY - bbox.top);
      //ratioY=((invMat[5]+invMat[13])/(invMat[7]+invMat[15]))/2;
      //ratioX=((invMat[0]+invMat[12])/(invMat[3]+invMat[15]))/2;
      var dx=x-lastMousePosX;
      var dy=y-lastMousePosY;
      var ratio_x=(x-lastMousePosX)/canvas.width;
      var ratio_y=(y-lastMousePosY)/canvas.height;
      console.log(x,y);
      lastMousePosX=x;
      lastMousePosY=y;
      /*
      var offset=twgl.v3.mulScalar(vectorX,-1*ratio_x/ratioX);
      changeCatLocationX(offset);
      offset=twgl.v3.mulScalar(vectorY,ratio_y/ratioY);
      changeCatLocationY(offset);
      */
      var offset=twgl.m4.transformPoint(invMat,[0,0,0]);
      offset=twgl.v3.subtract(twgl.m4.transformPoint(invMat,[dx,dy,0]),offset);
      //offset[2]=0;
      changeCatLocation(offset);
      console.log(ratioX,ratioY,offset);
    });

    this.canvas.addEventListener("mouseup",function(){
      if(mouseFlag) {
        mouseFlag=false;
        cat_uniforms.u_texture=tex2;
      }
    });
    var clearBtn=this.document.getElementById("clear");
    clearBtn.onclick=function(){clear();}
}

function is_cat(readout){
  return readout[1]==204;
}

function center(mesh) {
    var minX = Number.MAX_VALUE;
    var maxX = Number.MIN_VALUE;
    var minY = Number.MAX_VALUE;
    var maxY = Number.MIN_VALUE;
    var minZ = Number.MAX_VALUE;
    var maxZ = Number.MIN_VALUE;

    for (var i = 0; i < mesh.indices.length; i++) {
      var idx = mesh.indices[i];
      if (minX > parseFloat(mesh.vertices[idx * 3])) {
        minX = parseFloat(mesh.vertices[idx * 3]);
      } else if (maxX < parseFloat(mesh.vertices[idx * 3])) {
        maxX = parseFloat(mesh.vertices[idx * 3]);
      }
      if (minY > parseFloat(mesh.vertices[idx * 3 + 1])) {
        minY = parseFloat(mesh.vertices[idx * 3 + 1]);
      } else if (maxY < parseFloat(mesh.vertices[idx * 3 + 1])) {
        maxY = parseFloat(mesh.vertices[idx * 3 + 1]);
      }
      if (minZ > parseFloat(mesh.vertices[idx * 3 + 2])) {
        minZ = parseFloat(mesh.vertices[idx * 3 + 2]);
      } else if (maxZ < parseFloat(mesh.vertices[idx * 3 + 2])) {
        maxZ = parseFloat(mesh.vertices[idx * 3 + 2]);
      }
    }
    return [-(minX + maxX) / 2, -(minY + maxY) / 2, -(minZ + maxZ) / 2];
  }

function changeCameraY(theta){
  var rad=d2r(theta);
  camera_uniform.u_viewWorldPosition=[-50*Math.sin(rad),0,-50*Math.cos(rad)];
}

function changeShinese(shinese){
  board_uniform.u_shininess=shinese;
}

function changeLightPosZ(pos){
  light_uniform.uLightPos[2]=pos;
}

function changeCatLocationX(offset){
  //var temp=twgl.m4.multiply(projection_uniforms.uProjection,twgl.m4.multiply(view_uniforms.uView,twgl.m4.multiply(cat_uniforms.uWorld,cat_uniforms.uModel)));
  //ratioX=(temp[0]+temp[4]+temp[8])/temp[12];
  //console.log(temp);
  cat_uniforms.uWorld=twgl.m4.translate(cat_uniforms.uWorld,offset);
}

function changeCatLocationY(offset){
  cat_uniforms.uWorld=twgl.m4.translate(cat_uniforms.uWorld,offset);
}

function changeCatLocation(offset){
  cat_uniforms.uWorld=twgl.m4.translate(cat_uniforms.uWorld,offset);
}

function showInv(){
  console.log(invMat);
}

function changeShadow(shadow){
  light_uniform.texelSize=shadow;
}

function changeMirrorWeight(weight){
  board_uniform.u_mirrorWeight=weight;
}

function clear(){
  console.log('bbb');
  $$("#cameraAngle").val(0);
  changeCameraY(0);
  $$("#shinese").val(120);
  changeShinese(120);
  $$("#mirror").val(0.2);
  changeMirrorWeight(0.2);
  $$("#lightPosZ").val(-120);
  changeLightPosZ(-120);
  $$("#shadow").val(1024);
  changeShadow(1024);
  mdui.updateSliders();
}