const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const api = require("./routes");
const router = express.Router();
const app = express();
const db = require("./services/db");
const oracledb = require("oracledb");
var cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3001;

app.use(cookieParser())
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`${req.method} request on ${req.url}`);
    next();
});
app.use('/static', express.static('static'))
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

function parseItem(item) {
    return {
        title: item[0],
        author: item[1],
        average_rating: item[2],
        num_page: item[3],
        ratings_count: item[4],
        publication_date: item[5],
        publisher: item[6],
        bookid: item[7],
    }
}

function strcmp(a, b)
{   
    return (a<b?-1:(a>b?1:0));  
}







router.get("/", async (req, res) => {
    let conn = null;
    try {
        conn = await db.getConnection();
        const result = await conn.execute("BEGIN books_rat_pkg.books_rating_proc(:result); END;", {
            result: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT }
        });


        const result1 = await conn.execute("BEGIN books_rat_pkg.books_5_rating_proc(:result1); END;", {
            result1: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT }
        });


        const resultSet1= result1.outBinds.result1;
        const arr1 = [];
        let ite1 = null;
        while ((ite1 = await resultSet1.getRow())) arr1.push(ite1);
        await resultSet1.close();
        if (false) {
            return {
                ...result1.outBinds,
                result: arr1,
            };
        }


        const resultSet= result.outBinds.result;
        const arr = [];
        let item = null;
        while ((item = await resultSet.getRow())) arr.push(item);
        await resultSet.close();
        if (false) {
            return {
                ...result.outBinds,
                result: arr,
            };
        }


        res.render("index", { list: arr, rating: arr1 });
        console.log(result.outBinds.result);
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }
    
});






router.get("/login", async (req, res) => {
    res.render("login");
});







router.get("/register", async (req, res) => {
    res.render("register");
});







router.get("/register_action", async (req, res) => {
    const { login, password, conf_password } = req.query;
    let conn = null;
    try {
        if (password == conf_password){
            conn = await db.getConnection(); 
            const result = await conn.execute(
                `BEGIN :resul := user_add_func(:login, :password); COMMIT;END;`, {
                login: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: login, },
                password: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: password },
                resul: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER}
            });
            res.cookie('available', 'yes', { expires: new Date(Date.now() + 900000)});
            res.cookie('user', login, { expires: new Date(Date.now() + 900000)});
            res.redirect('/');

        } else{
            res.redirect('/register');
            console.log("not equal passwords");
        }
        
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }

});








router.get("/login_action", async (req, res) => {
    const { login, password } = req.query;
    let conn = null;
    try {

        conn = await db.getConnection(); 
        const result = await conn.execute(
            `BEGIN :resul := user_check_func(:login, :password); COMMIT;END;`, {
            login: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: login, },
            password: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: password },
            resul: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER}
        });
        if (result.outBinds.resul == 1){
            res.cookie('available', 'yes', { expires: new Date(Date.now() + 900000)});
            res.cookie('user', login, { expires: new Date(Date.now() + 900000)});
            res.redirect('/');
        }
        else{
            res.redirect('/login');
        }
        
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }

});








router.all("/logout", async (req, res) => {
    res.cookie('available', 'no');
    res.cookie('user', null);
    res.redirect('/');
});









router.all("/cab", async (req, res) => {
    let conn = null;
    let user = req.cookies.user;
    let us = user;
    try {
        conn = await db.getConnection();
        const result = await conn.execute("BEGIN books_proc(:us, :result); COMMIT;END;", {
            result: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT, },
            us :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: us, }
        });

        const count_result = await conn.execute("BEGIN books_count_func(:us, :count); COMMIT;END;", {
            count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER},
            us :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: us, },
        });

        const resultSet= result.outBinds.result;
        const arr = [];
        let item = null;
        while ((item = await resultSet.getRow())) arr.push(item);
        await resultSet.close();
        if (false) {
            return {
                ...result.outBinds,
                result: arr,
            };
        }
        res.render("cab", { books: arr, count: count_result.outBinds.count });
        console.log(arr);
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }


});








router.all("/add", async (req, res) => {
    const { title, author, date } = req.query;
    let conn = null;
    let user = req.cookies.user;
    let us = user;
    try {
        conn = await db.getConnection();
        const result = await conn.execute("BEGIN :result := boosk_add_func(:title, :author, :date, :us, :dat); COMMIT;END;", {
            title :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: title, },
            author :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: author, },
            date :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: date, },
            us :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: us, },
            dat:  {type: oracledb.DB_TYPE_DATE, dir: oracledb.BIND_OUT,},
            result: {type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT,}
        });


        res.redirect('/cab');
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }



});







router.all("/search", async (req, res) => {
    const {title, author, option} = req.query;
    
    try {
        conn = await db.getConnection();
        const result = await conn.execute("BEGIN get_simil(:p_query_title, :p_query_author,:result); COMMIT; END;", {
            p_query_title :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: title, },
            p_query_author :  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN, val: author, },
            result: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT, },
        });
        const resultSet= result.outBinds.result;
        let arr = [];
        let item = null;
        while ((item = await resultSet.getRow())) arr.push(item);
        await resultSet.close();

        arr = arr.map(parseItem);

        if (option == 1){
            arr.sort((a, b) => {
                // negative: a < b
                // 0: a = b
                // positive: a > b
                
                return (a.ratings_count - b.ratings_count) * -1;
            });
            // res.send(arr.map(item => item.ratings_count));
            
            res.render("index", {list1:arr});
            //res.render("index", {list: arr});
        }
    
        else if (option == 2){
            arr.sort((a, b) => {
                // negative: a < b
                // 0: a = b
                // positive: a > b
                const date1 = new Date(a.publication_date);
                const date2 = new Date(b.publication_date);
                if (date1 < date2) {
                    return -1;
                } 
                else if (date1 == date2)
                    return 0;
                else if (date1 > date2)
                    return 1;
            });
            res.render("index", {list1:arr});
            //res.render("index", {list: arr});
    
        }
        else if (option == 3){
            arr.sort((a, b) => {
                // negative: a < b
                // 0: a = b
                // positive: a > b
                const date1 = new Date(a.publication_date);
                const date2 = new Date(b.publication_date);
                if (date1 > date2) {
                    return -1;
                } 
                else if (date1 == date2)
                    return 0;
                else if (date1 < date2)
                    return 1;
            });
            res.render("index", {list1:arr});
            //res.render("index", {list: arr});
        }
        else if (option == 4){

            arr.sort((a, b) => {
                // negative: a < b
                // 0: a = b
                // positive: a > b
                return a.num_page - b.num_page;
            });
            res.render("index", {list1:arr});
            //res.render("index", {list: arr});
        }
       
    } catch (error) {
        console.error(error);
    } finally {
        if (conn)
            conn.close();
    }

   

});






app.use("/", router);
//app.use("/", api);

app.listen(PORT, () => {
    console.log("Server us running on " + PORT);
});
