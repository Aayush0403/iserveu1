const express=require('express')
const {Client} = require('pg')
const app=express()
app.use(express.json())
const fs = require('fs');
//connecting with pg database
const client= new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'test1',
    password: 'aayush',
    port: 5432

})

client.connect()


const success_array=new Array() // for storing all successful cases
const failed_array=new Array()  // for storing all failed cases
let count=0 // to count the no. of successful cases

//defining the object format to throw as a final response
const response = {
    success: {
        count: count,
        data: success_array
    },
    failed: {
        count: 10,
        data: failed_array
    }
};


// creating an API to  recive 10 objs.
app.post('/validobj',async(req,res)=>{
    try{
        const data= await req.body
        
        const regex = /^[a-zA-Z]+$/
        data.map(items=>{
            //validating the necessary conditions
                (items.name.length>10 || (items.age <20 || items.age>100) || !Number.isInteger(items.age) || !regex.test(items.name))
                ?
                (
                    failed_array.push(items)
                )
                :
                (
                    // insrting all the successful cases to the database
                    client.query('insert into practise_table(name,age) Values($1,$2)',[`${items.name}`, items.age],(err,res)=>{
                        console.log(" data inserted")
                    }),
                    success_array.push(items),
                    count++    
                )
    })
    response.success.count=count
    response.failed.count=10-count
    res.send(response);
    //creating a csv file for both failed and successful test cases
    fs.writeFileSync('success.csv', arrayToCSV(success_array));
    fs.writeFileSync('failed.csv', arrayToCSV(failed_array));
    }
    catch(error){
        res.send(error)
    }
})

//function to convert to csv file
function arrayToCSV(dataArray) {
    const header = Object.keys(dataArray[0]).join(' , ') + '\n';
    const rows = dataArray.map(obj => Object.values(obj).join(' , ') + '\n');
    return header + rows.join('');
}


app.listen(4000,()=>{
    console.log("server started at port 4000")
})