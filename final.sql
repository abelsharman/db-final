CREATE TABLE books(
    bookid float primary key, 
    title VARCHAR2(1500),
    authors VARCHAR2(1500),
    average_rating float, 
    num_page number, 
    ratings_count number, 
    publication_date DATE,
    publisher varchar2(255)
);
CREATE TABLE users(
    login VARCHAR2(255), 
    password VARCHAR2(255)
);
CREATE TABLE admin_books_log(
    action_author VARCHAR2(255),
    action_date DATE,
    title VARCHAR2(255), 
    authors VARCHAR2(255)
);






CREATE OR REPLACE TRIGGER insert_into_admin_table
AFTER INSERT ON books FOR EACH ROW
BEGIN
    INSERT INTO admin_books_log(action_author, action_date) VALUES(USER, SYSDATE);
END;




SELECT title FROM books INNER JOIN admin_books_log ON books.title = admin_books_log.title;





CREATE OR REPLACE TRIGGER create_user_log_trigger 
AFTER CREATE ON SCHEMA
DECLARE
	v_dynamic_statement VARCHAR2(10000);
BEGIN
    IF (ora_dict_obj_type = 'USER') THEN
        v_dynamic_statement := 'CREATE TABLE ' || ora_dict_obj_name || '_log (';
        v_dynamic_statement :=	v_dynamic_statement ||	'id NUMBER, login VARCHAR2(255), password VARCHAR2(255) );' ;
        EXECUTE IMMEDIATE v_dynamic_statement;
    END IF;
    
END create_user_log_trigger;





--two inputs, date and rating 
CREATE OR REPLACE PACKAGE books_pkg IS
    PROCEDURE books_oldest_proc(p_text OUT SYS_REFCURSOR);
    PROCEDURE books_newest_proc(p_text OUT SYS_REFCURSOR);
    PROCEDURE books_by_read_proc(p_text OUT SYS_REFCURSOR);
    PROCEDURE books_by_rating_proc(p_text OUT SYS_REFCURSOR);
END books_pkg;


CREATE OR REPLACE PACKAGE BODY books_pkg IS
    PROCEDURE books_oldest_proc(p_text OUT SYS_REFCURSOR) IS BEGIN
        OPEN p_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books WHERE publication_date > TO_DATE('01.01.1700')
                ORDER BY publication_date ASC FETCH NEXT 1000 ROWS ONLY;
    END books_oldest_proc;

    PROCEDURE books_newest_proc(p_text OUT SYS_REFCURSOR) IS BEGIN
        OPEN p_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books WHERE publication_date > TO_DATE('01.01.1700')
                ORDER BY publication_date DESC FETCH NEXT 1000 ROWS ONLY;
    END books_newest_proc;
    
    

    PROCEDURE books_by_rating_proc(p_text OUT SYS_REFCURSOR) IS BEGIN
        OPEN p_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books WHERE average_rating > 0 
                ORDER BY average_rating DESC FETCH NEXT 1000 ROWS ONLY;
    END books_by_rating_proc;
    
    PROCEDURE books_by_read_proc(p_text OUT SYS_REFCURSOR) IS BEGIN
        OPEN p_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books WHERE num_page > 0 
                ORDER BY num_page DESC FETCH NEXT 1000 ROWS ONLY;
    END books_by_read_proc;

END books_pkg;




--3 the most significant inputs
--procedure that fetchs data by dates
CREATE OR REPLACE PROCEDURE books_newest_proc(v_text OUT SYS_REFCURSOR) IS
BEGIN
    OPEN v_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books
            ORDER BY publication_date DESC FETCH NEXT 10 ROWS ONLY;
END books_newest_func;


--procedure that fetchs data by date
CREATE OR REPLACE PROCEDURE books_oldest_proc(v_text OUT SYS_REFCURSOR) IS
BEGIN
    OPEN v_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books
            ORDER BY publication_date ASC  FETCH NEXT 10 ROWS ONLY;
END books_oldest_func;


