import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';

let camera, scene, renderer;
let line, texture;

let offset = 0;

const dpr = window.devicePixelRatio;
const canvas = document.getElementById('canvas-background');

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let mouseX = 0, mouseY = 0;

const textureSize = 128 * dpr;
const vector = new THREE.Vector2();
const color = new THREE.Color();

init();
animate();

function init() {

	//

	const width = window.innerWidth;
	const height = window.innerHeight;

	camera = new THREE.PerspectiveCamera( 30, width / height, 1, 1000 );
	camera.position.z = 30;

	scene = new THREE.Scene();

	//

	const points = GeometryUtils.gosper( 8 );

	const geometry = new THREE.BufferGeometry();
	const positionAttribute = new THREE.Float32BufferAttribute( points, 3 );
	geometry.setAttribute( 'position', positionAttribute );
	geometry.center();

	const colorAttribute = new THREE.BufferAttribute( new Float32Array( positionAttribute.array.length ), 3 );
	colorAttribute.setUsage( THREE.DynamicDrawUsage );
	geometry.setAttribute( 'color', colorAttribute );

	const material = new THREE.LineBasicMaterial( { vertexColors: true, transparent: true, opacity: 0.1} );

	line = new THREE.Line( geometry, material );
	line.scale.setScalar( 0.18 );
	scene.add( line );

	//

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true, canvas:canvas} );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	//
	document.body.style.touchAction = 'none';
	document.body.addEventListener( 'pointermove', onPointerMove );
	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

}

function onPointerMove( event ) {

	if ( event.isPrimary === false ) return;
	
	mouseY = (event.clientY - windowHalfY)/100;
	mouseX = (event.clientX - windowHalfX)/100;

}

function animate() {

	requestAnimationFrame( animate );
	camera.position.x += ( 1- mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( mouseY - camera.position.y ) * 0.05;
	camera.lookAt(line.position);

	const colorAttribute = line.geometry.getAttribute( 'color' );
	updateColors( colorAttribute );

	// scene rendering

	renderer.clear();
	renderer.render( scene, camera );
	renderer.clearDepth();

}

function updateColors( colorAttribute ) {

	const l = colorAttribute.count;

	for ( let i = 0; i < l; i ++ ) {

		const h = ( ( offset + i ) % l ) / l;

		color.setHSL( h, 0.8, 0.2 );
		colorAttribute.setX( i, color.r );
		colorAttribute.setY( i, color.g );
		colorAttribute.setZ( i, color.b );

	}

	colorAttribute.needsUpdate = true;
	offset += 25;

}