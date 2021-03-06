INSERT INTO departments (name)
VALUES
  ('CLINICAL'),
  ('EXECUTIVE'),
  ('FINANCIAL'),
  ('INFORMATICS'),
  ('IT'),
  ('SUPPLY CHAIN');

INSERT INTO roles (title, salary, department_id)
VALUES
  ('Analyst', '45000.00', 4),
  ('Analyst', '56000.00', 5),
  ('Analyst', '55000.00', 6),
  ('CEO', '1250000.00', 2),
  ('CFO', '350000.00', 2),
  ('CTO', '250000.00', 2),
  ('CNO', '350000.00', 2),
  ('Director', '120000.00', 1),
  ('Director', '120000.00', 3),
  ('Director', '120000.00', 4),
  ('Director', '120000.00', 5),
  ('Informaticist', '60000.00', 4),
  ('Manager', '100000.00', 5),
  ('Manager', '100000.00', 6),
  ('Nurse', '80000.00', 1),
  ('Nurse Tech', '45000.00', 1),
  ('Supervisor', '100000.00', 1),
  ('Supervisor', '100000.00', 3),
  ('Supervisor', '100000.00', 4);
  
  INSERT INTO employees (first_name, last_name, role_id, manager_id)
  VALUES
    ('Casey', 'Jenkins', 18, NULL),
    ('Brad', 'Jones', 1, 1),
    ('William', 'Hathaway', 3, NULL),
    ('Anastasia', 'Betancourt', 4, NULL),
    ('Alex', 'Gomez', 5, NULL),
    ('Greg', 'Viera', 6, NULL),
    ('Angelina', 'Greer', 7, NULL),
    ('Cheryl', 'Grimes', 8, 5);