class Picture {

    constructor(px, py, w, h, impath, cat) {
        this.posx = px;
        this.posy = py;
        this.w = w;
        this.h = h;
        this.impath = impath;
        this.imgobj = new Image();
        this.imgobj.src = this.impath;
        this.imgobj.setAttribute('crossorigin', 'anonymous');
        this.original_w = this.imgobj.width;
        this.original_h = this.imgobj.height;
        this.category = cat;
        this.hist = [];
        this.color_moments = [];
        this.manhattanDist = [];
    }

    draw(cnv) {
        let ctx = cnv.getContext("2d");

        if (this.imgobj.complete) {
            ctx.drawImage(this.imgobj, this.posx, this.posy, this.w, this.h);
            // console.log("Debug: N Time");

        } else {
            // console.log("Debug: First Time");
            let self = this;
            this.imgobj.addEventListener('load', function () {
                ctx.drawImage(self.imgobj, self.posx, self.posy, self.w, self.h);
            }, false);
        }
    }

    //method to apply the algorithms to the image.
    //Because the image have to loaded from the server, the same strategy used in the method draw()
    //is used here to access the image pixels. We do not exactly when the image in loaded and computed.
    //For this reason the event "processed_picture" was created to alert the application (ISearchEngine)
    computation(cnv, histcol, colorMom, eventP) {
        let ctx = cnv.getContext("2d");

        if (this.imgobj.complete) {
            console.log("Debug: N Time");
            canvas.setAttribute("width", this.imgobj.width);
            canvas.setAttribute("height", this.imgobj.height);
            ctx.drawImage(this.imgobj, 0, 0, this.imgobj.width, this.imgobj.height);
            let pixels =  ctx.getImageData(0, 0, this.imgobj.width, this.imgobj.height);
            // console.log(pixels);
            //let pixels = Generate_Image(cnv);
            console.log(this.impath);
            this.hist = histcol.count_Pixels(pixels);
            // this.build_Color_Rect(cnv, this.hist, histcol.redColor, histcol.greenColor, histcol.blueColor);
            this.color_moments = colorMom.moments(this.imgobj, cnv);
            // console.log(this.color_moments);
            document.dispatchEvent(eventP);

        } else {
            console.log("Debug: First Time");
            let self = this;
            this.imgobj.addEventListener('load', function () {
                canvas.setAttribute("width", self.imgobj.width);
                canvas.setAttribute("height", self.imgobj.height);
                ctx.drawImage(self.imgobj, 0, 0, self.imgobj.width, self.imgobj.height);
                let pixels =  ctx.getImageData(0, 0, self.imgobj.width, self.imgobj.height);
                // console.log(pixels);
                //let pixels = Generate_Image(cnv);
                // console.log(self.impath);
                self.hist = histcol.count_Pixels(pixels);
                // self.build_Color_Rect(cnv, self.hist, histcol.redColor, histcol.greenColor, histcol.blueColor);
                self.color_moments = colorMom.moments(self.imgobj, cnv);
                // console.log(self.color_moments);
                document.dispatchEvent(eventP);
            }, false);
        }

        // this method should be completed by the students

    }

    //method used for debug. It shows the color and the correspondent number of pixels obtained by
    //the colorHistogram algorithm
    build_Color_Rect (cnv, hist, redColor, greenColor, blueColor) {
        let ctx = canvas.getContext("2d");
        let text_y = 390;
        let rect_y = 400;
        let hor_space = 80;

        ctx.font = "12px Arial";
        for (let c = 0; c < redColor.length; c++) {
            ctx.fillStyle = "rgb(" + redColor[c] + "," + greenColor[c] + "," + blueColor[c] + ")";
            ctx.fillRect(c * hor_space, rect_y, 50, 50);
            if (c === 8) {
                ctx.fillStyle = "black";
            }
            ctx.fillText(hist[c], c * hor_space, text_y);
        }
    }

    setPosition (px, py) {
        this.posx = px;
        this.posy = py;
    }

    mouseOver(mx, my) {
        if ((mx >= this.posx) && (mx <= (this.posx + this.w)) && (my >= this.posy) && (my <= (this.posy + this.h))) {
            return true;
        }
        return false;
    }

}


//Class to compute the Color Histogram algorithm. It receives the colors and computes the histogram
//through the method count_Pixels()
class ColorHistogram {
    constructor(redColor, greenColor, blueColor) {
        this.redColor = redColor;
        this.greenColor = greenColor;
        this.blueColor = blueColor;
        this.limiar1 = 160;
        this.limiar2 = 70;
        // this method should be completed by the students

    }

