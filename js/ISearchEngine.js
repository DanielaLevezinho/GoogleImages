'use strict';

class ISearchEngine {
    constructor(dbase) {
        this.allpictures = new Pool(3000);
        this.colors = ["red", "orange", "yellow", "green", "Blue-green", "blue", "purple", "pink", "white", "grey", "black", "brown"];
        this.redColor = [204, 251, 255, 0, 3, 0, 118, 255, 255, 153, 0, 136];
        this.greenColor = [0, 148, 255, 204, 192, 0, 44, 152, 255, 153, 0, 84];
        this.blueColor = [0, 11, 0, 0, 198, 255, 167, 191, 255, 153, 0, 24];
        this.categories = ["beach", "birthday", "face", "indoor", "manmade/artificial", "manmade/manmade","manmade/urban", "marriage", "nature", "no_people", "outdoor", "party", "people", "snow"];
        this.categoriesLabel = ["Beach", "Birthday", "Face", "Indoor", "Artificial", "Manmade","Urban", "Marriage", "Nature", "No people", "Outdoor", "Party", "People", "Snow"];
        this.XML_file = dbase;
        this.XML_db = new XML_Database();
        this.LS_db = new LocalStorageXML();
        this.num_Images = 100;
        this.numshownpic = 30;
        this.imgWidth = 190;
        this.imgHeight = 140;
        this.selectedColor;
        this.selectedCategory;
        this.nColumns;
        this.paddingHorizontalMinimo = 15;
        this.paddingVerticalMinimo = 15;
        this.paddingHorizontal;
        this.page = 0;
        this.imagesProcessed = 100;
        this.imageSelected;
        this.showingAllPic = false;
    }

    init(cnv) {
        this.databaseProcessing(cnv);

    }

    // method to build the database which is composed by all the pictures organized by the XML_Database file
    // At this initial stage, in order to evaluate the image algorithms, the method only compute one image.
    // However, after the initial stage the method must compute all the images in the XML file
    databaseProcessing (cnv) {
        let h12color = new ColorHistogram(this.redColor, this.greenColor, this.blueColor);
        let colmoments = new ColorMoments();
        // let imgs = [new Picture(0, 0, 100, 100,"Images/daniel1.jpg", "beach")]; 
        let imgs = this.getAllImages();
 

        for(let i = 0; i < imgs.length; i++){
            // if (imgs[i].category === "beach"){
                const img = imgs[i];
                let eventname = "processed_picture_" + img.impath;
                let eventP = new Event(eventname);
                let self = this;
                document.addEventListener(eventname, function(){
                    self.imageProcessed(img, eventname);
                },false);
                img.computation(cnv, h12color, colmoments, eventP);

            // }
        }
    }

    getAllImages(){
        const images = [];
        for(let i = 0; i < this.categories.length; i++){
            const xml = this.XML_db.loadXMLfile(this.XML_file);
            const res = this.XML_db.SearchXML(this.categories[i], xml, 1000); 
            for(let j = 0; j < res.length; j++){  //res array de paths da categoria i
                let img = new Picture(0, 0, 100, 100, res[j], this.categories[i]); 
                images.push(img);
            }
        }
        return images;
    }


    //When the event "processed_picture_" is enabled this method is called to check if all the images are
    //already processed. When all the images are processed, a database organized in XML is saved in the localStorage
    //to answer the queries related to Color and Image Example
    imageProcessed (img, eventname) {
        this.allpictures.insert(img);
        console.log("image processed " + this.allpictures.stuff.length + eventname);
        // (this.num_Images*this.categories.length))
        if(this.allpictures.stuff.length === (this.num_Images*this.categories.length)){
            this.createXMLColordatabaseLS();
            // this.createXMLIExampledatabaseLS();
        }
    }

    sortPixelCount(array, index){
        //sort por pixeis do maior para menor (decrescente) para uma cor
        return array.sort((a, b) => a.hist[index] - b.hist[index]).reverse();
    }

    //Method to create the XML database in the localStorage for color queries
    createXMLColordatabaseLS() {
        // this method should be completed by the students
       
        let parser = new DOMParser();
        for(let i = 0; i < this.categories.length; i++){
            //itera sobre o stuff e vai filtrar com base na categoria
            // e retira do array os que nao verificam a condicao
            let xmlDoc = parser.parseFromString("<images></images>", "text/xml");
            const categImgs = this.allpictures.stuff.filter((img) => img.category === this.categories[i])
            this.colors.forEach((color, m) => {
                //desconstrucao do array para fazer uma copia do array sorted com um id diferente
                const sortedImages = [...this.sortPixelCount(categImgs, m)];
                for(let j = 0; j < this.imagesProcessed; j++){
                    const tagImage = xmlDoc.createElement("image");         
                    tagImage.classList.add(color);
                    const tagPath = xmlDoc.createElement("path");
                    tagPath.innerHTML = sortedImages[j].impath;
                    tagImage.appendChild(tagPath);
                    xmlDoc.getElementsByTagName("images")[0].appendChild(tagImage);
                }
            });
            this.LS_db.saveLS_XML(this.categories[i], new XMLSerializer().serializeToString(xmlDoc));
        }
        
        
    }

