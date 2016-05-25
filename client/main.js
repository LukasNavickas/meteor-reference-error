import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { list } from '../imports/api/tasks.js';

Template.ScoreView.helpers({
    scoreBerechnen() {
        var final = list.findOne({}, {sort: {createdAt: -1, limit: 1}});
        var div = document.createElement("div");
            div.innerHTML = final.name;
            final.name = div.childNodes[0].nodeValue;
        return final;
    },
    classVar() {
        return Session.get('classVar');
    }
});

Template.DetailedView.helpers({
    werteBerechnen() {
        var final = list.findOne({}, {sort: {createdAt: -1, limit: 1}});
        var div = document.createElement("div");
            div.innerHTML = final.name;
            final.name = div.childNodes[0].nodeValue;
        return final;
    }
});

Template.BackgroundInfos.helpers({
    werteBerechnen() {
        var final = list.findOne({}, {sort: {createdAt: -1, limit: 1}});
        var div = document.createElement("div");
            div.innerHTML = final.name;
            final.name = div.childNodes[0].nodeValue;
        return final;
    }
});

if (Meteor.isCordova) {

  Template.barcode_scanner.events({
    'click .scanButton': function (event) {
        
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (confirm("You want to check the product with the following barcode? - " + result.text) == true) {
                    Meteor.call('code.check', result.text, function(err, finresult) {
                        if (finresult) {
                                    
                            Meteor.call('code.berechnen', finresult, function(err, score) {

                                if (score > 75) {
                                    Session.set('classVar', 'progress-bar-success');
                                } else if (score >= 50 && score <= 75) {
                                    Session.set('classVar', 'progress-bar-warning');
                                } else {
                                    Session.set('classVar', 'progress-bar-danger');
                                }       
                            
                            });
                            
                            Meteor.call('code.write', finresult, score, function(err, final) {
                                Router.go('/ScoreView');
                            });
                            

                        }
                    });
                } else {
                    alert("You pressed Cancel!");
                }    
                
            
                
            }, 
            function (error) {
                alert("Scanning failed: " + error);
            }
        );

    }

  });
}
