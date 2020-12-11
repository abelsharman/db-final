const oracledb = require("oracledb");

async function getConnection() {
    return oracledb.getConnection({
        user: "tlek",
        password: "tlek",
        connectString: "localhost/XEPDB1"
    });
}

module.exports = {
    getConnection,
}