    //Method to create the XML database in the localStorage for Image Example queries
    createXMLIExampledatabaseLS() {
        let list_images = new Pool(this.allpictures.stuff.length);
        this.zscoreNormalization();
        let parser = new DOMParser();
        for(let i = 0; i < this.allpictures.stuff.length; i++){
            let arrayDistance = [];
            for(let j = 0; j < this.allpictures.stuff.length; j++){
                if( i !== j){
                    arrayDistance.push({
                        dist : this.calcManhattanDist(this.allpictures.stuff[i], this.allpictures.stuff[j]), 
                        imgPath : this.allpictures.stuff[j].impath
                    });
                }
            }
            const sortedImages = [...this.sortbyManhattanDist(arrayDistance)];
            let xmlDoc = parser.parseFromString("<images></images>", "text/xml");

            for(let j = 0; j < 30; j++){
                const tagImage = xmlDoc.createElement("image");
                tagImage.classList.add("Manhattan");
                const tagPath = xmlDoc.createElement("path");
                tagPath.innerHTML = sortedImages[j].imgPath;
                tagImage.appendChild(tagPath);
                xmlDoc.getElementsByTagName("images")[0].appendChild(tagImage);
            }
            this.LS_db.saveLS_XML(this.allpictures.stuff[i].impath, new XMLSerializer().serializeToString(xmlDoc));
        }
        // this method should be completed by the students
    }

    //A good normalization of the data is very important to look for similar images. This method applies the
    // zscore normalization to the data
    zscoreNormalization() {
        let overall_mean = [];
        let overall_std = [];

        // Inicialization
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean.push(0);
            overall_std.push(0);
        }

