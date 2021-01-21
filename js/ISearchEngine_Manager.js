
let app = null;

function main() {
    let canvas = document.querySelector("canvas");
    app = new ISearchEngine("XML/Image_database.xml");
    autocomplete(document.getElementById("myInput"), app.categories, app.categoriesLabel, (val) =>{
        app.selectedCategory = val;
        console.log(val);
        if(app.selectedColor){
            app.searchColor(app.selectedCategory, app.selectedColor);
        }
        else{
            app.searchKeywords(app.selectedCategory);
        }
        manageToolbar(app);
    });
    select(document.getElementById("inputCor"), app.colors, [app.redColor, app.greenColor, app.blueColor], (val, valor)=>{
        app.selectedColor = val;
        if(app.selectedCategory !== undefined){
            console.log(app.selectedCategory);
            app.searchColor(app.selectedCategory, val);
        }
        changeColor(valor);
        manageToolbar(app);
    });
    // app.init(canvas);   
    manageToolbar(app);
    window.addEventListener("resize", (e) =>{
        app.gridView(canvas);
    })
}

function backToTop(){
    let vis = document.getElementById("visualizacao");
    vis.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}


function toggleMute() {
    let mute = document.getElementById("mute");
    let audio = document.getElementById("audio");
    let mutes = document.getElementById("mutes");
    let som = document.getElementById("som");
    if (audio.muted) {
        mutes.style.display = "none";
        som.style.display = "block";
        audio.muted = false;
    }
    else {
        console.log("hey")
        som.style.display = "none";
        mutes.style.display = "block";
        audio.muted = true;
    }
}


function manageToolbar(app){
    let id = document.getElementById("tools");
    let cnv = document.getElementById("canvas");
    let body = document.getElementById("bodys");
    let footer = document.getElementById("foots");
    let audio = document.getElementById("audio");
    if(app.allpictures.stuff.length){
        id.classList.remove('toolsInit');
        body.style.background = "aliceblue";
        cnv.style.visibility = "visible";
        footer.style.visibility = "visible";
        audio.style.display = "none";
        mute.style.display = "block"
    }
    else{
        id.classList.add('toolsInit');
        cnv.style.visibility = "hidden";
        footer.style.visibility = "hidden";
        audio.style.display = "none";
        mute.style.display = "none";
    }
}


function changeColor(valor){
    if(app.selectedColor){
        let divCor = document.getElementById("inputCor");
        let selectClass = document.getElementById("imgCor");
        if(selectClass){
            divCor.removeChild(selectClass);
        }
        let criarCor = document.createElement("div");
        criarCor.id = "imgCor";
        divCor.appendChild(criarCor);
        criarCor.classList.add('classCor');;
        criarCor.style.background = valor;
        criarCor.style.backgroundSize = 'cover';
        
    }
}



function Generate_Image(canvas) {
    var ctx = canvas.getContext("2d");
    var imgData = ctx.createImageData(100, 100);

    for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = 204;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
        if ((i >= 8000 && i < 8400) || (i >= 16000 && i < 16400) || (i >= 24000 && i < 24400) || (i >= 32000 && i < 32400))
            imgData.data[i + 1] = 200;
    }
    ctx.putImageData(imgData, 150, 0);
    return imgData;
}




