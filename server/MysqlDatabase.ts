import express from 'express';
import mysql from 'mysql';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import CircularJSON from 'circular-json';

interface OperationResult {
    success: boolean;
    message?: string;
}


// 创建 Express 应用
const app = express();

// 设置跨域请求头
app.use(cors());

// 解析请求体中的 JSON 数据
app.use(express.json());

// 创建数据库连接
const connection = mysql.createConnection({
    host: '0.0.0.0',
    user: 'root',
    password: 'pwrd',
    database: 'ai_keyword'
});

// 连接数据库
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + connection.threadId);
});

// 编辑 ai_dictionary 表
app.post('/api/dictionary', async (req, res) => {
    const {Text, Lang_zh, SubType, Dir, Alias} = req.body

    let exist = false;
    await connection.query(
        'SELECT * FROM ai_dictionary WHERE Text = ?',
        [Text],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: 'Internal server error'}).send();
            } else {
                console.error("exist");
                exist = (result as any).length > 0;

                if (exist) {
                    connection.query(
                        'UPDATE ai_dictionary SET Lang_zh = ?, SubType = ?, Dir = ?, Alias = ? WHERE Text = ?',
                        [Lang_zh, SubType, Dir, Alias, Text],
                        (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(500).json({message: 'Internal server error'}).send();
                            } else {
                                console.log("Data update successfully")
                                res.status(200).json({message: 'Data inserted successfully'}).send();
                            }
                        }
                    );
                } else {
                    connection.query(
                        'INSERT INTO ai_dictionary (Text, Lang_zh, SubType, Dir, Alias) VALUES (?, ?, ?, ?, ?)',
                        [Text, Lang_zh, SubType, Dir, Alias],
                        (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(500).json({message: 'Internal server error'}).send();
                            } else {
                                console.log("Data inserted successfully")
                                res.status(200).json({message: 'Data inserted successfully'}).send();
                            }
                        }
                    );
                }
            }
        }
    );

    
});

app.delete('/api/dictionary', async (req, res) => {
    const {Text} = req.body
    
    // await connection.query(
    //     'DELETE FROM ai_dictionary WHERE Text = ? ', 
    //     [Text], 
    //     (err, results) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).json({message: 'Internal server error'}).send();
    //     } else {
    //         console.log("Data delete successfully")
    //         res.status(200).json({message: 'Data delete successfully'}).send();
    //     }
    // });

    try {
        let result = await connection.query('DELETE FROM ai_dictionary WHERE Text = ?', [Text]);
        console.log('Data delete successfully');
        // console.log(result);
        res.status(200).json({message: 'Data delete successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    }
});

app.get('/api/dictionary', async (req, res) => {

    // try {
    //     const results = await connection.query('SELECT JSON_OBJECT(\'Text\',Text,\'Lang_zh\',Lang_zh,\'SubType\',SubType,\'Dir\',Dir,\'Alias\',Alias) as data FROM ai_dictionary');
    //     console.log("Data get successfully");
    //     res.status(200).json(results);
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({message: 'Internal server error'});
    // }

    await connection.query(
        'SELECT * FROM ai_dictionary',
        (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: 'Internal server error'}).send();
        } else {
            console.log("Data get successfully")
            res.status(200).send(CircularJSON.stringify(results));
        }
    });
});


// 启动本地服务器
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
