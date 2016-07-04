//(function() {
    'use strict';
    // 'To actually be able to display anything with Three.js, we need three things:
    // A scene, a camera, and a renderer so we can render the scene with the camera.'
    // - http://threejs.org/docs/#Manual/Introduction/Creating_a_scene

    var scene, camera, renderer;

    // I guess we need this stuff too
    var container,
        spaceWrapper,
        HEIGHT,
        WIDTH,
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane,
        geometry,
        particleCount,
        i,
        h,
        color,
        size,
        materials = [],
        mouseX = 0,
        mouseY = 0,
        windowHalfX,
        windowHalfY,
        cameraZ,
        fogHex,
        fogDensity,
        parameters = {},
        parameterCount,
        particles;

        spaceWrapper = document.querySelector('.js-spaaace-wrapper');

    //spaceInit();
/*    animate();*/

    function spaceInit() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 10000;

        /* 	fieldOfView — Camera frustum vertical field of view.
	       aspectRatio — Camera frustum aspect ratio.
	          nearPlane — Camera frustum near plane.
	             farPlane — Camera frustum far plane.

	- http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera

	In geometry, a frustum (plural: frusta or frustums)
	is the portion of a solid (normally a cone or pyramid)
	that lies between two parallel planes cutting it. - wikipedia.		*/

        cameraZ = 1250; /*	So, 1500? Yes! move on!	*/
        fogHex = 0x000000; /* As black as your heart.	*/
        fogDensity = 0.001; /* So not terribly dense? NO FOG IN SPACE	*/

        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        container = document.querySelector('.spaaace');

        geometry = new THREE.Geometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

        particleCount = 90000; /* Leagues under the sea */

        /*
        Hope you took your motion sickness pills;
	    We're about to get loopy.
        generate coordinates for our particles
         */

        for (i = 0; i < particleCount; i++) {

            var vertex = new THREE.Vector3();
            /*vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000; */

            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 10000 - 1000;

            geometry.vertices.push(vertex);
        }

        /*	We can't stop here, this is bat country!	*/

        //generate particle size and opacity for 5 difference point clouds
        parameters = [
            [
                [1, 1, 1], 2
            ],
            [
                [0.95, 1, 1], 2
            ],

            [
                [0.95, 1, 1], 1
            ],

            [
                [0.9, 1, 0.9], 1
            ],
            [
                [0.8, 1, 0.8], 1
            ]
        ];

        parameterCount = parameters.length;

        /*	I told you to take those motion sickness pills.
	       Clean that vommit up, we're going again!	*/
        //loop over the oarameters to rended the 5 different clouds and apply a random rotation to each one
        for (i = 0; i < parameterCount; i++) {

            color = parameters[i][0];
            size = parameters[i][1];

            materials[i] = new THREE.PointsMaterial({
                size: size,
                map: THREE.ImageUtils.loadTexture(
                  "assets/img/particle2.png"
                ),
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            //each cloud takes the geometry points generated earlier and the size from the array we're looping over
            particles = new THREE.Points(geometry, materials[i]);

            particles.sortParticles = true;

            //randomly rotate each cloud so the points aren't all on top of each other
            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add(particles);
        }

        /*	If my calculations are correct, when this baby hits 88 miles per hour...
	you're gonna see some serious shit.	*/

        renderer = new THREE.WebGLRenderer( { alpha: true }); /*	Rendererererers particles. Alpha allows for a transparent bg	*/
        renderer.setPixelRatio(window.devicePixelRatio); /*	Probably 1; unless you're fancy.	*/
        renderer.setSize(WIDTH, HEIGHT); /*	Full screen baby Wooooo!	*/

        container.appendChild(renderer.domElement); /* Let's add all this crazy junk to the page.	*/

        /*	I don't know about you, but I like to know how bad my
		code is wrecking the performance of a user's machine.
		Let's see some damn stats!	*/

        /* Event Listeners */

        window.addEventListener('resize', onWindowResize, false);
        //yup, mousemove function
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

    }

    function animate() {

        var sceneVisible = checkVisible();
        requestAnimationFrame(animate);

        if(sceneVisible){
            render();
        }
    }

    function checkVisible() {

        var elementVisible = true;
        if(spaceWrapper.classList.contains('visible')){
            elementVisible = true;
        } else {
            elementVisible = false;
        }

        if(elementVisible){
            return true;
        }
        else{
            return false;
        }
    }

    function render() {
        var time = Date.now() * 0.00005;

        //set camera facing based on mouse position
        // mouseX & mouseY retreived using the function called on mousemove
        // the multiplication by 0.05 gives it the feeling of acceleration as it moves the camera incrementallly more than the mouse
        camera.position.x += (mouseX/50 - camera.position.x) * 0.025;
        camera.position.y += (-mouseY/50 - camera.position.y) * 0.025;
        //camera.position.z += (-mouseX/10 - camera.position.x) * 0.025;
        //camera.position.z += (mouseY/10 - camera.position.y) * 0.025;

        camera.position.z -= 0.3;
        //camera.position.z += 1;



        camera.lookAt(scene.position);

        //idk
        for (i = 0; i < scene.children.length; i++) {

            var object = scene.children[i];

            if (object instanceof THREE.PointCloud) {

                //wtf halp plz
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        //applies differet colouring over time
        for (i = 0; i < materials.length; i++) {

            color = parameters[i][0];

            h = (360 * (color[0] + time) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2]);
        }


        renderer.render(scene, camera);
    }

    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
        //mouseX = e.clientX;
        //mouseY = e.clientY;
    }

    /*	Mobile users?  I got your back homey	*/

    function onDocumentTouchStart(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
//})();
