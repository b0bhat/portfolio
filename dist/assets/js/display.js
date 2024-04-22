import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';


let renderer, scene, camera, composer;
let stats, meshKnot, shape;
const container = document.getElementById('canvas-container');
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let fish;

var rectlights = [],
	rectlighthelpers = [],
	circlelights = [];

/*
const manager = new THREE.LoadingManager();
const loadingScreen = document.getElementById( 'loading-screen' );
const loader = new GLTFLoader( manager);

manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
	loadingScreen.classList.add( 'fade-out' );
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};*/

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
		const rectLight = new THREE.RectAreaLight( lights[i], 2, 4, 10 );
		rectLight.position.set( -10 + i*5, 5, 5 );
		rectlights[i] = rectLight;
		rectlighthelpers[i] = new RectAreaLightHelper( rectLight );
		scene.add( rectlights[i] );
		scene.add( rectlighthelpers[i] );
	}

	
	const rectLight = new THREE.RectAreaLight(0xd9234d, 30, 3000, 1);
	rectLight.position.set( 0, 9, 500 );
	const rectlighthelper = new RectAreaLightHelper( rectLight );
	scene.add( rectLight );
	scene.add( rectlighthelper );

	const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 3000 );
	const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0.2, metalness: 0 } );
	const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
	mshStdFloor.position.set(0, 11, 0);
	scene.add( mshStdFloor );
	
	const mshStdFloor2 = new THREE.Mesh( geoFloor, matStdFloor );
	mshStdFloor2.position.set(0, -3, 0);
	//scene.add( mshStdFloor2 );

	const geoKnot = new THREE.TorusKnotGeometry( 1, 0.4, 293, 16, 2, 3);
	const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 1, metalness: 0.2 } );
	meshKnot = new THREE.Mesh( geoKnot, matKnot );
	meshKnot.position.set( 0, 5, -2 );
	//scene.add( meshKnot );
	
	const geoPyramid = new THREE.CylinderGeometry(0, 4, 4, 4, 1);
	const matShape = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0.2 } );
	shape = new THREE.Mesh( geoPyramid, matShape );
	shape.rotation.x = -Math.PI/8;
	shape.position.set( 0, 6, 3 );
	scene.add( shape );
	
	const outerCircleShape = new THREE.Shape().absarc(0, 0, 5.5, 0, Math.PI * 2);
	const innerCircleHole = new THREE.Path().absarc(0, 0, 4, 0, Math.PI * 2);
	outerCircleShape.holes.push(innerCircleHole);

	const geometry = new THREE.ExtrudeGeometry(outerCircleShape, {
		steps: 5,
		depth: 0,
		bevelEnabled: false,
	});
	
	const circleWithHole = new THREE.Mesh(geometry, matShape);
	circleWithHole.position.set(0,5,0)
	scene.add(circleWithHole);

	const circleRadius = 5;
	const numLights = 30;
	const angleStep = (2 * Math.PI) / numLights;

	for (let i = 0; i < numLights; i++) {
		const angle = i * angleStep;

		const light = new THREE.RectAreaLight(0xd9234d, 3, 0.8, 0.8);
		light.position.set(circleRadius * Math.cos(angle), circleRadius * Math.sin(angle) + 5, -2);
		light.lookAt(0, 5, -2);

		scene.add(light);
		circlelights[i] = light;
		const lightHelper = new RectAreaLightHelper(light);
		scene.add(lightHelper);
	}

	composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	// const glitchPass = new GlitchPass();
	// glitchPass.enabled = true;
	// composer.addPass(glitchPass);
		
	/*
	const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: 0xffffff, roughness: 0, metalness: 1 } );
	loader.load('Goldfish.glb', (gltf) => {
	  	fish = gltf.scene;
		gltf.scene.scale.set(0.1, 0.1, 0.1); 
		fish.traverse((o) => {
		  if (o.isMesh) o.material = matKnot;
		});
		fish.rotation.y = Math.PI*5 / 7;
		fish.position.set( 0, 5, 0 );
	  	//scene.add(fish);
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
	}*/
	
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
	mouseX = ((event.clientX - windowHalfX) - 100) /100;

}

function animation( time ) {
	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( 5 -  - camera.position.y ) * 0;
	if (fish) {
		camera.lookAt(fish.position);
		fish.rotation.y = time/1000
	}
	shape.rotation.y = time/1000
	camera.lookAt(meshKnot.position);
	renderer.render( scene, camera );
	composer.render();
	circlelights.forEach(light => {
		light.lookAt(-mouseX, 5, -2);
	});

}

function onTransitionEnd( event ) {

	event.target.remove();
	
}