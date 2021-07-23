const parse      = require('csv-parse');
const util       = require('util');
const fs         = require('fs');
const async      = require('async');
const csvHeaders = require('csv-headers');
const dbhost = "localhost";
const dbuser = "root";
const dbpass = "root";
const dbname = "controlcenter";
const mysql = require('mysql');

module.exports = function upload(tblnm, csvfn) {
    new Promise((resolve, reject) => {
        csvHeaders({
            file      : csvfn,
            delimiter : ','
        }, function(err, headers) {
            if (err) reject(err);
            else resolve({ headers });
        });
    })
    .then(context => {
        return new Promise((resolve, reject) => {
    
            context.db = mysql.createConnection({
                host     : dbhost,
                user     : dbuser,
                password : dbpass,
                database : dbname
            });
    
            context.db.connect((err) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    reject(err);
                } else {
                    resolve(context);
                }
            });
        })
    })
    .then(context => {
        return new Promise((resolve, reject) => {
            context.db.query(`DROP TABLE IF EXISTS ${tblnm}`,
            [ ],
            err => {
                if (err) reject(err);
                else resolve(context);
            })
        });
    })
    .then(context => {
        return new Promise((resolve, reject) => {
            var fields = '';
            var fieldnms = '';
            var qs = '';
            context.headers.forEach(hdr => {
                hdr = hdr.replace(' ', '_');
                if (fields !== '') fields += ',';
                if (fieldnms !== '') fieldnms += ','
                if (qs !== '') qs += ',';
                fields += ` ${hdr} TEXT`;
                fieldnms += ` ${hdr}`;
                qs += ' ?';
            });
            context.qs = qs;
            context.fieldnms = fieldnms;
            console.log(`about to create CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields} )`);
            context.db.query(`CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields}, date DATETIME DEFAULT CURRENT_TIMESTAMP )`,
            [ ],
            err => {
                if (err) reject(err);
                else resolve(context);
            })
        });
    })
    .then(context => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(csvfn).pipe(parse({
                delimiter: ',',
                columns: true,
                relax_column_count: true
            }, (err, data) => {
                if (err) return reject(err);
                async.eachSeries(data, (datum, next) => {
                    // console.log(`about to run INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`);
                    var d = [];
                    try {
                        context.headers.forEach(hdr => {
                            // In some cases the data fields have embedded blanks,
                            // which must be trimmed off
                            let tp = datum[hdr].trim();
                            // For a field with an empty string, send NULL instead
                            d.push(tp === '' ? null : tp);
                        });
                    } catch (e) {
                        console.error(e.stack);
                    }
                    // console.log(`${d.length}: ${util.inspect(d)}`);
                    if (d.length > 0) {
                        context.db.query(`INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`, d,
                        err => {
                            if (err) { console.error(err); next(err); }
                            else setTimeout(() => { next(); });
                        });
                    } else { console.log(`empty row ${util.inspect(datum)} ${util.inspect(d)}`); next(); }
                },
                err => {
                    if (err) reject(err);
                    else resolve(context);
                });
            }));
        });
    })
    .then(context => { context.db.end(); })
    .catch(err => { console.error(err.stack); });    
}
