var Dropbox = require('dropbox');
var Key = require('./priv.js');
var key = new Key();

document.addEventListener('DOMContentLoaded', bindAuth);

function bindAuth() {
    
    // Add listeners
    var getFilesBtn = document.getElementById('getFilesBtn');
    
    if (getFilesBtn !== null) {
        getFilesBtn.addEventListener('click', function(e) {
            // on click set up authorization URL with app's client id and set up authentication redirect url
            var myDropbox = new Dropbox({ clientId: key.getKey()});
            var url = myDropbox.getAuthenticationUrl('http://localhost:8080/');
            window.location = url;
        });
    }
    
    // Display appropriate divs
    if(isAuth()) {
        console.log("isAuth = true");
        // If authorized, show files div
        document.getElementById("no_auth_div").style.display = 'none';
        document.getElementById("authed_div").style.display = 'block';
        
        // Get files from dropbox
        var accessToken = getAccessTokenFromUrl()
        var myDropbox = new Dropbox({ accessToken: accessToken});
        
        myDropbox.filesListFolder({path: ''}).then(function(response) {
            console.log("response");
            // returns: http://dropbox.github.io/dropbox-sdk-js/global.html#FilesListFolderResult
            displayFiles(response.entries);
            // enterieshttp://dropbox.github.io/dropbox-sdk-js/global.html#FilesFileMetadata
            
        }, function(error) {
            console.error(error);
        })
        // Render files as list items
    }
    else {
        // Not authorized, show button
        console.log("isAuth = false");
        document.getElementById("no_auth_div").style.display = 'block';
        document.getElementById("authed_div").style.display = 'none';
    }
    
    // Function to determine if user is authenticated.
    function isAuth(){
        // Check authorization
        console.log("isAuth");
        
        // See if access token is in URL
        var token = getAccessTokenFromUrl();
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
        
//        files.forEach(function(file) {
//            var li = document.createElement('li');
//            li.innerHTML = file.name;
//            ol.appendChild(li);
//        });

        for (var i = 0; i < 10; i++) {
            var li = document.createElement('li');
            li.innerHTML = files[i].name;
            ol.appendChild(li);
        };
        
    };

}




