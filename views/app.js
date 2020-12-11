

window.onload= function () {

    if (getCookie('available') == 'yes'){
        document.getElementById('cab').innerHTML = getCookie('user');
        document.getElementById('cab').href = "/cab";
        if (getCookie('user') != null){
            document.getElementById('logout').innerHTML = "Logout";
            document.getElementById('logout').href = "/logout";
        }
    }

    if (getCookie('available') == 'no'){
        document.getElementById('cab').innerHTML = "Login";
        document.getElementById('cab').href = "/login";
    }
    if (getCookie('user') == null){
        document.getElementById('logout').innerHTML = "Register";
        document.getElementById('logout').href = "/register";
    }


};



function createCookie(name, value, days) { 
    var expires; 
      
    if (days) { 
        var date = new Date(); 
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
        expires = "; expires=" + date.toGMTString(); 
    } 
    else { 
        expires = ""; 
    } 
      
    document.cookie = escape(name) + "=" +  
       encodeURI(value) + expires + "; path=/"; 
} 
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}