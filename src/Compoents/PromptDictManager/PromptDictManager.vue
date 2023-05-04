<template>
    <div class="input-container">
        <div class="form-input">
            <label>Text:</label>
            <input type="text" v-model="text" placeholder="提示词">
        </div>
        <div class="form-input">
            <label>Lang_zh:</label>
            <input type="text" v-model="lang_zh" placeholder="中文翻译">
        </div>
        <div class="form-input">
            <label>Dir:</label>
            <input type="text" v-model="dir" placeholder="词典文件夹。用'/'创建子分类，如'风格/绘画'">
        </div>
        <div class="form-input">
            <label>Alias:</label>
            <input type="text" v-model="alias" placeholder="别名">
        </div>
        <div class="form-input">
            <label>SubType:</label>
            <select v-model="subType">
                <option value="normal">普通</option>
                <option value="style">风格</option>
                <option value="quality">质量</option>
                <option value="command">命令</option>
                <option value="eg">负面</option>
            </select>
        </div>
        <div class="button-container">
            <button @click="AddItem(true)">添加/更新</button>
            <button @click="RemoveItem(true)">删除（只需要输入Text（提示词））</button>
        </div>
    </div>
</template>

<style>
.form-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    margin-right: 10px;
}

.form-input label {
    display: flex;
    margin-left: 10px;
    margin-right: 5px;
}

.form-input input[type="text"],
.form-input select {
    flex: 1;
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 8px;
}

.input-container {
    font-family: "JetBrains Mono";
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.button-container {
    font-family: "JetBrains Mono";
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
}
</style>

<script lang="ts">
import Vue from "vue";

import * as XLSX from "xlsx";
import axios from "axios"

export default Vue.extend( {
    data() {
        return {
            text: '',
            lang_zh: '',
            subType: 'normal',
            dir: '',
            alias: '',
            showAddDialog: false, 
            needAddDialog: false, 
            showRemoveDialog: false,
            needRemoveDialog: false,
        }
    },
    methods: {
        async AddItem(show?:boolean){
            // 添加操作
            console.log('进行添加...');
            this.showAddDialog = show ?? !this.showAddDialog;
            if (this.showAddDialog) this.needAddDialog = true;
            
            
            
            let ret = await this.WriteToDatabase(false);
            
            window.alert(ret);
        },
        async RemoveItem(show?: boolean) {
            // 删除操作
            console.log('进行删除...');
            this.showRemoveDialog = show ?? !this.showRemoveDialog;
            if (this.showRemoveDialog) this.needRemoveDialog = true;

            let ret = await this.WriteToDatabase(true);

            window.alert(ret);
        },
        
        async WriteToDatabase(deleteKey?: boolean) {
            //连接到ai_keyword数据库的ai_dictionary表
            
            let ret = '无响应';
            
            if(!deleteKey){
                await axios.post('http://10.4.76.47:3000/api/dictionary', {
                    Text: this.text,
                    Lang_zh: this.lang_zh,
                    SubType: this.subType,
                    Dir: this.dir,
                    Alias: this.alias
                }).then(response => {
                    if(response.status === 200){
                        console.log("添加/更新 成功");
                        ret = "添加/更新 成功"
                    }
                    else if(response.status === 500){
                        console.log("添加/更新 失败");
                        ret = "⚠⚠⚠添加/更新 失败"
                    }
                }).catch(error => {
                    console.log("添加/更新 失败");
                    ret = "⚠⚠⚠ 添加/更新 失败"
                })
            }
            else{
                await axios.delete('http://10.4.76.47:3000/api/dictionary', {
                    data: {
                        Text: this.text
                    }
                }).then(response => {
                    if (response.status === 200) {
                        console.log("删除 成功");
                        ret = "删除 成功"
                    } else if (response.status === 500) {
                        console.log("删除 失败");
                        ret = "⚠⚠⚠ 删除 失败"
                    }
                }).catch(error => {
                    console.log("删除 失败");
                    ret = "⚠⚠⚠ 删除 失败"
                })
            }
            
            // 添加到xlsx
            // {
            //    
            //     console.log('添加到数据库');
            //
            //     const url = "http://127.0.0.1:8887/a.XLSX";
            //     const response = await fetch(url, {});
            //
            //     let arraybuffer = await response.arrayBuffer();
            //
            //     /* convert data to binary string */
            //     let data = new Uint8Array(arraybuffer);
            //     let arr = new Array();
            //     for (let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            //     let bstr = arr.join("");
            //
            //     let workbook = XLSX.read(bstr, {type: "binary"});
            //     let worksheetIndex = 0
            //     let worksheet = workbook.Sheets[workbook.SheetNames[worksheetIndex]];
            //     console.log(`[XLSX] import sheet : ${workbook.SheetNames[worksheetIndex]} .`);
            //     console.log(XLSX.utils.sheet_to_json(worksheet, {raw: true}));
            //    
            //     // 写入新一行，并且与之前的列对应上
            //     // 如果text已经存在，则直接覆盖原本的行
            //     // 如果text存在且deleteKey为true，则删除该行
            //     // 如果text不存在且deleteKey为true，则弹出提示框
            //     let jsonData = XLSX.utils.sheet_to_json(worksheet, {raw: true});
            //     let isExist = false;
            //     for (let i = 0; i < jsonData.length; i++) {
            //         if (jsonData[i].Text === this.text) {
            //             isExist = true;
            //             if (deleteKey) {
            //                 jsonData.splice(i, 1);
            //             } else {
            //                 jsonData[i].Lang_zh = this.lang_zh;
            //                 jsonData[i].SubType = this.subType;
            //                 jsonData[i].Dir = this.dir;
            //                 jsonData[i].Alias = this.alias;
            //             }
            //             break;
            //         }
            //     }
            //     if (!isExist && !deleteKey) {
            //         jsonData.push({
            //             Text: this.text,
            //             Lang_zh: this.lang_zh,
            //             SubType: this.subType,
            //             Dir: this.dir,
            //             Alias: this.alias
            //         });
            //     }
            //     if(!isExist && deleteKey){
            //         return "删除失败（不存在Text）";
            //     }
            //    
            //     // 将修改后的数据写入到本地xlsx
            //     let new_worksheet = XLSX.utils.json_to_sheet(jsonData);
            //     let new_workbook = XLSX.utils.book_new();
            //     XLSX.utils.book_append_sheet(new_workbook, new_worksheet, "Sheet1");
            //     XLSX.writeFile(new_workbook, "a.xlsx");
            // }
            
            return ret;
        }
    }
})
</script>
