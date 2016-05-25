import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { list } from '../imports/api/tasks.js';

Template.ScoreView.helpers({
    scoreBerechnen() {
        
        var show = Session.get('changed');
            if(show === true) {
                Meteor.call('code.check', Session.get('resscan'), function(err, result) {
                        if (err) {
                           console.log('error from ScoreView template...');
                        }
                        if (result) {
                    
                            Meteor.call('code.berechnen', result, function(err, score) {

                                if (score > 75) {
                                    Session.set('classVar', 'progress-bar-success');
                                } else if (score >= 50 && score <= 75) {
                                    Session.set('classVar', 'progress-bar-warning');
                                } else {
                                    Session.set('classVar', 'progress-bar-danger');
                                }       
                            
                            });
                            
                            Meteor.call('code.write', result, score, function(err, final) {
                                Session.set('changed', false);
                                var final = list.findOne({}, {sort: {createdAt: -1, limit: 1}});
                                var div = document.createElement("div");
                                    div.innerHTML = final.name;
                                    final.name = div.childNodes[0].nodeValue;
                                return final;
                            });
                            

                        }
                    });
            } else {
                var final = list.findOne({}, {sort: {createdAt: -1, limit: 1}});
                var div = document.createElement("div");
                    div.innerHTML = final.name;
                    final.name = div.childNodes[0].nodeValue;
                return final;
            }
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

Template.barcode_scanner.onRendered(function () {
    Session.setDefault('changed', false);
});

if (Meteor.isCordova) {
    
  Template.barcode_scanner.helpers({
        isCreateGame: function() { // USER WANTS TO scan
            var show = Session.get('changed');
            if(show === true) {
                Meteor.call('code.check', Session.get('resscan'), function(err, result) {
                        if (err) {
                            var re = confirm("The code wasn't scaned correctly. Would you like to rescan it?");
                            if (re == true) {
                                
                                cordova.plugins.barcodeScanner.scan(
                                    function (result) {
                                        Session.set('resscan', result.text);
                                        Session.set('changed', true);                                      
                                    }, 
                                    function (error) {
                                        alert("Scanning failed: " + error);
                                    }
                                );
                                
                            } else {
                                return false;
                            }                    
                        }
                        if (result) {
                            
                            Meteor.call('code.berechnen', result, function(err, score) {

                                if (score > 75) {
                                    Session.set('classVar', 'progress-bar-success');
                                } else if (score >= 50 && score <= 75) {
                                    Session.set('classVar', 'progress-bar-warning');
                                } else {
                                    Session.set('classVar', 'progress-bar-danger');
                                }       
                            
                            });
                            
                            Meteor.call('code.write', result, score, function(err, final) {
                                Session.set('changed', false);
                                Router.go('/ScoreView');
                            });
                            

                        }
                    });
            } else {
                return false;
            }
        }
});  

  Template.barcode_scanner.events({
    'click .scanButton': function (event) {
        
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                Session.set('resscan', result.text);
                Session.set('changed', true);            
            }, 
            function (error) {
                alert("Scanning failed: " + error);
            }
        );

    }

  });
}
