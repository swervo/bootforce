/* global define */

define([
    'jsforce',
    'org/main'
], function(f, org) {
    'use strict';
    window.force = f;

    var $logoutDialog = $('#logoutDialog');
    var $logoutCancel = $('#logoutCancel', $logoutDialog);
    var $logoutConfirm = $('#logout', $logoutDialog);
    function tryLogout() {
        // this isnt a proper logout it just clears cookies
        // thus no promises or anything
        // the documented method has a CORS problem
        $logoutDialog.modal('hide');
        org.logout();
    }
    function closeDialog() {
        $logoutDialog.modal('hide');
    }

    $logoutConfirm.on('click', tryLogout);
    $logoutCancel.on('click', function() {
        closeDialog();
    });
});
