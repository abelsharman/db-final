const Router = require("express").Router;
const db = require("../services/db");
const books = Router();



books.get("/", async (req, res) => {
    let conn = null;
    try {
        conn = await db.getConnection();
        const { rows } = await conn.execute("select * from books FETCH NEXT 10 ROWS ONLY");
         //   n: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT }
        //});
        /*res.send(rows.map(row => ({
            bookId: row[0],
            title: row[1],
            authors: row[2],
            average_rating: row[3],
            num_page: row[4],
            ratings_count: row[5],
            publication_date: row[6],
            publisher: row[7],
        })));*/
        res.render("index", { title: "Hey", message: "Hello there!" });

        /*res.send(rows.map(row => ({
            bookId: row[0],
            title: row[1],
            authors: row[2],
            average_rating: row[3],
            num_page: row[4],
            ratings_count: row[5],
            publication_date: row[6],
            publisher: row[7],
        })));*/
        
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }
});

module.exports = books;