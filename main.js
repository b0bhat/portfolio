import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

let renderer, scene, camera;
let stats, meshKnot;
const container = document.getElementById('canvas-container');
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let fish;

var rectlights = [],
	rectlighthelpers = [];

const loader = new GLTFLoader();

init();

function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( container.clientWidth, container.clientHeight );
	renderer.setAnimationLoop( animation );
	container.appendChild( renderer.domElement );
	renderer.setClearColor( 0xffffff, 0);

	camera = new THREE.PerspectiveCamera( 30, container.clientWidth / container.clientHeight, 1, 1000 );
	camera.position.set( 0, 5, -30 );

	scene = new THREE.Scene();

	RectAreaLightUniformsLib.init();

	let lights = [0x00cfde, 0x00d0ff, 0x42baff, 0x548dff, 0x6540de]
	for (var i = 0; i < 5; i++) {
		const rectLight = new THREE.RectAreaLight( lights[i], 5, 4, 10 );
		rectLight.position.set( -10 + i*5, 5, 5 );
		rectlights[i] = rectLight;
		rectlighthelpers[i] = new RectAreaLightHelper( rectLight );
		scene.add( rectlights[i] );
		scene.add( rectlighthelpers[i] );
	}

	const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 2000 );
	const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0.2, metalness: 0 } );
	const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
	mshStdFloor.position.set(0, 11, 0);
	scene.add( mshStdFloor );
	
	const mshStdFloor2 = new THREE.Mesh( geoFloor, matStdFloor );
	mshStdFloor2.position.set(0, -3, 0);
	//scene.add( mshStdFloor2 );

	const geoKnot = new THREE.TorusKnotGeometry( 2, 0.4, 293, 16, 6, 2);
	const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: 0xffffff, roughness: 0, metalness: 1 } );
	meshKnot = new THREE.Mesh( geoKnot, matKnot );
	meshKnot.position.set( 0, 5, 0 );
	//scene.add( meshKnot );
	
	loader.load('Goldfish.glb', (gltf) => {
	  	fish = gltf.scene;
		gltf.scene.scale.set(0.1, 0.1, 0.1); 
		fish.traverse((o) => {
		  if (o.isMesh) o.material = matKnot;
		});
		fish.rotation.y = Math.PI*5 / 7;
		fish.position.set( 0, 5, 0 );
	  	scene.add(fish);
	});

	var positions = [[-7,2,4],[7,3,2],[-6,5,2],[2,2,3]];
	for (var i=0; i < 4; i++) {
	  (function (index) {
		loader.load('Goldfish.glb', (gltf) => {
		  	const model = gltf.scene;
			gltf.scene.scale.set(0.05, 0.05, 0.05); 
			model.traverse((o) => {
			  if (o.isMesh) o.material = matKnot;
			});
			model.rotation.y = Math.PI*5 / 7;
			model.position.set(positions[index][0], positions[index][1], positions[index][2]);
		  //scene.add(model);
		});
	  })(i);
	}
	
	document.body.style.touchAction = 'none';
	document.body.addEventListener( 'pointermove', onPointerMove );
	window.addEventListener( 'resize', onWindowResize );
	//document.body.appendChild( stats.dom );

}

function onWindowResize() {
	renderer.setSize( container.clientWidth, container.clientHeight );
	camera.aspect = (container.clientWidth / container.clientHeight );
	camera.updateProjectionMatrix();
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

}

function onPointerMove( event ) {

	if ( event.isPrimary === false ) return;
	
	if (event.clientY > container.clientHeight) mouseY = (container.clientHeight - windowHalfY)/100;
	else mouseY = (event.clientY - windowHalfY)/300;
	mouseX = (event.clientX - windowHalfX)/100;

}

function animation( time ) {
	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( 5 - mouseY - camera.position.y ) * 0;
	if (fish) {
		camera.lookAt(fish.position);
		fish.rotation.y = time/1000
	}
	meshKnot.rotation.y = time/1000

	renderer.render( scene, camera );

}