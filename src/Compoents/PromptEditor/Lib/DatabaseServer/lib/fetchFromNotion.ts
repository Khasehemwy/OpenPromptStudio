import { Client } from "@notionhq/client"
import { cloneDeep } from "lodash"
import WebOfficeSDK from '../../../../../../web-office-sdk-v1.1.19-a4d86a2/web-office-sdk-v1.1.19.es.js';
import * as XLSX from "xlsx";
import axios from "axios";

export async function fetchFromNotion(options: { apiKey: string; databaseId: string }) {
    let { databaseId: database_id, apiKey } = options

    let sheet2arr = function (sheet: any) {
        let result = [];
        let row;
        let rowNum;
        let colNum;
        let range = XLSX.utils.decode_range(sheet['!ref']);
        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            row = [];
            for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
                let nextCell = sheet[
                    XLSX.utils.encode_cell({r: rowNum, c: colNum})
                    ];
                if (typeof nextCell === 'undefined') {
                    row.push(void 0);
                } else row.push(nextCell.w);
            }
            result.push(row);
        }
        return result;
    };
    
    let defineMap: any = {}
    const subTypeMap: any = {
        普通: "normal",
        风格: "style",
        质量: "quality",
        命令: "command",
        负面: "eg",
    }
    
    async function once(){
        
        //从xlsx读数据
        // {
        //     const url = "http://127.0.0.1:8887/a.XLSX";
        //     const response = await fetch(url, {});
        //    
        //     // const url = "https://docs.oa.wanmei.net/weboffice/l/cn5wSleBUqpw?from=koa&timestamp=1682403826611";
        //     // const response = await fetch(url, {});
        //    
        //     let arraybuffer = await response.arrayBuffer();
        //
        //     /* convert data to binary string */
        //     let data = new Uint8Array(arraybuffer);
        //     let arr = new Array();
        //     for (let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        //     let bstr = arr.join("");
        //
        //     /* Call XLSX */
        //     let workbook = XLSX.read(bstr, {type: "binary"});
        //     for (let worksheetIndex = 0; worksheetIndex < workbook.SheetNames.length; worksheetIndex++) {
        //
        //         let worksheet = workbook.Sheets[workbook.SheetNames[worksheetIndex]];
        //         console.log(`[XLSX] import sheet : ${workbook.SheetNames[worksheetIndex]} .`);
        //         console.log(XLSX.utils.sheet_to_json(worksheet, {raw: true}));
        //
        //         // iterate every row
        //         const sheetArray = sheet2arr(worksheet);
        //         let firstRow = true;
        //         for (let row in sheetArray) {
        //             if (row[1] === '!') continue; // if the row is not part of the data, skip
        //             if (firstRow){
        //                 firstRow=false;
        //                 continue;
        //             }
        //
        //             let text = sheetArray[row][0];
        //             if(!text) continue;
        //             let lang_zh = sheetArray[row][1];
        //             let dir = sheetArray[row][2];
        //             let subType = sheetArray[row][3];
        //             let desc = sheetArray[row][4];
        //             let alias = sheetArray[row][5];
        //             let tags = sheetArray[row][6];
        //             console.log(`[XLSX] text : ${text} .`);
        //             subType = subTypeMap[subType] ?? "normal"
        //             let item = {text, desc, lang_zh, subType, dir, tags, alias}
        //             if (!text) return
        //             defineMap[item?.text?.toLowerCase()] = item
        //             if (typeof alias === "string") {
        //                 alias.split(/[,，]/).forEach((text) => {
        //                     text = text.trim()
        //                     if (text != "") {
        //                         let cloneItem = cloneDeep(item)
        //                         cloneItem.text = text
        //                         ;(cloneItem as any).isAlias = true
        //                         defineMap[text.toLowerCase()] = cloneItem
        //                     }
        //                 })
        //             }
        //             console.log(item);
        //         }
        //     }
        //     console.log(`[XLSX] inside import ${Object.keys(defineMap).length} items.`)
        // }

        //从mysql数据库读数据
        await axios.get('http://localhost:3000/api/dictionary', {
        }).then(response => {
            if (response.status === 200) {
                console.log("读取 成功");

                let rows = response.data;
                console.log(rows);
                for (let row of rows) {
                    let text = row.Text;
                    let lang_zh = row.Lang_zh;
                    let subType = row.SubType;
                    let dir = row.Dir;
                    let alias = row.Alias;
                    let desc = 'default';
                    let tags = 'default';
                    subType = subTypeMap[subType] ?? "normal"
                    let item = {text, desc, lang_zh, subType, dir, tags, alias}
                    if (!text) return
                    defineMap[item?.text?.toLowerCase()] = item
                    if (typeof alias === "string") {
                        alias.split(/[,，]/).forEach((text) => {
                            text = text.trim()
                            if (text != "") {
                                let cloneItem = cloneDeep(item)
                                cloneItem.text = text
                                ;(cloneItem as any).isAlias = true
                                defineMap[text.toLowerCase()] = cloneItem
                            }
                        })
                    }
                    console.log(item);
                }
                
            } else if (response.status === 500) {
                console.log("读取 失败[code: 500]");
            }
        }).catch(error => {
            console.log("读取 失败");
        })
    }
    await once()


    console.log(`[data] outside import ${Object.keys(defineMap).length} items.`)
    let me = {
        name: "刷新数据库（悬停打开设置 / 点击刷新）",
        url: "http://localhost:3000/api/dictionary",
    }
    return { defineMap, me }
}
