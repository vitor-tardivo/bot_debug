// server.js Back_End
const express = require('express')
const cors = require('cors')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const {
    Set_Log_Callback,
    Set_Exit_Callback, 
    Set_Auth_Failure_Callback, 
    Set_QrCode_On_Callback, 
    Set_QrCode_Exceeds_Callback, 
    Set_List_Callback,
    Set_List_Auxiliar_Callback,
    Print_All_Chat_Data,
    Set_Search_List_Callback,
    Search_Chat_Data_By_Search,
    Set_All_Erase_Callback,
    Set_Query_Erase_Callback,
    Set_Auth_Autenticated_Callback, 
    Set_Ready_Callback,
    Set_Start_Callback,
    Erase_Chat_Data_By_Query,
    Erase_All_Chat_Data,
    Reload_Front, 
    Input_Command, 
    Generate_Client_Id,
    Initialize_Client_,
    initialize,
} = require('./src/app')

process.on('uncaughtException', (error) => {
    //if (Exit_Callback) Exit_Callback()
    console.error(`> ❌ Uncaught Exception: ${error}`)
    if (global.Log_Callback) global.Log_Callback(`> ❌ Uncaught Exception: ${error}`)
    //process.exit(1)
})

let Statuses_WS_Callback = null
function Set_Statuses_WS_Callback(callback) {
    Statuses_WS_Callback = callback
}

global.QR_Counter = 0
global.Qr_String = ''
global.Is_Conected = true
global.Stage_ = 0

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)

function generateUniqueId() {
    return uuidv4();
}

const wss_Server = new WebSocket.Server({ server })
const wss_Connections = new Map()

app.use( 
    cors({
        origin: "*",
        credentials: true,
        allowedHeaders:
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin",
        methods: ["GET", "POST", "PUT", "DELETE"],
    }) 
)

app.use(express.static(path.join(__dirname, 'frontEnd')))

app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'frontEnd', 'index.html'))
        res.status(200).send({ sucess: true, message: `sucessfully get /.` })
    } catch (error) {
        console.error(`> ❌ ERROR /: ${error}`)
        res.status(500).send({ sucess: false, message: 'ERROR Internal server' })
    }
})

