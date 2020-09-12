import * as THREE from 'three';

var main;
var content;
var container;
var camera, scene, renderer;
var uniforms;
var startTime;

const GRID_VERTEX =  `    	void main() {
        gl_Position = vec4(position, 1.0);
      }`;

const GRID_FRAGMENT = `	#define TWO_PI 6.28318530718
  uniform vec2 resolution;
  uniform float time;
  uniform float count;

  float random(float value){
    return fract(sin(value) * 43758.5453123);
  }

  vec2 random2D(vec2 uv){
    uv = vec2(dot(uv, vec2(127.1, 311.7)), dot(uv, vec2(269.5, 183.3)));
    //return -1.0 + 2.0 * fract(sin(uv) * 43758.5453123);
    return fract(sin(uv) * 43758.5453123); //return without offset on x, y
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    //use sin for loop animation
    float sinTime = sin(time * (TWO_PI * 0.5));

    //define res for creating square grid
    float res = resolution.x / resolution.y;

    //define colsrows
    float crCount = 12.5;
    vec2 colrow = vec2(crCount, crCount/ res);

    //get new grid
    vec2 nuv = uv * colrow;
    vec2 fuv = fract(nuv);
    vec2 iuv = floor(nuv);

    //Shuffle index at random values
    //vec2 riuv = random2D((iuv + vec2(1.0) + count) * count) - 0.05;
    vec2 riuv = random2D((iuv + vec2(1.0) + count) * count) - 0.05;
    riuv = clamp(riuv, vec2(0.0), vec2(1.0));

    //define color
    vec2 white = smoothstep(riuv, riuv+0.05, vec2(sinTime));

    gl_FragColor = vec4(vec3(white.x * white.y), 1.0);
  }`;

var canvasWidth;
var canvasHeight;
var resPoster = 841.0/594.0;
var minWidth = 450;
var minHeight = minWidth * resPoster;
var margin = 50;
var boucle = 1.0;
var bool = true;

function init() {
	//get contenaire


	//Create THREE.JS scene and timer
	startTime = Date.now();
	camera = new THREE.Camera();
	camera.position.z = 1;
	scene = new THREE.Scene();

	//create a simple plance
	var geometry = new THREE.PlaneBufferGeometry(16, 9);

	//create uniform table which provide all our GLSL binding
	uniforms = {
		time: { type: "f", value: 1 },
		count: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	//create THREE.JS material
	var material = new THREE.ShaderMaterial( {
	//set shaders and uniforms into material
		uniforms: uniforms,
		vertexShader: GRID_VERTEX,
		fragmentShader: GRID_FRAGMENT
	} );

	//create mesh, add it to the scene
	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	//create renderer and add it to the DOM
	renderer = new THREE.WebGLRenderer();
	document.getElementById('canvas').appendChild(renderer.domElement);

	//check window for resize This will give us the proper resolution values to bind
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize(event) {
	var mainHeight =  window.innerHeight - margin * 2.0;
	var mainWidth =  mainHeight / resPoster;
	var contentHeight = window.offsetHeight;
	var contentMargin = margin  * 0.25;
	var containerHeight =  mainHeight - (contentHeight + contentMargin);
	var containerMinHeight =  minHeight - (contentHeight + contentMargin);

	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	//send new size value to the shader and resize the window
	uniforms.resolution.value.x = canvasWidth;
	uniforms.resolution.value.y = canvasHeight;

	renderer.setSize(canvasWidth, canvasHeight);
}

function animate() {
	render();
	requestAnimationFrame(animate);
}

function render() {
	var currentTime = Date.now();
	var elaspedSeconds = (currentTime - startTime) / 1000.0;
	var maxTime = 7.5;
	var count = parseInt(elaspedSeconds % maxTime ^ Math.random());
	if(count == 0){
		if(bool == false){
			boucle ++;
			// boucle = Math.random();
			bool = true;
		}
	}else{
		bool = false;
	}


	var normTime = (elaspedSeconds % maxTime) / maxTime;
  var targetElement = document.getElementById('landing-main')

  if(normTime > .225) targetElement.style.color = 'black'
  if(normTime > .6) targetElement.style.color = 'white'

	uniforms.time.value = normTime;
	uniforms.count.value = boucle;

	renderer.render(scene, camera);
}

export function renderCanvas(){
	init();
	animate();
}
