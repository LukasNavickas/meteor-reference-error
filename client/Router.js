Router.route('/', {
    template: 'barcode_scanner'
});

Router.route('barcode_scanner', {
    template: 'barcode_scanner'
});

Router.route('List', {
    template: 'List'
});


Router.route('Options', {
    template: 'Options'
});

Router.route('DetailedView', {
    template: 'DetailedView'
});

Router.route('BackgroundInfos', {
    template: 'BackgroundInfos'
});

Router.route('ScoreView', {
    template: 'ScoreView'
});


Router.configure({
    layoutTemplate: 'Rahmen'
});
