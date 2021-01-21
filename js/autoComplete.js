
function addMultipleEventListener(element, events, handler) {
    events.forEach(e => element.addEventListener(e, handler))
  }


function autocomplete(inp, arr, arrLabel, cb) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  addMultipleEventListener(inp, ["input", "focus"], openList);

    function openList(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      //if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("div");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      a.classList.add("scrollbar");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      const overlay = document.createElement("div");
      overlay.classList.add("optionOverlay");
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        
        if (!val || arrLabel[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("div");
          b.classList.add("option");
          b.style.backgroundImage = `url('./images/categories/${arr[i]}.jpg')`
          b.style.backgroundRepeat = 'no-repeat';
          b.style.backgroundSize = 'cover'
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arrLabel[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arrLabel[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arrLabel[i] + "'>";
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.innerHTML += '<div class="optionOverlay"></div>';
          b.appendChild(overlay);
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              cb(this.getElementsByTagName("input")[1].value);
              // console.log(this.getElementsByTagName("input")[1].value);
              // document.getElementById("enviar").removeAttribute('disabled');
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
         
          if(arrLabel[i] === document.getElementById("myInput").value){
            // document.getElementById("enviar").removeAttribute('disabled'); 
          }
          // else{
          //   document.getElementById("enviar").setAttribute('disabled', true);
          // }
        }
       
        
      }
  };
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus += 2;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus -= 2;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}


function select(inp, arr, arrColor, cb) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  addMultipleEventListener(inp, ["click"], openList);

    function openList(e) {  
      e.stopPropagation();
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("div");
      a.setAttribute("id", this.id + "select-list");
      a.setAttribute("class", "select-items");
      a.classList.add("scrollbar");
      /*append the DIV element as a child of the autocomplete container:*/
      /*for each item in the array...*/
      const overlay = document.createElement("div");
      overlay.classList.add("optionOverlay");
      for (i = 0; i < arr.length; i++) {
        b = document.createElement("div");
        b.classList.add('option');
        b.classList.add('optionSelect');
        let corBackground = `rgb(${arrColor[0][i]}, ${arrColor[1][i]}, ${arrColor[2][i]})`
        b.style.background = corBackground;
        b.innerHTML += arr[i];
        b.innerHTML += '<div class="optionOverlay"></div>';
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.innerHTML += "<input type='hidden' value='" + corBackground + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e){
        //   /*insert the value for the autocomplete text field:*/
          e.stopPropagation();
          inp.value = this.getElementsByTagName("input")[0].value;
          console.log(inp.value);

          cb(inp.value, corBackground);
        
          // document.getElementById("enviar").removeAttribute('disabled');
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
          });
          a.appendChild(b);
          
        //   if(arrLabel[i] === document.getElementById("myInput").value){
        //     document.getElementById("enviar").removeAttribute('disabled'); 
        //   }
        //   else{
        //     document.getElementById("enviar").setAttribute('disabled', true);
        //   }
        }
        this.appendChild(a);
      };
      /*execute a function presses a key on the keyboard:*/
      inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "select-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("select-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("select-active");
    }
  }
  function closeAllLists(elmnt) {
    
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("select-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    // e.stopPropagation();
    closeAllLists(e.target);
  });
}


