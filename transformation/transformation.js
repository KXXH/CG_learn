"use strict";

var canvas;
var gl;

var MAX_DEPTH = 5;
var numTimesToSubdivide = 0; //原来值是5,Num修改为num
var points = []; //存放所生成的所有顶点的位置
var axis = [vec2(-1,0),vec2(1,0),vec2(0,-1),vec2(0,1)];
var program;
var axis_program;
var bufferId;
var colorbufferId;
var WHITE = {R:255,G:255,B:255};
var BLACK = {R:0,G:0,B:0};
var vertices = [
	vec2(-0.5, -0.289),
	vec2(0,0.577),
	vec2(0.5, -0.289)
];
//var new_points;
//=====add===========
var colorsOfVertexs=[]; //存放所生成的所有顶点的颜色
var c1,c2,c3;
	c1 = vec4( 1.0, 0.0, 0.0, 1.0 );
	c2 = vec4( 0.0, 1.0, 0.0, 1.0 );
	c3 = vec4( 0.0, 0.0, 1.0, 1.0 );
var vPosition; 
var axis_bufferId;
var theta = 0.0;
var thetaLoc;
var centerX=0.0;
var centerXLoc;
var centerY=0.0;
var centerYLoc;
var TxLoc;
var TyLoc;
var SxLoc;
var SyLoc;
var ShxLoc;
var ShyLoc;
var FxLoc;
var FyLoc;
var colorLoc;
var animflag=false;
var sliderchangeflag=false;
var centerchageflag=false;

var angle;
var XY;

var mouseFlag=false;

