import $ from 'jquery';
import "./../../../node_modules/bootstrap/dist/js/bootstrap"

$(document).ready(() => {
    console.log('DOM ready via JQuery!');

    const test = async () => {

        return await console.log('test');


    }

    test();
});
