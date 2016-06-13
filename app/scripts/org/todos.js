/* global define */

define([
    'knockout'
], function(ko) {
    'use strict';

    function Todo(aTodoObj) {
        this.contact = aTodoObj.contact;
        this.assignee = aTodoObj.assignee;
        this.notes = aTodoObj.notes;
        this.when = aTodoObj.when;
    }

    function Todos() {

    }

    Todos.prototype = {
        todos: ko.observableArray([]),
        totalTodos: ko.observable(''),
        updateTodos: function(aTodoData) {
            this.totalTodos(aTodoData.length);
            aTodoData.forEach(function(aTodo) {
                this.todos.push(new Todo(aTodo));
            }, this);
        },
        getTodos: function() {
            var todoPromise = $.getJSON('/scripts/modules/data/todos.json');
            todoPromise.success(function(aData) {
                this.updateTodos(aData);
            }.bind(this));
            todoPromise.error(function(e) {
                console.log(e);
                console.log('json load error');
            });
            todoPromise.complete(function() {
                console.log('data load done');
            });
        }
    };

    return Todos;

});