    count_Pixels (pixels) {
        // this method should be completed by the students
        let hist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 
        const npixeis = pixels.data.length/4;
        for(let i = 0; i < npixeis; i++){
            const pixel = {
                r: pixels.data[i*4], //valor da componente red do pixel i                       //dividir por npixeis para normalizar?
                g: pixels.data[i*4 + 1], //valor da componente green do pixel i
                b: pixels.data[i*4 + 2] //valor da componente blue do pixel i
            }
            //redColor componente red da cor que está a ser iterada
            for(let j = 0; j < this.redColor.length; j++){ // itera 12cores
                const rAbs = Math.abs(this.redColor[j] - pixel.r); //calcula valor absoluto da diferença entre componente red da cor iterada e a componente red do pixel i
                const gAbs = Math.abs(this.greenColor[j] - pixel.g); 
                const bAbs = Math.abs(this.blueColor[j] - pixel.b);
                const sumRGB = rAbs + gAbs + bAbs;                 //soma dos 3 valores absolutos rbg
                if(sumRGB < this.limiar1 && rAbs < this.limiar2 && gAbs < this.limiar2 && bAbs < this.limiar2){  //verificaçao da semelhança de cor
                    hist[j] +=  1  //incrementar nmr pixeis da cor iterada
                }                 
            }
        }
        hist = hist.map((val) => val/npixeis)
        return hist;
    }

    calcManhattanDist(img1, img2){
        let manhattan = 0;

        for(let i=0; i < img1.color_moments.length; i++){
            manhattan += Math.abs(img1.color_moments[i] - img2.color_moments[i]);
        }
        manhattan /= img1.color_moments.length;
        return manhattan;
    }


}


//Class to compute the Color Moments algorithm. It computes the statistics moments
//through the method moments(). The moments are computed in the HSV color space. The method rgdToHsv is used
//to translate the pixel into the HSV color space
class ColorMoments {
    constructor() {
        this.h_block = 3;
        this.v_block = 3;
    }

    rgbToHsv (rc, gc, bc) {
        let r = rc / 255;
        let g = gc / 255;
        let b = bc / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h = null, s = null, v = max;

        let dif = max - min;
        s = max == 0 ? 0 : dif / max;

        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = (g - b) / dif + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / dif + 2;
                    break;
                case b:
                    h = (r - g) / dif + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    moments (imgobj, cnv) {
        let imgVetor = [];
        let wBlock = Math.floor(imgobj.width / this.h_block);
        let hBlock = Math.floor(imgobj.height / this.v_block);
        let nPixeis = wBlock * hBlock;
        let descriptor = [];
        
        let ctx = cnv.getContext("2d");
        ctx.drawImage(imgobj, 0, 0);
        
        // this method should be completed by the students
        for(let i = 0; i < this.h_block * this.v_block; i++){
            let componenteH = 0;
            let componenteV = 0;
            let componenteS = 0;
            let blocoPosx = (i % this.h_block) * wBlock;
            let blocoPosy = Math.floor( (i/ this.v_block) * hBlock);
            let pixels =  ctx.getImageData(blocoPosx, blocoPosy, wBlock, hBlock);

            for(let j = 0; j < nPixeis; j++){
                const pixel = {
                    r: pixels.data[j*4], //valor da componente red do pixel i                      
                    g: pixels.data[j*4 + 1], //valor da componente green do pixel i
                    b: pixels.data[j*4 + 2] //valor da componente blue do pixel i
                }
                let hsv = this.rgbToHsv(pixel.r, pixel.g, pixel.b);

                componenteH += hsv[0];
                componenteS += hsv[1];
                componenteV += hsv[2];
            }

            let mediaH = componenteH / nPixeis;
            let mediaS = componenteS / nPixeis;
            let mediaV = componenteV / nPixeis;
            
            let somavarianciaH = 0;
            let somavarianciaS = 0 
            let somavarianciaV = 0;
            
            for(let j = 0; j < nPixeis; j++){

                const pixel = {
                    r: pixels.data[j*4], //valor da componente red do pixel i                      
                    g: pixels.data[j*4 + 1], //valor da componente green do pixel i
                    b: pixels.data[j*4 + 2] //valor da componente blue do pixel i
                }
                let hsv = this.rgbToHsv(pixel.r, pixel.g, pixel.b);

                somavarianciaH += (hsv[0] - mediaH)**2;
                somavarianciaS += (hsv[1] - mediaS)**2;
                somavarianciaV += (hsv[2] - mediaV)**2;
            }
            let varianciaH = somavarianciaH / nPixeis;
            let varianciaS = somavarianciaS / nPixeis;
            let varianciaV = somavarianciaV / nPixeis;

            imgVetor.push(mediaH, varianciaH, mediaS, varianciaS, mediaV, varianciaV);
        }
        return imgVetor;

    }
}