        // Mean computation I
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_mean[j] += this.allpictures.stuff[i].color_moments[j];
            }
        }

        // Mean computation II
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean[i] /= this.allpictures.stuff.length;
        }

        // STD computation I
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_std[j] += Math.pow((this.allpictures.stuff[i].color_moments[j] - overall_mean[j]), 2);
            }
        }

        // STD computation II
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_std[i] = Math.sqrt(overall_std[i]/this.allpictures.stuff.length);
        }

        // zscore normalization
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                this.allpictures.stuff[i].color_moments[j] = (this.allpictures.stuff[i].color_moments[j] - overall_mean[j]) / overall_std[j];
            }
        }
    }

    //Method to search images based on a selected color
    searchColor(category, color, page = 0) {
        // this method should be completed by the students
        const cnv = document.getElementById("canvas");
        let buscarCategoria = this.LS_db.readLS_XML(category, color, this.numshownpic, page);
        if(page === 0){
            this.page = 0;
            this.allpictures.empty_Pool(); 
            this.showingAllPic = false;
        }

        for(let i = 0; i < buscarCategoria.length; i++){
            this.allpictures.insert(buscarCategoria[i]);
        }
        this.gridView(cnv);
        
    }

    //Method to search images based on keywords
    searchKeywords(category, page = 0) {
        // this method should be completed by the students
        const cnv = document.getElementById("canvas");
        const xml = this.XML_db.loadXMLfile(this.XML_file);
        const res = this.XML_db.SearchXML(category, xml, 30, page); 

        if(page === 0){
            this.page = 0;
            this.allpictures.empty_Pool();
            this.showingAllPic = false;
        }   
        
        for(let i = 0; i < res.length; i++){
            this.allpictures.insert(res[i]);
            
        }
        this.gridView(cnv);

    }

    //Method to search images based on Image similarities
    searchISimilarity(imgPath, page = 0) {
        // this method should be completed by the students
        const cnv = document.getElementById("canvas");
        let buscarPathImagem = this.LS_db.readLS_XML(imgPath, "Manhattan", this.numshownpic, page);
       
        if(page === 0){
            this.page = 0;
            this.allpictures.empty_Pool();
            this.showingAllPic = false;
        }
        for(let i = 0; i < buscarPathImagem.length; i++){
            this.allpictures.insert(buscarPathImagem[i]);
        }
        this.gridView(cnv);

    }

    //Method to compute the Manhattan difference between 2 images which is one way of measure the similarity
    //between images.
    calcManhattanDist(img1, img2){
        let manhattan = 0;

        for(let i=0; i < img1.color_moments.length; i++){
            manhattan += Math.abs(img1.color_moments[i] - img2.color_moments[i]);
        }
        manhattan /= img1.color_moments.length;
        return manhattan;
    }

    //Method to sort images according to the Manhattan distance measure
    sortbyManhattanDist(array){
        // this method should be completed by the students
        return array.sort((a, b) => a.dist - b.dist);
    }

    //Method to sort images according to the number of pixels of a selected color
    sortbyColor (idxColor, list) {
        list.sort(function (a, b) {
            return b.hist[idxColor] - a.hist[idxColor];
        });
    }

    mouseOver(e) {
        let x = e.offsetX;
        let y = e.offsetY;
        let column = Math.floor((x - this.paddingHorizontal) / (this.imgWidth + this.paddingHorizontal));
        let row = Math.floor((y - this.paddingHorizontal) / (this.imgHeight + this.paddingHorizontal));
        let xMin = column * (this.paddingHorizontal + this.imgWidth) + this.paddingHorizontal;
        let xMax = xMin + this.imgWidth;
        let yMin = row * (this.paddingHorizontal + this.imgHeight) + this.paddingHorizontal;
        let yMax = yMin + this.imgHeight;
        let index = row * this.nColumns + column;
        if(xMin < x  && x < xMax && yMin < y && y < yMax){
            if(this.allpictures.stuff[index]){

                this.imageSelected = this.allpictures.stuff[index];
                this.searchISimilarity(this.imageSelected);
            }
        }
    }

    debounce_leading(func, timeout = 300){
        return (...args) => {
          if (!this.timer) {
            // console.log(this.timer);
            func.apply(this, args);
          }
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.timer = undefined;
          }, timeout);
        };
      }

    loadMore(){
        document.getElementsByClassName("loader")[0]?.remove();
        
        // console.log(this.showingAllPic)
        if(!this.showingAllPic){
            let visualizacaoScroll = document.getElementById("visualizacao");
            let footer = document.getElementById("foots");
            let loader = document.createElement("div");
            loader.classList.add("loader");
            visualizacaoScroll.insertBefore(loader, footer);

            setTimeout(() => {
                this.page += 1;
                if(this.imageSelected){
                    app.searchISimilarity(this.imageSelected, this.page);
                }
                
                else if(app.selectedColor){
                    app.searchColor(app.selectedCategory, app.selectedColor, this.page);
                }
                
                
                else{
                    app.searchKeywords(app.selectedCategory, this.page);
                }
    
            },500);
        }
    }
    
    
    //Method to visualize images in canvas organized in columns and rows
    gridView (canvas) {
        // this method should be completed by the students
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.showingAllPic = this.allpictures.stuff.length < this.numshownpic * (this.page + 1);
        let numPics = this.showingAllPic ? this.allpictures.stuff.length : this.numshownpic * (this.page + 1);
        let cnvWidth = window.innerWidth;
        canvas.setAttribute("width", cnvWidth);
        this.nColumns = Math.floor(cnvWidth/(this.imgWidth + this.paddingVerticalMinimo));
        let rows = Math.ceil(numPics / this.nColumns);
        let espacamentoHorizontal = cnvWidth - this.imgWidth * this.nColumns;
        this.paddingHorizontal = espacamentoHorizontal / (this.nColumns + 1);
        let cnvHeight = rows * (this.imgHeight + this.paddingHorizontal) + this.paddingHorizontal ;
        canvas.setAttribute("height", cnvHeight);
        let visualizacaoScroll = document.getElementById("visualizacao");
        visualizacaoScroll.removeEventListener("scroll", app.scrollfunc);
        canvas.removeEventListener('click', app.func);
        for(var i = 0; i < this.allpictures.stuff.length; i++){
            if( i < numPics){
                let row = Math.floor(i/this.nColumns); //row da imagem 
                let column = i - row*this.nColumns;   //coluna da imagem
                if(row <= rows && column <= this.nColumns){ //nao desenha se exceder colunas e rows
                    let posx = column*this.imgWidth;
                    let posy = row* this.imgHeight;
                    const picture = new Picture(posx + this.paddingHorizontal * (column + 1), posy + this.paddingHorizontal * (row + 1), this.imgWidth, this.imgHeight, this.allpictures.stuff[i], "");
                    picture.draw(canvas);
                } 
            }
            
        }
        //     let buttonTop = document.getElementById("backToTop");
        //     buttonTop.addEventListener("click", app.auxTop);

        //     app.auxTop = (e) => {
        //         // let rootElement = document.documentElement;
        //         console.log(e)
        //         // console.log(rootElement);
        //         // window.scrollTo(0, 0);
        //         window.scrollTo({
        //             top: 0,
        //             left: 0,
        //             behavior: "smooth"
        //     })
        // }   
        
        app.scrollfunc = (e) =>{
            // console.log([visualizacaoScroll.offsetHeight, visualizacaoScroll.scrollTop, visualizacaoScroll.scrollHeight]);
            if (visualizacaoScroll.offsetHeight + visualizacaoScroll.scrollTop >= 0.95*visualizacaoScroll.scrollHeight) {
                this.debounce_leading(() => this.loadMore())();
            }
        }
        
        app.func = (e) => this.mouseOver(e);
        canvas.addEventListener('click', app.func);
        visualizacaoScroll.addEventListener("scroll", app.scrollfunc);
    }
    
}


class Pool {
    constructor (maxSize) {
        this.size = maxSize;
        this.stuff = [];

    }

    insert (obj) {
        if (this.stuff.length < this.size) {
            this.stuff.push(obj);
        } else {
            alert("The application is full: there isn't more memory space to include objects");
        }
    }

    remove () {
        if (this.stuff.length !== 0) {
            this.stuff.pop();
        } else {
           alert("There aren't objects in the application to delete");
        }
    }

    empty_Pool () {
        while (this.stuff.length > 0) {
            this.remove();
        }
    }
}