wss_Server.on('connection', async  function connection(wss) {
    try {
        const wss_Connection_Id = generateUniqueId()
        wss_Connections.set(wss_Connection_Id, {
            wss,
            reason: null
        })
        console.log(`> ✅ Conectado Client ao WebSocket(back).`)
        if (Statuses_WS_Callback) Statuses_WS_Callback(true)
        //if (global.Log_Callback) global.Log_Callback(`> ✅ Conectado Client ao WebSocket(back).`)
        wss.on('close', function() {
            console.error(`> ⚠️  Desconectado Client do WebSocket(back).`)
            //if (global.Log_Callback) global.Log_Callback(`> ⚠️ Desconectado Client do WebSocket(back).`)    
            if (Statuses_WS_Callback) Statuses_WS_Callback(false)
        
            setTimeout(function() {
                wss_Connections.delete(wss_Connection_Id)
            }, 300)
        })

        Set_Log_Callback(function(log) {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'log', message: log }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending log to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'log', message: log}))
        })

        Set_Statuses_WS_Callback(function(status) {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'statues-ws', data: status }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending status to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            } 
            //wss_Connection.wss.send(JSON.stringify({ type: 'statues-ws', data: status}))
        })
        
        Set_Exit_Callback(function() {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'exit' }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending exit to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            } 
            //wss_Connection.wss.send(JSON.stringify({ type: 'exit'}))
        })
        Set_Auth_Failure_Callback(function() {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'auth_failure' }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending auth_failure to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'auth_failure'}))
        })
        
        Set_QrCode_On_Callback(function(isOn, QR_Counter) {
            if (isOn) {
                const wss_Connection = wss_Connections.get(wss_Connection_Id)
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'generate_qr_code', data: QR_Counter }));
                    } catch (error) {
                        console.error(`> ❌ ERROR sending generate_qr_code to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
                //wss_Connection.wss.send(JSON.stringify({ type: 'generate_qr_code', data: QR_Counter}))
            }
        })
        Set_QrCode_Exceeds_Callback(function(QR_Counter_Exceeds) {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'qr_exceeds', data: QR_Counter_Exceeds }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending qr_exceeds to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'qr_exceeds', data: QR_Counter_Exceeds }))
        })
        
        Set_List_Callback(async function() {
            try {
                
                /*const { Sucess, Is_Empty, ChatData, Is_From_All_Erase } = await Print_All_Chat_Data(isallerase)
                if (Sucess) {
                    wss.send(JSON.stringify({ type: 'all-print', sucess: Sucess, message: `Sucessfully send all ChatData.`, chatdata: ChatData, empty: Is_Empty, isallerase: Is_From_All_Erase }))
                } else {
                    wss.send(JSON.stringify({ type: 'all-print', sucess: Sucess, message: `ERROR to send all ChatData.`, chatdata: ChatData, empty: Is_Empty, isallerase: Is_From_All_Erase }))
                }*/
                //let Is_From_All_Erase = null
                //Is_From_All_Erase = isallerase
                const wss_Connection = wss_Connections.get(wss_Connection_Id)
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'all-print'}))//, isallerase: Is_From_All_Erase}))
                    } catch (error) {
                        console.error(`> ❌ ERROR sending List to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
            } catch (error) {
                console.error(`> ❌ ERROR Set all-print: ${error}`)
                //wss.send(JSON.stringify({ type: 'all-print', sucess: false, message: `ERROR Internal server: ${error}`, chatdata: [], empty: null, isallerase: null }))
            }
        })
        Set_List_Auxiliar_Callback(async function(Is_From_All_Erase) {
            try {
                /*if (Is_From_All_Erase) {
                    Print_All_Chat_Data(Is_From_All_Erase)
                }*/
                const wss_Connection = wss_Connections.get(wss_Connection_Id) 
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'all-print-auxiliar', isallerase: Is_From_All_Erase }));
                    } catch (error) {
                        console.error(`> ❌ ERROR sending all-print-auxiliar to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
                //wss_Connection.wss.send(JSON.stringify({ type: 'all-print-auxiliar', isallerase: Is_From_All_Erase}))
            } catch (error) {
                console.error(`> ❌ ERROR Set all-print: ${error}`)
            }
        })
        Set_Search_List_Callback(async function(Search) {
            try {
                //const Parse_Data = await Search_Chat_Data_By_Search(search)
                
                /*if (Parse_Data.length === 0) {
                    wss.send(JSON.stringify({ type: 'search-chatdata', data: [], data2: search }))
                } else {
                    wss.send(JSON.stringify({ type: 'search-chatdata', data: Parse_Data, data2: search }))
                }*/
                const wss_Connection = wss_Connections.get(wss_Connection_Id)
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'search-search', search: Search }));
                    } catch (error) {
                        console.error(`> ❌ ERROR sending search-search to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
                //wss_Connection.wss.send(JSON.stringify({ type: 'search-search', search: Search }))
            } catch (error) {
                console.error(`ERROR Set search-search: ${error}`)
                //wss.send(JSON.stringify({ type: 'error', message: `status(500) ERROR searching ChatData by the search ${search}: ${error}` }))
            }
        })
        Set_All_Erase_Callback(async function() {
            try { 
                /*const Is_From_End = false
                const { Sucess, Is_Empty } = await Erase_All_Chat_Data(Is_From_End)
                if (Sucess) {
                    wss.send(JSON.stringify({ type: 'all-erase', sucess: Sucess, message: `sucessfully erase all ChatData.`, empty: Is_Empty }))
                } else {
                    wss.send(JSON.stringify({ type: 'all-erase', sucess: Sucess, message: `ERROR to erase all ChatData.`, empty: Is_Empty }))
                }*/
                const wss_Connection = wss_Connections.get(wss_Connection_Id)
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'all-erase'}))
                    } catch (error) {
                        console.error(`> ❌ ERROR sending all erase to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
            } catch (error) {
                console.error(`> ❌ ERROR Set all-erase: ${error}`)
                //wss.send(JSON.stringify({ type: 'all-erase', Sucess: false, message: `ERROR Internal server: ${error}`, empty: null }))
            }
        })
        Set_Query_Erase_Callback(function(query) {
            try {
                const wss_Connection = wss_Connections.get(wss_Connection_Id)
                if (wss_Connection) {
                    try {
                        wss_Connection.wss.send(JSON.stringify({ type: 'erase-query', Search: query }));
                    } catch (error) {
                        console.error(`> ❌ ERROR sending erase-query to WebSocket ${wss_Connection_Id}: ${error}`);
                    }
                } else {
                    console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
                }
                //wss_Connection.wss.send(JSON.stringify({ type: 'erase-query', Search: query }))
            } catch (error) {
                console.error(`ERROR Set erase-query: ${error}`)
            }
        })

        Set_Auth_Autenticated_Callback(function() {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'auth_autenticated' }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending auth_autenticated to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'auth_autenticated'}))
        })
        Set_Ready_Callback(function() {
            const wss_Connection = wss_Connections.get(wss_Connection_Id)
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'ready' }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending ready to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'ready'}))
        })
        Set_Start_Callback(function() {
            const wss_Connection = wss_Connections.get(wss_Connection_Id) 
            if (wss_Connection) {
                try {
                    wss_Connection.wss.send(JSON.stringify({ type: 'start' }));
                } catch (error) {
                    console.error(`> ❌ ERROR sending start to WebSocket ${wss_Connection_Id}: ${error}`);
                }
            } else {
                console.error(`> ⚠️  WebSocket connection ${wss_Connection_Id} not found.`);
            }
            //wss_Connection.wss.send(JSON.stringify({ type: 'start'}))
        })
    } catch (error) {
        console.error(`> ❌ ERROR WebSocket connection: ${error}`)
    }
})

app.get('/what-stage', async (req, res) => {
    try {
        res.status(200).send({ sucess: true, message: `sucessfully get stage.`, data: global.Stage_, data2: global.QR_Counter })
    } catch (error) {
        console.error(`> ❌ ERROR /what-stage: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}` })
    }
})

app.delete('/erase-query', async (req, res) => {
    try {
        const query = req.query.queryList
        const Is_From_End = false
        const { Sucess, Is_Empty, Is_Empty_Input } = await Erase_Chat_Data_By_Query(query, Is_From_End)
        if (Sucess) {
            res.status(200).send({ sucess: Sucess, message: `sucessfully erased ${query}.`, empty: Is_Empty, empty_input: Is_Empty_Input })
        } else {
            res.status(200).send({ sucess: Sucess, message: `ERROR to erase ${query}.`, empty: Is_Empty, empty_input: Is_Empty_Input })
        }
    } catch (error) {
        console.error(`> ❌ ERROR /erase-query: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}`, empty: null, empty_input: null })
    }
})
app.delete('/all-erase', async (req, res) => {
    try {
        const Is_From_End = false
        const { Sucess, Is_Empty } = await Erase_All_Chat_Data(Is_From_End)
        if (Sucess) {
            res.status(200).send({ sucess: Sucess, message: 'Sucessfully erased all ChatData.', empty: Is_Empty })
        } else {
            res.status(200).send({ sucess: Sucess, message: `ERROR to erase all ChatData.`, empty: Is_Empty })
        }
    } catch (error) {
        console.error(`> ❌ ERROR /all-erase: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}`, empty: null })
    }
})
app.get('/search-search', async (req, res) => {
    try {
        const search = req.query.Search
        if (!search) {
            return res.status(200).send({ sucess: false, message: `The ChatData ${search} is not in List.`, empty: false, chatdata: [], empty_input: true })
        }
        const { Sucess, Is_Empty, ChatData, Is_Empty_Input } = await Search_Chat_Data_By_Search(search)
        if (Sucess) {
            res.status(200).send({ sucess: Sucess, message: `Sucessfully to sent the ChatData ${search}.`, empty: Is_Empty, chatdata: ChatData, empty_input: Is_Empty_Input })
        } else {
            res.status(200).send({ sucess: Sucess, message: `ERROR to sent the ChatData ${search}.`, empty: Is_Empty, chatdata: ChatData, empty_input: Is_Empty_Input })
        }         
    } catch (error) {
        console.error(`> ❌ ERROR /search-list: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}`, empty: null, chatdata: [], empty_input: null })
    }    
})
app.get('/all-print', async (req, res) => {
    try {
        const isallerase = req.query.isallerase
        const { Sucess, Is_Empty, ChatData, Is_From_All_Erase } = await Print_All_Chat_Data(isallerase)
        if (Sucess) {
            res.status(200).send({ sucess: Sucess, message: `Sucessfully send all ChatData.`, empty: Is_Empty, chatdata: ChatData, isallerase: Is_From_All_Erase })
        } else {
            res.status(200).send({ sucess: Sucess, message: `ERROR to send all ChatData.`, empty: Is_Empty, chatdata: ChatData, isallerase: Is_From_All_Erase })
        }
    } catch (error) {
        console.error(`> ❌ ERROR /all-print: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}`, empty: null, chatdata: [], isallerase: null })
    }
})

app.get('/reload', (req, res) => {
    try {
        Reload_Front()
        res.status(200).send({ sucess: true, message: `sucessfully get reload FrontEnd and send to BackEnd.`})
    } catch (error) {
        console.error(`> ❌ ERROR /command: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}` })
    }
})

app.post('/command', express.json(), (req, res) => {
    try {
        const { command } = req.body
        let Is_Front_Back = false
        Input_Command(command, Is_Front_Back) 
        res.status(200).send({ sucess: true, message: `sucessfully send command.`})
    } catch (error) {
        console.error(`> ❌ ERROR /command: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}` })
    }
})

app.get('/qr', (req, res) => {
    try {
        if (Qr_String === null) {
            res.status(200).send({ sucess: true, message: `sucessfully send command.`, qrString: 'Client já Conectado ao WhatsApp Web!', Is_Conected })
        } else {
            res.status(200).send({ sucess: true, message: `sucessfully send command.`, qrString: Qr_String, Is_Conected })
        }
    } catch (error) {
        console.error(`> ❌ ERROR /qr: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}` })
    }
})

app.post('/new-client', async (req, res) => {
    try {
        const clientId = Generate_Client_Id()
        await Initialize_Client_(clientId);

        res.status(200).send({ success: true, message: `Client ${clientId} initialized.` });
    } catch (error) {
        console.error(`> ❌ ERROR /new-client: ${error}`);
        res.status(500).send({ success: false, message: `ERROR Internal server: ${error}` });
    }
})
app.post('/start-bot', async (req, res) => {
    try {
        const { Sucess } = await initialize()
        
        res.status(200).send({ sucess: Sucess, message: `sucessfully started bot.` })
    } catch (error) {
        console.error(`> ❌ ERROR /start-bot: ${error}`)
        res.status(500).send({ sucess: false, message: `ERROR Internal server: ${error}` })
    }
})

server.listen(port, () => {
    axios.get('https://api.ipify.org?format=json')
    .then(response => {
        let data = response.data
        console.log(`>  ℹ️ Server running ON: http://${data.ip}:${port}/ || http://localhost:${port}/`)
    })
    .catch(error => {
        console.error(`> ❌ ERROR Listen server: ${error}`)
    })
})

//tarefas bot backend 
//em desenvolvimento...
    

//a desenvolver...
    //melhorar para ser possivel varias instancias de websocket ao mesmo tempo e tals
    //da pra melhora os set pra um so e dentro dele seleionar qual vai madar o type e os caralho
    //melhora o reconhecimto do chatdata nao esta na lista do /search-search Search_Chat_Data_By_Search
    //funcoes multi instancias...