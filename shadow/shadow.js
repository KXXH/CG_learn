
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
  u_ambient:[0,0,0,1],
  u_specular:[1,1,1,1],
  u_shininess:120
};
var light_uniform={
  uLightPos:[-10,10,-120],
  u_ShadowMap:0.0,
  u_lightColor:[1,1,1,1],
}
var board_uniform={
  //uLightPos:[-10,10,-100],
  uWorld:twgl.m4.identity(),
  uModel:twgl.m4.identity(),
  uMVPFromLight:twgl.m4.identity(),
  v_Color:[1,1,1,1],
  u_texture:undefined,
  u_ambient:[0,0,0,1],//环境光
  u_specular:[1,1,1,1],//镜面反射
  u_shininess:120
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

function main(){
    var canvas = document.getElementById("gl-canvas");
    canvas.onclick=function(e){
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
      twgl.setUniforms(programInfo, projection_uniforms);
      twgl.setUniforms(programInfo, view_uniforms);
      twgl.drawBufferInfo(gl,boardBufferInfo);
      gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout);
      console.log(readout);
      if(readout[1]==204){
        alert("你点击了猫!");
      }
      twgl.bindFramebufferInfo(gl,null);
    }
    gl = canvas.getContext("webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    var programInfo = twgl.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);
    var shadow_programInfo=twgl.createProgramInfo(gl,["vertex-shader-shadow","fragment-shader-shadow"]);
    var hit_programInfo=twgl.createProgramInfo(gl,["vertex-shader","hit-fragment-shader"]);

    var objStr = document.getElementById('cat.obj').innerHTML;
    var mesh = new OBJ.Mesh(objStr);
    var cat_array={
        vPosition:mesh.vertices,
        a_normal:mesh.vertexNormals,
        indices:mesh.indices
    };

    var board_array={
        vPosition: [-100, -100, 0, 100, -100, 0, -100, 100, 0, -100, 100, 0, 100, -100, 0, 100, 100, 0],
        a_normal:[0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,],
        a_texcoord:[0,0, 1,0, 0,1 ,1,0 ,0,1 ,0,0],
    };
    const attachments = [
        { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR },
        { format: gl.DEPTH_COMPONENT16 },
    ];
    
    
    var catBufferInfo=twgl.createBufferInfoFromArrays(gl,cat_array);
    var boardBufferInfo=twgl.createBufferInfoFromArrays(gl,board_array);


    var tex=twgl.createTexture(gl,{
      min:gl.NEAREST,
      mag:gl.NEAREST,
      src:[
        255,255,255,255,
        192,192,192,255,
        192,192,192,255,
        255,255,255,255,
      ]
    });

    var tex2=twgl.createTexture(gl,{
      min:gl.NEAREST,
      mag:gl.NEAREST,
      src:[
        200,149,106,255,
      ]
    });

    board_uniform.u_texture=tex;
    cat_uniforms.u_texture=tex2;

    board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
    cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
    
    shadow_uniform.uProjection=twgl.m4.perspective(d2r(70),1,1,1000);
    const fbi = twgl.createFramebufferInfo(gl,attachments,1024,1024);
    const fbi2 = twgl.createFramebufferInfo(gl,attachments,canvas.width,canvas.height);
    light_uniform.u_ShadowMap=fbi.attachments[0];
    gl.activeTexture(gl.TEXTURE0);
    twgl.setUniforms(light_uniform);
    gl.enable(gl.DEPTH_TEST);
    function render(){
        view_uniforms.uView=twgl.m4.lookAt(camera_uniform.u_viewWorldPosition,[0,0,50],[0,1,0]);
      
        //绘制阴影
        twgl.bindFramebufferInfo(gl,fbi);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shadow_programInfo.program);
        
        shadow_uniform.uView=twgl.m4.lookAt(light_uniform.uLightPos,[0,0,1000],[0,1,0]);

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
        
        //var tempMat=twgl.m4.multiply(twgl.m4.multiply(twgl.m4.multiply(shadow_uniform.uProjection,shadow_uniform.uView),shadow_uniform.uWorld),shadow_uniform.uModel);
        
        
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
      changeCamera(parseFloat(e.target.value));
    }
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

function changeCamera(theta){
  var rad=d2r(theta);
  camera_uniform.u_viewWorldPosition=[50*Math.sin(rad),0,-50*Math.cos(rad)];
}