--package for rating body
CREATE OR REPLACE PACKAGE books_rat_pkg IS
    PROCEDURE books_rating_proc(v_text OUT SYS_REFCURSOR);
    PROCEDURE books_5_rating_proc(v_text OUT SYS_REFCURSOR);
END books_rat_pkg;


CREATE OR REPLACE PACKAGE BODY books_rat_pkg IS
    PROCEDURE books_rating_proc(v_text OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN v_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books
            ORDER BY average_rating FETCH NEXT 10 ROWS ONLY;
    END books_rating_proc;
    
    
    PROCEDURE books_5_rating_proc(v_text OUT SYS_REFCURSOR) IS
    BEGIN
    OPEN v_text FOR
            SELECT title, authors, ratings_count FROM books WHERE ratings_count > 0
            ORDER BY ratings_count DESC FETCH NEXT 5 ROWS ONLY;
    END books_5_rating_proc;
END books_rat_pkg;


            
            
--functions on inserting 

CREATE OR REPLACE FUNCTION boosk_add_func(p_title IN VARCHAR2, p_authors IN VARCHAR2, p_date IN VARCHAR2, p_publisher IN VARCHAR2, p_date_char OUT DATE)
RETURN INTEGER IS
  v_text INTEGER := 0;
BEGIN
    p_date_char := TO_DATE(p_date, 'dd.mm.yyyy');
    INSERT INTO books(title, authors, publication_date, publisher) VALUES(p_title, p_authors, p_date_char, p_publisher);
    RETURN v_text;
END;

--function that adds user
CREATE OR REPLACE FUNCTION user_add_func(p_login IN VARCHAR2, p_password IN VARCHAR2)
RETURN INTEGER IS
  v_text INTEGER := 0;
BEGIN
    INSERT INTO users(login, password) VALUES(p_login, p_password);
    RETURN v_text;
END;

--function that check registered user
CREATE OR REPLACE FUNCTION user_check_func(p_login IN VARCHAR2, p_password IN VARCHAR2)
RETURN INTEGER IS
  v_text INTEGER := 0;
BEGIN
    SELECT count(login) INTO v_text FROM users WHERE password = p_password AND password IN (SELECT password FROM users WHERE login = p_login);
    IF v_text > 0 THEN v_text := 1;
    ELSE v_text := 0;
    END IF;
    RETURN v_text;
END;




--procedure that holds data in cursor to cab page
CREATE OR REPLACE PROCEDURE books_proc(p_login IN VARCHAR2, v_text OUT SYS_REFCURSOR) IS
BEGIN
    OPEN v_text FOR
            SELECT title, authors, average_rating, num_page, publication_date, publisher FROM books WHERE publisher = p_login
            FETCH NEXT 3 ROWS ONLY; 
END books_proc;


--procedure that returns number count of books of each user
CREATE OR REPLACE PROCEDURE books_count_func(p_login IN VARCHAR2, v_text OUT NUMBER) IS
BEGIN
    SELECT COUNT(title) INTO v_text FROM books WHERE publisher = p_login; 
END;


--similarity between text 
CREATE OR REPLACE PROCEDURE get_simil (p_query_title VARCHAR2, p_query_author VARCHAR2, v_text OUT SYS_REFCURSOR) IS
BEGIN
    OPEN v_text FOR 
        select * from books
        where compare_text(authors, p_query_author) = 1
        AND compare_text(title, p_query_title) = 1
        FETCH NEXT 9 ROWS ONLY;
END;

CREATE OR REPLACE FUNCTION compare_text(p_target VARCHAR2, p_query VARCHAR2)
RETURN INTEGER IS
    v_score INTEGER := 0;
BEGIN
    IF p_query IS NULL THEN
        RETURN 1;
    END IF;
    
    v_score := similarity(p_target, p_query);
    IF v_score >= 80 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END;


CREATE OR REPLACE FUNCTION similarity(STRING VARCHAR2, substring VARCHAR2)
RETURN NUMBER IS 
BEGIN
  RETURN UTL_MATCH.JARO_WINKLER_SIMILARITY(LOWER(STRING), LOWER(substring));
END;
