"use strict";

var gl;
var points = [];

var MAX_DEPTH = 7;
//初始化函数
window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas"); //获取画布对象

    gl = WebGLUtils.setupWebGL(canvas); //获取webgl
    if(!gl) alert("WebGL 坏了");

    //初始化顶点

    var vertices = [
        vec2(-0.5, -0.5),
        vec2(0,0.366),
        vec2(0.5, -0.5)
    ];

    //初始化边集合
    var lines = [
        [vertices[0],vertices[1]],
        [vertices[1],vertices[2]],
        [vertices[2],vertices[0]]
    ]

    //this.console.log(vertices[2][1])
    
    //初始化点集合
    points.push(vertices[0]);
    koch(vertices[0],vertices[1],1,1);
    points.push(vertices[1]);
    koch(vertices[1],vertices[2],1,1);
    points.push(vertices[2]);
    koch(vertices[2],vertices[0],1,1);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_LOOP, 0, points.length );
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
    koch(p1, new_p, depth+1, -position);
    points.push(new_p);
    koch(new_p, p2, depth+1, -position);
    points.push(p2);
    koch(p2, end, depth+1, position);
}
