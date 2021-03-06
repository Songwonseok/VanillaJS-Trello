const mysql = require('mysql2');
const DBconfig = require('../config/DBconfig');
const connection = mysql.createConnection(DBconfig);

class LogModel {
    constructor() { }

    SELECT_USERLOG(user_id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT l.id, l.action, u.name, l.subject, l.from_column, l.to_column, l.createdAt FROM Log l INNER JOIN Users u ON l.user_id = u.id WHERE l.user_id = ? ORDER BY l.createdAt DESC";
            connection.query(query, user_id, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            })
        })
    }

    ADD_NOTE(info) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO Log(action, user_id, subject, to_column) VALUES('added',?,?,?)";
            const params = [info.addedBy, info.content, info.to_column];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

    UPDATE_NOTE(info) {
        return new Promise((resolve, reject) => { // subject : "그전 내용 -> 바뀐내용" 
            const query = "INSERT INTO Log(action, user_id, subject) VALUES('updated',?,?)";
            const params = [info.user_id, info.subject];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

    MOVE_NOTE(info) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO Log(action, user_id, subject, from_column, to_column) VALUES('moved',?,?,?,?)";
            const params = [info.user_id, info.subject, info.from_column, info.to_column];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

    REMOVE_NOTE(info) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO Log(action, user_id, subject, from_column) VALUES('removed',?,?,?)";
            const params = [info.user_id, info.subject, info.from_column];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

    ADD_COLUMN(info) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO Log(action, user_id, subject) VALUES('added',?,?)";
            const params = [info.user_id, info.subject];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

    UPDATE_COLUMN(info) {
        return new Promise((resolve, reject) => { // subject : "그전 내용 -> 바뀐내용" 
            const query = "INSERT INTO Log(action, user_id, subject) VALUES('updated',?,?)";
            const params = [info.user_id, info.subject];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }


    REMOVE_COLUMN(info) {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO Log(action, user_id, subject) VALUES('removed',?,?)";
            const params = [info.user_id, info.subject];
            connection.execute(query, params, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                const insertId = rows.insertId;
                resolve(insertId);
            })
        })
    }

}

module.exports = LogModel;


