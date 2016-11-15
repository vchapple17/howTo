var Dropbox = require('dropbox');
var Key = require('./priv.js');
var key = new Key();

var token = null;
var baseUrl = "http://localhost:8080/";

document.addEventListener('DOMContentLoaded', setUpBootstrapListeners);
document.addEventListener('DOMContentLoaded', bindAuth);
window.addEventListener('load', scrollToHash);

window.addEventListener('hashchange', handleHashChange);

function handleHashChange(e) {
    e.preventDefault();
    scrollToHash();
}
function scrollToHash() {
    if (window.location.hash !== null) {

        var hash = window.location.hash;

        if (hash === "#getting_started") {
            $('#collapseGettingStarted').collapse({
                toggle: true
            });
            location.hash = hash;

        }
        else if (hash === "#auth-demo") {
            $('#collapseAuthDemo').collapse({
                toggle: true
            });
            location.hash = hash;
        }
        else if (hash === "#authentication") {
            $('#collapseAuth').collapse({
                toggle: true
            });
            location.hash = hash;
        }
        else if (hash === "#chooser_saver") {
            $('#collapseChooserSaver').collapse({
                toggle: true
            });
            location.hash = hash;
        }

    }
}

function setUpBootstrapListeners() {
    // BOOTSTRAP LISTENERS
    $('#collapseGettingStarted').on('shown.bs.collapse', function () {
        window.location.hash = "getting_started";
        scrollToHash();
        document.getElementById('getting_started_spacer').style.display = "block";
    });
    $('#collapseGettingStarted').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
        document.getElementById('getting_started_spacer').style.display = "none";
    });

    $('#collapseAuthDemo').on('shown.bs.collapse', function () {
        window.location.hash = "auth-demo";
        scrollToHash();
        document.getElementById('auth-demo_spacer').style.display = "block";
    });

    $('#collapseAuthDemo').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
        document.getElementById('auth-demo_spacer').style.display = "none";
    });


    $('#collapseAuth').on('shown.bs.collapse', function () {
        window.location.hash = "authentication";
        scrollToHash();
        document.getElementById('authentication_spacer').style.display = "block";
    });

    $('#collapseAuth').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
        document.getElementById('authentication_spacer').style.display = "none";
    });

    $('#collapseChooserSaver').on('shown.bs.collapse', function () {
        window.location.hash = "chooser_saver";
        document.getElementById('chooser_saver_spacer').style.display = "block";
    });

    $('#collapseChooserSaver').on('hidden.bs.collapse', function () {
        window.location.hash = ""; document.getElementById('chooser_saver_spacer').style.display = "none";
    });
}

function bindAuth() {
    // Add Dropbox listeners
    var getFilesBtn = document.getElementById('getFilesBtn');
    if (getFilesBtn !== null) {
        getFilesBtn.addEventListener('click', function(e) {
            // on click set up authorization URL with app's client id and set up authentication redirect url
            var myDropbox = new Dropbox({ clientId: key.getKey()});
            var url = myDropbox.getAuthenticationUrl(baseUrl);
            window.location = url;
        });
    };


    // Display appropriate divs
    if(isAuth()) {
        // If authorized, show files div
        document.getElementById("no_auth_div").style.display = 'none';
        document.getElementById("authed_div").style.display = 'block';

        // Get files from dropbox
        var myDropbox = new Dropbox({ accessToken: token});

        myDropbox.filesListFolder({path: ''}).then(function(response) {
            // returns: http://dropbox.github.io/dropbox-sdk-js/global.html#FilesListFolderResult
            displayFiles(response.entries);
            // enterieshttp://dropbox.github.io/dropbox-sdk-js/global.html#FilesFileMetadata
            location.hash = "#auth-demo";
            scrollToHash;
        }, function(error) {
            console.error(error);
        })
    }
    else {
        // Not authorized, show button
        document.getElementById("no_auth_div").style.display = 'block';
        document.getElementById("authed_div").style.display = 'none';
    }

    // Function to determine if user is authenticated.
    function isAuth(){
        // Check authorization
        // See if access token is in URL
        if (token === null) {
            token = getAccessTokenFromUrl();
        }
        
        if ((token === null) || (token === 'access_denied')) {
            return false;
        }
        else {
            return true;
        }
    }

    // Function to parse the url hash for the access token
    function getAccessTokenFromUrl() {
        // If the url has an access_token, it is returned. Else null.
        var URI = window.location.hash;
        var result = null;
        if (typeof URI === 'string') {
            // Remove leading and trialing white space
            URI.trim();

            // Replace the # sign at beginning
            URI.replace(/^#/)

            // Check that string exists
            if (URI.length == 0) {
                return null;
            }
            else {
                // split by & and find access_token
                var parts = URI.split("&");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.match('access_token=')){
                        result = part.split('=')[1];
                        return result;
                    }
                    else if (part.match('error=')) {
                        result = part.split('=')[1];
                        return result;
                    }
                }
            }
        }
        return null;
    };

    // Function to display files of "FilesListFolderResult"
    function displayFiles(files){
        var filesDiv = document.getElementById('files');
        filesDiv.textContent = '';
        var ol = document.createElement('ol');
        ol.id = "fileList";
        filesDiv.appendChild(ol);

        for (var i = 0; i < 10; i++) {
            var li = document.createElement('li');
            li.innerHTML = files[i].name;
            ol.appendChild(li);
        };

//        files.forEach(function(file) {
//            var li = document.createElement('li');
//            li.innerHTML = file.name;
//            ol.appendChild(li);
//        });
    };

}
