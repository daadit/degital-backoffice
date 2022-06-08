const config = require("../configs/database");

let mysql = require("mysql");
let pool = mysql.createPool(config);

pool.on("error", (err) => {
    console.error(err);
});

module.exports = {
    login(req, res) {
        res.render("login", {
            url: "http://localhost:8080/",
            expressFlash: req.flash("message"),
        });
    },
    loginAuth(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        if (username && password) {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(`SELECT * FROM administrator WHERE email = ? AND password = ?`, [username, password], function (error, results) {
                    if (error) throw error;
                    if (results.length > 0) {
                        if (results[0].isactive == 1) {
                            req.session.loggedin = true;
                            req.session.userid = results[0].id;
                            req.session.username = results[0].name;
                            res.redirect("/");
                        } else {
                            req.flash("message", "Your account is banned !");
                            res.redirect("/login");
                        }
                    } else {
                        req.flash("message", "Account not found");
                        res.redirect("/login");
                    }
                });
                connection.release();
            });
        } else {
            res.redirect("/login");
            res.end();
        }
    },
    logout(req, res) {
        // Hapus sesi user dari broser
        req.session.destroy((err) => {
            if (err) {
                return console.log(err);
            }
            // Hapus cokie yang masih tertinggal
            res.clearCookie("secretname");
            res.redirect("/login");
        });
    },
};