var graph;
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
	
    //divideTriangle( vertices[0], vertices[1], vertices[2],numTimesToSubdivide);


    //  Load shaders and initialize attribute buffers
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	axis_program = initShaders(gl,"vertex-shader-axis", "fragment-shader-axis" );
	
	//第一步，设置坐标轴
	gl.useProgram(axis_program);
	axis_bufferId = gl.createBuffer();
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, axis_bufferId)
	gl.bufferData(gl.ARRAY_BUFFER,flatten(axis),gl.STATIC_DRAW);
	
	var axis_loc = gl.getAttribLocation(axis_program,"vPosition");
	gl.vertexAttribPointer( axis_loc, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( axis_loc );
	
	gl.drawArrays(gl.LINES,0,axis.length);

	
	this.gl.useProgram(this.program);
	bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	thetaLoc = gl.getUniformLocation( program, "theta" );
	centerXLoc = gl.getUniformLocation( program, "centerX" );
	centerYLoc = gl.getUniformLocation( program, "centerY" );
	TxLoc = gl.getUniformLocation( program, "Tx" );
	TyLoc = gl.getUniformLocation( program, "Ty" );
	SxLoc = gl.getUniformLocation( program, "Sx" );
	SyLoc = gl.getUniformLocation( program, "Sy" );
	ShxLoc = gl.getUniformLocation( program, "Shx" );
	ShyLoc = gl.getUniformLocation( program, "Shy" );
	FxLoc = gl.getUniformLocation( program, "Fx" );
	FyLoc = gl.getUniformLocation( program, "Fy" );
	colorLoc = gl.getUniformLocation( program, "uColor" );
	gl.uniform1f(FxLoc,1);
	gl.uniform1f(FyLoc,1);
	gl.uniform1f(SxLoc,1);
	gl.uniform1f(SyLoc,1);

	graph = new Vue({
		el:"#control_panel",
		data:{
			Tx:0,
			Ty:0,
			Sx:1,
			Sy:1,
			Fx:false,
			Fy:false,
			theta:0,
			Shx:0,
			Shy:0,
			points:[],
			tweenedTheta:0,
			tweenedTx:0,
			tweenedTy:0,
			tweenedSx:1,
			tweenedSy:1,
			tweenedShx:0,
			tweenedShy:0,
			tweenedFx:1,
			tweenedFy:1,
			color:{R:255,G:255,B:255},
			tweenedColor:{R:255,G:255,B:255},
			R:255,
			G:255,
			B:255,
			pointsChangeFlag:false,
		},
		watch:{
			points: function(){
				this.pointsChangeFlag=true;
			},
			Tx: function(newValue){
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedTx:newValue},500).start();
			},
			Ty: function(newValue){
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedTy:newValue},500).start();
				
			},
			Sx: function(newValue){
				new TWEEN.Tween(this)
					.easing(TWEEN.Easing.Quadratic.InOut)
					.to({tweenedSx:newValue},500)
					.start();
				
			},
			Sy: function(newValue){
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedSy:newValue},500).start();
			},
			Fx: function(){
				var newValue=(this.Fx?-1:1);
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedFx:newValue},500).start();
			},
			Fy: function(){
				var newValue=(this.Fy?-1:1);
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedFy:newValue},500).start();
			},
			theta: function(newValue){
				var tween = new TWEEN.Tween(this);
				tween.to({tweenedTheta:newValue},500).easing(TWEEN.Easing.Quadratic.InOut);
				tween.onUpdate(function(){
					console.log('update!');
				});
				tween.start();
			},
			tweenedTheta: function(){
				gl.useProgram(program);
				gl.uniform1f(thetaLoc,this.tweenedTheta);
			},
			tweenedTx: function(){
				gl.useProgram(program);
				gl.uniform1f(TxLoc,this.tweenedTx);
			},
			tweenedTy: function(){
				gl.useProgram(program);
				gl.uniform1f(TyLoc,this.tweenedTy);
			},
			tweenedSx: function(){
				gl.useProgram(program);
				gl.uniform1f(SxLoc,this.tweenedSx);
			},
			tweenedSy: function(){
				gl.useProgram(program);
				gl.uniform1f(SyLoc,this.tweenedSy);
			},
			tweenedShx: function(){
				gl.useProgram(program);
				gl.uniform1f(ShxLoc,this.tweenedShx);
			},
			tweenedShy: function(){
				gl.useProgram(program);
				gl.uniform1f(ShyLoc,this.tweenedShy);
			},
			tweenedFx: function(){
				gl.useProgram(program);
				gl.uniform1f(FxLoc,this.tweenedFx);
			},
			tweenedFy: function(){
				gl.useProgram(program);
				gl.uniform1f(FyLoc,this.tweenedFy);
			},
			Shx: function(newValue){
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedShx:newValue},500).start();
				
			},
			Shy:function(newValue){
				new TWEEN.Tween(this).easing(TWEEN.Easing.Quadratic.InOut).to({tweenedShy:newValue},500).start();
				
			},
			color:function(newValue){
				new TWEEN.Tween(this).to(newValue,200).start();
				//new TWEEN.Tween(this).to({R:newValue.R},200).start();
				console.log('changed!');
			},
			tweenedColor:function(){
				gl.useProgram(program);
				gl.uniform4f(colorLoc,this.tweenedColor.R/255,this.tweenedColor.G/255,this.tweenedColor.B/255,1);
				console.log('send!');
				console.log(this.tweenedColor.R/255);
			},
			R: function(){
				gl.useProgram(program);
				gl.uniform4f(colorLoc,this.R/255,this.G/255,this.B/255,1);
			},
			G: function(){
				gl.useProgram(program);
				gl.uniform4f(colorLoc,this.R/255,this.G/255,this.B/255,1);
			},
			B:function(){
				gl.useProgram(program);
				gl.uniform4f(colorLoc,this.R/255,this.G/255,this.B/255,1);
			},

		}
	});

	canvas.addEventListener("mousedown", function(event){
		mouseFlag=true;
		graph.points=[];
		var bbox = canvas.getBoundingClientRect();
		var x = 2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
		var y = 2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
		graph.points.push(vec2(x,y));
	});

	canvas.addEventListener("mouseup",function(){
		mouseFlag=false;
	});
	canvas.addEventListener("mouseleave",function(){mouseFlag=false;});
	canvas.addEventListener("mousemove",function(event){
		if(mouseFlag){
			var bbox = canvas.getBoundingClientRect();
			var x = 2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
			var y = 2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
			graph.points.push(vec2(x,y));
			graph.points.push(vec2(x,y));
		}
	});
	this.drawGraph();
};


