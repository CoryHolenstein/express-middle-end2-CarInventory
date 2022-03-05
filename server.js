var express = require('express')
var app = express()
var mysql = require('mysql')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

var pool = mysql.createPool({
    connectionLimit: 25,
    host: 'mysql.freehostia.com',
    user: 'corhol5_sharpdatabase',
    password: 'sharppassword123',
    port: '3306',
    database: 'corhol5_sharpdatabase'
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.json({});
    }
    next();
});



app.post('/users/register', (req, res) => {
    const email = req.email;
    const password = req.password;
    const password_confirmation = req.password_confirmation;


    console.log(email);

    pool.getConnection(function (err, connection) {
        console.log("Connected!");

        /* if (!email || !password || !password_confirmation) {
             res.send({ errormessage: "Please fill in all the fields" });
             return;
         }*/

        //Check passwords match
        if (password != password_confirmation) {
            console.log('Passwords dont match');
            res.send({ errormessage: "Passwords dont match" });
            return;
        }

        //Check password length
        if (password.length < 6) {
            res.send({ errormessage: 'Password should be atleast 6 characters' });
            return;

        }

        connection.query("SELECT email FROM user WHERE email = ?", [email], (err, result) => {
            if (err) throw err;


            //You will get an array. if no users found it will return.

            if (result.length > 0) {
                console.log("we found a user???");
                console.log(result);
                res.send({ errormessage: "Email already exists!" });

                return;
            } else {
                connection.query("INSERT INTO user (email, password) VALUES (?,?)", [email, password], (err, result) => {
                    if (err) {
                        res.send({ err: err });
                        return;
                    }
                    res.send(email);
                });
                console.log("inserted new user!");
                return;
            }

        });
        connection.release();


    });


});


app.post("/testpoint", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    pool.getConnection(function (err, connection) {

        console.log(req);
        console.log("You made it to this end point!");
        console.log(username);
        console.log(password);
        res.send(username);
        res.send("Lets goooo");
        connection.release();
    });

});

app.post("/inventory/addcar", (req, res) => {

    const inventoryID = req.body.inventoryID;
    const carBrand = req.body.carBrand;
    const carName = req.body.carName;
    const carColor = req.body.carColor;
    const carType = req.body.carType;


    pool.getConnection(function (err, connection) {


        connection.query("SELECT inventoryID FROM cars WHERE inventoryID = ?", [inventoryID], (err, result) => {
            if (err) throw err;


            //You will get an array. if no users found it will return.

            if (result.length > 0) {
                console.log("we found a ID???");
                console.log(result);
                res.send({ errormessage: "ID already exists!" });

                return;
            } else {
                connection.query("INSERT INTO cars (InventoryID, CarBrand, CarName, CarColor, CarType) VALUES (?,?,?,?,?)",
                    [inventoryID, carBrand, carName, carColor, carType], (err, result) => {
                    if (err) {
                        res.send({ err: err });
                        return;
                    }
                    res.send(result);
                });
                console.log("inserted new user!");
                return;
            }

        });
        connection.release();
    });
});


app.post("/inventory/getcars", (req, res) => {




    pool.getConnection(function (err, connection) {
 

        console.log("You made it to this end point! getting cars!");
        connection.query("SELECT * FROM cars",(err, result) => {
            if (err) {
                res.send({ err: err });

            }
            console.log(result);
            if (result.length > 0) {
                res.send(result);
        

                // res.send({message: "correct"});
            } else {
              
                res.send({ errormessage: "No Cars!" });
             
            }

        });
        connection.release();
    });
});


app.post("/users/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    pool.getConnection(function (err, connection) {
        console.log(username, password);

        console.log("You made it to this end point!");
        connection.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, result) => {
            if (err) {
                res.send({ err: err });
             
            }
   
            if (result.length > 0) {
                res.send(result);
                
                // res.send({message: "correct"});
            } else {
             
                res.send({ errormessage: "Wrong username or password" });
            }

        });
        connection.release();
    });

});

app.get('/', function (req, res) {
    console.log("Connected!");
    res.send('Hello World!')
});


app.listen(3000);