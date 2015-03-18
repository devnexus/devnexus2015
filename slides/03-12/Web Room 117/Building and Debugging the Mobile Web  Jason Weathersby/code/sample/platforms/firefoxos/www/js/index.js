/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//Landscape vs Portrait
window.onload = init;
var _l;

//Initialize the app
function init() {
    console.log("Setting up");
    app.initialize();
}

var app = {

    // Application Constructor
    initialize: function () {
        console.log("initializing...");
        _l = navigator.mozL10n.get;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        window.screen.mozLockOrientation('portrait-primary');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var currX = 0;
        var currY = 0;
        var dX = 0;
        var dY = 0;
        var watchIDAccel = null;
        var watchID = null;
        var globe = null;
        var browserRef = null;
        var netEvent = null;
        var batteryEvent = null;
        var frameID = null;
        var deviceEAdded = null;
        //Utility function for request animation
        var requestAnimationFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        })();
        //Utility function to cancel animation
        var cancelAnimationFrame = (function () {
            return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
        })();
        // Flip the screen to show the contents of a demo. The header
        // will display `title` as the title
        function flipDemo(title) {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');

            backside.innerHTML = '';
            back.classList.add('open');
            appbar.heading = title;
            flipbox.showBack();
        }

        // Flip the screen back to show the main navigation
        function flipMain() {
            var flipbox = document.querySelector('x-flipbox');
            var appbar = document.querySelector('x-appbar');
            var back = appbar.querySelector('.back');
            var backside = flipbox.querySelector('div:last-child');
            flipbox.showFront();

            back.classList.remove('open');
            appbar.heading = _l('cordova-love-ffos');
        }

        // Set the contents of the screen. Used by demos to
        // dynamically build the DOM for the demo and show it.
        function setOutput(el) {
            var flipbox = document.querySelector('x-flipbox');
            var backside = flipbox.querySelector('div:last-child');
            backside.innerHTML = '';
            backside.appendChild(el);
        }

        function appendOutput(el) {
            var flipbox = document.querySelector('x-flipbox');
            var backside = flipbox.querySelector('div:last-child');
            //backside.innerHTML = '';
            backside.appendChild(el);
        }

        function clearOutput() {
            var flipbox = document.querySelector('x-flipbox');
            var backside = flipbox.querySelector('div:last-child');
            backside.innerHTML = '';
        }

        function writeText(text) {
            var loading = document.createElement('pre');
            loading.innerHTML = text;
            appendOutput(loading);
        }

        function online() {
            alert(_l('online'));
        }

        function offline() {
            alert(_l('offline'));
        }

        function onBatteryStatus(info) {
                // Handle the online event
                var msg = _l('battery-level-is-plugged',
                            {level: info.level, isplugged: _l(info.isPlugged.toString())});
                console.log(msg);
                writeText(msg);
            }
            // The "back" button will appear in the header on the demo
            // pages. Make it flip back to the navigation and clear any
            // events when touched.
        document.querySelector('x-appbar .back').addEventListener('click', function () {
            flipMain();

            if (frameID != null) {
                cancelAnimationFrame(frameID);
                frameID = null;
            }
            if (watchID) {
                navigator.compass.clearWatch(watchID);
                watchID = null;
            }
            if (watchIDAccel) {
                navigator.accelerometer.clearWatch(watchIDAccel);
                watchIDAccel = null;
            }
            //If the webgl globe is created stop the animation
            if (globe) {
                globe.stop();
                globe = null;
            }
            if (deviceEAdded) { //deviceorientation
                window.removeEventListener('deviceorientation', deviceOrientationEvent);
                deviceEAdded = null;
            }
            if (browserRef) {
                browserRef.close();
                browserRef = null;
            }
            if (netEvent) {
                document.removeEventListener('online', online);
                document.removeEventListener('offline', offline);
                netInfo = null;
            }
            if (batteryEvent) {
                window.removeEventListener("batterystatus", onBatteryStatus);
                batteryEvent = null;
            }
        });

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);

        function getPicture() {
                //Get the picture and put into an image tag that is appended to the document.
                navigator.camera.getPicture(function (src) {
                    // Now that we have a picture, flip to the demo screen
                    // and set the title for the page
                    flipDemo('Picture');

                    // Display the picture
                    var img = document.createElement('img');
                    img.id = 'slide';
                    img.src = src;
                    setOutput(img);
                }, function () {}, {
                    destinationType: 1
                });
            }
            //The function get the accelerometer data and draws a moving worm on the canvas

        function getAccel() {
            var ptArray = [];
            var canvas = null;
            var context = null;
            flipDemo(_l('accelerometer'));
            //Setup the canavs
            canvas = document.createElement('canvas');
            setOutput(canvas);

            var rect = canvas.getBoundingClientRect();

            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            currX = canvas.width / 2;
            currY = canvas.height / 2;

            //Call the watch acceleration funciton every 100ms
            var options = {
                frequency: 50
            };
            watchIDAccel = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

            //navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);

            //This function draws lines for 15 points saved in the pts array
            //Creating the worm
            function drawLines() {
                    context.clearRect(0, 53, canvas.width, canvas.height - 53);
                    if (ptArray.length > 1) {
                        for (var ii = 0; ii < ptArray.length; ii++) {
                            context.beginPath();
                            context.moveTo(ptArray[ii][0], ptArray[ii][1]);
                            if ((ii + 1) < ptArray.length) {
                                context.lineTo(ptArray[(ii + 1)][0], ptArray[(ii + 1)][1]);
                                context.lineWidth = 3.5;
                                context.strokeStyle = 'rgba(230,186,124,0.9)';
                                context.stroke();
                            }
                        }
                    }

                }
                //Successful read of the Accelerometer

            function onSuccess(acceleration) {
                    var acX = acceleration.x.toFixed(1) * -1;
                    var acY = acceleration.y.toFixed(1);
                    var acZ = acceleration.z.toFixed(1);
                    //write out the current acceleration values
                    context.clearRect(10, 0, canvas.width / 2, 50);
                    context.fillStyle = "white";
                    context.font = "16px Arial";
                    context.fillText("Accel X " + acX, 10, 20);
                    context.fillText("Accel Y " + acY, 10, 35);
                    context.fillText("Accel Z " + acZ, 10, 50);
                    //add some deadband in the x and y directions
                    if ((Math.abs(parseFloat(acX)) > 2) || (Math.abs(parseFloat(acY)) > 2)) {
                        //console.log('Acceleration X: ' + acX + '\n' + 'Acceleration Y: ' + acY + '\n' + 'Acceleration Z: ' + acZ + '\n' + 'Timestamp: ' + acceleration.timestamp + '\n');
                        //Push and shift datapoints with new values
                        currX += parseInt(acX);
                        currY += parseInt(acY);
                        var coord = [];
                        coord[0] = currX;
                        coord[1] = currY;
                        var len = ptArray.push(coord);
                        if (len >= 15) ptArray.shift();
                        //Handle x and y boundaries
                        if (currX > canvas.width) currX = canvas.width;
                        if (currY > canvas.height) currX = canvas.height;
                        if (currX < 0) currX = 0;
                        if (currY < 65) currY = 65;
                        drawLines();

                    }
                }
                // onError: Failed to get the acceleration
                //

            function onError() {
                alert('onError!');
            }
        }

        //Really HTML Device Motion Event
        function deviceOrientationEvent(eventData) {
                var alpha = Math.round(eventData.alpha);
                //front to back - neg back postive front
                var beta = Math.round(eventData.beta);
                //roll left positive roll right neg
                var gamma = Math.round(eventData.gamma);
                dX = -(gamma / 360) * 100;
                dY = -(beta / 360) * 100;
                //console.log("dX = " + dX + " dY = " + dY);
        }
        //Setup HTML5 Device Motion Event Handler

        function runAccel() {
            var bCanvas = null;
            var canvas = null;
            var context = null;
            flipDemo(_l('device-motion'));
            //This function creates an offscreen canvas to create a ball

            function setupBallCanvas() {
                    var radius = 20;
                    bCanvas = document.createElement('canvas');
                    bCanvas.width = radius * 2;
                    bCanvas.height = radius * 2;
                    var m_context = bCanvas.getContext('2d');
                    x = radius;
                    y = radius;
                    a = .8;
                    loopcount = 60;
                    for (var i = 0; i < loopcount; i++) {
                        var redval = 265;
                        var greenval = 245;
                        var blueval = 220 + i
                        drawCirc(x + i / 12, y - i / 12, radius - i / 6, redval, greenval, blueval, a, m_context);
                    }
                }
                //Utility function to draw a simple circle

            function drawCirc(x, y, radius, r, g, b, a, dcontext) {
                dcontext.beginPath();
                dcontext.arc(x, y, radius, 0, 2 * Math.PI, false);
                dcontext.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                dcontext.fill();
                dcontext.closePath();
            }

            //Draw the Ball
            function drawBall(x, y, a) {
                var ballRadius = 20;
                //Setup the offscreen canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (bCanvas == null) {
                    setupBallCanvas();
                }
                var redval = 68;
                var greenval = 68;
                var blueval = 68;
                //draw shadow of ball
                drawCirc(x + 1, y + 1, ballRadius + 3, redval, greenval, blueval, 0.3, context);
                //draw offscreen canvas
                context.drawImage(bCanvas, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
                context.globalAlpha = 1;
            }

            function handleMovement() {
                //animate the changes in dx and dy
                frameID = requestAnimationFrame(handleMovement);
                context.clearRect(currX, currY, 60, 60);
                currX -= dX;
                currY -= dY;
                if (currX >= (canvas.width - 20))(currX = canvas.width - 20);
                if (currX <= 20) currX = 20;
                if (currY >= (canvas.height - 20))(currY = canvas.height - 20);
                if (currY <= 20) currY = 20;
                //console.log("currX = " + currX + " currY = " + currY);
                drawBall(currX, currY, .9);
            }

            canvas = document.createElement('canvas');
            setOutput(canvas);
            var rect = canvas.getBoundingClientRect();

            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            dX = 0;
            dY = 0;
            currX = canvas.width / 2;
            currY = canvas.height / 2;

            //Add the event handler and launch the animation
            window.addEventListener('deviceorientation', deviceOrientationEvent);
            deviceEAdded = true;
            handleMovement();
        }

        //Run the geolocation demo
        //this uses a modified globe.js and three.js
        //Best to run with Firefox OS 1.2 and higher
        function runGeo() {
            flipDemo(_l('geolocation'));

            var loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = 'Getting Location...';
            setOutput(loading);

            var onSuccess = function (position) {
                if (!document.getElementById('map')) {
                    var mapdiv = document.createElement('div');
                    setOutput(mapdiv);
                    //Create WebGL Globe Div
                    mapdiv.setAttribute('id', 'map');
                    mapdiv.style.height = "400px";
                    mapdiv.style.width = "320px";
                    globe = new DAT.Globe(mapdiv);
                    //var data = [53.795,-1.53,2,2];
                    //Setup the geo point of light
                    var geodata = [position.coords.latitude, position.coords.longitude, 2, 2];
                    globe.addData(geodata, {
                        format: 'magnitude',
                        animated: false
                    });
                    globe.createPoints();
                    //Fire the WebGL animation
                    globe.animate();
                }
            };

            function onError(error) {
                alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }

        //This function demonstrates the compass functions
        function runCompass() {
            flipDemo(_l('compass'));
            var img = null;
            var gImg = null;
            var myHeading = 0;
            var oCanvas = null;
            //This function just creates an offscreen canvas to hold a picture of the compass
            //background
            function offscreenCanvas() {
                    if (img != null && oCanvas == null) {
                        var m_canvas = document.createElement('canvas');
                        m_canvas.width = img.width;
                        m_canvas.height = img.height;
                        m_context = m_canvas.getContext('2d');
                        m_context.beginPath();
                        m_context.arc(m_canvas.width / 2, m_canvas.height / 2, img.width / 2, 0, 2 * Math.PI, false);
                        var radgrad = m_context.createRadialGradient(m_canvas.width / 2, m_canvas.height / 2, img.height / 3, m_canvas.width / 2, m_canvas.height / 2, img.height / 2);
                        radgrad.addColorStop(0.9, '#F5F5DC');
                        radgrad.addColorStop(0.1, '#cdc0b0');
                        m_context.fillStyle = radgrad;
                        m_context.fill();
                        m_context.closePath();
                        m_context.strokeStyle = 'rgba(200,0,0,0.7)'
                        m_context.beginPath();
                        m_context.moveTo(m_canvas.width / 2, m_canvas.height / 2 - 5);
                        m_context.lineTo(m_canvas.width / 2, m_canvas.height / 2 - img.height / 2);
                        m_context.closePath();
                        m_context.stroke();
                        m_context.beginPath();
                        m_context.arc(m_canvas.width / 2, m_canvas.height / 3, img.height / 20, 0, 2 * Math.PI, false);
                        m_context.lineWidth = 1.5;
                        m_context.strokeStyle = 'rgba(128,0,0,0.9)';
                        m_context.stroke();
                        m_context.closePath();
                        var xStart = (m_canvas.width - img.width) / 2;
                        var yStart = (m_canvas.height - img.height) / 2;
                        m_context.beginPath();
                        m_context.arc(m_canvas.width / 2, m_canvas.height / 2, (img.height / 2) - 2, 0, 2 * Math.PI, false);
                        m_context.lineWidth = 3.5;
                        m_context.strokeStyle = 'rgba(0,0,0,0.5)';
                        m_context.stroke();
                        m_context.closePath();
                        oCanvas = m_canvas;
                    }
                }
                //Run this function when the compass updates

            function runCompassUpdate() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                var myrads = Math.PI / 180 * myHeading;
                context.font = '18pt Calibri';
                context.fillStyle = 'white';
                context.fillText("Current Heading: " + myHeading, canvas.width * .095, canvas.height * .05);
                //Draw compass background from offscreen canvas
                context.drawImage(oCanvas, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
                context.save();
                //rotate needle proper amount
                context.translate(canvas.width / 2, canvas.height / 2);
                context.rotate(myrads);
                context.translate(-img.width / 2, -img.height / 2);
                context.drawImage(img, 0, 5, img.width, img.height - 5);
                //console.log("Drawing Needle");
                context.restore();
                //Draw Glass over the needle
                context.drawImage(gImg, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
            }

            function onSuccess(heading) {
                //Retrieve the compass heading
                myHeading = (heading.magneticHeading).toFixed(2);
                console.log("My Heading = " + myHeading);
                runCompassUpdate();
            }

            function onError(compassError) {
                    alert(_l('compass-error', {code: compassError.code}));
                }
                //Setup the compass to read every 100ms
            var options = {
                frequency: 300
            };
            watchID = navigator.compass.watchHeading(onSuccess, onError, options);

            canvas = document.createElement('canvas');
            setOutput(canvas);

            var rect = canvas.getBoundingClientRect();

            canvas.height = window.innerHeight - rect.top;
            canvas.width = window.innerWidth;
            context = canvas.getContext('2d');
            //Load the compass glass image
            gImg = new Image();
            gImg.src = "img/glass.png";
            //Load the compass needle image
            img = new Image(); //create image object
            img.onload = function () { //create our handler
                var xStart = (canvas.width - img.width) / 2;
                var yStart = (canvas.height - img.height) / 2;
                //Setup background canvas
                offscreenCanvas();
                runCompassUpdate();
            };
            img.src = "img/cNeedle.png";
        }

        //Test the Notification API
        function runPro() {
            function onPrompt(results) {
                alert(_l('button-number-entered', 
                         {index: results.buttonIndex, input: results.input1}));
            }
            navigator.notification.vibrate(500);
            navigator.notification.prompt(
                _l('enter-name'), // message
                onPrompt, // callback to invoke
                _l('propmpt-test'), // title
                [_l('ok'), _l('exit')], // buttonLabels
                _l('doe-jane') // defaultText
            );

        }

        //Contacts API Demo
        function addNewContact() {

            //Use the contacts api to create a contact
            //Make sure the app is privileged and contain the 
            //proper contacts permission
            function createAndSaveContact() {
                    var fname = document.getElementById('fname').value;
                    var lname = document.getElementById('lname').value;
                    var email = document.getElementById('email').value;

                    function onSuccess(contact) {
                        console.log("Save Success");
                        flipMain();
                    };

                    function onError(contactError) {
                        console.log("Add Error = " + contactError.code);
                        flipMain();
                    };

                    // create a new contact object
                    var contact = navigator.contacts.create();
                    // populate some fields
                    var name = new ContactName();
                    name.givenName = fname;
                    name.familyName = lname;
                    contact.name = name;
                    var emails = [];
                    emails[0] = new ContactField('Personal', email, false);
                    contact.emails = emails;
                    // save to device
                    contact.save(onSuccess, onError);

                }
                //Check to see if contact exists and if not create it

            function saveContact() {
                var options = new ContactFindOptions();
                options.filter = "";
                var fields = ["name", "emails"];
                var fname = document.getElementById('fname').value;
                var lname = document.getElementById('lname').value;
                var email = document.getElementById('email').value;
                if (fname == null || lname == null || fname.length == 0 || lname.length == 0) {
                    console.log("No user entered");
                    flipMain();
                    return;
                }
                navigator.contacts.find(fields, onSuccess, onError, options);

                function onSuccess(contacts) {
                        if (contacts.length == 0) {
                            createAndSaveContact();
                            return;
                        }
                        for (var i = 0; i < contacts.length; i++) {
                            //console.log("Name = " + contacts[i].name.givenName + "," + contacts[i].name.familyName + " emails " + contacts[i].emails);
                            if (contacts[i].name.givenName == fname && contacts[i].name.familyName == lname) {
                                //Contact exists already
                                alert(_l('name-already-added'));
                                flipMain();
                                return;
                            }

                        }
                        //Does not exist add them
                        createAndSaveContact();

                    }
                    // onError: Failed to get the contacts

                function onError(contactError) {
                    alert('onError!');
                    flipMain();
                }
            }

            flipDemo(_l('contact'));
            var form = document.querySelector('.contactForm').cloneNode(true);
            setOutput(form);

            var button2 = document.querySelector('x-flipbox .contactForm .save');
            button2.addEventListener('click', saveContact, false);
        }


        //Run the file demo
        function addFile() {
            flipDemo('File API');
            var fs;
            var fEntry;
            //var loading = document.createElement('div');
            //loading.className = 'loading';
            //loading.innerHTML = 'Creating File...';
            //setOutput(loading);


            function listDir(dirEntry) {
                function success(entries) {
                    var i;
                    for (i = 0; i < entries.length; i++) {
                        //var tn = document.createTextNode("TT:"+entries[i].fullPath);
                        //var loading = document.createElement('pre');
                        //loading.innerHTML = "Entry:"+entries[i].fullPath
                        //appendOutput(loading);
                        writeText("Entry:" + entries[i].fullPath);
                        if (entries[i].isDirectory) {
                            listDir(entries[i]);
                        }
                    }
                }

                var dirReader = dirEntry.createReader();
                dirReader.readEntries(success, fail);
            }

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

            function gotFS(fileSystem) {
                fs = fileSystem;
                fileSystem.root.getFile("readme.txt", {
                    create: true,
                    exclusive: false
                }, gotFileEntry, fail);
            }

            function gotFileEntry(fileEntry) {
                writeText("readme.txt created");
                fEntry = fileEntry;
                fileEntry.createWriter(gotFileWriter, fail);
            }

            function gotFileWriter(writer) {
                writer.onwriteend = function (evt) {
                    writeText("Wrote text to readme.txt");

                    //iterate over entries


                    //create a directory
                    fs.root.getDirectory('TestDir', {
                        create: true
                    }, gotDir, fail);
                    writeText("Created TestDir");

                    function gotDir(dirEntry) {
                        fEntry.copyTo(dirEntry, 'copyreadme.txt', function () {
                            writeText("Copied readme.txt to TestDir/copyreadme.txt");
                            writeText("List Filesystem Contents");
                            listDir(fs.root);
                        }, fail);

                    }
                };
                writer.write("Write Text");
            }

            function fail(error) {
                console.log(error.code);
            }
        }

        function openBrowser() {
            flipDemo(_l('in-app-browser-short'));
            browserRef = window.open('https://developer.mozilla.org', '_blank', 'location=yes');
            var el = document.querySelector(".inAppBrowserWrap");
            setOutput(el);
        }

        function getNetInfo() {
            flipDemo(_l('network-info'));
            var networkState = navigator.connection.type;

            writeText('Connection type: ' + networkState);

            document.addEventListener("offline", offline, false);
            document.addEventListener("online", online, false);
            netEvent = true;
        }

        function batteryStats() {
            flipDemo(_l('battery-status'));
            window.addEventListener("batterystatus", onBatteryStatus, false);
            batteryEvent = true;
        }
        function globalSuccess( language ){
        	alert('language: ' + language.value );
			navigator.globalization.dateToString(
    			new Date(),
    			function (date) { alert('date: ' + date.value + '\n'); },
    			function () { alert('Error getting dateString\n'); },
    			{ formatLength: 'short', selector: 'date and time' }
			);       	
        }
        function globalFail(){
        	alert('Error getting language');
        }
        function global(){
        	console.log( navigator.globalization.getPreferredLanguage );
        	navigator.globalization.getPreferredLanguage(globalSuccess, globalFail);
		}	
		function uploadFile(){
			var appStore = cordova.file.applicationDirectory;
			var fileName = "README.md";	
			var ft = new FileTransfer();
			var options = new FileUploadOptions();
			options.mimeType = "text/plain";
			options.chunkedMode = true;
			ft.upload(appStore + fileName, encodeURI("http://posttestserver.com/post.php?html&dir=cordovatest"), function(result) {
				console.log('upload successful ', result);
				alert("Upload successful");
			}, function(err) {
				console.log('upload error ', err);
				alert("Upload failed");
			}, options);	
		
		}

        // Wire up events for all the navigation buttons on the main
        // page to run individual demos
        var button = document.getElementById('getPicture');
        button.addEventListener('click', getPicture, false);
        button = document.getElementById('getAccel');
        button.addEventListener('click', getAccel, false);
        button = document.getElementById('runAccel');
        button.addEventListener('click', runAccel, false);
        button = document.getElementById('runGeo');
        button.addEventListener('click', runGeo, false);
        button = document.getElementById('runCompass');
        button.addEventListener('click', runCompass, false);
        button = document.getElementById('runPro');
        button.addEventListener('click', runPro, false);
        button = document.getElementById('addNewContact');
        button.addEventListener('click', addNewContact, false);
        button = document.getElementById('addNewFile');
        button.addEventListener('click', addFile, false);
        button = document.getElementById('inAppBrowser');
        button.addEventListener('click', openBrowser, false);
        button = document.getElementById('netInfo');
        button.addEventListener('click', getNetInfo, false);
        button = document.getElementById('batteryInfo');
        button.addEventListener('click', batteryStats, false);
        button = document.getElementById('globalization');
        button.addEventListener('click', global, false);
        button = document.getElementById('uploadFile');
        button.addEventListener('click', uploadFile, false);

    }
};
