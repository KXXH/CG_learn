"use strict";

var canvas;
var gl;

var MAX_DEPTH = 5;
var numTimesToSubdivide = 0; //原来值是5,Num修改为num
var points = []; //存放所生成的所有顶点的位置

var program;
var bufferId;
var colorbufferId;

var vertices = [
	vec2(-0.5, -0.289),
	vec2(0,0.577),
	vec2(0.5, -0.289)
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

var angle;
var XY;

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

	angle = new Vue({
		el:"#Rotation_Angle",
		data:{
			angle:theta,
			step:0.1
		},
		watch:{
			angle: function(){
				if(typeof(this.angle)==typeof('123')) this.angle=parseFloat(this.angle);
				gl.uniform1f(thetaLoc, angle.angle);
			},
			step: function(){
				if(typeof(this.step)==typeof('123')) this.step=parseFloat(this.step);
			}
		}
	});

	XY = new Vue({
		el:"#XY_input",
		data:{
			centerX:centerX,
			centerY:centerY
		},
		watch:{
			centerX: function(){
				if(typeof(this.centerX)==typeof('123')) this.centerX=parseFloat(this.centerX);
				gl.uniform1f(centerXLoc, this.centerX);
			},
			centerY: function(){
				if(typeof(this.centerY)==typeof('123')) this.centerY=parseFloat(this.centerY);
				gl.uniform1f(centerYLoc, this.centerY);
			}
		}
	});

    //====================================================
    //  Initialize our data for the Sierpinski Gasket
    //====================================================
	
    //divideTriangle( vertices[0], vertices[1], vertices[2],numTimesToSubdivide);


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
	     //centerX= -1 + 2*event.clientX/canvas.width;
	     //centerY= -1 + 2*(canvas.height-event.clientY)/canvas.height;
		 //centerchageflag=true;	 

		 /*为画布添加点击事件，从画布坐标到裁剪坐标计算同课本。
			注：canvas内坐标计算为
			X=(event.clientX - bbox.left) * (canvas.width/bbox.width)
			Y=(event.clientY - bbox.top) * (canvas.height/bbox.height)
			这里是将裁剪坐标下（0，0）点平移到点击位置，故在计算偏移量时是减去0。
			*/
	    var bbox = canvas.getBoundingClientRect();
		 XY.centerX=2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
		 XY.centerY=2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
  		 centerchageflag=true;
	});
		
	//*******动画启动/停止监听器 Initialize event handlers
    document.getElementById("Animation").onclick = function () {
        animflag = !animflag;
    };
	
	points = [];
	colorsOfVertexs=[];
	divideTriangle( vertices[0], vertices[1], vertices[2],4);
	sliderchangeflag=true;	
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
/*
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
*/
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );		
	//*******增加代码*********************************************************
	if(animflag)//如果旋转控制按钮由切换，需要发送旋转角度给shader
	{
		if(typeof(angle.angle)==typeof('123')) angle.angle=parseFloat(angle.angle);
		angle.angle += angle.step ;
				
	}; 	
    
	if(sliderchangeflag)//如果slider值有变化需要发送Gasket2D 新初始顶点属性数据给shader
	{	
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );		
		gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW );		
    }	
	
	/*
	if(centerchageflag)//如果鼠标重新点击了中心，需要把新中心传递给shader
	{
		gl.uniform1f(centerXLoc, centerX);
		gl.uniform1f(centerYLoc, centerY);
    }
	*/
	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );	
	//gl.drawArrays( gl.LINE_LOOP, 0, points.length );	
	gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length );
	sliderchangeflag=false;
	centerchageflag=false;
	//*******增加代码***********************************************************
	requestAnimFrame(render);    
}



function koch(start, end, depth, position){
    if(depth >= MAX_DEPTH) return;
    var p1 = mix(start, end,0.333333) //找到线段的1/3点
    var p2 = mix(start, end,0.666667) //找到线段的2/3点
    var dx = p1[0]-p2[0] //计算x1-x2
    var dy = p1[1]-p2[1] //计算y1-y2 
    var k;  //k表示斜率的符号
    if(Math.abs(dx)<=0.0001||Math.abs(dy)<=0.0001) k=0;
    else if(dx<0&&dy<0||dx>0&&dy>0) k=1;
    else k=-1;
    if(k<0){
        if(position>0){
            if(dy<0){
                dy=-dy;
                dx=-dx;
            }
        }else{
            if(dy>0){
                dy=-dy;
                dx=-dx;
            }
        }
    }else if(k>0){
        if(position>0){
            if(dy>0){
                dy=-dy;
                dx=-dx;
            }
        }else{
            if(dy<0){
                dy=-dy;
                dx=-dx;
            }
        }
    }else{
        if(position>0){
            if(dx<0){
                dx=-dx;
                dy=-dy;
            }
        }else{
            if(dx>0){
                dx=-dx;
                dy=-dy;
            }
        }
    }
    var new_x = 0.5*(p1[0]+p2[0]+1.73205*dy) //计算新的点的x坐标
    var new_y = 0.5*(p1[1]+p2[1]-1.73205*dx) //计算新的点的y坐标
    var new_p = [new_x, new_y] //构造新的点
        
	koch(start,p1, depth+1, position);
	points.push(p1);
	colorsOfVertexs.push(c1);
    koch(p1, new_p, depth+1, -position);
	points.push(new_p);
	colorsOfVertexs.push(c2);
    koch(new_p, p2, depth+1, -position);
	points.push(p2);
	colorsOfVertexs.push(c3);
    koch(p2, end, depth+1, position);
}

function crossproduct(a,b){
	return a[0]*b[1]-b[0]*a[1];
}

function divideTriangle( a, b, c, count)
{
	points.push(vec2(0,0));
	colorsOfVertexs.push(vec4( 0.0, 0.0, 0.0, 1.0 ));
	MAX_DEPTH = count;
	points.push(a);
	colorsOfVertexs.push(c1);
    koch(a,b,1,1);
	points.push(b);
	colorsOfVertexs.push(c2);
    koch(b,c,1,1);
	points.push(c);
	colorsOfVertexs.push(c3);
	koch(c,a,1,1);
	points.push(a);
	colorsOfVertexs.push(c1);
}

function check(a,b,c,p){
	return (b[0]-a[0])*(p[1]-a[1])>(b[1]-a[1])*(p[0]-a[0]) && (c[0]-b[0])*(p[1]-b[1])>(c[1]-b[1])*(p[0]-b[0]) && (a[0]-c[0])*(p[1]-c[1])>a[1]-c[1]*(p[0]-c[0])?false:true;
}