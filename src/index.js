// import
const path = require('path');
const express = require('express');
const db = require('./util/database');

// setup
const app = express();
const port = 3000;

// static files
app.use(express.static(path.join(__dirname, '../', 'public')));

// read body
app.use(express.json());

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views'));

class Rule {
    constructor(id, name, content) {
        this.id = id;
        this.name = name;
        this.content = content;
    }
    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getFullName() {
        return this.id + '. ' + this.name;
    }

    getContent() {
        return this.content;
    }
}

class Metric {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
    getId() {
        return this.id;
    }

    getValue() {
        return this.value;
    }
}

async function main() {
    let data_imps = await db.run('improvements', {}).catch(console.dir);
    let ruleList = [];
    let rule_name = [];
    let content = [];
    for (let i = 0; i < data_imps.length; i++) {
        let result = new Rule(data_imps[i]._id, data_imps[i].rule_name, data_imps[i].content);
        rule_name.push(result.getFullName());
        content.push(result.getContent());
        ruleList.push(result);
    }


    let data_metrics = await db.run('metrics', {}).catch(console.dir);
    // console.log(data_metrics);
    let metricList = [];
    let opNameList = [];
    for (let i = 0; i < data_metrics.length; i++) {
        let result = new Metric(data_metrics[i]._id, data_metrics[i].value);
        opNameList.push(result.getValue());
        metricList.push(result);
    }
    // console.log(opNameList);

    // routes
    app.locals.opt1 = 1; // max option, default = 1
    app.locals.opt2 = 1;

    app.locals.option_name = opNameList; // pass variable to view
    app.get('/', (req, res) => {
        res.render('home')
    })

    app.post('/get-answers', async (req, res) => {

        const rulename = [];
        const rule_content = [];
        if (req.body.goodOption != 0 && req.body.badOption != 0) {
            const rowData = await db.runOne('matrix_byGoodOption', { _id: req.body.goodOption }).catch(console.dir);
            const list = rowData.pros.find(item => item && item.ID === req.body.badOption).data;
            const test_arr = list.split(',').map(Number);
            for (let index = 0; index < test_arr.length; index++) {
                let element = test_arr[index];
                console.log(element);
                if (element == 90) {
                    element = 41;
                } else if (element == 99) {
                    element = 42;
                }
                const data_des_name = rule_name[element - 1];
                const data_des_deitail = content[element - 1];
                rulename.push(data_des_name);
                rule_content.push(data_des_deitail);
            }
        } else {
            rulename.push('Vui lòng chọn tùy chọn');
        }

        app.locals.rule_name = rulename;
        app.locals.content = rule_content;
        res.render('include/answers.ejs', { rulename, rule_content });
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    })

}

main();
