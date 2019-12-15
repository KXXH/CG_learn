function main(){
    var canvas = document.getElementById("gl-canvas");
    var gl = canvas.getContext("webgl");
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
        a_normal:[0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,]
    };
    const attachments = [
        { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR },
        { format: gl.DEPTH_COMPONENT16 },
    ];
    
    
    var catBufferInfo=twgl.createBufferInfoFromArrays(gl,cat_array);
    var boardBufferInfo=twgl.createBufferInfoFromArrays(gl,board_array);
    var cat_uniforms={
        uLightPos:[-10,10,-100],
        uWorld:twgl.m4.identity(),
        uView:twgl.m4.identity(),
        uProjection:twgl.m4.identity(),
        uModel:twgl.m4.identity(),
        uMVPFromLight:twgl.m4.identity(),
        v_Color:[1,0.8,0,1]
    };
    var light_uniform={
        u_ShadowMap:0.0,
    }
    var board_uniform={
        uLightPos:[-10,10,-100],
        uWorld:twgl.m4.identity(),
        uView:twgl.m4.identity(),
        uProjection:twgl.m4.identity(),
        uModel:twgl.m4.identity(),
        uMVPFromLight:twgl.m4.identity(),
        v_Color:[1,1,1,1]
    };

    var shadow_uniform={
        uWorld:twgl.m4.identity(),
        uView:twgl.m4.identity(),
        uProjection:twgl.m4.identity(),
        uModel:twgl.m4.identity(),
    };
    board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
    cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
    const fbi = twgl.createFramebufferInfo(gl,attachments,512,512);
    const fbi2 = twgl.createFramebufferInfo(gl,attachments,canvas.width,canvas.height);
    //board_uniform.u_ShadowMap=cat_uniforms.u_ShadowMap=fbi.attachments[0];
    light_uniform.u_ShadowMap=fbi.attachments[0];
    gl.activeTexture(gl.TEXTURE0);
    twgl.setUniforms(light_uniform);
    gl.enable(gl.DEPTH_TEST);
    function render(){
        //绘制hit帧
        twgl.bindFramebufferInfo(gl,fbi2);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
        gl.useProgram(hit_programInfo.program );
        twgl.setUniforms(hit_programInfo,light_uniform);
        cat_uniforms.uView=twgl.m4.lookAt([0,0,-40],[10,10,20],[0,1,0]);
        cat_uniforms.uProjection=twgl.m4.perspective(90,1,0.1,1000);
        twgl.setBuffersAndAttributes(gl, hit_programInfo, catBufferInfo);
        twgl.setUniforms(hit_programInfo, cat_uniforms);
        
        twgl.drawBufferInfo(gl, catBufferInfo);

        twgl.setBuffersAndAttributes(gl,hit_programInfo,boardBufferInfo);
        board_uniform.uView=twgl.m4.lookAt([0,0,-40],[10,10,20],[0,1,0]);
        board_uniform.uProjection=twgl.m4.perspective(90,1,0.1,1000);
        board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
        twgl.setUniforms(hit_programInfo, board_uniform);
        twgl.drawBufferInfo(gl,boardBufferInfo);

        //绘制阴影
        twgl.bindFramebufferInfo(gl,fbi);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //twgl.bindFramebufferInfo(gl,null);
        gl.useProgram(shadow_programInfo.program);
        shadow_uniform.uView=twgl.m4.lookAt(cat_uniforms.uLightPos,[0,0,1000],[0,1,0]);

        shadow_uniform.uProjection=twgl.m4.perspective(70,1,1,1000);
        shadow_uniform.uWorld=cat_uniforms.uWorld;
        shadow_uniform.uModel=cat_uniforms.uModel;
        //cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
        twgl.setBuffersAndAttributes(gl, shadow_programInfo, catBufferInfo);
        
        twgl.setUniforms(shadow_programInfo,cat_uniforms);
        twgl.setUniforms(shadow_programInfo, shadow_uniform);
        twgl.drawBufferInfo(gl, catBufferInfo);
        shadow_uniform.uWorld=board_uniform.uWorld;
        twgl.setUniforms(programInfo, shadow_uniform);
        twgl.setBuffersAndAttributes(gl,programInfo,boardBufferInfo);
        twgl.drawBufferInfo(gl,boardBufferInfo);

        
        var tempMat=twgl.m4.multiply(twgl.m4.multiply(twgl.m4.multiply(shadow_uniform.uProjection,shadow_uniform.uView),shadow_uniform.uWorld),shadow_uniform.uModel);
        
        
        
       /*
        twgl.bindFramebufferInfo(gl,null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //twgl.bindFramebufferInfo(gl,null);
        gl.useProgram(programInfo.program);
        shadow_uniform.uView=twgl.m4.lookAt(cat_uniforms.uLightPos,[0,0,10],[0,1,0]);

        shadow_uniform.uProjection=twgl.m4.perspective(70,1,1,1000);
        cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
        shadow_uniform.uWorld=cat_uniforms.uWorld;
        shadow_uniform.uModel=cat_uniforms.uModel;
        shadow_uniform.v_Color=[1,0,0,1];
        twgl.setBuffersAndAttributes(gl, programInfo, catBufferInfo);
        twgl.setUniforms(programInfo, shadow_uniform);
        twgl.drawBufferInfo(gl, catBufferInfo);
        board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
        shadow_uniform.uWorld=board_uniform.uWorld;
        shadow_uniform.v_Color=[0,1,0,1];
        twgl.setUniforms(programInfo, shadow_uniform);
        twgl.setBuffersAndAttributes(gl,programInfo,boardBufferInfo);
        twgl.drawBufferInfo(gl,boardBufferInfo);
        //twgl.setBuffersAndAttributes(gl,shadow_programInfo,boardBufferInfo);
        //shadow_uniform.uMatrix=twgl.m4.multiply(twgl.m4.perspective(90,1,0.1,1000),twgl.m4.setTranslation(twgl.m4.identity(),[0,0,-100]));
        //shadow_uniform.uProjection=twgl.m4.perspective(90,1,0.1,1000);
        //shadow_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
        //twgl.setUniforms(shadow_programInfo, shadow_uniform);
        //twgl.drawBufferInfo(gl,boardBufferInfo);
        
        */
        
        //绘制可见帧
        twgl.bindFramebufferInfo(gl,null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programInfo.program);
        //twgl.bindFramebufferInfo(gl,fbi);
        light_uniform.u_ShadowMap=fbi.attachments[0];
        twgl.setUniforms(programInfo,light_uniform);
        //cat_uniforms.uWorld=twgl.m4.rotateY(cat_uniforms.uWorld,0.01);
        cat_uniforms.uView=twgl.m4.lookAt([0,0,-40],[10,10,20],[0,1,0]);
        cat_uniforms.uMVPFromLight=tempMat;
        cat_uniforms.uProjection=twgl.m4.perspective(90,1,0.1,1000);
        //cat_uniforms.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),center(mesh));
        twgl.setBuffersAndAttributes(gl, programInfo, catBufferInfo);
        twgl.setUniforms(programInfo, light_uniform);
        twgl.setUniforms(programInfo, cat_uniforms);
        
        twgl.drawBufferInfo(gl, catBufferInfo);

        twgl.setBuffersAndAttributes(gl,programInfo,boardBufferInfo);
        board_uniform.uView=twgl.m4.lookAt([0,0,-40],[10,10,20],[0,1,0]);
        board_uniform.uMVPFromLight=tempMat;
        //board_uniform.uMatrix=twgl.m4.multiply(twgl.m4.perspective(90,1,0.1,1000),twgl.m4.setTranslation(twgl.m4.identity(),[0,0,-100]));
        board_uniform.uProjection=twgl.m4.perspective(90,1,0.1,1000);
        board_uniform.uWorld=twgl.m4.setTranslation(twgl.m4.identity(),[0,0,50]);
        twgl.setUniforms(programInfo,light_uniform);
        twgl.setUniforms(programInfo, board_uniform);
        twgl.drawBufferInfo(gl,boardBufferInfo);
        
        requestAnimationFrame(render);
    }

    render();
}

window.onload=function init(){
    this.main();
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