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

app.post("/inventory/deletecar", (req, res) => {
    const inventoryID = req.body.inventoryID;
    console.log(inventoryID);


    pool.getConnection(function (err, connection) {
        

       // console.log("You made it to this end point!");
        connection.query("DELETE FROM cars WHERE inventoryID = ?", [inventoryID], (err, result) => {
            if (err) {
                res.send({ err: err });
                return;
            }
            console.log(result);
            if (result.length > 0) {
                console.log("god damnit");
              
          
            } else {
                console.log("tits");
                res.sendStatus(200);
            }

        });
        connection.release();
    });
 
});


app.post("/inventory/updatecar", (req, res) => {

    const inventoryID = req.body.inventoryID;
    const carBrand = req.body.carBrand;
    const carName = req.body.carName;
    const carColor = req.body.carColor;
    const carType = req.body.carType;
    console.log(inventoryID, carBrand, carType);
    /*
     * 
     * for some reason this end point does not use the VALUES(?,?,?) when using SQL call. I think it's because of the nature of SET. 
     * 
     * Side side note, we also do this in delete. no idea. need to investigate
     * 
     * */

    pool.getConnection(function (err, connection) {
        connection.query("UPDATE cars SET CarBrand = ?, CarName = ?, CarColor = ?, CarType = ? WHERE InventoryID = ?",
            [carBrand, carName, carColor, carType, inventoryID], (err, result) => {
                if (err) {
                    res.send({ err: err });
                    return;
                }
                console.log("UPDATE result : " + result);
                res.sendStatus(200);
            });


        return;

       /*
        * Probably unneeded code as there is no point to checking if the ID exists. 
        * Will keep around until it annoys me
        * 
        * connection.query("SELECT InventoryID FROM cars WHERE InventoryID = ?", [inventoryID], (err, result) => {
            if (err) throw err;
            console.log(result);

            //You will get an array. if no users found it will return.

            if (result.length < 0) {
                console.log("we DIDNT find a ID???");
                console.log(result);
                //send bad request for invalid ID, but shouldn't happen because they need a selection of valid ID

                return;
            } else {

                console.log("car ID found so we should update this entry");
                //UPDATE call HERE
                connection.query("UPDATE cars SET CarBrand = Bugatii WHERE InventoryID = 24",
                    [carBrand, inventoryID], (err, result) => {
                        if (err) {
                            res.send({ err: err });
                            return;
                        }
                        console.log("UPDATE result : " + result);
                        res.send(result);
                    });

                
                return;
            }

        });*/
        connection.release();
    });
});


app.post("/inventory/addcar", (req, res) => {

    const inventoryID = req.body.inventoryID;
    const carBrand = req.body.carBrand;
    const carName = req.body.carName;
    const carColor = req.body.carColor;
    const carType = req.body.carType;


    console.log(carName);

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
                res.sendStatus(200);
            } else {
             
                res.sendStatus(400);
            }

        });
        connection.release();
    });

});

app.post('/users/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const password_confirmation = req.body.passwordConfirmation;

    console.log(password.length);

    pool.getConnection(function (err, connection) {
        console.log("Connected!");

        if (username == "" || password == "" || password_confirmation == "") {
            res.sendStatus(400);
          //  res.send({ errormessageFields: "Please fill in all the fields" });
            return;
        }
        if (password != password_confirmation) {
            res.sendStatus(400);
          //  res.send({ errormessagePassMatch: "Password should match" });
            return;

        }
        if (password.length < 6 || username.length < 6 || username.length > 15 || password.length > 15) {
            res.sendStatus(411);
            return;

        }


        connection.query("SELECT username FROM users WHERE username = ?", [username], (err, result) => {
            console.log(result);
            console.log("lets go");
            if (err) {
                res.send({ err: err });

            }


            //You will get an array. if no users found it will return.

            if (result.length > 0) {
                console.log("we found a user???");
                console.log(result);
                res.sendStatus(406);
                return;
                
            } else {
                console.log("No user found!");
                console.log(result);
                connection.query("INSERT INTO users (username, password) VALUES (?,?)", [username, password], (err, result) => {
                    if (err) {
                        res.send({ err: err });
                    } 
                    res.sendStatus(200);
                });
                console.log(result);
                console.log("inserted new user!");
                ;
            }

        });
        connection.release();


    });


});


app.post('/users/updatepass', (req, res) => {
    const username = req.body.username;
    const newPassword = req.body.newPassword;
    const newPasswordConfirmation = req.body.newPasswordConf;

    console.log(newPassword.length);

    console.log("password update end point!!");
    console.log(newPassword + username + newPasswordConfirmation);

    pool.getConnection(function (err, connection) {


        if (newPassword == "" || newPasswordConfirmation == "") {
            res.sendStatus(400);
            //  res.send({ errormessageFields: "Please fill in all the fields" });
            return;
        }
        if (newPassword != newPasswordConfirmation) {
            res.sendStatus(400);
            //  res.send({ errormessagePassMatch: "Password should match" });
            return;

        }
        if (newPassword.length < 6 || newPassword.length > 15) {
            res.sendStatus(411);
            return;

        }
            connection.query("UPDATE users SET password = ? WHERE username = ?",
                [newPassword, username], (err, result) => {
                    if (err) {
                        res.send({ err: err });
                        return;
                    }
                    console.log("UPDATE result : " + result);
                    res.sendStatus(200);
                });


            return;
        connection.release();


    });


});



app.get('/', function (req, res) {
    console.log("Connected!");
    res.send('Hello World!')
});


app.listen(3000);