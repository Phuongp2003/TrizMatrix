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
    constructor(id, name, detail) {
        this.id = id;
        this.name = name;
        this.detail = detail;
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

    getDetail() {
        return this.detail;
    }
}

class Metric {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }
}

async function main() {
    let data_imps = await db.run('imps', {}).catch(console.dir);

    let ruleList = [];
    let rule_name = [];
    let rule_detail = [];
    for (let i = 0; i < data_imps.length; i++) {
        let result = new Rule(data_imps[i].ID, data_imps[i].rule_name, data_imps[i].rule_detail);
        rule_name.push(result.getFullName());
        rule_detail.push(result.getDetail());
        ruleList.push(result);
    }
    // console.log(rule_name);


    let data_metrics = await db.run('metrics', {}).catch(console.dir);
    let metricList = [];
    let opNameList = [];
    for (let i = 0; i < data_metrics.length; i++) {
        let result = new Metric(data_metrics[i].ID, data_metrics[i].detail);
        opNameList.push(result.name);
        metricList.push(result);
    }

    // routes
    app.locals.opt1 = 1; // max option, default = 1
    app.locals.opt2 = 1;

    app.locals.option_name = opNameList; // pass variable to view
    app.get('/', (req, res) => {
        res.render('home')
    })

    app.post('/get-answers', async (req, res) => {

        const rulename = [];
        const ruledetail = [];
        if (req.body.goodOption != 0 && req.body.badOption != 0) {
            const listStr = await db.run('matrix', { goodOption: parseInt(req.body.goodOption), badOption: parseInt(req.body.badOption) }).catch(console.dir);
            const list = listStr[0].data + '';
            const test_arr = list.split(',').map(Number);
            console.log(test_arr);
            for (let index = 0; index < test_arr.length; index++) {
                let element = test_arr[index];
                if (element == 90) {
                    element = 41;
                } else if (element == 99) {
                    element = 42;
                }
                const data_des_name = rule_name[element - 1];
                const data_des_deitail = rule_detail[element - 1];
                rulename.push(data_des_name);
                ruledetail.push(data_des_deitail);
            }
        } else {
            rulename.push('Vui lòng chọn tùy chọn');
        }

        app.locals.rule_name = rulename;
        app.locals.rule_detail = ruledetail;
        res.render('include/answers.ejs', { rulename, ruledetail });
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    })

}

main();
