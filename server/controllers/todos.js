'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('debug')('todos');
let todosPath;

function init() {
    todosPath = path.join(__dirname, '../models/todos.js');
}

function getTodos(req, res) {

    // async function main() {
    //     var todos = await fsp.readFile(todosPath);
    //     debug(todos);
    //     res.end(JSON.stringify(todos));
    // }
    // main().catch(err => debug(err));
    // try {
    //     var todos = await fsp.readFile(todosPath);
    //     res.end(JSON.stringify(data));
    //     console.info("File created successfully with Node.js v10 fs/promises!");
    // } catch (error) {
    //     console.error(error);
    // }
    // (async function () {
    //     var fileContents = await fs.promises.readFile(todosPath)
    //     res.end(JSON.stringify(data));
    // })()
    fs.readFile(todosPath, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }
        debug(data);
        res.end(JSON.stringify(JSON.parse(data)));

    });
}

module.exports = {
    getTodos: getTodos,
    init: init
};