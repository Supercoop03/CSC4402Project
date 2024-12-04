const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser'); // If you are using Express 4.x

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
const db = new sqlite3.Database('tiger_temp.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Set up Express to use EJS for rendering HTML
app.set('view engine', 'ejs');

// Route to display all workers
app.get('/workers', (req, res) => {
    db.all('SELECT * FROM Worker', [], (err, rows) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            res.status(500).send('Error retrieving workers.');
        } else {
            res.render('workers', { workers: rows });
        }
    });
});

// Route to display the edit form for a specific worker
app.get('/workers/edit/:id', (req, res) => {
    const workerId = req.params.id;
    db.get('SELECT * FROM Worker WHERE WorkerID = ?', [workerId], (err, row) => {
        if (err) {
            console.error('Error retrieving worker:', err.message);
            res.status(500).send('Error retrieving worker.');
        } else {
            res.render('edit_worker', { worker: row });
        }
    });
});

// Route to handle worker edits
app.post('/workers/edit/:id', (req, res) => {
    const workerId = req.params.id;
    const { name, address, contactInfo, skills, assignmentId } = req.body; // Adjusted to use contactInfo

    console.log(`Updating WorkerID ${workerId} with Name: ${name}, ContactInfo: ${contactInfo}, Skills: ${skills}, Address: ${address}`);

    const query = `
        UPDATE Worker
        SET Name = ?, Address = ?, ContactInfo = ?, Skills = ?, AssignmentID = ?
        WHERE WorkerID = ?
    `;

    db.run(query, [name, address, contactInfo, skills, assignmentId, workerId], function (err) {
        if (err) {
            console.error('Error updating worker:', err.message);
            res.status(500).send(`Error updating worker: ${err.message}`);
        } else {
            console.log(`Worker with ID ${workerId} updated successfully.`);
            res.redirect('/workers');
        }
    });
});

// Route to display the "Add Worker" form
app.get('/workers/add', (req, res) => {
    res.render('add_worker');
});

app.post('/workers/add', (req, res) => {
    const { name, address, contactInfo, skills, assignmentId } = req.body;

    const query = `
        INSERT INTO Worker (Name, Address, ContactInfo, Skills, AssignmentID)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [name, address, contactInfo, skills, assignmentId], function (err) {
        if (err) {
            console.error('Error adding worker:', err.message);
            res.status(500).send(`Error adding worker: ${err.message}`);
        } else {
            console.log(`Worker added successfully with ID ${this.lastID}.`);
            res.redirect('/workers');
        }
    });
});

// Route to delete a worker
app.get('/workers/delete/:id', (req, res) => {
    const workerId = req.params.id;

    db.run('DELETE FROM Worker WHERE WorkerID = ?', [workerId], function (err) {
        if (err) {
            console.error('Error deleting worker:', err.message);
            res.status(500).send(`Error deleting worker: ${err.message}`);
        } else {
            console.log(`Worker with ID ${workerId} deleted successfully.`);
            res.redirect('/workers');
        }
    });
});

// Route to display all clients
app.get('/clients', (req, res) => {
    db.all('SELECT * FROM Client', [], (err, rows) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            res.status(500).send('Error retrieving clients.');
        } else {
            res.render('clients', { clients: rows });
        }
    });
});

// Route to display the "Add Client" form
app.get('/clients/add', (req, res) => {
    res.render('add_client');
});

// Route to handle adding a new client
app.post('/clients/add', (req, res) => {
    const { name, industry, contactInfo, address, contractDetails } = req.body;

    const query = `
        INSERT INTO Client (Name, Industry, ContactInfo, Address, ContractDetails)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [name, industry, contactInfo, address, contractDetails], function (err) {
        if (err) {
            console.error('Error adding client:', err.message);
            res.status(500).send(`Error adding client: ${err.message}`);
        } else {
            console.log(`Client added successfully with ID ${this.lastID}.`);
            res.redirect('/clients');
        }
    });
});

// Route to show the edit form for a specific client
app.get('/clients/edit/:id', (req, res) => {
    const clientId = req.params.id;
    db.get('SELECT * FROM Client WHERE ClientID = ?', [clientId], (err, row) => {
        if (err) {
            console.error('Error retrieving client:', err.message);
            res.status(500).send('Error retrieving client.');
        } else {
            res.render('edit_client', { client: row });
        }
    });
});

