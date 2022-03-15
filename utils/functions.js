const inquirer = require('inquirer');
const db = require('../db/connection');
require('console.table');

// Display "main menu"
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
      // Assign the first word (ex. view) and the second word
      // (ex. employees) to array
      const opt = answer.options.toLowerCase().split(' ');
      // Run function depending on menu choice
      // ie. the first word of the opt array
      // and pass second word of opt array as parameter
      // ie. employee
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

// View records based on choice
function viewRecords(table) {
  let sql;
  switch (table) {
    case 'departments':
      sql = `SELECT * FROM departments`;
      break;
    case 'roles':
      sql = `SELECT r.id AS ID,
             r.title AS Title,
             r.salary AS Salary,
             d.name as Department
             FROM roles r
             JOIN departments d ON r.department_id = d.id
             GROUP BY r.id ORDER BY d.name;`;
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
      console.table(rows[0]);
    })
    .catch(console.log())
    .then(() => init());
}

function updateRecord() {
  let empArray = [];
  let roleArray = [];
  db.promise()
    .query(`SELECT first_name, last_name FROM employees;`)
    .then(([rows, fields]) =>
      rows.forEach((employee) => {
        empArray.push(`${employee.first_name} ${employee.last_name}`);
      })
    )
    .then(
      db
        .promise()
        .query(
          `SELECT roles.title, departments.name AS dept_name FROM roles JOIN departments ON roles.department_id = departments.id;`
        )
        .then(([rows, fields]) => {
          rows.forEach((role) => {
            roleArray.push(`${role.dept_name}: ${role.title}`);
          });
          console.log(roleArray);
        })
        .then(() =>
          inquirer.prompt([
            {
              type: 'list',
              name: 'emp_name',
              message: "Which employee's role do you want to update?",
              choices: empArray,
            },
            {
              type: 'list',
              name: 'emp_role',
              message: "What is the employee's new role?",
              choices: roleArray,
            },
          ])
        )
        .then((answer) => {
          let empName = answer.emp_name.split(' ');
          let empRole = answer.emp_role.split(': ');
          const sql = `UPDATE employees SET role_id = (SELECT roles.id FROM roles WHERE roles.title LIKE '${empRole[1]}' AND department_id = (SELECT departments.id FROM departments WHERE departments.name LIKE '${empRole[0]}')) WHERE employees.first_name LIKE '${empName[0]}' AND employees.last_name LIKE '${empName[1]}';`;
          db.promise()
            .query(sql)
            .then(() => init());
        })
        .catch(console.log())
    );
}

module.exports = { init, viewRecords, updateRecord };
