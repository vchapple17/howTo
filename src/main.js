var Dropbox = require('dropbox');
var Key = require('./priv.js');
var key = new Key();

var token = null;
//var baseUrl = "http://localhost:8080/";
var baseUrl = "https://web.engr.oregonstate.edu/~chapplev";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('home_link').href = baseUrl;
});
document.addEventListener('DOMContentLoaded',scrollToHash);

document.addEventListener('DOMContentLoaded', setUpBootstrapListeners);
document.addEventListener('DOMContentLoaded', bindAuth);
window.addEventListener('load', scrollToHash);
window.addEventListener('hashchange', function() {
    scrollToHash();
    var hash = location.hash;
    hash.replace(/^#/)
    console.log(hash);
    scrollBy(0, -70)
});

function scrollToHash() {
    if (window.location.hash !== null) {
        var hash = window.location.hash;

        if (hash === "#getting_started") {
            $('#collapseGettingStarted').collapse({
                toggle: true
            });
            document.getElementById("getting_started").scrollIntoView();
            scrollBy(0, -70)
        }        
        else if (hash === "#auth-demo") {
            $('#collapseAuthDemo').collapse({
                toggle: true
            });
            document.getElementById("auth-demo").scrollIntoView()
            scrollBy(0, -70)
        }
        else if (hash === "#authentication") {
            $('#collapseAuth').collapse({
                toggle: true
            });
            document.getElementById("authentication").scrollIntoView()
            scrollBy(0, -70)
        }
        else if (hash === "#api") {
            $('#collapseAPI').collapse({
                toggle: true
            });
            document.getElementById("api").scrollIntoView()
            scrollBy(0, -70)
        }
        else if (hash === "#conclusion") {
            $('#collapseConclusion').collapse({
                toggle:true
            });
            document.getElementById("conclusion").scrollIntoView();
            scrollBy(0, -70)
        }
        
    }
}

function setUpBootstrapListeners() {
    // BOOTSTRAP LISTENERS
    $('#collapseGettingStarted').on('shown.bs.collapse', function () {
        window.location.hash = "getting_started";
        scrollToHash();
    });
    $('#collapseGettingStarted').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
    });

    $('#collapseAuthDemo').on('shown.bs.collapse', function () {
        window.location.hash = "auth-demo";
        scrollToHash();
    });

    $('#collapseAuthDemo').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
    });


    $('#collapseAuth').on('shown.bs.collapse', function () {
        window.location.hash = "authentication";
        scrollToHash();
    });

    $('#collapseAuth').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
    });

    $('#collapseAPI').on('shown.bs.collapse', function () {
        window.location.hash = "api";
        scrollToHash();
    });

    $('#collapseAPI').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
    });
    
    $('#collapseConclusion').on('shown.bs.collapse', function () {
        window.location.hash = "conclusion";
        scrollToHash();
    });

    $('#collapseConclusion').on('hidden.bs.collapse', function () {
        window.location.hash = "";
        scrollToHash();
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

    var createFolderBtn = document.getElementById('createFolderBtn');
    if (createFolderBtn !== null) {
        createFolderBtn.addEventListener('click', function() {
            var myDropbox = new Dropbox({accessToken: token});
            var foldername = "How To Tutorial Folder";
            myDropbox.filesCreateFolder({path: '/'+foldername, autorename: false}).then( function(response) {
                console.log("created folder");
                console.log(response.name);
                myDropbox.filesListFolder({path: ''}).then(function(response) {
                        displayFiles(response.entries);
                        displayFolderSuccess(foldername);
                    }, function(error) {
                        console.error(error);
                });
            }, function(error) {
                console.error(error);
                console.log("ERORR");
                var errorObj = JSON.parse(error.error);
                if (errorObj.error['.tag'] === 'path') {
                    var path = errorObj.error['path'];
                    if (path[".tag"] === 'conflict') {
                        displayFolderError(foldername, "Naming conflict with existing folder.");
                    }
                    else {
                        console.log("other error");
                        displayFolderError(foldername, errorObj.error_summary);
                    }
                    myDropbox.filesListFolder({path: ''}).then(function(response) {
                        displayFiles(response.entries);
                    }, function(error) {
                        console.error(error);
                });
                    
                }
            }
            );
        });
    }
    
    var revokeBtn = document.getElementById('revokeBtn');
    if (revokeBtn !== null) {
        revokeBtn.addEventListener('click', function() {
            var myDropbox = new Dropbox({ accessToken: token});
            myDropbox.authTokenRevoke();
            token = null;
            location = baseUrl;
        });
    }

    // Display appropriate divs
    if(isAuth()) {
        // If authorized, show files div
        document.getElementById("no_auth_div").style.display = 'none';
        document.getElementById("authed_div").style.display = 'block';

        // Get files from dropbox
        var myDropbox = new Dropbox({ accessToken: token});
        
        myDropbox.filesListFolder({path: ''}).then(function(response) {
            displayFiles(response.entries, 200);
            location.hash = "#auth-demo";
            scrollToHash();
        }, function(error) {
            console.error(error);
        });
        
    }
    else {
        // Not authorized, show button div
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

    function displayFolderError(foldername, extraInfoStr) {
        var errorDiv = document.getElementById('Error');
        errorDiv.textContent = '';
        var h4 = document.createElement('h4');
        
        h4.textContent = "Error creating folder: " + foldername;
        errorDiv.appendChild(h4);
        var h5 = document.createElement('h5');
        h5.textContent = "Error: " + extraInfoStr;
        errorDiv.appendChild(h5);
        errorDiv.style.display = 'block';
    }
    function displayFolderSuccess(foldername) {
        console.log("folder success");
        document.getElementById('Error').style.display = 'none';
        
        var successDiv = document.getElementById('folderCreated');
        successDiv.textContent = '';
        var h4 = document.createElement('h4');
        h4.textContent = "Look for the \"" + foldername + "\" created.";
        successDiv.appendChild(h4);
        successDiv.style.display = 'block';
    }
    
    // Function to display files of "FilesListFolderResult"
    function displayFiles(files, max){
        var filesDiv = document.getElementById('files');
        filesDiv.textContent = '';
        var ol = document.createElement('ol');
        ol.id = "fileList";
        filesDiv.appendChild(ol);

        if (max === undefined) {        
            files.forEach(function(file) {
                var li = document.createElement('li');
                li.innerHTML = file.name;
                ol.appendChild(li);
            });
        }
        else {
            for (var i = 0; i < max; i++) {
                var li = document.createElement('li');
                li.innerHTML = files[i].name;
                ol.appendChild(li);
            };
        }
    
    };

}
