alert('VALIDATE LOADED');

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
 }

 function continueOrNot() {
    if(validateEmail(document.getElementById('emailfield').value)){
      alert('valid'); return true;
    }else{ alert("email not valid"); return false;}
 }
