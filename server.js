const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true};

const {options_mdb} = require('./options/mariaDB.js');
const {options} = require('./options/SQLite3.js');
const createTables = require('./createTables.js')

const { defaultConfiguration } = require('express/lib/application');
const { Server: HttpServer } = require('http');       
const { Server: SocketServer } = require('socket.io');

let producto = [];
let messages = [];

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static('public')); 
app.use(cookieParser());


let modulo = require('./Contenedor.js');
let contenedor_prod = new modulo.Contenedor('productos', options_mdb);
let contenedor_mnsjs = new modulo.Contenedor('mensajes', options);

const httpServer = new HttpServer(app);             
const socketServer = new SocketServer(httpServer);  

const userlog = 'diego';
const pwdlog = 'pwd';
let credencial = {};

//------------------ SET SESSION -----------------------

app.use(session({

    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://diego:Mongo2022@cluster1.jjt93.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: advancedOptions
      }),
    secret: 'clave',
    resave: true,
    cookie: {
        maxAge: 60000
      },
    saveUninitialized: true
  }));

function auth(req, res, next){
    if(req.session?.user === userlog && req.session?.admin){
        return next();
    }
    return res.redirect('/')
}

//--------- RENDER LOGIN Y LOGOUT ---------------

const {engine} = require('express-handlebars');

app.set('view engine', 'hbs');
app.set('views', './views');

app.engine(
    'hbs',
    engine({
        extname: '.hbs'
    })
);

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { name, pwd } = req.body;

    if(name!== userlog || pwd!== pwdlog){
        res.send('Login failed')
    }
    else{
        req.session.user = name;
        req.session.pwd = pwd;
        req.session.admin = true;
    
        credencial = {
            name: req.session.user,
            pwd: req.session.pwd
        }
        console.log(credencial);
        res.redirect('/login');
    }
});

app.get('/login', auth,(req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/logout', (req, res) => {

    req.session.destroy((err) =>{
        if(!err) res.render('logout', { credencial });
        else res.send({status: 'Logout ERROR', body: err})
        /* setTimeout(() => {
            res.redirect('/');
        }, 2000); */
    })
});

app.get('/logout', (req, res) => {
console.log("entro")
    setTimeout(() => {
            res.redirect('/');
        }, 2000);
    
});

//----------------------------------------------------------------

socketServer.on('connection', (socket) => {

    async function init(){
        await createTables();
        messages = await contenedor_mnsjs.getAll();
        producto = await contenedor_prod.getAll();
        socket.emit('new_event', producto, messages, credencial);      
    }
    init();

    socket.on('nuevo_prod', (obj) => {

        async function ejecutarSaveShow(argObj) {
            await contenedor_prod.save(argObj);
            const result = await contenedor_prod.getAll();
            producto = result;
            socketServer.sockets.emit('new_event', producto, messages, credencial);
        }
        ejecutarSaveShow(obj);
    });
    socket.on('new_message', (mensaje) => {
        async function ejecutarSaveShowMnsjs(mnsj) {
            await contenedor_mnsjs.save(mnsj);
            const result = await contenedor_mnsjs.getAll();
            messages = result;
            socketServer.sockets.emit('new_event', producto, messages, credencial);
        }
        ejecutarSaveShowMnsjs(mensaje);
    });
});

httpServer.listen(8080, () => {
  console.log('Estoy escuchando en el puerto 8080');
});
