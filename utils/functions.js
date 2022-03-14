const inquirer = require('inquirer');
const db = require('../db/connection');
const cTable = require('console.table');

function init() {
  inquirer
    .prompt([
      {
        type: 'list',
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
          'Quit',
        ],
      },
    ])
    .then((answer) => {
      const opt = answer.options.toLowerCase().split(' ');
      switch (opt[0]) {
        case 'view':
          viewRecords(opt[2]);
          break;
        case 'add':
          console.log('add', opt[2]);
          break;
        case 'update':
          updateRecord();
          break;
        case 'quit':
          console.log('Goodbye!');
          process.exit();
      }
    });
}

function viewRecords(table) {
  let sql;
  switch (table) {
    case 'departments':
      sql = `SELECT * FROM departments`;
      break;
    case 'roles':
      sql = `SELECT id AS ID,
             title AS Title,
             salary AS Salary,
             (SELECT name FROM departments WHERE id = roles.department_id) AS Department
            FROM roles`;
      break;
    case 'employees':
      sql = `SELECT employees.id AS ID, 
             employees.first_name AS "First Name",
             employees.last_name AS "Last Name",
             roles.title AS Title,
             (SELECT name FROM departments WHERE id = roles.department_id) AS Department,
             roles.salary AS Salary, 
             CONCAT(manager.first_name,' ',manager.last_name) AS Manager
             FROM employees 
             LEFT JOIN roles ON employees.role_id = roles.id
             LEFT JOIN employees manager ON employees.manager_id = manager.id;`;
      break;
  }
  db.promise()
    .query(sql)
    .then((rows) => {
      const table = cTable.getTable(rows[0]);
      console.log(table);
    })
    .catch(console.log())
    .then(() => init());
}

function updateRecord(record) {
  console.log(record);
}

module.exports = { init, viewRecords, updateRecord };
