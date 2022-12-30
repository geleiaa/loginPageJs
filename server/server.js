const dotenv = require('dotenv');
dotenv.config({ path: './config.env'});
const app = require('./app');

const mongoose = require('mongoose');

// Tratamento p/ erros de funcs sincronos ...
process.on('uncaughtException', err => {
    console.log('Erro sincrono kkkk, saindo ...');
    console.log(err.name, err.message);
    
    process.exit(1);
}); // talvez esta no lugar errado

//connect local db with mongoose
mongoose
.connect(process.env.DATABASE_LOCAL) // config.env
.then(() => {
    //console.log(con.connections);
    console.log('Db connection successful!');
})
.catch(err => console.log(err))


// server         
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server up, port ${port}`);
});

// Promisses não tratadas passam por aqui (unhandled rejections)
process.on('unhandledRejection', err => {
    console.log(err); //err.name, err.message
    console.log('Promisses não tratadas, saindo ...');

    server.close(() => { // fecha o server 
        process.exit(1);
    });
});
