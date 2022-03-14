const inquirer = require('inquirer');
const db = require('./db/connection');
const { viewRecords, updateRecord } = require('./utils/functions');

function init() {
  inquirer
    .prompt([
      {
        type: 'rawlist',
        name: 'options',
        message: 'Please choose from the following actions:',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
        ],
      },
    ])
    .then((answer) => {
      const opt = answer.options.toLowerCase().split(' ');
      switch (opt[0]) {
        case 'view':
          console.log('view', opt[2]);
          break;
        case 'add':
          console.log('add', opt[2]);
          break;
        case 'update':
          console.log('update', opt[2]);
          break;
      }
    });
}

init();
