'use strict';

var ko = require('knockout');

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
        var todoPromise = $.getJSON('scripts/org/data/todos.json');
        todoPromise.done(function(aData) {
            this.updateTodos(aData);
        }.bind(this));
        todoPromise.fail(function(e) {
            console.log(e);
            console.log('json load error');
        });
        todoPromise.always(function() {
            console.log('data load done');
        });
    }
};

module.exports = Todos;
