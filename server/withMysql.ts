//导入mysql连接包
import mysql from 'mysql';

//创建连接conn
const conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'pwrd',
    database: 'ai_keyword'
});

export async function addToMysql(input: { Text: string; Lang_zh: string; SubType: string; Dir:string ; Alias: string; }) {
    //使用query方法执行sql语句
    let maxIdSql = "select max(id) from ai_dictionary;"
    let maxId = 0;
    conn.query(maxIdSql, (err: any, result: any) => {
        if (err) {
            console.log(err);
        } else {
            maxId = result;
        }
    });
    
    let addSql = "insert into ai_dictionary values (?,?,?,?,?,?>);"
    conn.query(addSql,[maxId,input.Text,input.Lang_zh,input.SubType,input.Dir,input.Alias], (err: any, result: any) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
}