// Route to handle the edit form submission
app.post('/clients/edit/:id', (req, res) => {
    const clientId = req.params.id;
    const { name, industry, contactInfo, address, contractDetails } = req.body;

    const query = `
        UPDATE Client
        SET Name = ?, Industry = ?, ContactInfo = ?, Address = ?, ContractDetails = ?
        WHERE ClientID = ?
    `;

    db.run(query, [name, industry, contactInfo, address, contractDetails, clientId], function (err) {
        if (err) {
            console.error('Error updating client:', err.message);
            res.status(500).send(`Error updating client: ${err.message}`);
        } else {
            console.log(`Client with ID ${clientId} updated successfully.`);
            res.redirect('/clients');
        }
    });
});

// Route to delete a client
app.get('/clients/delete/:id', (req, res) => {
    const clientId = req.params.id;

    db.run('DELETE FROM Client WHERE ClientID = ?', [clientId], function (err) {
        if (err) {
            console.error('Error deleting client:', err.message);
            res.status(500).send(`Error deleting client: ${err.message}`);
        } else {
            console.log(`Client with ID ${clientId} deleted successfully.`);
            res.redirect('/clients');
        }
    });
});

app.get('/jobAssignments', (req, res) => {
    db.all('SELECT * FROM JobAssignment', [], (err, rows) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            res.status(500).send('Error retrieving job assignments.');
        } else {
            // Make sure that 'rows' contains all the expected fields (including AssignmentID)
            res.render('jobAssignments', { jobAssignments: rows });
        }
    });
});



// Route to display the "Add Job Assignment" form
app.get('/jobAssignments/add', (req, res) => {
    db.all('SELECT * FROM Client', [], (err, clients) => {
        if (err) {
            console.error('Error retrieving clients:', err.message);
            res.status(500).send('Error retrieving clients.');
        } else {
            res.render('add_jobAssignment', { clients: clients });
        }
    });
});

// Route to handle adding a new job assignment
app.post('/jobAssignments/add', (req, res) => {
    const { jobDescription, startDate, endDate, hours, payRate, clientId } = req.body;

    const query = `
        INSERT INTO JobAssignment (JobDescription, StartDate, EndDate, Hours, PayRate, ClientID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [jobDescription, startDate, endDate, hours, payRate, clientId], function (err) {
        if (err) {
            console.error('Error adding job assignment:', err.message);
            res.status(500).send(`Error adding job assignment: ${err.message}`);
        } else {
            console.log(`Job assignment added successfully with ID ${this.lastID}.`);
            res.redirect('/jobAssignments');
        }
    });
});

app.get('/jobAssignments/edit/:id', (req, res) => {
    const assignmentId = req.params.id;
    db.get('SELECT * FROM JobAssignment WHERE AssignmentID = ?', [assignmentId], (err, row) => {
        if (err) {
            console.error('Error retrieving job assignment:', err.message);
            res.status(500).send('Error retrieving job assignment.');
        } else if (!row) {
            res.status(404).send('Job Assignment not found.');
        } else {
            res.render('edit_jobAssignment', { jobAssignment: row });
        }
    });
});

app.post('/jobAssignments/edit/:id', (req, res) => {
    const assignmentId = req.params.id;
    const { JobDescription, StartDate, EndDate, Hours, PayRate, ClientID } = req.body;

    db.run(
        'UPDATE JobAssignment SET JobDescription = ?, StartDate = ?, EndDate = ?, Hours = ?, PayRate = ?, ClientID = ? WHERE AssignmentID = ?',
        [JobDescription, StartDate, EndDate, Hours, PayRate, ClientID, assignmentId],
        function (err) {
            if (err) {
                console.error('Error updating job assignment:', err.message);
                res.status(500).send(`Error updating job assignment: ${err.message}`);
            } else {
                console.log(`Job Assignment with ID ${assignmentId} updated successfully.`);
                res.redirect('/jobAssignments');
            }
        }
    );
});


// Route to delete a job assignment
app.get('/jobAssignments/delete/:id', (req, res) => {
    const assignmentId = req.params.id;

    db.run('DELETE FROM JobAssignment WHERE AssignmentID = ?', [assignmentId], function (err) {
        if (err) {
            console.error('Error deleting job assignment:', err.message);
            res.status(500).send(`Error deleting job assignment: ${err.message}`);
        } else {
            console.log(`Job assignment with ID ${assignmentId} deleted successfully.`);
            res.redirect('/jobAssignments');
        }
    });
});

// Home page route
app.get('/', (req, res) => {
    res.render('home');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
