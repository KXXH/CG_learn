"use strict";

var canvas;
var gl;


var numTimesToSubdivide = 0; //原来值是5,Num修改为num
var points = []; //存放所生成的所有顶点的位置

var program;
var bufferId;
var colorbufferId;

var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
];
//=====add===========
var colorsOfVertexs=[]; //存放所生成的所有顶点的颜色
var c1,c2,c3;
	c1 = vec4( 1.0, 0.0, 0.0, 1.0 );
	c2 = vec4( 0.0, 1.0, 0.0, 1.0 );
	c3 = vec4( 0.0, 0.0, 1.0, 1.0 );


var theta = 0.0;
var thetaLoc;
var centerX=0.0;
var centerXLoc;
var centerY=0.0;
var centerYLoc;

var animflag=false;
var sliderchangeflag=false;
var centerchageflag=false;

//====add=============
window.onload = function init() 
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );


    //====================================================
    //  Initialize our data for the Sierpinski Gasket
    //====================================================
	
    divideTriangle( vertices[0], vertices[1], vertices[2],numTimesToSubdivide);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    	
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//*****************deliver colors attribue********************************
	colorbufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferId );	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	thetaLoc = gl.getUniformLocation( program, "theta" );
	centerXLoc = gl.getUniformLocation( program, "centerX" );
	centerYLoc = gl.getUniformLocation( program, "centerY" );
	
	render();
	
    //*******增加滑动条的监听程序,重新生成顶点，重新绘制
	document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
		points = [];
		colorsOfVertexs=[];
		divideTriangle( vertices[0], vertices[1], vertices[2],numTimesToSubdivide);
		sliderchangeflag=true;			
    };	

	
	//*********增加鼠标点击事件,移动坐标中心
	//canvas.addEventListener("click", function(event) {
	canvas.addEventListener("mousedown", function(event){
	     centerX= -1 + 2*event.clientX/canvas.width;
	     centerY= -1 + 2*(canvas.height-event.clientY)/canvas.height;
		 centerchageflag=true;	 

		 /*为画布添加点击事件，从画布坐标到裁剪坐标计算同课本。
			注：canvas内坐标计算为
			X=(event.clientX - bbox.left) * (canvas.width/bbox.width)
			Y=(event.clientY - bbox.top) * (canvas.height/bbox.height)
			这里是将裁剪坐标下（0，0）点平移到点击位置，故在计算偏移量时是减去0。
			*/
	    /* var bbox = canvas.getBoundingClientRect();
		 centerX=2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
		 centerY=2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
  		 centerchageflag=true;	 */
	});
		
	//*******动画启动/停止监听器 Initialize event handlers
    document.getElementById("Animation").onclick = function () {
        animflag = !animflag;
    };

};


function triangle( a, b, c )
{

    points.push( a, b, c );	
	//**************add color**************
	colorsOfVertexs.push(c1);
	colorsOfVertexs.push(c2);
	colorsOfVertexs.push(c3);
	//*************add color **************
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides找中点
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        count=count-1;        //count--;	
         		
        //three new triangles，递归调用
        divideTriangle( a, ab, ac, count );
		divideTriangle( ab,b, bc, count );
		divideTriangle( ac, bc, c, count );
        //divideTriangle( b, bc, ab, count );
		//divideTriangle( c, ac, bc, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );		
	//*******增加代码*********************************************************
	if(animflag)//如果旋转控制按钮由切换，需要发送旋转角度给shader
	{
		theta += 0.1 ;
		gl.uniform1f(thetaLoc, theta);		
	}; 	
    
	if(sliderchangeflag)//如果slider值有变化需要发送Gasket2D 新初始顶点属性数据给shader
	{	
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );		
		gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW );		
    }	
	
	if(centerchageflag)//如果鼠标重新点击了中心，需要把新中心传递给shader
	{
		gl.uniform1f(centerXLoc, centerX);
		gl.uniform1f(centerYLoc, centerY);
    }
	
	gl.drawArrays( gl.TRIANGLES, 0, points.length );	
	sliderchangeflag=false;
	centerchageflag=false;
	//*******增加代码***********************************************************
	requestAnimFrame(render);    
}



