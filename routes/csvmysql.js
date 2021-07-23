const express = require("express");
const router = express.Router();
const formidable = require('formidable');
const isLoggedIn = require("./custom_modules/isLoggedIn.js");
const connection = require("./custom_modules/connection.js");
const queries = require("./custom_modules/queries.js");
const mustEmp = require("./custom_modules/mustEmp.js");
const upload = require("./custom_modules/upload.js");

router.get('/upload', isLoggedIn, mustEmp, (req, res) => {
  connection.query(queries.stores + queries.userName, req.user.username, (rows) => {
    res.render('upload', {
        user : req.user,
        rows : rows[0],
        profile : rows[1][0]
    });
  });
});

router.get('/upload2', isLoggedIn, mustEmp, (req, res) => {
  connection.query(queries.stores + queries.userName, req.user.username, (rows) => {
    res.render('upload2', {
        user : req.user,
        rows : rows[0],
        profile : rows[1][0]
    });
  });
});

router.post('/upload', (req, res) => {
	let form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', (file) => {
		file.path = './uploads/usa.csv';
	});
	form.on('file', (file) => {
		console.log('Uploaded ' + file.name);
    });
    res.redirect('upload2');
});

router.post('/upload2', (req, res) => {
	let form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', (file) => {
		file.path = './uploads/uk.csv';
	})
	form.on('file', (file) => {
		console.log('Uploaded ' + file.name);
    });
    upload("productsusa", "./uploads/usa.csv");
    upload("productsuk", "./uploads/uk.csv");
    res.redirect('inventory'); 
});

router.get("/inventory", (req, res) => {
  connection.query(
    queries.stores + queries.userName,
    req.user.username,
   (rows) => {
      res.render("inventory", {
        rows: rows[0],
        profile: rows[1][0],
      });
    }
  );
});
  
router.get("/inventory2", (req, res) => {
  connection.query(
    queries.stores + queries.upload1 + queries.upload2 + queries.userName,
    req.user.username,
   (rows) => {
      res.render("inventory2", {
        rows: rows[0],
        rows1: rows[1],
        rows2: rows[2],
        profile: rows[3][0]
      });
    }
  );
});

router.get("/ukSuggests", (req, res) => {
  connection.query(
    queries.stores + 'CREATE TEMPORARY TABLE UStable (sku VARCHAR(15), usinv int(20), title VARCHAR(55), country int(1));CREATE TEMPORARY TABLE UKtable (sku VARCHAR(15), ukinv int(20), title VARCHAR(55), country int(1));INSERT UStable SELECT store_var.sku, inv, store_prod.title, country FROM store_var JOIN stores ON stores.id = store_var.storeid JOIN store_prod ON store_prod.prod_id = store_var.prod_id WHERE country = 1;INSERT UKtable SELECT store_var.sku, inv, store_prod.title, country FROM store_var JOIN stores ON stores.id = store_var.storeid JOIN store_prod ON store_prod.prod_id = store_var.prod_id WHERE country = 2;SELECT UStable.title, UStable.sku, UStable.usinv, UKtable.ukinv FROM UStable INNER JOIN UKtable ON UStable.sku = UKtable.sku ORDER BY UKtable.ukinv ASC, UStable.usinv DESC;DROP TABLE UStable;DROP TABLE UKtable;' + queries.userName, req.user.username,
   (err, rows) => {
      if(err){
        console.log(err);
      }
      res.render("ukSuggests", {
        rows: rows[0],
        rows1: rows[5],
        profile: rows[8][0]
      });
    }
  );
});

module.exports = router;
