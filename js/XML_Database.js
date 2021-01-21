class XML_Database {
    constructor () {

    }

    loadXMLfile (filename) {
        let xmlhttp = {};
        let xmlDoc = {};

        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        xmlhttp.open("GET", filename, false);
        xmlhttp.send();
        xmlDoc = xmlhttp.responseXML;
        return xmlDoc;
    }

    SearchXML (query, xmlDoc, num_Img, page = 0) {
        let Images_path = [];
        let x = xmlDoc.getElementsByClassName(query);
        if (num_Img > x.length) {
            num_Img = x.length;
        }

        for (let i = page*num_Img; i < (page + 1)*num_Img; i++) {
            for (let j = 0; j < x[i]?.childNodes.length; j++) {
                if (x[i].childNodes[j].nodeName == "path") {
                    Images_path.push(x[i].childNodes[j].textContent);
                    break;
                }
            }
        }
        return Images_path;
    }
}


class LocalStorageXML {

    constructor() {

    }

    saveLS_XML (keyname, xmlRowString) {
        if (typeof(localStorage) == 'undefined')
            alert('Your browser does not support HTML5 localStorage. Try upgrading.');
        else {
            try {
                localStorage.setItem(keyname, xmlRowString);
            }
            catch (e) {
                alert("save failed!");
                if (e == QUOTA_EXCEEDED_ERR)
                    alert('Quota exceeded!');
            }
        }
    }
    
    readLS_XML (keyname, query, num_Img, page = 0){
        let Images_path = [];
        let xmlDoc = null;
        let localStorageRow = localStorage.getItem(keyname);

        if (window.DOMParser) {
            let parser = new DOMParser();
            xmlDoc = parser.parseFromString(localStorageRow, "text/xml");
        }
        else throw new TypeError("LocalStorageXML-readLS_XML: Error with DOMParser");

        let x = xmlDoc.getElementsByClassName(query);

        if (num_Img > x.length) {
            num_Img = x.length;
        }

        for (let i = page*num_Img; i < (page + 1)*num_Img; i++) {
            for (let j = 0; j < x[i]?.childNodes.length; j++) {
                if (x[i].childNodes[j].nodeName == "path") {
                    Images_path.push(x[i].childNodes[j].textContent);
                    break;
                }
            }
        }
        
        return Images_path;
      
    }

}














    
    
   