//把折线段转换成线段，并加入坐标轴
function convertPoints(line_points){
	var target_points=[];
	for(var i=0;i<line_points.length-1;i++){
		target_points.push(line_points[i]);
		target_points.push(line_points[i+1]);
	}
	target_points.push(line_points[line_points.length-1]);
	target_points.push(line_points[0]);
	return target_points;
}

function drawGraph(){
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);  
	if(graph.pointsChangeFlag==true){
		gl.bufferData(gl.ARRAY_BUFFER,flatten(graph.points),gl.STATIC_DRAW);
		graph.pointsChangeFlag=false;
	}
		
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	gl.drawArrays(gl.LINES,0,graph.points.length);



	drawAxis();
	TWEEN.update();
	requestAnimationFrame(drawGraph);

}

function drawAxis(){
	gl.useProgram(axis_program);
	//gl.clear( gl.COLOR_BUFFER_BIT );  
	gl.bindBuffer(gl.ARRAY_BUFFER,axis_bufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(axis),gl.STATIC_DRAW);
	var axis_loc = gl.getAttribLocation(axis_program,"vPosition");
	gl.vertexAttribPointer( axis_loc, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( axis_loc );
	gl.drawArrays(gl.LINES,0,axis.length);
}

function addSquare(){
	var new_points=[
		vec2(0.5,0.5),
		vec2(-0.5,0.5),
		vec2(-0.5,-0.5),
		vec2(0.5,-0.5)
	];
	new TWEEN.Tween(graph)
		.to(BLACK,200)
		.onComplete(
			function(){
				graph.points = convertPoints(new_points);
			})
		.chain(
			new TWEEN.Tween(graph)
				.to(WHITE,200)
		).start();

}

function addTriangle(){
	var new_points=[
		vec2(0,0.5),
		vec2(-0.5,-0.25),
		vec2(0.5,-0.25)
	];
	new TWEEN.Tween(graph)
	.to(BLACK,200)
	.onComplete(
		function(){
			graph.points = convertPoints(new_points);
		})
	.chain(
		new TWEEN.Tween(graph)
			.to(WHITE,200)
	).start();
}

function addX(){
	
	new TWEEN.Tween(graph)
	.to(BLACK,200)
	.onComplete(
		function(){
			graph.points=[
				vec2(0.5,0.5),vec2(-0.5,-0.5),
				vec2(-0.5,0.5),vec2(0.5,-0.5)
			];
		})
	.chain(
		new TWEEN.Tween(graph)
			.to(WHITE,200)
	).start();
}

function addCircle(){
	var new_points=[];
	for(var theta=0;theta<2*Math.PI;theta+=0.1){
		new_points.push(vec2(0.5*Math.cos(theta),0.5*Math.sin(theta)));
	}
	//graph.points=convertPoints(new_points);
	new TWEEN.Tween(graph)
	.to(BLACK,200)
	.onComplete(
		function(){
			graph.points = convertPoints(new_points);
		})
	.chain(
		new TWEEN.Tween(graph)
			.to(WHITE,200)
	).start();
}

function clearGraph(){
	graph.points=[];
	graph.Tx=graph.Ty=graph.theta=graph.Shx=graph.Shy=0;
	graph.Sx=graph.Sy=1;
	graph.Fx=graph.Fy=false;
}

function toggleAxis(){
	if(axis.length>0){
		axis=[];
	}else{
		axis=[vec2(-1,0),vec2(1,0),vec2(0,-1),vec2(0,1)];
	}
}