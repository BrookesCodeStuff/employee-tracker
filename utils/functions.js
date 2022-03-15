const inquirer = require('inquirer');
const { listenerCount } = require('process');
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
          if (opt[2] === 'department') {
            addDepartment();
          } else if (opt[2] === 'role') {
            addRole();
          } else {
            addEmployee();
          }
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
      sql = `SELECT id AS ID, name AS 'Dept. Name' FROM departments`;
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
          console.log(`Updated ${answer.emp_name}'s role!`);
          db.promise()
            .query(sql)
            .then(() => init());
        })
        .catch((err) => console.log(err))
    );
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: "What is new department's name?",
      },
    ])
    .then((answer) => {
      const sql = `INSERT into departments (name) VALUES(?);`;
      const params = [answer.name.toUpperCase()];
      console.log(`Added ${answer.name.toUpperCase()} to departments!`);
      db.promise().query(sql, params);
    })
    .then(() => init());
}

function addRole() {
  let deptArray = [];
  db.promise()
    .query(`SELECT name FROM departments;`)
    .then(([rows, fields]) =>
      rows.forEach((department) => {
        deptArray.push(department.name);
      })
    )
    .then(() =>
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: "What is the role's title?",
        },
        {
          type: 'number',
          name: 'salary',
          message: "What is the role's salary?",
        },
        {
          type: 'list',
          name: 'department',
          message: 'Which department does the role belong to?',
          choices: deptArray,
        },
      ])
    )
    .then((answers) => {
      const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, (SELECT departments.id FROM departments WHERE departments.name LIKE '${answers.department}'));`;
      const params = [answers.title, answers.salary];
      console.log(`Added ${answers.title} to the roles!`);
      db.promise().query(sql, params);
    })
    .then(() => init());
}

function addEmployee() {
  let roleArray = [];
  let mgrArray = [];
  db.promise()
    .query(
      `SELECT roles.title, departments.name AS dept_name FROM roles JOIN departments ON roles.department_id = departments.id;`
    )
    .then(([rows, fields]) => {
      rows.forEach((role) => {
        roleArray.push(`${role.dept_name}: ${role.title}`);
      });
    })
    .then(
      db
        .promise()
        .query(`SELECT first_name, last_name FROM employees;`)
        .then(([rows, fields]) => {
          rows.forEach((employee) => {
            mgrArray.push(`${employee.first_name} ${employee.last_name}`);
          });
        })
    )
    .then(() =>
      inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: "What is the employee's first name?",
        },
        {
          type: 'input',
          name: 'last_name',
          message: "What is the employee's last name?",
        },
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: roleArray,
        },
        {
          type: 'list',
          name: 'manager',
          message: "Who is the employee's manager?",
          choices: mgrArray,
        },
      ])
    )
    .then((answers) => {
      let sql;
      let mgrId = mgrArray.indexOf(answers.manager) + 1;
      const empRole = answers.role.split(': ');
      const params = [answers.first_name, answers.last_name, mgrId];
      sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT roles.id FROM roles WHERE roles.title LIKE '${empRole[1]}' AND department_id = (SELECT departments.id FROM departments WHERE departments.name LIKE '${empRole[0]}')), ?);`;
      db.promise().query(sql, params);
      console.log(
        `Added new employee ${answers.first_name} ${answers.last_name}!`
      );
    })
    .then(() => init());
}

module.exports = { init, viewRecords, updateRecord };
