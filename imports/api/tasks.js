import { Meteor } from 'meteor/meteor';

export const list = new Ground.Collection('list', { connection: null });

Meteor.methods({
    'code.check'(info) {
        
        allInfo = ScrapeParser.get('http://www.codecheck.info/product.search?q='+info);    
        ref = allInfo.references[1];
        
        ScrapeParser.registerHelper('toInt', function(str, url) {
            return parseInt('0'+str.replace(',', ''));
        });

        ScrapeParser.registerHelper('titleLinks', function(arr, url) {
            return arr && arr.map(function(str) {
                var $ = cheerio.load(str);
                var link = $('a.title');
                return { link: link.attr('href'), title: link.text() };
            });
        });
        
        function changeToG(str) {
            var kilogramm = new RegExp("kilogramm");
            var kg = new RegExp("kg");
            var Kg = new RegExp("Kg");
            
            var L = new RegExp("L");
            var l = new RegExp("l");
            var ml = new RegExp("ml");
            var Liter = new RegExp("Liter");
            var liter = new RegExp("liter");
            
            
            var strToNr = parseFloat(str);
            
            if (ml.exec(str)) {
                console.log('NICHT umgewandelt: ' + strToNr);
                return strToNr;
            }
            
            if (kilogramm.exec(str) || kg.exec(str) || Kg.exec(str) || L.exec(str) || Liter.exec(str) || l.exec(str) || liter.exec(str)) {
                console.log('in gramm/ml umgewandelt: ' + strToNr * 1000);
                return strToNr * 1000;
            } else {
                console.log('NICHT umgewandelt: ' + strToNr);
                return strToNr;
            }
            
        }

        ScrapeParser.reset(); // Remove any/all stored parsers

        ScrapeParser.parser(ref, {
            titles: { path: 'td.c3', content: true, multi: true },
            prozent: { path: 'td.c-2', content: true, multi: true },
            packung: { path: 'body > div.page.product-info > div.float-group > div.page-col-1-2-left > div.block.prod-basic-info > div > div:nth-child(2) > p:nth-child(2)', content: true, multi: true },
            name: { path: 'div.page-title-headline h1', content: true, multi: true },
        });
     
        

        ScrapeParser.resetExcept([ref]); // Remove stored parsers except those in array
        
        values = ScrapeParser.get(ref); 
        
        values.packung[0] = values.packung[0].replace(",", ".");
        values.packung[0] = changeToG(values.packung[0]);
        
        values.name[0] = values.name[0].trim();
        
        
        if (isNaN(parseFloat(values.titles[0]))) { values.titles[0] = 0; } else { values.titles[0] = parseFloat(values.titles[0].replace(",", ".")) }
        if (isNaN(parseFloat(values.titles[1]))) { values.titles[1] = 0; } else { values.titles[1] = parseFloat(values.titles[1].replace(",", ".")) }
        if (isNaN(parseFloat(values.titles[2]))) { values.titles[2] = 0; } else { values.titles[2] = parseFloat(values.titles[2].replace(",", ".")) }
        if (isNaN(parseFloat(values.titles[3]))) { values.titles[3] = 0; } else { values.titles[3] = parseFloat(values.titles[3].replace(",", ".")) }
        if (isNaN(parseFloat(values.prozent[0]))) { values.prozent[0] = 0; }
        if (isNaN(parseFloat(values.prozent[1]))) { values.prozent[1] = 0; }
        if (isNaN(parseFloat(values.prozent[2]))) { values.prozent[2] = 0; }
        if (isNaN(parseFloat(values.prozent[3]))) { values.prozent[3] = 0; }
        
        values.titles[4] = values.prozent[0];
        values.titles[5] = values.prozent[1];
        values.titles[6] = values.prozent[3];
        values.titles[7] = values.packung[0];
        values.titles[8] = values.name[0];
        
   
        return values;
    },
    'code.write'(values, score) {
        list.insert({
            fett: values.titles[0],
            gesfett: values.titles[1],
            zucker: values.titles[2],
            salz: values.titles[3],
            kalorien: values.prozent[0],
            eiweiss: values.prozent[1],
            kohlen: values.prozent[3],
            packung: values.packung[0],
            name: values.name[0],
            score: score,
            createdAt: new Date(), // current time
         });
    },
    'code.berechnen'(values) {
        //Berechnung Energiegehalt für energiehelper

        var energiegehhelper = 0;

                energiegehhelper = (2000 * (values.titles[4]) ) / 10000
                console.log('energiegehhelper ' + energiegehhelper);
                

        //Berechnung Energiedichte

        var energiedihelp = 0;

                if (energiegehhelper <= 1.5) {
                    energiedihelp = 0;
                }
                else if (energiegehhelper > 1.5 && energiegehhelper < 2.5){
                    energiedihelp = 25
                }
                else {
                    energiedihelp = 50
                }


        //Berechnung FettScore

        var fetthelp = 0;

                if (values.titles[0] <= 3) {
                    fetthelp = 0;
                }
                else if (values.titles[0] > 3 && values.titles[0] < 20){
                    fetthelp = 6.25
                }
                else if (values.titles[0] >= 20 && values.titles[0] < 40){
                    fetthelp = 6.25
                }
                else {
                    fetthelp = 25
                }


        //Berechnung gesättigteFettsäuren

        var gesFetthelp = 0;

                if (values.titles[1] <= 1.5) {
                    gesFetthelp = 0;
                }
                else if (values.titles[1] > 1.5 && values.titles[1] < 5){
                    gesFetthelp = 6.25
                }
                else if (values.titles[1] >= 5 && values.titles[1] < 10){
                    fgesFetthelp = 6.25
                }
                else {
                    gesFetthelp = 25
                }


        //Berechnung Zuckeranteil

        var zuckerhelp = 0;

                if (values.titles[2] <= 5) {
                    zuckerhelp = 0;
                }
                else if (values.titles[2] > 5 && values.titles[2] < 12.5){
                    zuckerhelp = 6.25
                }
                else if (values.titles[2] >= 12.5 && values.titles[2] < 25){
                    zuckerhelp = 6.25
                }
                else {
                    zuckerhelp = 25
                }


        //Berechnung Salzanteil

        var salzhelp = 0;

                if (values.titles[3] <= 0.3) {
                    salzhelp = 0;
                }
                else if (values.titles[3] > 0.3 && values.titles[3] < 1.5){
                    salzhelp = 6.25
                }
                else if (values.titles[3] >= 1.5 && values.titles[3] < 3){
                    salzhelp = 6.25
                }
                else {
                    salzhelp = 25
                }


        //Score Berechnung

                if ((fetthelp + gesFetthelp + zuckerhelp + salzhelp) > 50){
                    console.log('fetthelp ' + fetthelp);
                    console.log('gesFetthelp ' + gesFetthelp);
                    console.log('zuckerhelp ' + zuckerhelp);
                    console.log('salzhelp ' + salzhelp);
                    return score = 100 - energiedihelp - 50
                }

                else {
                    console.log('fetthelp ' + fetthelp);
                    console.log('gesFetthelp ' + gesFetthelp);
                    console.log('zuckerhelp ' + zuckerhelp);
                    console.log('salzhelp ' + salzhelp);
                    return score = 100 - energiedihelp - fetthelp - gesFetthelp - zuckerhelp - salzhelp;
                }
    }
});