//scriptBot.js frontEnd

let userAgent = null

let wss = null
let setLogError = true

let isDisconected = false

let isFromTerminal = false

let tableReady = false
let isTableHidden = null

let isFunilHidden = null

let isConsoleHidden = null

let isExceeds = true 

let isQrOff = true

let isAlreadyDir = false

let Clientt_Temp = null

let isFromNew = false

let Client_ = null

let Client_NotReady = true 

let ChatDataNotReady = true

let isStartedNew = true

let isHideAP = true

let isStarted = false

let Funilt_Temp = null
let Funil_ = null

let nameApp = null
let versionApp = null

async function getDeviceType() {//IDENTIFY IF THE USER IS FROM A PHONE
    try {    
        const userAgent = navigator.userAgent.toLowerCase()
        const devicePatterns = {
            "android": "Android Device",
            "iphone": "iPhone",
            "ipad": "iPad",
            "windows phone": "Windows Phone",
            "windows ce": "Windows Phone",
            "webos": "webOS Device",
            "mobile safari": "Mobile Safari",
            "blackberry": "BlackBerry",
            "tablet": "Tablet Device",
            "mobile": "Other Mobile Device"
        }
        for (const pattern in devicePatterns) {
            if (userAgent.includes(pattern)) {
                return devicePatterns[pattern];
            }
        }
        return "Desktop"
    } catch(error) {
        console.error(`> ⚠️ ERROR getDeviceType: ${error}`)
        displayOnConsole(`> ⚠️ <i><i><strong>ERROR</strong></i></i> getDeviceType: ${error.message}`, setLogError)
    }
}

window.onerror = function(event) {
    console.error(`> ❌ Uncaught Exception: ${event}`)
    displayOnConsole(`> ❌ Uncaught Exception: ${event}`, setLogError)
}
window.onload = function(event) {
    try {
        axios.get('/front/reload')
    } catch(error) {
        console.error(`> ⚠️ ERROR onload: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> onload: ${error.message}`, setLogError)
    }
}
window.onbeforeunload = function(event) {
    try {    
        //event.preventDefault()
    } catch(error) {
        console.error(`> ⚠️ ERROR onbeforeunload: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> onbeforeunload: ${error.message}`, setLogError)
    }
}
document.addEventListener('DOMContentLoaded', async function () {// LOAD MEDIA QUERY PHONE AND ELSE
    try {
        const deviceType = await getDeviceType()
        if (deviceType !== "Desktop") {
            console.log(`User is from a ${deviceType} (${navigator.userAgent}).`)
            
            var link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = '../styles/Bot/mediaQueryBot.css'
            document.head.appendChild(link)
        } else {
            console.log(`User is from a Desktop (${navigator.userAgent}).`)
        }

        const response = await axios.get('/api/data')
        const Bot_Name = response.data.name
        const dataName = document.querySelector('#appName')
        nameApp = `${Bot_Name}`
        document.title = `Inicie o ${nameApp.toUpperCase() || 'BOT'}`
        dataName.textContent = nameApp.toUpperCase() || 'BOT'
        const Version_ = response.data.version
        const dataVersion = document.querySelector('#appVersion')
        versionApp = 'v' +`${Version_ || '?.?.?'}`
        dataVersion.textContent = versionApp

        const response2 = await axios.get('/back/what-stage')
        const stage = response2.data.data
        const QR_Counter = response2.data.data2
        Client_ = response2.data.data3
        Funil_ = response2.data.data4
        
        if (stage === 0) {
            
        }
        if (stage === 1) {
            if (!isFromNew) {
                isStarted = true
            }
            isQrOff = false
            await generateQrCode(QR_Counter, Client_)
        }
        if (stage === 2) {
            if (!isFromNew) {
                isStarted = true
            }
            await authsucess(Client_)
            await ready(Client_)
        }
        if (stage === 3) {
            if (!isFromNew) {
                isStarted = true
            }
            await authsucess(Client_)
            await ready(Client_)
            let isFromNew = true
            isQrOff = false
            await generateQrCode(QR_Counter)
        }

        const reloadButton = document.querySelector('#reload')
        let reloadAbbr = document.querySelector('#abbrReload')

        reloadButton.style.cssText =
            'color: var(--colorContrast); background-color: var(--colorYellow); cursor: progress;'
        reloadAbbr.title = `WebSocket STATUS: carregando`
        
        if (wss) wss.close(), wss = null
        wss = new WebSocket(`ws://${window.location.host}`)
        /*wss = new WebSocket(`wss://${window.location.host}`)*/
        await webSocket()

        /*const originalConsoleLog = console.log
        console.log = function (...args) {
            originalConsoleLog.apply(console, args)
            
            displayLogOnSite(args.join(' '))
        
            ws.send(JSON.stringify({ type: 'log', message: args.join(' ') }))
        }*/
        
        const commandInput = document.querySelector('#commandInput')
        commandInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault()
                document.querySelector('#commandSend').click()
            }
        })

        const listInput = document.querySelector('#inputList')
        listInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault()
            document.querySelector('#sendSearchList').click()
        }
        })

        await loadConsoleStyles()
        await loadFunilStyles()
        const dir_Path = 'Funils_'
        const response3 = await axios.get('/functions/dir', { params: { dir_Path } })
        const Directories_ = response3.data.dirs
        if (Directories_.length-1 === -1) {
            
            
        } else {
            let Counter_Clients_ = 1
            for (let i = 1; i <= Directories_.length; i++) {
                const match = Directories_[Counter_Clients_-1].match(/=(.+)\.json/)
                const Funilt_ = match ? match[1] : null
                await insertFunil_Front(Funilt_)
                await selectFunil_(Funilt_)
                
                Counter_Clients_++
            }
        }
        //await loadSectionsHtml()
    } catch (error) {
        console.error(`> ⚠️ ERROR DOMContentLoaded: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> DOMContentLoaded: ${error.message}`, setLogError)
    }
})

async function reconnectWebSocket() {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        isReconectOn = true
        isDisconected = false

        const reloadButton = document.querySelector('#reload')
        let reloadAbbr = document.querySelector('#abbrReload')

        reloadButton.style.cssText =
            'color: var(--colorContrast); background-color: var(--colorYellow); cursor: progress;'
        reloadAbbr.title = `WebSocket STATUS: carregando...`

        if (wss) wss.close(), wss = null
        wss = new WebSocket(`ws://${window.location.host}`)
        //wss = new WebSocket(`wss://${window.location.host}`)
        await webSocket()

    } catch (error) {
        console.error(`> ⚠️ ERROR reconnectConsole: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> reconnectConsole: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}
async function webSocket() {
    try {
        const reloadButton = document.querySelector('#reload')
        let reloadAbbr = document.querySelector('#abbrReload')

        wss.onopen = function(event) {
            console.log(`> ✅ Conectado Usuario ao WebSocket: `, event)
            displayOnConsole(`> ✅ Conectado <strong>Usuario</strong> ao <strong>WebSocket</strong>: ${event}`)
            reloadButton.style.cssText =
                'color: var(--colorContrast); background-color: var(--colorGreen); cursor: not-allowed; pointer-events: none; opacity: 0.5;'
            reloadAbbr.title = `WebSocket STATUS: conectado`
            setTimeout(function() {
                reloadButton.style.cssText =
                    'color: var(--colorContrast); background-color: var(--colorGreen); cursor: pointer; pointer-events: unset; opacity: 1;'
            }, 5 * 1000)

            resetLoadingBar()
        }
        wss.onclose = function(event) {
            console.log(`> ⚠️ Desconectado Usuario do WebSocket: `, event)
            displayOnConsole(`> ⚠️ Desconectado <strong>Usuario</strong> do <strong>WebSocket</strong>: ${event}`, setLogError)
            reloadButton.style.cssText =
                'color: var(--colorContrast); background-color: var(--colorOrange); cursor: not-allowed; pointer-events: none; opacity: 0.5;'
            reloadAbbr.title = `WebSocket STATUS: desconectou`
            setTimeout(function() {
                reloadButton.style.cssText =
                    'color: var(--colorContrast); background-color: var(--colorOrange); cursor: pointer; pointer-events: unset; opacity: 1;'
            }, 5 * 1000)

            isDisconected = true

            resetLoadingBar()
        }
        wss.onerror = function(event) {
            console.error(`> ❌ ERROR ao reconectar Usuario ao WebSocket: `, event)
            displayOnConsole(`> ❌ <i><strong>ERROR</strong></i> ao reconectar <strong>Usuario</strong> ao <strong>WebSocket</strong>: ${event}`, setLogError)
            setTimeout(function() {
                reloadButton.style.cssText =
                    'color: var(--colorContrast); background-color: var(-colorRed); cursor: not-allowed; pointer-events: none; opacity: 0.5;'
                reloadAbbr.title = `WebSocket STATUS: error`
                setTimeout(function() {
                    reloadButton.style.cssText =
                        'color: var(--colorContrast); background-color: var(-colorRed); cursor: pointer; pointer-events: none; opacity: 0.5;'
                }, 5 * 1000)
            }, 100)

            isDisconected = true
            
            resetLoadingBar()
        }

        wss.onmessage = function(event) {
            const dataWebSocket = JSON.parse(event.data)
            handleWebSocketData(dataWebSocket)
        }
        
        resetLoadingBar()
    } catch(error) {
        console.error(`> ⚠️ ERROR webSocket: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> webSocket: ${error.message}`, setLogError)
        reconectAttempts = 0
        resetLoadingBar()
    }
}
async function handleWebSocketData(dataWebSocket) {
    switch (dataWebSocket.type) {
        case 'WS=/back/logs':
            //console.log(logData.message)
            displayOnConsole(dataWebSocket.message)
            /*const logElement = document.createElement('div')
            logElement.textContent = logData.message
            document.querySelector('#log').appendChild(logElement)
            autoScroll()*/
            break
        case 'WS=/websocket/statues-connection':
            const statuses = dataWebSocket.data
            await statusesWs(statuses)
            break
        case 'WS=/chatdata/query-erase':
            const search2 = dataWebSocket.Search.trim()
            const isFromTerminal3 = true
            //ChatDataNotReady = false
            await eraseChatDataByQuery(isFromTerminal3, search2)
            break
        case 'WS=/chatdata/all-erase':
            /*const Sucess2 = dataWebSocket.sucess
            const Is_Empty2 = dataWebSocket.empty
            const isFromTerminal2 = true*/
            //allErase(Sucess2, Is_Empty2, isFromTerminal2)
            //ChatDataNotReady = false
            await allErase()
            break
        case 'WS=/chatdata/search-print':
            //const Parse_Data = dataWebSocket.data
            const Search = dataWebSocket.search.trim()
            const isFromTerminal = true
            //ChatDataNotReady = false
            await searchChatDataBySearch(isFromTerminal, Search)
            //searchChatDataBySearch(isFromTerminal, Parse_Data, Search)
            break
        case 'WS=/chatdata/all-print':
            /*const Sucess = dataWebSocket.sucess
            const Is_Empty = dataWebSocket.empty
            const ChatData = dataWebSocket.chatdata*/
            const isFromButton = false
            //allPrint(Sucess, Is_Empty, ChatData, isFromButton, Is_From_All_Erase)
            await allPrint(isFromButton, false, null)
            break
        case 'WS=/chatdata/all-print-auxiliar':
            /*const Sucess = dataWebSocket.sucess
            const Is_Empty = dataWebSocket.empty
            const ChatData = dataWebSocket.chatdata*/
            const isFromButton2 = false
            const Is_From_All_Erase = dataWebSocket.isallerase
            const Client_ = dataWebSocket.Client_
            //allPrint(Sucess, Is_Empty, ChatData, isFromButton, Is_From_All_Erase)
            ChatDataNotReady = false
            await allPrint(isFromButton2, Is_From_All_Erase, Client_)
            break
        case 'WS=/back/exit':
            isReconectionOff = true
            let exitInten = false
            await exit(exitInten)
            break
        case 'WS=/client/qr-code-exceeds':
            isExceeds = false
            const QR_Counter_Exceeds = dataWebSocket.data
            await counterExceeds(QR_Counter_Exceeds)
            break
        case 'WS=/client/auth-autenticated':
            const Client____ = dataWebSocket.client
            await authsucess(Client____);
            break
        case 'WS=/client/ready':
            const Client_____ = dataWebSocket.client
            const Is_Reinitialize = dataWebSocket.isreinitialize
            if (Is_Reinitialize === true) {
                isAlreadyDir = true
            }
            await ready(Client_____)
            break
        case 'WS=/client/auth-failure':
            isReconectionOff = true
            await authFailure()
            break
        case 'WS=/client/erase':
            const Client______ = dataWebSocket.client
            await eraseClient_(Client______)
            break
        case 'WS=/client/destroy':
            const Client_______ = dataWebSocket.client
            await DestroyClient_(Client_______)
            break
        case 'WS=/client/reinitialize':
            const Client________ = dataWebSocket.client
            await ReinitializeClient_(Client________)
            break
        case 'WS=/client/select':
            const Client_________ = dataWebSocket.client
            await selectClient_(Client_________)
            break
        case 'WS=/client/new':
            await newClients()
            break
        case 'WS=/clients/insert':
            const Client__ = dataWebSocket.client
            isAlreadyDir = true
            Client_NotReady = true
            let isActive = true
            await insertClient_Front(Client__, isActive)
            break
        case '/client/qr-code':
            const QR_Counter = dataWebSocket.data
            const Client___ = dataWebSocket.data2

            isQrOff = false
            setTimeout(async function() {
                await generateQrCode(QR_Counter, Client___)
            }, 100)
            break
        case 'WS=/clients/start':
            await startBot()
            break
        case 'WS=/error':
            console.error(`> ⚠️ ERROR Return WebSocket Conection: ${dataWebSocket.message}`)
            displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> Retorno da Conexão WebSocket: ${dataWebSocket.message}`, setLogError)
            break
    }
}
function statusesWs(statuses) {
    try {
        //const reloadButton = document.querySelector('#reload')
        //let reloadAbbr = document.querySelector('#abbrReload')
        if (statuses) {
            //console.log(`> ✅ Conectado Client ao WebSocket`)
            /*displayOnConsole(`> ✅ Conectado Client ao WebSocket(true)`)
            reloadButton.style.cssText =
                'color: var(--colorContrast); background-color: var(--colorGreen); cursor: not-allowed; pointer-events: none; opacity: 0.5;'
            reloadAbbr.title = `WebSocket STATUS: conectado`
            setTimeout(function() {
                reloadButton.style.cssText =
                    'color: var(--colorContrast); background-color: var(--colorGreen); cursor: pointer; pointer-events: unset; opacity: 1;'
            }, 5 * 1000)

            isDisconected = false

            resetLoadingBar()*/
        } else {
            //console.log(`> ⚠️ Desconectado Client do WebSocket`)
            /*displayOnConsole(`> ⚠️ Desconectado Client do WebSocket(true)`, setLogError)
            reloadButton.style.cssText =
                'color: var(--colorContrast); background-color: var(--colorOrange); cursor: not-allowed; pointer-events: none; opacity: 0.5;'
            reloadAbbr.title = `WebSocket STATUS: desconectou`
            setTimeout(function() {
                reloadButton.style.cssText =
                    'color: var(--colorContrast); background-color: var(--colorOrange); cursor: pointer; pointer-events: unset; opacity: 1;'
            }, 5 * 1000)

            isDisconected = true*/
    
            if (wss) wss.close(), wss = null
            wss = new WebSocket(`ws://${window.location.host}`)
            /*wss = new WebSocket(`wss://${window.location.host}`)*/
            webSocket()

            //resetLoadingBar()
        }
    } catch(error) {
        console.error(`> ⚠️ ERROR statusesWs: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> statusesWs: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}

async function exit(exitInten) {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        ChatDataNotReady = true

        isFromNew = false

        Client_ = null

        ChatDataNotReady = true

        TableReady = false

        isStartedNew = true

        isHideAP = true

        isStarted = false

        if (!exitInten) {
            if (isDisconected) {
                reconnectWebSocket()
            }
        } 

        if (exitInten) {
            const capList = document.querySelector(`caption`)
            capList.innerHTML = `<stronger>CHATDATA</stronger>`
        }
        
        if (exitInten) {
            document.title = 'Reset page'
        } else {
            document.title = 'ERROR'
        }
        
        if (exitInten) {
            displayOnConsole(`> ⚠️ Reset page`)
        } else {
            console.error(`> ❌ ERROR: BackEnd`)
            displayOnConsole(`> ❌ <i><strong>ERROR</strong></i>: BackEnd`, setLogError)
        }

        const mainContent = document.querySelector('#innerContent')
        mainContent.style.cssText =
            'display: inline-block;'

        isConsoleHidden = null

        isTableHidden = null
        let listShow = document.querySelector('#showList')
        let listShowAbbr = document.querySelector('#abbrShowList')
        listShow.style.cssText = 
            'display: inline-block; background-color: var(--colorContrast); color: var(--colorInteractionElements); cursor: help; pointer-events: none; opacity: 0;'
        setTimeout(function() {
            listShow.style.cssText =
                'display: none; background-color: var(--colorContrast); color: var(--colorInteractionElements); cursor: help; pointer-events: none; opacity: 0;'
        }, 300)
        listShow.textContent = '-O'
        listShowAbbr.title = `STATUS Lista: null`
        const list = document.querySelector('#listTable')
        list.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            list.style.cssText =
                'display: none; opacity: 0;'
        }, 300)

        const status = document.querySelector('#status')
        if (exitInten) {
            status.innerHTML = `<strong>Reset page</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Reset page</strong>!`)
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> Back End!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> Back End!`)
        }

        let buttonStart = document.querySelector('#start')
        buttonStart.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            buttonStart.style.cssText =
                'display: inline-block; opacity: 1;'
        }, 100)
        
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
                'display: none; opacity: 0;'
        }, 300)

        const newClientDiv = document.querySelector('#divNewClient')
        newClientDiv.style.cssText = 'display: flex; opacity: 0;' 
        setTimeout(() => newClientDiv.style.cssText = 'display: none; opacity: 0;', 100)
        document.querySelector('#Clients_').innerHTML = ''

        resetLoadingBar()
    } catch(error) {
        if (exitInten) {
            console.error(`> ⚠️ ERROR exit(Reset page): ${error}`)
            displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> exit(<strong>Reset page</strong>): ${error.message}`, setLogError)
        } else {
            console.error(`> ⚠️ ERROR exit: ${error}`)
            displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> exit: ${error.message}`, setLogError)
        }
        ChatDataNotReady = true

        isFromNew = false

        Client_ = null

        ChatDataNotReady = true

        isStartedNew = true

        isStarted = false

        isHideAP = true

        isStarted = false
        document.title = 'ERROR'
        resetLoadingBar()
    }
} 
async function authsucess(Client_) {
    try {
        if (!isFromNew) {
            let buttonStart = document.querySelector('#start')
            buttonStart.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                    'display: none; opacity: 0;'
            }, 300)
            isStarted = true
        }

        const status = document.querySelector('#status')
        status.innerHTML = `Client_ <strong>${Client_}</strong> Realizado com Sucesso <strong>Autenticação</strong> ao WhatsApp Web pelo <strong>Local_Auth</strong>!`
        displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Client_}</strong> Realizado com Sucesso <strong>Autenticação</strong> ao WhatsApp Web pelo <strong>Local_Auth</strong>!`)
        
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
            'display: none; opacity: 0;'
        }, 300)
    } catch(error) {
        console.error(`> ⚠️ ERROR ${Client_} authSucess: ${error}`)
        displayOnConsole(`> ⚠️ <strong>ERROR ${Client_}</strong> authSucess: ${error.message}`, setLogError)
    }
}
async function ready(Client_) {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        ChatDataNotReady = false

        if (isDisconected) {
            reconnectWebSocket()
        }

        const mainContent = document.querySelector('#innerContent')
        mainContent.style.cssText =
            'display: inline-block;'
            
        isStartedNew = false

        if (!isFromNew) {
            isStarted = true
        }

        const newClientDiv = document.querySelector('#divNewClient')
        newClientDiv.style.cssText = 'display: flex; opacity: 0;' 
        setTimeout(() => newClientDiv.style.cssText = 'display: flex; opacity: 1;', 100)
        if (!isAlreadyDir) {
            //o codigo abaixo e possivel botar tudo numa rota e devolver e fazer oq fas aqui que nsei como explica certinho, modelo REST e tals (se for preciso)

            const dir_Path = 'Local_Auth'
            const response = await axios.get('/functions/dir', { params: { dir_Path } })
            const Directories_ = response.data.dirs
            
            if (Directories_.length-1 === -1) {
                displayOnConsole(`> ⚠️ <strong>Dir</strong> Clients_ (<strong>${Directories_.length}</strong>) is <strong>empty</strong>.`)
                
                let exitInten = true
                await exit(exitInten)
            } else {
                displayOnConsole(`>  ℹ️  <strong>Dir</strong> Clients_ has (<strong>${Directories_.length}</strong>) loading <strong>ALL</strong>...`)
                
                const response = await axios.get('/clients/active')
                const Actives_ = response.data.actives

                let Counter_Clients_ = 1
                const key = `_${Counter_Clients_}_Client_`
                for (let i = 1; i <= Directories_.length; i++) {
                    let isActive = null
                    if (Actives_[key] === null || Actives_[key] === undefined) {
                        isActive = false                   
                    } else {
                        isActive = true
                    }

                    Client_NotReady = true
                    await insertClient_Front(Directories_[Counter_Clients_-1], isActive)
                    await selectClient_(Directories_[Counter_Clients_-1])
                    
                    Counter_Clients_++
                }
                displayOnConsole(`> ✅ <strong>Dir</strong> Clients_ loaded <strong>ALL</strong> (<strong>${Directories_.length}</strong>).`)
            }
        } else {
            isAlreadyDir = false
        }

        isFromNew = false 

        tableReady = false
        await loadTableStyles()
        
        document.title = `${nameApp || 'BOT'} ${Client_} pronto`

        resetLoadingBar()
    } catch(error) {
        document.title = 'ERROR'
        console.error(`> ⚠️ ERROR ${Client_} ready: ${error}`)
        displayOnConsole(`> ⚠️ <strong>ERROR ${Client_}</strong> ready: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}
async function authFailure() {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        ChatDataNotReady = true

        if (isDisconected) {
            reconnectWebSocket()
        }
        document.title = 'ERROR'

        console.error(`> ❌ ERROR BackEnd authFailure`)
        displayOnConsole(`> ❌ <i><strong>ERROR</strong></i> BackEnd authFailure`, setLogError)

        const mainContent = document.querySelector('#innerContent')
        mainContent.style.cssText =
            'display: inline-block;'
        
        isConsoleHidden = null

        isTableHidden = null
        let listShow = document.querySelector('#showList')
        let listShowAbbr = document.querySelector('#abbrShowList')
        listShow.style.cssText = 
            'display: inline-block; background-color: var(--colorContrast); color: var(--colorInteractionElements); cursor: help; pointer-events: none; opacity: 0;'
        setTimeout(function() {
            listShow.style.cssText =
                'display: none; background-color: var(--colorContrast); color: var(--colorInteractionElements); cursor: help; pointer-events: none; opacity: 0;'
        }, 300)
        listShow.textContent = '-O'
        listShowAbbr.title = `STATUS Lista: null`
        const list = document.querySelector('#listTable')
        list.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            list.style.cssText =
                'display: none; opacity: 0;'
        }, 300)


        if (!isFromNew) {
            let buttonStart = document.querySelector('#start')
            buttonStart.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                    'display: inline-block; opacity: 1;'
            }, 100)
            isStarted = false
        }
        
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
                'display: none; opacity: 0;'
        }, 300)

        const newClientDiv = document.querySelector('#divNewClient')
        newClientDiv.style.cssText = 'display: flex; opacity: 0;' 
        setTimeout(() => newClientDiv.style.cssText = 'display: none; opacity: 0;', 100)
        document.querySelector('#Clients_').innerHTML = ''

        resetLoadingBar()
    } catch(error) {
        document.title = 'ERROR'
        console.error(`> ⚠️ ERROR authFailure: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> authFailure: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}

//Patterns for Miliseconds times:
// Formated= 1 \ * 24 * 60 * 60 * 1000 = 1-Day
// Formated= 1 \ * 60 * 60 * 1000 = 1-Hour
// Formated= 1 \ * 60 * 1000 = 1-Minute
// Formated= 1 \ * 1000 = 1-Second

function sleep(time) {
    try {
        return new Promise((resolve) => setTimeout(resolve, time))
    } catch(error) {
        console.error(`> ⚠️ ERROR sleep: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> sleep: ${error.message}`, setLogError)
    }
}

function displayOnConsole(message, setLogError) {
    try {
        const logElement = document.createElement('div')
        logElement.innerHTML = `${message}`
        if (setLogError) {
            logElement.style.cssText =
                'color: var(--colorRed)'
        }
        document.querySelector('#log').appendChild(logElement)
        autoScroll()
    } catch(error) {
        console.error(`> ⚠️ ERROR displayOnConsole: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> displayOnConsole: ${error.message}`, setLogError)
    }
}

async function saveTableStyles() {
    try {
        localStorage.setItem('tableStyles', JSON.stringify({
            tableStateHidden: isTableHidden
        }))
    } catch (error) {
        console.error(`> ⚠️ ERROR saveTableStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> saveTableStyles: ${error.message}`, setLogError)
    }
}
async function loadTableStyles() {
    try {
        const savedStylesTable = JSON.parse(localStorage.getItem('tableStyles'))
        if (savedStylesTable) {
            isTableHidden = savedStylesTable.tableStateHidden
        }
        await showTableList()
    } catch (error) {
        console.error(`> ⚠️ ERROR loadTableStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> loadTableStyles: ${error.message}`, setLogError)
    }
}
async function showTableList() {
    if (tableReady) {
        displayOnConsole('>  ℹ️ <strong>showTableList</strong> not Ready.', setLogError)
        return
    }
    try {
        const listShow = document.querySelector('#showList')
        const listShowAbbr = document.querySelector('#abbrShowList')
        const list = document.querySelector('#listTable')

        //const sectionActual = list.parentElement.parentElement
        
        if (isTableHidden === null || undefined) {
            isTableHidden = true 
        }

        if (isTableHidden) {
            listShow.style.cssText = 
                'display: inline-block; background-color: var(--colorWhite); color: var(--colorBlack); cursor: pointer; pointer-events: auto; opacity: 1;'
            listShow.textContent = '-'
            listShowAbbr.title = `Lista STATUS: visivel`
            
            list.style.cssText =
                'display: inline-block; opacity: 0;'
            /*sectionActual.style.cssText =
                'display: unset; opacity: 0;'*/
            setTimeout(function() {
                list.style.cssText =
                    'display: inline-block; opacity: 1;'
                /*sectionActual.style.cssText =
                    'display: unset; opacity: 1;'*/
            }, 100)
            
            await saveTableStyles()
            isTableHidden = false
            isHideAP = false
        } else {
            listShow.style.cssText = 
                'display: inline-block; background-color: var(--colorBlack); color: var(--colorWhite); cursor: pointer; pointer-events: auto; opacity: 1;'
            listShow.textContent = 'O'
            listShowAbbr.title = `Lista STATUS: escondido`
            
            list.style.cssText =
                'display: inline-block; opacity: 0;'
            /*sectionActual.style.cssText =
                'display: unset; opacity: 0;'*/
            setTimeout(function() {
                list.style.cssText =
                    'display: none; opacity: 0;'
                /*sectionActual.style.cssText =
                    'display: none; opacity: 0;'*/
            }, 300)

            await saveTableStyles()
            isTableHidden = true
            isHideAP = true
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR showTableList: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> showTableList: ${error.message}`, setLogError)
    }
}

async function saveFunilStyles() {
    try {
        localStorage.setItem('funilStyles', JSON.stringify({
            funilStateHidden: isFunilHidden
        }))
    } catch (error) {
        console.error(`> ⚠️ ERROR saveFunilStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> saveFunilStyles: ${error.message}`, setLogError)
    }
}
async function loadFunilStyles() {
    try {
        const savedStylesFunil = JSON.parse(localStorage.getItem('funilStyles'))
        if (savedStylesFunil) {
            isFunilHidden = savedStylesFunil.funilStateHidden
        }
        await showFunil()
    } catch (error) {
        console.error(`> ⚠️ ERROR loadFunilStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> loadFunilStyles: ${error.message}`, setLogError)
    }
}
async function showFunil() {
    /*if (funilReady) {
        displayOnConsole('>  ℹ️ <strong>showFunil</strong> not Ready.', setLogError)
        return
    }*/
    try {
        const funilShow = document.querySelector('#showFunil')
        const funilShowAbbr = document.querySelector('#abbrShowFunil')
        const funil = document.querySelector('#divFunil')

        //const sectionActual = funil.parentElement.parentElement

        if (isFunilHidden === null || undefined) {
            isFunilHidden = true 
        }

        if (isFunilHidden) {
            funilShow.style.cssText = 
                'display: inline-block; background-color: var(--colorWhite); color: var(--colorBlack); cursor: pointer; pointer-events: auto; opacity: 1;'
            funilShow.textContent = '-'
            funilShowAbbr.title = `Funil STATUS: visivel`
            
            funil.style.cssText =
                'display: inline-block; opacity: 0;'
            /*sectionActual.style.cssText =
                'display: unset; opacity: 0;'*/
            setTimeout(function() {
                funil.style.cssText =
                    'display: inline-block; opacity: 1;'
                /*sectionActual.style.cssText =
                    'display: unset; opacity: 1;'*/
            }, 100)

            await saveFunilStyles()
            isFunilHidden = false
        } else {
            funilShow.style.cssText = 
                'display: inline-block; background-color: var(--colorBlack); color: var(--colorWhite); cursor: pointer; pointer-events: auto; opacity: 1;'
            funilShow.textContent = 'O'
            funilShowAbbr.title = `Funil STATUS: escondido`
            
            funil.style.cssText =
                'display: inline-block; opacity: 0;'
            /*sectionActual.style.cssText =
                'display: unset; opacity: 0;'*/
            setTimeout(function() {
                funil.style.cssText =
                    'display: none; opacity: 0;'
                /*sectionActual.style.cssText =
                    'display: none; opacity: 0;'*/
            }, 300)
            
            await saveFunilStyles()
            isFunilHidden = true
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR showFunil: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> showFunil: ${error.message}`, setLogError)
    }
}

async function saveConsoleStyles() {
    try {
        localStorage.setItem('consoleStyles', JSON.stringify({
            consoleStateHidden: isConsoleHidden
        }))
    } catch (error) {
        console.error(`> ⚠️ ERROR saveConsoleStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> saveConsoleStyles: ${error.message}`, setLogError)
    }
}
async function loadConsoleStyles() {
    try {
        const savedStylesConsole = JSON.parse(localStorage.getItem('consoleStyles'))
        if (savedStylesConsole) {
            isConsoleHidden = savedStylesConsole.consoleStateHidden   
        }
        await hideConsole()
    } catch (error) {
        console.error(`> ⚠️ ERROR loadConsoleStyles: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> loadConsoleStyles: ${error.message}`, setLogError)
    }
}
async function hideConsole() {
    try {
        const consoleElement = document.querySelector('#console')
        const buttonHideConsole = document.querySelector('#hideConsole')
        const titleHideConsole = document.querySelector('#titleHide')
    
        if (isConsoleHidden === null || undefined) {
            isConsoleHidden = false
        }
        
        if (isConsoleHidden) {    
            consoleElement.style.cssText =
                'width: 30.62vw;'
            buttonHideConsole.textContent = `◀`
            titleHideConsole.title = `Terminal STATUS: visivel`
        
            await saveConsoleStyles()
            isConsoleHidden = false
        } else {
            consoleElement.style.cssText = 
                'width: 0vw;' 
            buttonHideConsole.textContent = `▶`
            titleHideConsole.title = `Terminal STATUS: escondido`
           
            await saveConsoleStyles()
            isConsoleHidden = true
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR hideConsole: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> hideConsole: ${error.message}`, setLogError)
    }
}

async function clsConsole() {
    try {
        displayOnConsole(`cls/clear`)
        document.querySelector('#log').innerHTML = ''
        displayOnConsole(`cls/clear`)
    } catch (error) {
        console.error(`> ⚠️ ERROR clsConsole: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> clsConsole: ${error.message}`, setLogError)
    }
}

/*async function saveSectionsHtml() {
    let sectionIndex = 1
    let isEnded = true
    while (isEnded === true) {
        const sectionDiv = document.querySelector(`#section${sectionIndex}`)
        if (!sectionDiv) {
            isEnded = false
            break
        }

        const conteinerPositionSection = sectionDiv.querySelector(`#idivInnerConteinerSection`)
        const innerHTML = conteinerPositionSection.innerHTML

        const titleSection = sectionDiv.querySelector(`#ititleSection`)
        const titleText = titleSection.textContent

        localStorage.setItem(`sectionInnerHTML_${sectionIndex}`, innerHTML)
        localStorage.setItem(`sectionTitleText_${sectionIndex}`, titleText)

        sectionIndex++
    }
}
async function loadSectionsHtml() {
    let sectionIndex = 1
    let isEnded = true
    while (isEnded === true) {
        const sectionDiv = document.querySelector(`#section${sectionIndex}`)
        if (!sectionDiv) {
            isEnded = false
            break
        }

        // Busca a div com id "idivInnerConteinerSection" dentro da seção atual
        const conteinerPositionSection = sectionDiv.querySelector(`#idivInnerConteinerSection`)
        const savedSectionInnerHTML = localStorage.getItem(`sectionInnerHTML_${sectionIndex}`)
        if (savedSectionInnerHTML) {
            conteinerPositionSection.innerHTML = savedSectionInnerHTML
        }

        const titleSection = sectionDiv.querySelector(`#ititleSection`)
        const savedTitleText = localStorage.getItem(`sectionTitleText_${sectionIndex}`)
        if (savedTitleText) {
            titleSection.textContent = savedTitleText
            displayOnConsole(titleSection.textContent)
            if (titleSection.textContent === 'Tabela') {
                await loadFunilStyles()
            }
        }

        sectionIndex++
    }
}
let positionSelectedSection = null
async function selectionPositionSection(checkElement) {
    try {
        const divPosition = checkElement.parentElement.parentElement.parentElement
        const idNumberPositionSection = divPosition.id.match(/\d+/g)

        if (positionSelectedSection !== null && checkElement.checked === true) {
            checkElement.checked = false
            
            let userConfirmation = confirm(`Tem certeza de que deseja trocar a Seção (${positionSelectedSection}) para a Seção (${idNumberPositionSection})?`)
            if (userConfirmation) {
                const conteinerPositionSectionSelected = document.querySelector(`#section${positionSelectedSection}`)
                const conteinerPositionSectionTochange = document.querySelector(`#section${idNumberPositionSection}`)

                conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).style.cssText =
                    `display: flex; opacity: 0;`
                conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).style.cssText =
                    `display: flex; opacity: 0;`

                conteinerPositionSectionSelected.querySelector(`#ititleSection`).style.cssText =
                    `display: flex; opacity: 0;`
                conteinerPositionSectionTochange.querySelector(`#ititleSection`).style.cssText =
                    `display: flex; opacity: 0;`
                setTimeout(function() {
                    conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).style.cssText =
                        `display: none; opacity: 0;`
                    conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).style.cssText =
                        `display: none; opacity: 0;`

                    conteinerPositionSectionSelected.querySelector(`#ititleSection`).style.cssText =
                        `display: none; opacity: 0;`
                    conteinerPositionSectionTochange.querySelector(`#ititleSection`).style.cssText =
                        `display: none; opacity: 0;`
                
                    const divInnerPositionSectionSelected = conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).cloneNode(true)
                    conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).innerHTML = ''

                    const divInnerPositionSectionTochange = conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).cloneNode(true)
                    conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).innerHTML = ''

                    conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).replaceWith(divInnerPositionSectionTochange)
                    conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).style.cssText =
                        `display: flex; opacity: 0;`
                    conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).replaceWith(divInnerPositionSectionSelected)
                    conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).style.cssText =
                        `display: flex; opacity: 0;`

                    const titleSectionSelected = conteinerPositionSectionSelected.querySelector(`#ititleSection`).textContent
                    conteinerPositionSectionSelected.querySelector(`#ititleSection`).textContent = ''

                    const titleSectionTochange = conteinerPositionSectionTochange.querySelector(`#ititleSection`).textContent
                    conteinerPositionSectionTochange.querySelector(`#ititleSection`).textContent = ''
                    
                    conteinerPositionSectionSelected.querySelector(`#ititleSection`).style.cssText =
                        `display: flex; opacity: 0;`
                    conteinerPositionSectionTochange.querySelector(`#ititleSection`).style.cssText =
                        `display: flex; opacity: 0;`
                    setTimeout(async function() {
                        conteinerPositionSectionSelected.querySelector(`#ititleSection`).textContent = titleSectionTochange
                        conteinerPositionSectionTochange.querySelector(`#ititleSection`).textContent = titleSectionSelected

                        conteinerPositionSectionSelected.querySelector(`#idivInnerConteinerSection`).style.cssText =
                            `display: flex; opacity: 1;`
                        conteinerPositionSectionTochange.querySelector(`#idivInnerConteinerSection`).style.cssText =
                            `display: flex; opacity: 1;`
                        
                        conteinerPositionSectionSelected.querySelector(`#ititleSection`).style.cssText =
                            `display: flex; opacity: 1;`
                        conteinerPositionSectionTochange.querySelector(`#ititleSection`).style.cssText =
                            `display: flex; opacity: 1;`
                        
                        document.querySelector(`#iinputCheckboxSelectionSection${positionSelectedSection}`).checked = false
                        document.querySelector(`#iinputCheckboxSelectionSection${positionSelectedSection}`).dispatchEvent(new Event('change'))

                        await saveSectionsHtml()
                    }, 300)
                }, 100)
            } else {


                return
            }
            return
        }

        if (checkElement.checked) {
            const idNumberPositionSelected = Number(idNumberPositionSection)
            positionSelectedSection = idNumberPositionSelected
            checkElement.parentElement.title = `Selecionado esta posição (${idNumberPositionSection})`
        } else {
            positionSelectedSection = null
            checkElement.parentElement.title = `Selecione esta posição (${idNumberPositionSection})`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR selectionPositionSection: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> selectedPositionSection: ${error.message}`, setLogError)
    }
}*/

/*window.onscroll = function() { scrollFunction() }// CALL FUNCTION FOR HEADER AND FOOTER CUSTOMS

function scrollFunction() {// SHOW THE SCROLLS BUTTONS AND FOOTER
    let head = document.querySelector('header')
    
    if (window.scrollY > 35) {
        head.style.cssText =
            'border-radius: 0px 0px 0px 0px'
    } else {
        head.style.cssText =
            'border-radius: 0px 0px 50px 0px'
    }

    let foot = document.querySelector('footer')
    let lO = document.querySelector('#linklOuKo')
    
    if (document.body.scrollHeight - (window.scrollY + window.innerHeight) < 27) {
        foot.style.cssText =
            'opacity: 1 visibility: visible border-radius: 0px 50px 0px 0px'

        lO.style.cssText =
            'pointer-events: unset'
    } else {
        foot.style.cssText =
            'opacity: 1 visibility: visible border-radius: 0px 0px 0px 0px'

        lO.style.cssText =
            'pointer-events: none'
    }
}*/
function autoScroll() {
    try {
        const consoleLog = document.querySelector('#divLog')
        const currentScroll = consoleLog.scrollTop
        const targetScroll = consoleLog.scrollHeight - consoleLog.clientHeight
        const scrollDifference = targetScroll - currentScroll
        const duration = 300

        let startTime

        function scrollStep(timestamp) {
            if (!startTime) {
                startTime = timestamp
            }

            const progress = Math.min((timestamp - startTime) / duration, 1)
            consoleLog.scrollTop = currentScroll + scrollDifference * progress

            if (progress < 1) {
                requestAnimationFrame(scrollStep)
            }
        }

        requestAnimationFrame(scrollStep)
    } catch(error) {
        console.error(`> ⚠️ ERROR autoScroll: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> autoSroll: ${error.message}`, setLogError)
    }
}

async function sendCommand() {
    try {
        let commandInput = document.querySelector('#commandInput').value
        let commandSend = document.querySelector('#commandSend')

        commandSend.style.cssText =
            'background-color: #2b2b2b; color: var(--colorWhite); border: 1px solid var(--colorWhite); transition: var(--configTrasition01s);'
        
        //console.log(commandInput)
        //displayOnConsole(commandInput)
        
        await axios.post('/features/command', { command: commandInput}, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        /*await axios.post('/features/command', { command: commandInput }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })*/
        
        setTimeout(function() {
            commandSend.style.cssText =
                'background-color: var(--colorInteractionElements); color: var(--colorBlack); border: 1px solid rgba(0, 0, 0, 0); transition: var(--configTrasition03s);'
        }, 100)
        
        document.querySelector('#commandInput').value = ''
    } catch (error) {
        console.error(`> ⚠️ ERROR sendCommand: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> sendCommand: ${error.message}`, setLogError)
    }
}

async function eraseFunil_(Funilt_) {
    /*if (Client_NotReady) {
        displayOnConsole(`>  ℹ️  ${Funilt_} not Ready.`, setLogError)
        return
    }*/
    try {
        //Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        let userConfirmation = confirm(`Tem certeza de que deseja apagar o Funil_ ${Funilt_}?\nsera apagada para sempre.`)
        if (userConfirmation) {
            const status = document.querySelector('#status')

            const response = await axios.delete('/funil/erase', { params: { Funilt_ } })
            const Sucess = response.data.sucess
            const Is_Empty = response.data.empty
            const Is_Empty_Input = response.data.empty_input
            const Not_Selected = response.nselected
            if (Not_Selected) {
                status.innerHTML = `O Funil_ <strong>${Funilt_}</strong> esta para ser <strong>apagado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Funil_ <strong>selecionado</strong> é <strong>${Funil_}</strong> então <strong>selecione</strong> <strong>${Funilt_}</strong> para poder <strong>apaga-lo</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(back)</span></strong></i><strong>O Funil_ <strong>${Funilt_}</strong> esta para ser <strong>apagado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Funil_ <strong>selecionado</strong> é <strong>${Funil_}</strong> então <strong>selecione</strong> <strong>${Funilt_}</strong> para poder <strong>apaga-lo</strong>!`)
                
                resetLoadingBar()
                
                //Client_NotReady = false

                return
            }
            if (Is_Empty) {
                status.innerHTML = `Dados de <strong>${Funilt_}</strong> esta <strong>vazio</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Dados de <strong>${Funilt_}</strong> esta <strong>vazio</strong>`)

                resetLoadingBar()
                
                //Client_NotReady = false
                
                return
            }
            if (Is_Empty_Input) {
                status.innerHTML = `Funil_ <strong>${Funilt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Funil_ <strong>${Funilt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`)

                resetLoadingBar()
                
                //Client_NotReady = false
                
                return  
            } 
            if (Sucess) {
                const divFunilt_ = document.querySelector(`#${Funilt_}`)
                divFunilt_.remove()
                
                status.innerHTML = `Funil_ <strong>${Funilt_}</strong> foi <strong>Apagado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Funil_ <strong>${Funilt_}</strong> foi <strong>Apagado</strong>!`)

                //o codigo abaixo e possivel botar tudo numa rota e devolver o porArrayClient e se tiver vazio nada e reset e tals, modelo REST e tals (se for preciso)
                const dir_Path = 'Funils_'
                const response = await axios.get('/functions/dir', { params: { dir_Path } })
                const Directories = response.data.dirs

                if (Directories.length === 0) {
                    status.innerHTML = `<strong>Dir</strong> off Funils_ (<strong>${Directories.length}</strong>) is <strong>empty</strong>!`
                    displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Dir</strong> off Funils_ (<strong>${Directories.length}</strong>) is <strong>empty</strong>!`)
                } else {
                    const funilIdNumber = Number(Funilt_.match(/\d+/g))

                    let Counter_Funils_ = 0
                    let posArrayFunil = null
                    for (let i = 0; i < Directories.length; i++) {
                        const funilDirIdNumber = Number(Directories[Counter_Funils_].match(/_.*?_.*?_/)[0].match(/\d+/g))

                        if (funilIdNumber === funilDirIdNumber) {
                            posArrayFunil = Counter_Funils_

                            if (Directories[posArrayFunil+1] === undefined) {
                                posArrayFunil--
                            } else {
                                posArrayFunil++
                            }
                        } else {
                            //aqui pega o numero e o nome inves do nome so e manda...
                            posArrayFunil = Number(Directories[Counter_Funils_].match(/_.*?_.*?_/)[0].match(/\d+/g))
                            Counter_Funils_++
                        }
                    }

                    //aqui
                    await selectFunil_(`_${Number(posArrayFunil)}_Funil_`)
                }
            } else {
                status.innerHTML = `<i><strong>ERROR</strong></i> ao <strong>Apagar</strong> Funil_ <strong>${Funilt_}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao <strong>Apagar</strong> Funil_ <strong>${Funilt_}</strong>!`)
            }
        } else {
            resetLoadingBar()
            //Client_NotReady = false
            return
        }

        resetLoadingBar()
        //Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR eraseFunil_ ${Funilt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> eraseFunil_ <strong>${Funilt_}</strong>: ${error.message}`, setLogError)
        //Client_NotReady = false
        resetLoadingBar()
    }
}
async function selectFunil_(Funilt_) {
    /*if (Client_NotReady = false) {
        displayOnConsole(`>  ℹ️  <strong>${Funilt_}</strong> not Ready.`, setLogError)
        return
    }*/
    try {
        //Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const status = document.querySelector('#status')

        const divFunilt_ = document.querySelector(`#${Funilt_}`)
        const capList = document.querySelector(`caption`)

        const divFunilt_Temp = document.querySelector(`#${Funilt_Temp}`)
        if (divFunilt_Temp !== null) {
            divFunilt_Temp.style.cssText =
                'border-top: 5px solid var(--colorBlack); border-bottom: 5px solid var(--colorBlack); transition: var(--configTrasition03s);'
        }
        if (divFunilt_ === null) {
            status.innerHTML = `Client_ <strong>${Funilt_}</strong> <strong>Não</strong> existe!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Funilt_}</strong> <strong>Não</strong> existe!`)
            resetLoadingBar()

            //Funil_NotReady = false
            
            return
        }

        const response = await axios.post('/funil/select', { Funil_: Funilt_ })
        let Sucess = response.data.sucess
        if (Sucess) {
            divFunilt_.style.cssText =
                'border-top: 5px solid var(--colorBlue); border-bottom: 5px solid var(--colorBlue); transition: var(--configTrasition03s);'

            capList.innerHTML = `<stronger>${Funilt_}</stronger>`

            Funilt_Temp = Funilt_
            Funil_ = Funilt_

            status.innerHTML = `Funil_ <strong>${Funilt_}</strong> <strong>Selecionado</strong>`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Funil_ <strong>${Funilt_}</strong> <strong>Selecionado</strong>.`)
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> <strong>selecionando</strong> Funil_ <strong>${Funilt_}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> <strong>selecionando</strong> Funil_ <strong>${Funilt_}</strong>!`)
        }

        resetLoadingBar()
        //Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR selectFunil_ ${Funilt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> selectFunil_ <strong>${Funilt_}</strong>: ${error.message}`, setLogError)
        //Client_NotReady = false
        resetLoadingBar()
    }
}
async function insertFunil_Front(Funilt_) {
    /*if (!Client_NotReady) {
        displayOnConsole(`>  ℹ️  <strong>${Funilt_}</strong> not Ready.`, setLogError)
        return
    }*/
    try {
        //Client_NotReady = false

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const FunilsDiv = document.querySelector('#Funils_')
        const allConteinerFunils_ = FunilsDiv.querySelectorAll('.divFunils_')
        let arrayIdNameFunils_ = []
        allConteinerFunils_.forEach((divElement) => {
            const Funil_Id = Number(divElement.id.match(/\d+/g))
            const Funil_Name = divElement.id.split('_').slice(2, -1).join('_')
            arrayIdNameFunils_.push({ Funil_Id, Funil_Name })
        })
        let idNumberFunil_DivAdjacent = null
        let isFirstUndefined = null
        if (arrayIdNameFunils_.length > 0) {
            const response = await axios.get('/funil/insert_exponecial_position_Funil_', { params: { arrayIdNameFunils_ } })
            idNumberFunil_DivAdjacent = response.data.idnumberfunil_divadjacent
            isFirstUndefined = response.data.isfirstundefined
        }
    
        const divAdjacent = document.querySelector(`#${idNumberFunil_DivAdjacent}`)

        const funilHTMlDestroy = `\n<div class="divFunils_" id="${Funilt_}">\n<abbr title="Funil_ ${Funilt_}" id="abbrselect-${Funilt_}"><button class="Funils_" id="select-${Funilt_}" onclick="selectFunil_('${Funilt_}')">${Funilt_}</button></abbr><abbr title="Apagar ${Funilt_}" id="abbrerase-${Funilt_}"><button class="Funils_Erase" id="erase-${Funilt_}" onclick="eraseFunil_('${Funilt_}')"><</button></abbr>\n</div>\n`
        if (divAdjacent) {
            if (isFirstUndefined) {
                divAdjacent.insertAdjacentHTML('beforebegin', funilHTMlDestroy)
            } else {
                divAdjacent.insertAdjacentHTML('afterend', funilHTMlDestroy)
            }
        } else {
            FunilsDiv.innerHTML += funilHTMlDestroy
        }

        const divFunilt_ = document.querySelector(`#${Funilt_}`)
        divFunilt_.style.cssText =
            'border-top: 5px solid var(--colorBlack); border-bottom: 5px solid var(--colorBlack); transition: var(--configTrasition03s);'

        //console.log(document.documentElement.outerHTML)
        resetLoadingBar()
    } catch (error) {
        console.error(`> ⚠️ ERROR insertFunil_Front ${Funilt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> insertFunil_Front <strong>${Funilt_}</strong>: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}
async function newFunils() {
    /*if (isStartedNew) {
        displayOnConsole('>  ℹ️ <strong>newClients</strong> not Ready.', setLogError)
        return
    }*/
    try {
        //isStartedNew = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        let userConfirmation = confirm('Tem certeza de que deseja criar um novo Funil_?')
        if (!userConfirmation) {
            resetLoadingBar()

            //isStartedNew = false

            return
        }

        //isFromNew = true

        const response = await axios.post('/funil/new')
        const Sucess = response.data.sucess
        const Funil_ = response.data.Funilt_
        if (Sucess) {
            await insertFunil_Front(Funil_)
            await selectFunil_(Funil_)

            resetLoadingBar()
        } else {


            resetLoadingBar()
            return
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR newFunils: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> newFunils: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}

let positionSelectedMSG = null
async function selectionPositionMSG(checkElement, typeMSG) {
    try {
        const divPosition = checkElement.parentElement.parentElement.parentElement
        const idNumberPositionMSG = divPosition.id.match(/\d+/g)

        if (positionSelectedMSG !== null && checkElement.checked === true) {
            let barL = document.querySelector('#barLoading')
            barL.style.cssText =
                'width: 100vw; visibility: visible;'

            checkElement.checked = false
            
            let userConfirmation = confirm(`Tem certeza de que deseja trocar a Posição MSG (${positionSelectedMSG.idNumberPositionSelected}) para a Posição MSG (${idNumberPositionMSG})?`)
            if (userConfirmation) {
                const conteinerPositionMSGSelected = document.querySelector(`#conteinerFunilMSG${positionSelectedMSG.idNumberPositionSelected}`)
                conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                    `display: flex; opacity: 0;`
                const conteinerPositionMSGTochange = document.querySelector(`#conteinerFunilMSG${idNumberPositionMSG}`)
                conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                    `display: flex; opacity: 0;`
                setTimeout(function() {
                    conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                        `display: none; opacity: 0;`
                    conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                            `display: none; opacity: 0;`
                
                    const divInnerPositionMSGSelected = conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).cloneNode(true)
                    conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).innerHTML = ''

                    const divInnerPositionMSGTochange = conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).cloneNode(true)
                    conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).innerHTML = ''

                    conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).replaceWith(divInnerPositionMSGTochange)
                    conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                        `display: flex; opacity: 0;`
                    conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).replaceWith(divInnerPositionMSGSelected)
                    conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                        `display: flex; opacity: 0;`
                    setTimeout(function() {
                        conteinerPositionMSGSelected.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                            `display: flex; opacity: 1;`
                        conteinerPositionMSGTochange.querySelector(`#idivInnerConteinerFunilMSG`).style.cssText =
                            `display: flex; opacity: 1;`

                        //ja com valor no input delay ele roda o select duas vezes

                        /*displayOnConsole(positionSelectedMSG.typeMSGSelected)
                        switch (positionSelectedMSG.typeMSGSelected) {
                            case 1:
                                divPosition.querySelector(`#idelayMSGTime`).dispatchEvent(new Event('input'))
                                divPosition.querySelector(`#idelayMSGSelect`).dispatchEvent(new Event('input'))
                                break;
                            case 2:
                                divPosition.querySelector(`#idelayTextTime`).dispatchEvent(new Event('input'))
                                divPosition.querySelector(`#idelayTextSelect`).dispatchEvent(new Event('input'))
                                divPosition.querySelector(`#itextAreaTypeMSG`).dispatchEvent(new Event('input'))
                                break;
                            case 3:
                                divPosition.querySelector(`#idelayTexAudioTime`).dispatchEvent(new Event('input'))
                                divPosition.querySelector(`#idelayTextAudioSelect`).dispatchEvent(new Event('input'))
                                divPosition.querySelector(`#itextAreaCaption`).dispatchEvent(new Event('input'))
                                //divPosition.querySelector('input#ifileTypeMSGAux[type="file"]').dispatchEvent(new Event('change'))//deprecated
                                break;
                        }

                        const divPositionTochange = document.querySelector(`#conteinerFunilMSG${positionSelectedMSG.idNumberPositionSelected}`)//caso n esteja entendo como ja mudo a posicao ent é isso... da certo tendeu?
                        console.log(divPositionTochange)
                        displayOnConsole(typeMSG)
                        switch (typeMSG) {
                            case 1:
                                divPositionTochange.querySelector(`#idelayMSGTime`).dispatchEvent(new Event('input'))
                                divPositionTochange.querySelector(`#idelayMSGSelect`).dispatchEvent(new Event('input'))
                                break;
                            case 2:
                                divPositionTochange.querySelector(`#idelayTextTime`).dispatchEvent(new Event('input'))
                                divPositionTochange.querySelector(`#idelayTextSelect`).dispatchEvent(new Event('input'))
                                divPositionTochange.querySelector(`#itextAreaTypeMSG`).dispatchEvent(new Event('input'))
                                break;
                            case 3:
                                divPositionTochange.querySelector(`#idelayTexAudioTime`).dispatchEvent(new Event('input'))
                                divPositionTochange.querySelector(`#idelayTextAudioSelect`).dispatchEvent(new Event('input'))
                                divPositionTochange.querySelector(`#itextAreaCaption`).dispatchEvent(new Event('input'))
                                //divPositionTochange.querySelector('input#ifileTypeMSGAux[type="file"]').dispatchEvent(new Event('change'))//deprecated
                                break;
                        }*/

                        document.querySelector(`#iinputCheckboxSelectionMSG${positionSelectedMSG.idNumberPositionSelected}`).checked = false
                        document.querySelector(`#iinputCheckboxSelectionMSG${positionSelectedMSG.idNumberPositionSelected}`).dispatchEvent(new Event('change'))
                        
                        resetLoadingBar()
                    }, 300)
                }, 100)
            } else {

                resetLoadingBar()
                return
            }
            return
        }
        
        if (checkElement.checked) {
            const idNumberPositionSelected = Number(idNumberPositionMSG)
            const typeMSGSelected = typeMSG
            positionSelectedMSG = { idNumberPositionSelected, typeMSGSelected }
            checkElement.parentElement.title = `Selecionado esta posição (${idNumberPositionMSG})`
        } else {
            positionSelectedMSG = null
            checkElement.parentElement.title = `Selecione esta posição (${idNumberPositionMSG})`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR selectedPositionMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> selectedPositionMSG: ${error.message}`, setLogError)
    }
}

async function erasePosition(divPosition, typeMSG) {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const IdDivPosition = divPosition.id
        const IdNumberPosition = IdDivPosition.match(/\d+/g)

        let userConfirmation = null
        switch (typeMSG) {
            case 1:
            case 2:
                userConfirmation = confirm(`Tem certeza de que deseja deletar o template da posição (${IdNumberPosition})?\nsera apagado tudo para sempre.`)
                break;
            case 3:
                const fileInput = divPosition.querySelector('input#ifileTypeMSGAux[type="file"]')
                if (fileInput.files[0] === undefined) {
                    userConfirmation = confirm(`Tem certeza de que deseja deletar o template da posição (${IdNumberPosition})?\nsera apagado tudo para sempre.`)
                } else {
                    userConfirmation = confirm(`Tem certeza de que deseja deselecionar o arquivo (${fileInput.files[0].name})?\nsera apagado para sempre.`)
                }
                break;
        }
        if (userConfirmation) {
            let response = null
            let Sucess = null
            switch (typeMSG) {
                case 1:
                    response = await axios.delete('/funil/erase-position-MSG', { params: { IdNumberPosition } })
                    Sucess = response.data.sucess
                    if (Sucess) {
                        const inputDelayMSG = divPosition.querySelector(`#idelayMSGTime`)
                        if (inputDelayMSG.value !== '') {
                            inputDelayMSG.value = ''
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }

                        const conteinerMSG = document.querySelector(`#${IdDivPosition}`)
                        conteinerMSG.style.cssText =
                            `display: flex; opacity: 0;`
                        setTimeout(async function() {
                            conteinerMSG.style.cssText =
                                `display: none; opacity: 0;`
                            
                            divPosition.remove()
                        }, 100)
                    } else {

                    }
                    break;
                case 2:
                    response = await axios.delete('/funil/erase-position-MSG', { params: { IdNumberPosition } })
                    Sucess = response.data.sucess
                    if (Sucess) {
                        /*const inputDelayText = divPosition.querySelector(`#idelayTextTime`)                        
                        if (inputDelayText.value !== '') {
                            inputDelayText.value = ''
                            inputDelayText.dispatchEvent(new Event('input'))
                        }*/
                        await StateTypingMSG(divPosition, true)

                        const divTextAreaMSG = divPosition.querySelector(`#itextAreaTypeMSG`)
                        if (divTextAreaMSG.value !== '') {
                            divTextAreaMSG.value = ''
                            divTextAreaMSG.dispatchEvent(new Event('input'))
                        }

                        const conteinerMSG = document.querySelector(`#${IdDivPosition}`)
                        conteinerMSG.style.cssText =
                            `display: flex; opacity: 0;`
                        setTimeout(async function() {
                            conteinerMSG.style.cssText =
                                `display: none; opacity: 0;`

                            divPosition.remove()
                        }, 100)
                    } else {

                    }
                    break;
                case 3:
                    const fileInput = divPosition.querySelector('input#ifileTypeMSGAux[type="file"]')
                    if (fileInput.files[0] === undefined) {
                        response = await axios.delete('/funil/erase-position-MSG', { params: { IdNumberPosition } })
                        Sucess = response.data.sucess
                        if (Sucess) {
                            const conteinerMSG = document.querySelector(`#${IdDivPosition}`)
                            conteinerMSG.style.cssText =
                                `display: flex; opacity: 0;`
                            setTimeout(async function() {
                                conteinerMSG.style.cssText =
                                    `display: none; opacity: 0;`

                                divPosition.remove()
                            }, 100)
                        } else {

                        }
                    } else {
                        fileInput.value = ''
                        fileInput.dispatchEvent(new Event('change'))
                    }
                    break;
            }

            resetLoadingBar()
        } else {
            resetLoadingBar()
            return
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR erasePosition: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> erasePosition: ${error.message}`, setLogError)
    }
}

async function sendToFunil(bridgeElement, typeMSG, typeTypeMSG, data) {
    try {
        let divElement = null

        switch (typeMSG) {
            case 1:
                divElement = bridgeElement.closest(`#idivDelayTypeMSG`)
                
                const inputDelayMSG = divElement.querySelector(`#idelayMSGTime`)

                switch (typeTypeMSG.value || typeTypeMSG) {
                    case 'input':
                        displayOnConsole(`1=${typeTypeMSG}:`)
                        displayOnConsole(inputDelayMSG.value)

                        const selectDelayMSG = divElement.querySelector(`#idelayMSGSelect`)
                        if (inputDelayMSG.value >= 1) {
                            if (selectDelayMSG.selectedIndex === 0) {
                                selectDelayMSG.selectedIndex = 1
                                selectDelayMSG.dispatchEvent(new Event('input'))
                            }
                        } else {
                            if (selectDelayMSG.selectedIndex !== 0) {
                                selectDelayMSG.selectedIndex = 0
                                selectDelayMSG.dispatchEvent(new Event('input'))
                            }
                        }


                        break;
                    case 'seconds':
                        displayOnConsole(`1=${typeTypeMSG.value}`)
                        
                        if (!inputDelayMSG.value || inputDelayMSG.value === 0) {
                            inputDelayMSG.value = 1
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }


                        break;
                    case 'minutes':
                        displayOnConsole(`1=${typeTypeMSG.value}`)
                        
                        if (!inputDelayMSG.value || inputDelayMSG.value === 0) {
                            inputDelayMSG.value = 1
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }


                        break;
                    case 'hours':
                        displayOnConsole(`1=${typeTypeMSG.value}`)
                        
                        if (!inputDelayMSG.value || inputDelayMSG.value === 0) {
                            inputDelayMSG.value = 1
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }


                        break;
                    case 'days':
                        displayOnConsole(`1=${typeTypeMSG.value}`)
                        
                        if (!inputDelayMSG.value || inputDelayMSG.value === 0) {
                            inputDelayMSG.value = 1
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }


                        break;
                    case 'none':
                        displayOnConsole(`1=${typeTypeMSG.value}`)

                        if (inputDelayMSG.value !== '') {
                            inputDelayMSG.value = ''
                            inputDelayMSG.dispatchEvent(new Event('input'))
                        }

                        break;
                }
                break;
            case 2:
                divElement = bridgeElement.closest(`#idivTextarea`)

                const inputDelayText = divElement.querySelector(`#idelayTextTime`)

                if (typeTypeMSG) {
                    switch (typeTypeMSG.value || typeTypeMSG) {
                        case 'input':
                            displayOnConsole(`2=${typeTypeMSG}:`)
                            displayOnConsole(inputDelayText.value)

                            const selectDelayText = divElement.querySelector(`#idelayTextSelect`)
                            if (inputDelayText.value >= 1) {
                                if (selectDelayText.selectedIndex === 0) {
                                    selectDelayText.selectedIndex = 1
                                    selectDelayText.dispatchEvent(new Event('input'))
                                }
                            } else {
                                if (selectDelayText.selectedIndex !== 0) {
                                    selectDelayText.selectedIndex = 0
                                    selectDelayText.dispatchEvent(new Event('input'))
                                }
                            }
                            

                            break;
                        case 'seconds':
                            displayOnConsole(`2=${typeTypeMSG.value}`)

                            if (!inputDelayText.value || inputDelayText.value === 0) {
                                inputDelayText.value = 1
                                inputDelayText.dispatchEvent(new Event('input'))
                            }
                            
                            
                            break;
                        case 'minutes':
                            displayOnConsole(`2=${typeTypeMSG.value}`)

                            if (!inputDelayText.value || inputDelayText.value === 0) {
                                inputDelayText.value = 1
                                inputDelayText.dispatchEvent(new Event('input'))
                            }
                            
                            
                            break;
                        case 'hours':
                            displayOnConsole(`2=${typeTypeMSG.value}`)

                            if (!inputDelayText.value || inputDelayText.value === 0) {
                                inputDelayText.value = 1
                                inputDelayText.dispatchEvent(new Event('input'))
                            }

                            
                            break;
                        case 'days':
                            displayOnConsole(`2=${typeTypeMSG.value}`)

                            if (!inputDelayText.value || inputDelayText.value === 0) {
                                inputDelayText.value = 1
                                inputDelayText.dispatchEvent(new Event('input'))
                            }

                            
                            break;
                        case 'none':
                            displayOnConsole(`2=${typeTypeMSG.value}`)

                            if (inputDelayText.value !== '') {
                                inputDelayText.value = ''
                                inputDelayText.dispatchEvent(new Event('input'))
                            }

                            
                            break;
                    }
                }
                
                //const divTextAreaMSG = divElement.querySelector(`#itextAreaTypeMSG`)
                if (data) {
                    displayOnConsole(`3=textarea:`) 
                    displayOnConsole(data.value)
                }


                break;
            case 3:
                divElement = bridgeElement.closest(`#ifileTypeMSG`)
                
                const inputDelayTextAudio = divElement.querySelector(`#idelayTexAudioTime`)

                if (typeTypeMSG) {
                    switch (typeTypeMSG.value || typeTypeMSG) {
                        case 'input':
                            displayOnConsole(`3=${typeTypeMSG}:`)
                            displayOnConsole(inputDelayTextAudio.value)

                            const selectDelayTextAudio = divElement.querySelector(`#idelayTextAudioSelect`)
                            if (inputDelayTextAudio.value >= 1) {
                                if (selectDelayTextAudio.selectedIndex === 0) {
                                    selectDelayTextAudio.selectedIndex = 1
                                    selectDelayTextAudio.dispatchEvent(new Event('input'))
                                }
                            } else {
                                if (selectDelayTextAudio.selectedIndex !== 0) {
                                    selectDelayTextAudio.selectedIndex = 0
                                    selectDelayTextAudio.dispatchEvent(new Event('input'))
                                }
                            }


                            break;
                        case 'seconds':
                            displayOnConsole(`3=${typeTypeMSG.value}`)

                            if (!inputDelayTextAudio.value || inputDelayTextAudio.value === 0) {
                                inputDelayTextAudio.value = 1
                                inputDelayTextAudio.dispatchEvent(new Event('input'))
                            }
                            
                            break;
                        case 'minutes':
                            displayOnConsole(`3=${typeTypeMSG.value}`)

                            if (!inputDelayTextAudio.value || inputDelayTextAudio.value === 0) {
                                inputDelayTextAudio.value = 1
                                inputDelayTextAudio.dispatchEvent(new Event('input'))
                            }
                            
                            break;
                        case 'hours':
                            displayOnConsole(`3=${typeTypeMSG.value}`)

                            if (!inputDelayTextAudio.value || inputDelayTextAudio.value === 0) {
                                inputDelayTextAudio.value = 1
                                inputDelayTextAudio.dispatchEvent(new Event('input'))
                            }
                            
                            break;
                        case 'days':
                            displayOnConsole(`3=${typeTypeMSG.value}`)

                            if (!inputDelayTextAudio.value || inputDelayTextAudio.value === 0) {
                                inputDelayTextAudio.value = 1
                                inputDelayTextAudio.dispatchEvent(new Event('input'))
                            }

                            
                            break;
                        case 'none':
                            displayOnConsole(`3=${typeTypeMSG.value}`)

                            if (inputDelayTextAudio.value !== '') {
                                inputDelayTextAudio.value = ''
                                inputDelayTextAudio.dispatchEvent(new Event('input'))
                            }

                            
                            break; 
                    }
                }

                //const divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                if (data) {
                    displayOnConsole(`3=file:`)   
                    displayOnConsole(data.name)   
                    console.log(data || '')
                    displayOnConsole(`3=textarea:`)   
                    displayOnConsole(data.value || '')   
                }


                break;
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR sendToFunil: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> sendToFunil: ${error.message}`, setLogError)
    }
}

async function StateTypingMSG(buttonElement, IsWType) {
    try {
        let type = null
        let button = null
        let abbr = null
        let input = null
        let delay = null
        if (IsWType) {
            type = 'idivTextarea'
            button = 'iOnOffStateTypingMSG'
            abbr = 'iabbrOnOffStateTypingMSG'
            input = 'idelayTextTime'
            delay = 'idivDelayText'
        } else {
            type = 'ifileTypeMSG'
            button = 'iOnOffStateTypingFile'
            abbr = 'iabbrOnOffStateTypingFile'
            input = 'idelayTexAudioTime'
            delay = 'idivDelayTextAudio'
        }

        const typeElement = buttonElement.closest(`#${type}`)
        const divElement = typeElement || buttonElement
        console.log(divElement)
        const buttonStateTyping = divElement.querySelector(`#${button}`)
        const abbrStateTyping = divElement.querySelector(`#${abbr}`)
        
        const inputDelayText = divElement.querySelector(`#${input}`)
        const divDelayStateTyping = divElement.querySelector(`#${delay}`)

        const computedSyle2 = window.getComputedStyle(buttonStateTyping)
        const currentButtonStateTypingDisplay = computedSyle2.display
        const currentButtonStateTypingOpacity = computedSyle2.opacity

        const isShown_divDelayTextStateRecording = window.getComputedStyle(divDelayStateTyping).height
        
        if (isShown_divDelayTextStateRecording === '0px') {
            buttonStateTyping.style.cssText =
                `display: ${currentButtonStateTypingDisplay}; opacity: ${currentButtonStateTypingOpacity}; background-color: var(--colorWhite); color: var(--colorBlack);`
            buttonStateTyping.textContent = `-`
            
            abbrStateTyping.title = `StateTyping STATUS: on`

            divDelayStateTyping.style.cssText =
                'display: flex; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            setTimeout(function() {
                divDelayStateTyping.style.cssText =
                    'display: flex; height: 0vh; outline: 2px solid rgba(0, 0, 0, 0); border: 2px solid var(--colorBlack); padding: 5px 5px 10px 5px;'
            }, -1)
            setTimeout(function() {
                divDelayStateTyping.style.cssText =
                    'display: flex; height: 6vh; outline: 2px solid rgba(0, 0, 0, 0); border: 2px solid var(--colorBlack); padding: 5px 5px 10px 5px;'
            }, 100)
        } else {
            if (inputDelayText.value !== '') {
                inputDelayText.value = ''
                inputDelayText.dispatchEvent(new Event('input'))
            }

            buttonStateTyping.style.cssText =
                `display: ${currentButtonStateTypingDisplay}; opacity: ${currentButtonStateTypingOpacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonStateTyping.textContent = `O`

            abbrStateTyping.title = `StateTyping STATUS: off`

            divDelayStateTyping.style.cssText =
                'display: flex; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            setTimeout(function() {
                divDelayStateTyping.style.cssText =
                    'display: none; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            }, 300)
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR StateTypingMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> StateTypingMSG: ${error.message}`, setLogError)
    }
}
async function StateRecordingMSG(buttonElement) {
    try {
        const divElement = buttonElement.closest('#ifileTypeMSG')

        const buttonStateRecording = divElement.querySelector(`#iOnOffStateRecordingFile`)
        const abbrStateRecording = divElement.querySelector(`#iabbrOnOffStateRecordingFile`)
        
        const inputDelayTextAudio = divElement.querySelector(`#idelayTexAudioTime`)
        const divDelayStateRecording = divElement.querySelector(`#idivDelayTextAudio`)

        const computedSyle2 = window.getComputedStyle(buttonStateRecording)
        const currentButtonStateRecordingDisplay = computedSyle2.display
        const currentButtonStateRecordingOpacity = computedSyle2.opacity
        
        const isShown_divDelayTextStateRecording = window.getComputedStyle(divDelayStateRecording).height
        
        if (isShown_divDelayTextStateRecording === '0px') {
            buttonStateRecording.style.cssText =
                `display: ${currentButtonStateRecordingDisplay}; opacity: ${currentButtonStateRecordingOpacity}; background-color: var(--colorWhite); color: var(--colorBlack);`
            buttonStateRecording.textContent = `-`
            
            abbrStateRecording.title = `StateTyping STATUS: on`

            divDelayStateRecording.style.cssText =
                'display: flex; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            setTimeout(function() {
                divDelayStateRecording.style.cssText =
                    'display: flex; height: 0vh; outline: 2px solid rgba(0, 0, 0, 0); border: 2px solid var(--colorBlack); padding: 5px 5px 10px 5px;'
            }, -1)
            setTimeout(function() {
                divDelayStateRecording.style.cssText =
                    'display: flex; height: 6vh; outline: 2px solid rgba(0, 0, 0, 0); border: 2px solid var(--colorBlack); padding: 5px 5px 10px 5px;'
            }, 100)
        } else {
            if (inputDelayTextAudio.value >= 1) {
                inputDelayTextAudio.value = ''
                inputDelayTextAudio.dispatchEvent(new Event('input'))
            }

            buttonStateRecording.style.cssText =
                `display: ${currentButtonStateRecordingDisplay}; opacity: ${currentButtonStateRecordingOpacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonStateRecording.textContent = `O`

            abbrStateRecording.title = `StateTyping STATUS: off`

            divDelayStateRecording.style.cssText =
                'display: flex; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            setTimeout(function() {
                divDelayStateRecording.style.cssText =
                    'display: none; height: 0vh; outline: 0px solid rgba(0, 0, 0, 0); border: 0px solid var(--colorBlack); padding: 0px 0px 0px 0px;'
            }, 300)
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR StateRecordingMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> StateRecordingMSG: ${error.message}`, setLogError)
    }
}
async function CaptionFileMSG(buttonElement) {
    try {
        const divElement = buttonElement.closest('#ifileTypeMSG')
        
        const buttonCaption = divElement.querySelector(`#iOnOffCaption`)
        const abbrCaption = divElement.querySelector(`#iabbrOnOffCaption`)
        const divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)

        const buttonLigtDark = divElement.querySelector(`#iOnOffLightDarkCaption`)
        const currentLightDarkBackground_Color = buttonLigtDark.style.backgroundColor
        const currentLightDarkColor = buttonLigtDark.style.color
        const buttonLightDarkColor = divElement.querySelector(`#iOnOffLightDarkColorCaption`)
        const currentLightDarkColorBackground_Color = buttonLightDarkColor.style.backgroundColor
        const currentLightDarkColorColor = buttonLightDarkColor.style.color
        
        const buttonDesktopScreen1 = divElement.querySelector(`#iOnOffResetScreenSetupCaption1`)
        const buttonDesktopScreen2 = divElement.querySelector(`#iOnOffVLockScreenSetupCaption2`)
        const currentButtonDesktopScreen2Background_Color = buttonDesktopScreen2.style.backgroundColor
        const currentButtonDesktopScreen2Color = buttonDesktopScreen2.style.color
        const buttonDesktopScreen3 = divElement.querySelector(`#iOnOffDesktopScreenSetupCaption3`)
        const currentButtonDesktopScreen3Background_Color = buttonDesktopScreen3.style.backgroundColor
        const currentButtonDesktopScreen3Color = buttonDesktopScreen3.style.color
        const buttonDesktopScreen4 = divElement.querySelector(`#iOnOffPhoneScreenSetupCaption4`)
        const currentButtonDesktopScreen4Background_Color = buttonDesktopScreen4.style.backgroundColor
        const currentButtonDesktopScreen4Color = buttonDesktopScreen4.style.color

        const isShown_divTextAreaCaption = window.getComputedStyle(divTextAreaCaption).display
        const currentTextAreaBackground_Color = divTextAreaCaption.style.backgroundColor
        const currentTextAreaColor = divTextAreaCaption.style.color
        const currentTextAreaWidth = divTextAreaCaption.style.width
        const currentTextAreaResize = divTextAreaCaption.style.resize

        if (isShown_divTextAreaCaption === 'none') {
            buttonCaption.style.cssText =
                'background-color: var(--colorWhite); color: var(--colorBlack);'
            buttonCaption.textContent = `-`
            
            abbrCaption.title = `Area de texto STATUS: on`
            
            divTextAreaCaption.style.cssText =
                `display: block; height: 0em; width: ${currentTextAreaWidth}; padding: 0px;  background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; resize: ${currentTextAreaResize};`
            setTimeout(function() {
                divTextAreaCaption.style.cssText =
                    `display: block; height: 0em; width: ${currentTextAreaWidth}; padding: 6px; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; resize: ${currentTextAreaResize};`
            }, -1)
            setTimeout(function() {
                divTextAreaCaption.style.cssText =
                    `display: block; height: 13em; width: ${currentTextAreaWidth}; padding: 6px;  background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; resize: ${currentTextAreaResize};`
            }, 100)

            buttonLigtDark.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentLightDarkBackground_Color}; color: ${currentLightDarkColor};`
            buttonLightDarkColor.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentLightDarkColorBackground_Color}; color: ${currentLightDarkColorColor};`

            buttonDesktopScreen1.style.cssText =
                `display: inline; opacity: 0;`
            buttonDesktopScreen2.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen2Background_Color}; color: ${currentButtonDesktopScreen2Color};`
            buttonDesktopScreen3.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen3Background_Color}; color: ${currentButtonDesktopScreen3Color};`
            buttonDesktopScreen4.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen4Background_Color}; color: ${currentButtonDesktopScreen4Color};`
            setTimeout(function() {
                buttonLigtDark.style.cssText =
                    `display: inline; opacity: 1; background-color: ${currentLightDarkBackground_Color}; color: ${currentLightDarkColor};`
                buttonLightDarkColor.style.cssText =
                    `display: inline; opacity: 1; background-color: ${currentLightDarkColorBackground_Color}; color: ${currentLightDarkColorColor};`

                buttonDesktopScreen1.style.cssText =
                    `display: inline; opacity: 1;`
                buttonDesktopScreen2.style.cssText =
                    `display: inline; opacity: 1; background-color: ${currentButtonDesktopScreen2Background_Color}; color: ${currentButtonDesktopScreen2Color};`
                buttonDesktopScreen3.style.cssText =
                    `display: inline; opacity: 1; background-color: ${currentButtonDesktopScreen3Background_Color}; color: ${currentButtonDesktopScreen3Color};`
                buttonDesktopScreen4.style.cssText =
                    `display: inline; opacity: 1; background-color: ${currentButtonDesktopScreen4Background_Color}; color: ${currentButtonDesktopScreen4Color};`
            }, 100)
        } else {
            if (divTextAreaCaption.value !== '') {
                divTextAreaCaption.value = ''
                divTextAreaCaption.dispatchEvent(new Event('input'))
            }

            buttonLigtDark.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentLightDarkBackground_Color}; color: ${currentLightDarkColor};`
            buttonLightDarkColor.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentLightDarkColorBackground_Color}; color: ${currentLightDarkColorColor};`

            buttonDesktopScreen1.style.cssText =
                `display: inline; opacity: 0;`
            buttonDesktopScreen2.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen2Background_Color}; color: ${currentButtonDesktopScreen2Color};`
            buttonDesktopScreen3.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen3Background_Color}; color: ${currentButtonDesktopScreen3Color};`
            buttonDesktopScreen4.style.cssText =
                `display: inline; opacity: 0; background-color: ${currentButtonDesktopScreen4Background_Color}; color: ${currentButtonDesktopScreen4Color};`
            setTimeout(function() {
                buttonLigtDark.style.cssText =
                    `display: none; opacity: 0; background-color: ${currentLightDarkBackground_Color}; color: ${currentLightDarkColor};`
                buttonLightDarkColor.style.cssText =
                    `display: none; opacity: 0; background-color: ${currentLightDarkColorBackground_Color}; color: ${currentLightDarkColorColor};`

                buttonDesktopScreen1.style.cssText =
                    `display: none; opacity: 0;`
                buttonDesktopScreen2.style.cssText =
                    `display: none; opacity: 0; background-color: ${currentButtonDesktopScreen2Background_Color}; color: ${currentButtonDesktopScreen2Color};`
                buttonDesktopScreen3.style.cssText =
                    `display: none; opacity: 0; background-color: ${currentButtonDesktopScreen3Background_Color}; color: ${currentButtonDesktopScreen3Color};`
                buttonDesktopScreen4.style.cssText =
                    `display: none; opacity: 0; background-color: ${currentButtonDesktopScreen4Background_Color}; color: ${currentButtonDesktopScreen4Color};`
            }, 300)

            buttonCaption.style.cssText =
                'background-color: var(--colorBlack); color: var(--colorWhite);'
            buttonCaption.textContent = `O`
            
            abbrCaption.title = `Area de texto STATUS: off`
            
            divTextAreaCaption.style.cssText =
                `display: block; height: 0em; width: ${currentTextAreaWidth}; padding: 0px;  background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; resize: ${currentTextAreaResize};`
            setTimeout(function() {
                divTextAreaCaption.style.cssText =
                    `display: none; height: 0em; width: ${currentTextAreaWidth}; padding: 0px;  background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; resize: ${currentTextAreaResize};`
            }, 300)
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR CaptionFileMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> CaptionFileMSG: ${error.message}`, setLogError)
    }
}

async function LightDarkMSG(buttonElement, IsWType) {
    try {
        let type = null
        let button = null
        let abbrButton = null
        let colorButton = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            button = 'iOnOffLightDarkMSG'
            abbrButton = 'iabbrOnOffLightDarkMSG'
            colorButton = 'iOnOffLightDarkColorMSG'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            button = 'iOnOffLightDarkCaption'
            abbrButton = 'iabbrOnOffLightDarkCaption'
            colorButton = 'iOnOffLightDarkColorCaption'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const buttonLightDark = divElement.querySelector(`#${button}`)
        const abbrLightDark = divElement.querySelector(`#${abbrButton}`)
        const buttonLightDarkColor = divElement.querySelector(`#${colorButton}`)
        const textAreaDiv = divElement.querySelector(`#${textarea}`)

        const computedSyle = window.getComputedStyle(textAreaDiv)
        const currentTextAreaWidth = computedSyle.width
        const currentTextAreaHeight = computedSyle.height
        const currentTextAreaDisplay = computedSyle.display
        const currentTextAreaPadding = computedSyle.padding
        
        const computedSyle2 = window.getComputedStyle(buttonLightDark)
        const currentButtonLightDarkDisplay = computedSyle2.display
        const currentButtonLightDarkOpacity = computedSyle2.opacity
        const computedSyle3 = window.getComputedStyle(buttonLightDarkColor)
        const currentButtonLightDarkColorDisplay = computedSyle3.display
        const currentButtonLightDarkColorOpacity = computedSyle3.opacity

        const isWMode_textAreaMSG = computedSyle.backgroundColor

        const black = 'rgb(27, 27, 27)'
        const white = 'rgb(240, 240, 240)'
        const modeDark = 'rgb(33, 33, 33)'
        const modeLight = 'rgb(240, 240, 240)'
        const greenDark = 'rgb(0, 64, 52)'
        const greenLight = 'rgb(215, 241, 178)'
        if (isWMode_textAreaMSG === modeDark || isWMode_textAreaMSG === greenDark) {
            if (isWMode_textAreaMSG === modeDark) {
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
                textAreaDiv.style.cssText =
                    `background-color: ${modeLight}; color: ${black}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            } else if (isWMode_textAreaMSG === greenDark) {
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: ${greenLight}; color: ${black};`
                textAreaDiv.style.cssText =
                    `background-color: ${greenLight}; color: ${black}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            }
            
            buttonLightDark.style.cssText =
                `display: ${currentButtonLightDarkDisplay}; opacity: ${currentButtonLightDarkOpacity}; background-color: ${modeLight}; color: ${black}`
            buttonLightDark.textContent = `-`
            abbrLightDark.title = `Modo Claro/Escuro STATUS: claro`
        } else if (isWMode_textAreaMSG === modeLight || isWMode_textAreaMSG === greenLight) {
            if (isWMode_textAreaMSG === modeLight) {
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
                textAreaDiv.style.cssText =
                    `background-color: ${modeDark}; color: ${white}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            } else if (isWMode_textAreaMSG === greenLight) {
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: ${greenDark}; color: ${white};`
                textAreaDiv.style.cssText =
                    `background-color: ${greenDark}; color: ${white}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            }
            
            buttonLightDark.style.cssText =
                `display: ${currentButtonLightDarkDisplay}; opacity: ${currentButtonLightDarkOpacity}; background-color: ${modeDark}; color: ${white}`
            buttonLightDark.textContent = `O`
            abbrLightDark.title = `Modo Claro/Escuro STATUS: escuro`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR LightDarkMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> LightDarkMSG: ${error.message}`, setLogError)
    }
}
async function LightDarkColorMSG(buttonElement, IsWType) {
    try {
        let type = null
        let abbrButton = null
        let colorButton = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            abbrButton = 'iabbrOnOffLightDarkColorMSG'
            colorButton = 'iOnOffLightDarkColorMSG'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            abbrButton = 'iabbrOnOffLightDarkColorCaption'
            colorButton = 'iOnOffLightDarkColorCaption'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const abbrColor = divElement.querySelector(`#${abbrButton}`)
        const buttonLightDarkColor = divElement.querySelector(`#${colorButton}`)
        const textAreaDiv = divElement.querySelector(`#${textarea}`)

        const computedSyle = window.getComputedStyle(textAreaDiv)
        const currentTextAreaWidth = computedSyle.width
        const currentTextAreaHeight = computedSyle.height
        const currentTextAreaDisplay = computedSyle.display
        const currentTextAreaPadding = computedSyle.padding
        
        const computedSyle2 = window.getComputedStyle(buttonLightDarkColor)
        const currentButtonLightDarkColorDisplay = computedSyle2.display
        const currentButtonLightDarkColorOpacity = computedSyle2.opacity

        const isWMode_textAreaMSG = computedSyle.backgroundColor
        
        
        const black = 'rgb(27, 27, 27)'
        const white = 'rgb(240, 240, 240)'
        const modeDark = 'rgb(33, 33, 33)'
        const modeLight = 'rgb(240, 240, 240)'
        const greenDark = 'rgb(0, 64, 52)'
        const greenLight = 'rgb(215, 241, 178)'
        if (isWMode_textAreaMSG === modeDark || isWMode_textAreaMSG === modeLight) {
            if (isWMode_textAreaMSG === modeDark) {
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: ${greenDark}; color: ${white};`
                textAreaDiv.style.cssText =
                    `background-color: ${greenDark}; color: ${white}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            } else if (isWMode_textAreaMSG === modeLight){
                buttonLightDarkColor.style.cssText =
                    `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: ${greenLight}; color: ${black};`
                textAreaDiv.style.cssText =
                    `background-color: ${greenLight}; color: ${black}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            }
                
            buttonLightDarkColor.textContent = `-`
            abbrColor.title = `Modo Cliente/Usuario STATUS: usuario`
        } else if (isWMode_textAreaMSG === greenDark || isWMode_textAreaMSG === greenLight) {
            if (isWMode_textAreaMSG === greenDark) {
                textAreaDiv.style.cssText =
                    `background-color: ${modeDark}; color: ${white}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            } else if (isWMode_textAreaMSG === greenLight){
                textAreaDiv.style.cssText =
                    `background-color: ${modeLight}; color: ${black}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; display: ${currentTextAreaDisplay}; padding: ${currentTextAreaPadding};`
            }
                    
            buttonLightDarkColor.style.cssText =
                `display: ${currentButtonLightDarkColorDisplay}; opacity: ${currentButtonLightDarkColorOpacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonLightDarkColor.textContent = `O`
            abbrColor.title = `Modo Cliente/Usuario STATUS: cliente`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR LightDarkColorMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> LightDarkColorMSG: ${error.message}`, setLogError)
    }
}

async function resetScreenSetup(buttonElement, IsWType) {
    try {
        let type = null
        let button2 = null
        let abbr2 = null
        let button3 = null
        let abbr3 = null
        let button4 = null
        let abbr4 = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            button2 = 'iOnOffVLockScreenSetupText2'
            abbr2 = 'iabbrOnOffVLockScreenSetupText2'
            button3 = 'iOnOffDesktopScreenSetupText3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupText3'
            button4 = 'iOnOffPhoneScreenSetupText4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupText4'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            button2 = 'iOnOffVLockScreenSetupCaption2'
            abbr2 = 'iabbrOnOffVLockScreenSetupCaption2'
            button3 = 'iOnOffDesktopScreenSetupCaption3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupCaption3'
            button4 = 'iOnOffPhoneScreenSetupCaption4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupCaption4'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const buttonDesktopScreen2 = divElement.querySelector(`#${button2}`)
        const abbrDesktopScreen2 = divElement.querySelector(`#${abbr2}`)
        const buttonDesktopScreen3 = divElement.querySelector(`#${button3}`)
        const abbrDesktopScreen3 = divElement.querySelector(`#${abbr3}`)
        const buttonDesktopScreen4 = divElement.querySelector(`#${button4}`)
        const abbrDesktopScreen4 = divElement.querySelector(`#${abbr4}`)
        const textAreaMSG = divElement.querySelector(`#${textarea}`)
        
        const computedSyle = window.getComputedStyle(textAreaMSG)
        const currentTextAreaBackground_Color = computedSyle.backgroundColor
        const currentTextAreaColor = computedSyle.color
        const currentTextAreaDisplay = computedSyle.display
        
        let buttonDesktopScreen1 = null
        let computedSyle2 = null
        let currentButtonDesktopScreen1Display = null
        let currentButtonDesktopScreen1Opacity = null
        let computedSyle3 = null
        let currentButtonDesktopScreen2Display = null
        let currentButtonDesktopScreen2Opacity = null
        let computedSyle4 = null
        let currentButtonDesktopScreen3Display = null
        let currentButtonDesktopScreen3Opacity = null
        let computedSyle5 = null
        let currentButtonDesktopScreen4Display = null
        let currentButtonDesktopScreen4Opacity = null

        if (IsWType) {
            buttonDesktopScreen2.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen3.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        } else {
            buttonDesktopScreen1 = divElement.querySelector(`#iOnOffResetScreenSetupCaption1`)
            computedSyle2 = window.getComputedStyle(buttonDesktopScreen1)
            currentButtonDesktopScreen1Display = computedSyle2.display
            currentButtonDesktopScreen1Opacity = computedSyle2.opacity
            computedSyle3 = window.getComputedStyle(buttonDesktopScreen2)
            currentButtonDesktopScreen2Display = computedSyle3.display
            currentButtonDesktopScreen2Opacity = computedSyle3.opacity
            computedSyle4 = window.getComputedStyle(buttonDesktopScreen3)
            currentButtonDesktopScreen3Display = computedSyle4.display
            currentButtonDesktopScreen3Opacity = computedSyle4.opacity
            computedSyle5 = window.getComputedStyle(buttonDesktopScreen4)
            currentButtonDesktopScreen4Display = computedSyle5.display
            currentButtonDesktopScreen4Opacity = computedSyle5.opacity
            
            buttonDesktopScreen1.style.cssText =
                `display: ${currentButtonDesktopScreen1Display}; opacity: ${currentButtonDesktopScreen1Opacity};`

            buttonDesktopScreen2.style.cssText =
                `display: ${currentButtonDesktopScreen2Display}; opacity: ${currentButtonDesktopScreen2Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen3.style.cssText =
                `display: ${currentButtonDesktopScreen3Display}; opacity: ${currentButtonDesktopScreen3Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `display: ${currentButtonDesktopScreen4Display}; opacity: ${currentButtonDesktopScreen4Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        }

        textAreaMSG.style.cssText =
            `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: 100%; height: 13em; resize: both;`
    } catch (error) {
        console.error(`> ⚠️ ERROR resetScreenSetup: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> resetScreenSetup: ${error.message}`, setLogError)
    }
}
async function VLockScreenSetup(buttonElement, IsWType) {
    try {
        let type = null
        let button2 = null
        let abbr2 = null
        let button3 = null
        let abbr3 = null
        let button4 = null
        let abbr4 = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            button2 = 'iOnOffVLockScreenSetupText2'
            abbr2 = 'iabbrOnOffVLockScreenSetupText2'
            button3 = 'iOnOffDesktopScreenSetupText3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupText3'
            button4 = 'iOnOffPhoneScreenSetupText4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupText4'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            button2 = 'iOnOffVLockScreenSetupCaption2'
            abbr2 = 'iabbrOnOffVLockScreenSetupCaption2'
            button3 = 'iOnOffDesktopScreenSetupCaption3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupCaption3'
            button4 = 'iOnOffPhoneScreenSetupCaption4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupCaption4'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const buttonDesktopScreen2 = divElement.querySelector(`#${button2}`)
        const abbrDesktopScreen2 = divElement.querySelector(`#${abbr2}`)
        const buttonDesktopScreen3 = divElement.querySelector(`#${button3}`)
        const abbrDesktopScreen3 = divElement.querySelector(`#${abbr3}`)
        const buttonDesktopScreen4 = divElement.querySelector(`#${button4}`)
        const abbrDesktopScreen4 = divElement.querySelector(`#${abbr4}`)
        const textAreaMSG = divElement.querySelector(`#${textarea}`)
        const computedSyle = window.getComputedStyle(textAreaMSG)
        const currentTextAreaWidth = computedSyle.width
        const currentTextAreaHeight = computedSyle.height
        const currentTextAreaBackground_Color = computedSyle.backgroundColor
        const currentTextAreaColor = computedSyle.color
        const currentTextAreaDisplay = computedSyle.display
        
        let buttonDesktopScreen1 = null
        let computedSyle2 = null
        let currentButtonDesktopScreen1Display = null
        let currentButtonDesktopScreen1Opacity = null
        let computedSyle3 = null
        let currentButtonDesktopScreen2Display = null
        let currentButtonDesktopScreen2Opacity = null
        let computedSyle4 = null
        let currentButtonDesktopScreen3Display = null
        let currentButtonDesktopScreen3Opacity = null
        let computedSyle5 = null
        let currentButtonDesktopScreen4Display = null
        let currentButtonDesktopScreen4Opacity = null

        if (IsWType) {
            buttonDesktopScreen3.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        } else {
            buttonDesktopScreen1 = divElement.querySelector(`#iOnOffResetScreenSetupCaption1`)
            computedSyle2 = window.getComputedStyle(buttonDesktopScreen1)
            currentButtonDesktopScreen1Display = computedSyle2.display
            currentButtonDesktopScreen1Opacity = computedSyle2.opacity
            computedSyle3 = window.getComputedStyle(buttonDesktopScreen2)
            currentButtonDesktopScreen2Display = computedSyle3.display
            currentButtonDesktopScreen2Opacity = computedSyle3.opacity
            computedSyle4 = window.getComputedStyle(buttonDesktopScreen3)
            currentButtonDesktopScreen3Display = computedSyle4.display
            currentButtonDesktopScreen3Opacity = computedSyle4.opacity
            computedSyle5 = window.getComputedStyle(buttonDesktopScreen4)
            currentButtonDesktopScreen4Display = computedSyle5.display
            currentButtonDesktopScreen4Opacity = computedSyle5.opacity
            
            buttonDesktopScreen1.style.cssText =
                `display: ${currentButtonDesktopScreen1Display}; opacity: ${currentButtonDesktopScreen1Opacity};`

            buttonDesktopScreen3.style.cssText =
                `display: ${currentButtonDesktopScreen3Display}; opacity: ${currentButtonDesktopScreen3Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `display: ${currentButtonDesktopScreen4Display}; opacity: ${currentButtonDesktopScreen4Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        }
            
        const isWMode_abbrDesktopScreen2 = abbrDesktopScreen2.title

        if (isWMode_abbrDesktopScreen2 === 'VLock Tela STATUS: off') {
            buttonDesktopScreen2.style.cssText =
                `display: ${currentButtonDesktopScreen2Display}; opacity: ${currentButtonDesktopScreen2Opacity}; background-color: var(--colorWhite); color: var(--colorBlack);`
            buttonDesktopScreen2.textContent = `-`
            abbrDesktopScreen2.title = `VLock Tela STATUS: on`
        
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; resize: vertical;`
        } else {
            buttonDesktopScreen2.style.cssText =
                `display: ${currentButtonDesktopScreen2Display}; opacity: ${currentButtonDesktopScreen2Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
        
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: ${currentTextAreaWidth}; height: ${currentTextAreaHeight}; resize: both;`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR VlockScreenSetup: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> VlockScreenSetup: ${error.message}`, setLogError)
    }
}
async function desktopScreenSetup(buttonElement, IsWType) {
    try {
        let type = null
        let button2 = null
        let abbr2 = null
        let button3 = null
        let abbr3 = null
        let button4 = null
        let abbr4 = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            button2 = 'iOnOffVLockScreenSetupText2'
            abbr2 = 'iabbrOnOffVLockScreenSetupText2'
            button3 = 'iOnOffDesktopScreenSetupText3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupText3'
            button4 = 'iOnOffPhoneScreenSetupText4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupText4'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            button2 = 'iOnOffVLockScreenSetupCaption2'
            abbr2 = 'iabbrOnOffVLockScreenSetupCaption2'
            button3 = 'iOnOffDesktopScreenSetupCaption3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupCaption3'
            button4 = 'iOnOffPhoneScreenSetupCaption4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupCaption4'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const buttonDesktopScreen2 = divElement.querySelector(`#${button2}`)
        const abbrDesktopScreen2 = divElement.querySelector(`#${abbr2}`)
        const buttonDesktopScreen3 = divElement.querySelector(`#${button3}`)
        const abbrDesktopScreen3 = divElement.querySelector(`#${abbr3}`)
        const buttonDesktopScreen4 = divElement.querySelector(`#${button4}`)
        const abbrDesktopScreen4 = divElement.querySelector(`#${abbr4}`)
        const textAreaMSG = divElement.querySelector(`#${textarea}`)
        const computedSyle = window.getComputedStyle(textAreaMSG)
        const currentTextAreaHeight = computedSyle.height
        const currentTextAreaBackground_Color = computedSyle.backgroundColor
        const currentTextAreaColor = computedSyle.color
        const currentTextAreaDisplay = computedSyle.display

        let buttonDesktopScreen1 = null
        let computedSyle2 = null
        let currentButtonDesktopScreen1Display = null
        let currentButtonDesktopScreen1Opacity = null
        let computedSyle3 = null
        let currentButtonDesktopScreen2Display = null
        let currentButtonDesktopScreen2Opacity = null
        let computedSyle4 = null
        let currentButtonDesktopScreen3Display = null
        let currentButtonDesktopScreen3Opacity = null
        let computedSyle5 = null
        let currentButtonDesktopScreen4Display = null
        let currentButtonDesktopScreen4Opacity = null

        if (IsWType) {
            buttonDesktopScreen2.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        } else {
            buttonDesktopScreen1 = divElement.querySelector(`#iOnOffResetScreenSetupCaption1`)
            computedSyle2 = window.getComputedStyle(buttonDesktopScreen1)
            currentButtonDesktopScreen1Display = computedSyle2.display
            currentButtonDesktopScreen1Opacity = computedSyle2.opacity
            computedSyle3 = window.getComputedStyle(buttonDesktopScreen2)
            currentButtonDesktopScreen2Display = computedSyle3.display
            currentButtonDesktopScreen2Opacity = computedSyle3.opacity
            computedSyle4 = window.getComputedStyle(buttonDesktopScreen3)
            currentButtonDesktopScreen3Display = computedSyle4.display
            currentButtonDesktopScreen3Opacity = computedSyle4.opacity
            computedSyle5 = window.getComputedStyle(buttonDesktopScreen4)
            currentButtonDesktopScreen4Display = computedSyle5.display
            currentButtonDesktopScreen4Opacity = computedSyle5.opacity
            
            buttonDesktopScreen1.style.cssText =
                `display: ${currentButtonDesktopScreen1Display}; opacity: ${currentButtonDesktopScreen1Opacity};`

            buttonDesktopScreen2.style.cssText =
                `display: ${currentButtonDesktopScreen2Display}; opacity: ${currentButtonDesktopScreen2Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen4.style.cssText =
                `display: ${currentButtonDesktopScreen4Display}; opacity: ${currentButtonDesktopScreen4Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
        }

        const isWMode_abbrDesktopScreen3 = abbrDesktopScreen3.title

        if (isWMode_abbrDesktopScreen3 === 'PC Tela STATUS: off') {
            buttonDesktopScreen3.style.cssText =
                `display: ${currentButtonDesktopScreen3Display}; opacity: ${currentButtonDesktopScreen3Opacity}; background-color: var(--colorWhite); color: var(--colorBlack);`
            buttonDesktopScreen3.textContent = `-`
            abbrDesktopScreen3.title = `PC Tela STATUS: on`
        
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: 44.35em; height: ${currentTextAreaHeight}; resize: vertical;`
        } else {
            buttonDesktopScreen3.style.cssText =
                `display: ${currentButtonDesktopScreen3Display}; opacity: ${currentButtonDesktopScreen3Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
        
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
            
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: 100%; height: ${currentTextAreaHeight}; resize: both;`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR desktopScreenSetup: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> desktopScreenSetup: ${error.message}`, setLogError)
    }
}
async function phoneScreenSetup(buttonElement, IsWType) {
    try {
        let type = null
        let button2 = null
        let abbr2 = null
        let button3 = null
        let abbr3 = null
        let button4 = null
        let abbr4 = null
        let textarea = null
        if (IsWType) {
            type = 'idivTextarea'
            button2 = 'iOnOffVLockScreenSetupText2'
            abbr2 = 'iabbrOnOffVLockScreenSetupText2'
            button3 = 'iOnOffDesktopScreenSetupText3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupText3'
            button4 = 'iOnOffPhoneScreenSetupText4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupText4'
            textarea = 'itextAreaTypeMSG'
        } else {
            type = 'ifileTypeMSG'
            button2 = 'iOnOffVLockScreenSetupCaption2'
            abbr2 = 'iabbrOnOffVLockScreenSetupCaption2'
            button3 = 'iOnOffDesktopScreenSetupCaption3'
            abbr3 = 'iabbrOnOffDesktopScreenSetupCaption3'
            button4 = 'iOnOffPhoneScreenSetupCaption4'
            abbr4 = 'iabbrOnOffPhoneScreenSetupCaption4'
            textarea = 'itextAreaCaption'
        }
        const divElement = buttonElement.closest(`#${type}`)
        
        const buttonDesktopScreen2 = divElement.querySelector(`#${button2}`)
        const abbrDesktopScreen2 = divElement.querySelector(`#${abbr2}`)
        const buttonDesktopScreen3 = divElement.querySelector(`#${button3}`)
        const abbrDesktopScreen3 = divElement.querySelector(`#${abbr3}`)
        const buttonDesktopScreen4 = divElement.querySelector(`#${button4}`)
        const abbrDesktopScreen4 = divElement.querySelector(`#${abbr4}`)
        const textAreaMSG = divElement.querySelector(`#${textarea}`)
        const computedSyle = window.getComputedStyle(textAreaMSG)
        const currentTextAreaHeight = computedSyle.height
        const currentTextAreaBackground_Color = computedSyle.backgroundColor
        const currentTextAreaColor = computedSyle.color
        const currentTextAreaDisplay = computedSyle.display

        let buttonDesktopScreen1 = null
        let computedSyle2 = null
        let currentButtonDesktopScreen1Display = null
        let currentButtonDesktopScreen1Opacity = null
        let computedSyle3 = null
        let currentButtonDesktopScreen2Display = null
        let currentButtonDesktopScreen2Opacity = null
        let computedSyle4 = null
        let currentButtonDesktopScreen3Display = null
        let currentButtonDesktopScreen3Opacity = null
        let computedSyle5 = null
        let currentButtonDesktopScreen4Display = null
        let currentButtonDesktopScreen4Opacity = null

        if (IsWType) {
            buttonDesktopScreen2.style.cssText =
                'background-color: var(--colorBlack); color: var(--colorWhite);'
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen3.style.cssText =
                'background-color: var(--colorBlack); color: var(--colorWhite);'
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
        } else {
            buttonDesktopScreen1 = divElement.querySelector(`#iOnOffResetScreenSetupCaption1`)
            computedSyle2 = window.getComputedStyle(buttonDesktopScreen1)
            currentButtonDesktopScreen1Display = computedSyle2.display
            currentButtonDesktopScreen1Opacity = computedSyle2.opacity
            computedSyle3 = window.getComputedStyle(buttonDesktopScreen2)
            currentButtonDesktopScreen2Display = computedSyle3.display
            currentButtonDesktopScreen2Opacity = computedSyle3.opacity
            computedSyle4 = window.getComputedStyle(buttonDesktopScreen3)
            currentButtonDesktopScreen3Display = computedSyle4.display
            currentButtonDesktopScreen3Opacity = computedSyle4.opacity
            computedSyle5 = window.getComputedStyle(buttonDesktopScreen4)
            currentButtonDesktopScreen4Display = computedSyle5.display
            currentButtonDesktopScreen4Opacity = computedSyle5.opacity
            
            buttonDesktopScreen1.style.cssText =
                `display: ${currentButtonDesktopScreen1Display}; opacity: ${currentButtonDesktopScreen1Opacity};`

            buttonDesktopScreen2.style.cssText =
                `display: ${currentButtonDesktopScreen2Display}; opacity: ${currentButtonDesktopScreen2Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen2.textContent = `O`
            abbrDesktopScreen2.title = `VLock Tela STATUS: off`
            buttonDesktopScreen3.style.cssText =
                `display: ${currentButtonDesktopScreen3Display}; opacity: ${currentButtonDesktopScreen3Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen3.textContent = `O`
            abbrDesktopScreen3.title = `PC Tela STATUS: off`
        }

        const isWMode_abbrDesktopScreen4 = abbrDesktopScreen4.title

        if (isWMode_abbrDesktopScreen4 === 'Celular Tela STATUS: off') {
            buttonDesktopScreen4.style.cssText =
                `display: ${currentButtonDesktopScreen4Display}; opacity: ${currentButtonDesktopScreen4Opacity}; background-color: var(--colorWhite); color: var(--colorBlack);`
            buttonDesktopScreen4.textContent = `-`
            abbrDesktopScreen4.title = `Celular Tela STATUS: on`
        
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: 23.35em; height: ${currentTextAreaHeight}; resize: vertical;`
        } else {
            buttonDesktopScreen4.style.cssText =
                `display: ${currentButtonDesktopScreen4Display}; opacity: ${currentButtonDesktopScreen4Opacity}; background-color: var(--colorBlack); color: var(--colorWhite);`
            buttonDesktopScreen4.textContent = `O`
        
            abbrDesktopScreen4.title = `Celular Tela STATUS: off`
            
            textAreaMSG.style.cssText =
                `display: ${currentTextAreaDisplay}; background-color: ${currentTextAreaBackground_Color}; color: ${currentTextAreaColor}; width: 100%; height: ${currentTextAreaHeight}; resize: both;`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR phoneScreenSetup: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> phoneScreenSetup: ${error.message}`, setLogError)
    }
}

//pro sistemas de mandar arquivo, as funcoes a adicionar... um botao que deseleciona o arquivo e um pra apagar do funil o card(isso de apagar o card vai ter em todos os tipos de cards do funil) e pra poder apagar o card tera que deseleciona primeiro entao faze um esquema de desgin que no lugar do botao pra deseleciona dps de clical muda pro apagar, e tbm algum esqueme de dps de selecionar mandar enviar ele retrai o tamanho pra n ficar mt grande na tela ne e talves tirar a funcao de arrasta pra mandar ou sla, e claro em todos os card tem do lado um lugar que vc pega seleciona segurando e deixa onde na posica odo funil ele vai ficar e tals personalizavel
async function getFileData(divElementBridge, file) {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const divElement = divElementBridge.closest('.fileTypeMSG')
        const divFunctions = divElement.querySelector('#idivFileFunctions')
        const typeFile = divElement.querySelector('#ifileTypeSelected')
        
        const buttonStateTyping = divElement.querySelector('#iOnOffStateTypingFile')
        const buttonStateRecording = divElement.querySelector('#iOnOffStateRecordingFile')

        let buttonErasePositionMSG = null

        let divDelayStateTypingRecording = null
        let computedSyle = null
        let currentDivDelayStateTypingDisplay = null
        let computedSyle2 = null
        let currentButtonStateTypingDisplay = null
        let computedSyle3 = null
        let currentButtonStateRecordingDisplay = null

        let divTextAreaCaption = null
        let abbrDivTextAreaCaption = null
        let computedSyle4 = null
        let currentDivTextAreaCaptionDisplay = null

        let divDelayTextAudioTitle = null
        
        if (file === null || file === undefined || file === '...') {
            await sendToFunil(divElementBridge, 3, null, file)
            
            typeFile.textContent = `...`
            
            divFunctions.style.cssText =
                'display: flex; border: 0px solid var(--colorBlack); border-bottom: 0px solid var(--colorBlack); height: 0;'
            setTimeout(function() {
                divFunctions.style.cssText =
                    'display: none; border: 0px solid var(--colorBlack); border-bottom: 0px solid var(--colorBlack); height: 0;' 
            }, 100)


            const divPosition = divElement.parentElement.parentElement
            buttonErasePositionMSG = divPosition.querySelector(`#ierasePositionMSG`)
            const IdDivPosition = divPosition.id
            const IdNumberPosition = IdDivPosition.match(/\d+/g)
            buttonErasePositionMSG.title = `Deletar posição MSG (${IdNumberPosition})`

            await resetScreenSetup(divElementBridge, false)
            divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
            computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
            currentDivDelayStateTypingDisplay = computedSyle.display
            computedSyle2 = window.getComputedStyle(buttonStateTyping)
            currentButtonStateTypingDisplay = computedSyle2.display
            computedSyle3 = window.getComputedStyle(buttonStateRecording)
            currentButtonStateRecordingDisplay = computedSyle3.display
            if (currentButtonStateTypingDisplay === 'inline-block') {
                if (currentDivDelayStateTypingDisplay === 'flex') {
                    await StateTypingMSG(divElementBridge, false)
                }
            } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                if (currentDivDelayStateTypingDisplay === 'flex') {
                    await StateRecordingMSG(divElementBridge)
                }
            }
            buttonStateTyping.style.cssText =
                `display: none; opacity: 0;`
            buttonStateRecording.style.cssText =
                `display: none; opacity: 0;`
            divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
            computedSyle4 = window.getComputedStyle(divTextAreaCaption)
            currentDivTextAreaCaptionDisplay = computedSyle4.display
            if (currentDivTextAreaCaptionDisplay === 'block') {
                await CaptionFileMSG(divElementBridge)
            }
            divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
            abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
            divTextAreaCaption.placeholder = `Legenda do (...): >...`
            abbrDivTextAreaCaption.title = `Digite a legenda do (...)`
            divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
            divDelayTextAudioTitle.textContent = 'ATRASO-State=Typing&Recording:'

            resetLoadingBar()
            return
        } else {
            /*if (divElement.querySelector('input#ifileTypeMSGAux[type="file"]').files[0] ) {   
                if (file === divElement.querySelector('input#ifileTypeMSGAux[type="file"]').files[0]) {
                    displayOnConsole('cuuuuuuuuuuu')
                    await sendToFunil(divElementBridge, 3, null, file)
                    return
                }
            }*/
            divFunctions.style.cssText =
                'display: flex; border: 0px solid var(--colorBlack); border-bottom: 0px solid var(--colorBlack); height: 0;'
            setTimeout(function() {
                divFunctions.style.cssText =
                    'display: flex; border: 2px solid var(--colorBlack); border-bottom: 3.5px solid var(--colorBlack); height: 5vh;'//mudar o 5vh n fica bom pra diferentes telas
            }, 300)

            const divPosition = divElement.parentElement.parentElement
            console.log(divPosition)
            buttonErasePositionMSG = divPosition.querySelector(`#ierasePositionMSG`)
            console.log(buttonErasePositionMSG)
            buttonErasePositionMSG.title = `Deselecionar arquivo (${file.name})`

            //melhora esse de reseta o style de tudo tbm pra cada file novo ou igual, talves verificar ser o file é igual ou novo se n ele fas nada sla
            displayOnConsole(file.type)
            const fileType = file.type
            switch (fileType) {//conforme vai indo adicionar o maximo possivel de tipos de arquivos para cada e assim ser mais completo e preciso
                case 'video/mp4':
                case 'video/avi':
                case 'video/mov':
                case 'video/mkv':
                    typeFile.textContent = `video`
                    
                    await resetScreenSetup(divElementBridge, false)
                    divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
                    computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
                    currentDivDelayStateTypingDisplay = computedSyle.display
                    computedSyle2 = window.getComputedStyle(buttonStateTyping)
                    currentButtonStateTypingDisplay = computedSyle2.display
                    computedSyle3 = window.getComputedStyle(buttonStateRecording)
                    currentButtonStateRecordingDisplay = computedSyle3.display
                    if (currentButtonStateTypingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateTypingMSG(divElementBridge, false)
                        }
                    } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateRecordingMSG(divElementBridge)
                        }
                    }
                    buttonStateTyping.style.cssText =
                        `display: none; opacity: 0;`
                    buttonStateRecording.style.cssText =
                        `display: none; opacity: 0;`
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    computedSyle4 = window.getComputedStyle(divTextAreaCaption)
                    currentDivTextAreaCaptionDisplay = computedSyle4.display
                    if (currentDivTextAreaCaptionDisplay === 'block') {
                        await CaptionFileMSG(divElementBridge)
                    }
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
                    divTextAreaCaption.placeholder = `Legenda do (${file.name || 'arquivo'}): >...`
                    abbrDivTextAreaCaption.title = `Digite a legenda do (${file.name || 'arquivo'})`
                    divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
                    divDelayTextAudioTitle.textContent = 'ATRASO-State=Typing&Recording:'

                    await sendToFunil(divElementBridge, 3, null, file)

                    break;
                case 'audio/x-m4a':
                case 'audio/wav':
                case 'audio/mp3':
                case 'audio/gif':
                    typeFile.textContent = `audio`

                    await resetScreenSetup(divElementBridge, false)
                    divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
                    computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
                    currentDivDelayStateTypingDisplay = computedSyle.display
                    computedSyle2 = window.getComputedStyle(buttonStateTyping)
                    currentButtonStateTypingDisplay = computedSyle2.display
                    computedSyle3 = window.getComputedStyle(buttonStateRecording)
                    currentButtonStateRecordingDisplay = computedSyle3.display
                    if (currentButtonStateTypingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateTypingMSG(divElementBridge, false)
                        }
                    } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateRecordingMSG(divElementBridge)
                        }
                    }
                    buttonStateTyping.style.cssText =
                        `display: none; opacity: 0;`
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    computedSyle4 = window.getComputedStyle(divTextAreaCaption)
                    currentDivTextAreaCaptionDisplay = computedSyle4.display
                    if (currentDivTextAreaCaptionDisplay === 'block') {
                        await CaptionFileMSG(divElementBridge)
                    }
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
                    divTextAreaCaption.placeholder = `Legenda do (${file.name || 'arquivo'}): >...`
                    abbrDivTextAreaCaption.title = `Digite a legenda do (${file.name || 'arquivo'})`
                    
                    buttonStateRecording.style.cssText =
                        `display: inline; opacity: 0;`
                    setTimeout(function() {
                        buttonStateRecording.style.cssText =
                            `display: inline; opacity: 1;`
                    }, 300)

                    divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
                    divDelayTextAudioTitle.textContent = 'ATRASO-State=Recording:'
                    
                    await sendToFunil(divElementBridge, 3, null, file)

                    break;
                case 'image/jpg':
                case 'image/png':
                    typeFile.textContent = `imagem`
                    
                    await resetScreenSetup(divElementBridge, false)
                    divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
                    computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
                    currentDivDelayStateTypingDisplay = computedSyle.display
                    computedSyle2 = window.getComputedStyle(buttonStateTyping)
                    currentButtonStateTypingDisplay = computedSyle2.display
                    computedSyle3 = window.getComputedStyle(buttonStateRecording)
                    currentButtonStateRecordingDisplay = computedSyle3.display
                    if (currentButtonStateTypingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateTypingMSG(divElementBridge, false)
                        }
                    } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateRecordingMSG(divElementBridge)
                        }
                    }
                    buttonStateTyping.style.cssText =
                        `display: none; opacity: 0;`
                    buttonStateRecording.style.cssText =
                        `display: none; opacity: 0;`
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    computedSyle4 = window.getComputedStyle(divTextAreaCaption)
                    currentDivTextAreaCaptionDisplay = computedSyle4.display
                    if (currentDivTextAreaCaptionDisplay === 'block') {
                        await CaptionFileMSG(divElementBridge)
                    }
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
                    divTextAreaCaption.placeholder = `Legenda do (${file.name || 'arquivo'}): >...`
                    abbrDivTextAreaCaption.title = `Digite a legenda do (${file.name || 'arquivo'})`
                    divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
                    divDelayTextAudioTitle.textContent = 'ATRASO-State=Typing&Recording:'

                    await sendToFunil(divElementBridge, 3, null, file)

                    break;
                case 'text/plain':
                case 'application/pdf':
                case 'application/msword':
                    typeFile.textContent = `texto`
                    
                    await resetScreenSetup(divElementBridge, false)
                    divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
                    computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
                    currentDivDelayStateTypingDisplay = computedSyle.display
                    computedSyle2 = window.getComputedStyle(buttonStateTyping)
                    currentButtonStateTypingDisplay = computedSyle2.display
                    computedSyle3 = window.getComputedStyle(buttonStateRecording)
                    currentButtonStateRecordingDisplay = computedSyle3.display
                    if (currentButtonStateTypingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateTypingMSG(divElementBridge, false)
                        }
                    } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateRecordingMSG(divElementBridge)
                        }
                    }
                    buttonStateRecording.style.cssText =
                        `display: none; opacity: 0;`
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    computedSyle4 = window.getComputedStyle(divTextAreaCaption)
                    currentDivTextAreaCaptionDisplay = computedSyle4.display
                    if (currentDivTextAreaCaptionDisplay === 'block') {
                        await CaptionFileMSG(divElementBridge)
                    }

                    buttonStateTyping.style.cssText =
                        `display: inline; opacity: 0;`
                    setTimeout(function() {
                        buttonStateTyping.style.cssText =
                        `display: inline; opacity: 1;`
                    }, 300)

                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
                    divTextAreaCaption.placeholder = 'TEXTO-MSG: >...'
                    abbrDivTextAreaCaption.title = 'Digite a MSG'
                    
                    divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
                    divDelayTextAudioTitle.textContent = 'ATRASO-State=Typing:'

                    await sendToFunil(divElementBridge, 3, null, file)

                    break;
                default:
                    typeFile.textContent = `documento`
                    
                    await resetScreenSetup(divElementBridge, false)
                    divDelayStateTypingRecording = divElement.querySelector('#idivDelayTextAudio')
                    computedSyle = window.getComputedStyle(divDelayStateTypingRecording)
                    currentDivDelayStateTypingDisplay = computedSyle.display
                    computedSyle2 = window.getComputedStyle(buttonStateTyping)
                    currentButtonStateTypingDisplay = computedSyle2.display
                    computedSyle3 = window.getComputedStyle(buttonStateRecording)
                    currentButtonStateRecordingDisplay = computedSyle3.display
                    if (currentButtonStateTypingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateTypingMSG(divElementBridge, false)
                        }
                    } else if (currentButtonStateRecordingDisplay === 'inline-block') {
                        if (currentDivDelayStateTypingDisplay === 'flex') {
                            await StateRecordingMSG(divElementBridge)
                        }
                    }
                    buttonStateTyping.style.cssText =
                        `display: none; opacity: 0;`
                    buttonStateRecording.style.cssText =
                        `display: none; opacity: 0;`
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    computedSyle4 = window.getComputedStyle(divTextAreaCaption)
                    currentDivTextAreaCaptionDisplay = computedSyle4.display
                    if (currentDivTextAreaCaptionDisplay === 'block') {
                        await CaptionFileMSG(divElementBridge)
                    }
                    divTextAreaCaption = divElement.querySelector(`#itextAreaCaption`)
                    abbrDivTextAreaCaption = divElement.querySelector(`#iabbrtextAreaCaption`)
                    divTextAreaCaption.placeholder = `Legenda do (${file.name || 'arquivo'}): >...`
                    abbrDivTextAreaCaption.title = `Digite a legenda do (${file.name || 'arquivo'})`
                    divDelayTextAudioTitle = divElement.querySelector(`#idelayTextAudioTitle`) 
                    divDelayTextAudioTitle.textContent = 'ATRASO-State=Typing&Recording:'

                    await sendToFunil(divElementBridge, 3, null, file)

                    break;
            }

            resetLoadingBar()
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR getFileData: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> getFileData: ${error.message}`, setLogError)
    }
}
async function fileTypeAction(event, isClick, divElement) {
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        divElement.classList.remove('enter')

        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')
        
        let file = null
        if (isClick) {
            file = fileInput.files[0]
        } else {
            event.preventDefault()
            event.stopPropagation()
            
            
            file = event.dataTransfer.files[0]
        }
        
        const nameFile = divElement.querySelector('#ifileNameSelected')
        const statusFile = divElement.querySelector('#ifileStatus')
        const abbrFileZone = divElement.closest('abbr')
        
        if (file === null || file === undefined) {
            nameFile.textContent = `...`
            statusFile.textContent = `Clique ou arraste um arquivo`
            abbrFileZone.title = `Clique e selecione ou arraste um arquivo aqui para poder enviar`
            
            file = '...'
            await getFileData(divElement, file)

            resetLoadingBar()
        } else {
            /*if () {
                return
            }*/
            if (!isClick) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                fileInput.files = dataTransfer.files
            }
            
            nameFile.textContent = file.name
            statusFile.textContent = `Arquivo selecionado`
            abbrFileZone.title = `Arquivo: ${file.name}`

            await getFileData(divElement, file)

            resetLoadingBar()
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR fileTypeAction: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileTypeAction: ${error.message}`, setLogError)
    }
}

async function fileHandleDragLeave(event, divElement) {//fica ativando quando mexe rapido dentro inves de quando sai mesmo da area
    try {
        event.preventDefault()
        event.stopPropagation()

        divElement.classList.remove('enter')

        const statusFile = divElement.querySelector('#ifileStatus')
        
        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')
        if (fileInput.files.length >= 1) {
            statusFile.textContent = `Arquivo selecionado`
        } else {
            statusFile.textContent = `Clique ou arraste um arquivo`

            const abbrFileZone = divElement.closest('abbr')
            abbrFileZone.title = `Clique e selecione ou arraste um arquivo aqui para poder enviar`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR fileHandDragLeave: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileHandDragLeave: ${error.message}`, setLogError)
    }
}
async function fileHandleDragEnter(event, divElement) {
    try {
        event.preventDefault()
        event.stopPropagation()

        divElement.classList.add('enter')

        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')
        if (fileInput.files.length === 0) {
            const abbrFileZone = divElement.closest('abbr')
            abbrFileZone.title = `Solte para enviar o arquivo`
        }
        const statusFile = divElement.querySelector('#ifileStatus')
        statusFile.textContent = `Solte`
    } catch (error) {
        console.error(`> ⚠️ ERROR fileHandDragEnter: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileHandDragLeave: ${error.message}`, setLogError)
    }
}
async function fileHoverLeave(divElement) {
    try {
        const statusFile = divElement.querySelector('#ifileStatus')
        
        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')
        if (fileInput.files.length >= 1) {
            statusFile.textContent = `Arquivo selecionado`
        } else {
            statusFile.textContent = `Clique ou arraste um arquivo`

            const abbrFileZone = divElement.closest('abbr')
            abbrFileZone.title = `Clique e selecione ou arraste um arquivo aqui para poder enviar`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR fileHoverLeave: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileHoverLeave: ${error.message}`, setLogError)
    }
}
async function fileHoverEnter(divElement) {
    try {
        const statusFile = divElement.querySelector('#ifileStatus')
        statusFile.textContent = `Clique`

        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')
        if (fileInput.files.length === 0) {
            const abbrFileZone = divElement.closest('abbr')
            abbrFileZone.title = `Clique e selecione um arquivo para enviar o arquivo`
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR fileHoverEnter: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileHoverEnter: ${error.message}`, setLogError)
    }
}
async function fileAuxAction(divElement) {
    try {
        const fileInput = divElement.querySelector('input#ifileTypeMSGAux[type="file"]')

        const statusFile = divElement.querySelector('#ifileStatus')
        const abbrFileZone = divElement.closest('abbr')
        
        if (fileInput.files.length === 0) {
            abbrFileZone.title = `Selecione um arquivo para enviar o arquivo`
        }
        statusFile.textContent = `Selecione`
        
        await fileInput.click()
    } catch (error) {
        console.error(`> ⚠️ ERROR fileAuxAction: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> fileAuxAction: ${error.message}`, setLogError)
    }
}

async function delayLimitLength(input) {
    try {
        if (input.value.length > 5) {
            const newValue = input.value.slice(0, 5)
            input.value = newValue
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR delayLimitLength: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> delayLimitLength: ${error.message}`, setLogError)
    }
}

async function newTypeMSG(type) {//fazer aparecer invisivel e usar o id criado na hora pra modificar unicamente por MSG para aparecer bunitin opacity e tals
    try {  
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        await newTypeMSGShown()
        
        const divFunil = document.querySelector('#funilArea')
        const allConteinerFunilMSG = divFunil.querySelectorAll('.conteinerFunilMSG')
        let arrayIdNumberPosition = []
        allConteinerFunilMSG.forEach((divElement) => { 
            arrayIdNumberPosition.push(Number(divElement.id.match(/\d+/g)))  
        })
        let idNumberPositionDivAdjacent = null
        let isFirstUndefined = null 
        if (arrayIdNumberPosition.length > 0) {   
            const response = await axios.get('/funil/insert_exponecial_position_MSG', { params: { arrayIdNumberPosition } })
            idNumberPositionDivAdjacent = response.data.idnumberpositiondivadjacent
            isFirstUndefined = response.data.isfirstundefined 
        }

        const response2 = await axios.post('/funil/new-MSG')
        const Id_Position_MSG = response2.data.idpositionmsg

        const divAdjacent = document.querySelector(`#${idNumberPositionDivAdjacent}`)
        let conteinerMSG = null
        switch (type) {
            case 1:
                const MSGHTMlDelay = `<div class="conteinerFunilMSG" id="conteinerFunilMSG${Id_Position_MSG}">

                                        <div class="divInfoPositionMSG" id="idivInfoPositionMSG${Id_Position_MSG}">
                                            <label title="Selecione esta posição (${Id_Position_MSG})" class="divSelectionPositionMSG">
                                                <input type="checkbox" class="inputCheckboxSelectionMSG" id="iinputCheckboxSelectionMSG${Id_Position_MSG}" onchange="selectionPositionMSG(this, 1)">
                                                <span class="checkSelectionMSG" id="icheckSelectionMSG"></span>
                                            </label>
                                            <h3 class="titlePositionMSG" id="ititlePositionMSG">Posicao MSG</h3>
                                            <p class="positionMSG" id="ipositionMSG">(${Id_Position_MSG})</p>

                                            <button title="Deletar posição MSG (${Id_Position_MSG})" class="erasePositionMSG" id="ierasePositionMSG" onclick="erasePosition(this.parentElement.parentElement, 1)">D</button>
                                        </div>

                                        <div class="divInnerConteinerFunilMSG" id="idivInnerConteinerFunilMSG">

                                            <div class="divDelayTypeMSG" id="idivDelayTypeMSG">
                                                <abbr title="Determine um valor para o tempo de Delay"><span class="delayMSGTitle"><strong>ATRASO-MSG:</strong></span><label for="idelayMSGTime" class="delayMSGLabelTime">Tempo-<input type="number" class="delayMSGTime" id="idelayMSGTime" min="1" max="9999" step="1" oninput="delayLimitLength(this), sendToFunil(this, 1, 'input', null)" placeholder="00000"></label></abbr> 
                                            
                                                <select title="Selecione um tipo de duração" class="delayMSGSelect" id="idelayMSGSelect" oninput="sendToFunil(this, 1, this, null)">
                                                    <option value="none" selected>Nenhum</option>
                                                    <option value="seconds">Segundos</option>
                                                    <option value="minutes">Minutos</option>
                                                    <option value="hours">Horas</option>
                                                    <option value="days">Dias</option>
                                                </select>
                                            </div>

                                        </div>

                                    </div>`
                if (divAdjacent) {
                    if (isFirstUndefined) {
                        divAdjacent.insertAdjacentHTML('beforebegin', MSGHTMlDelay)
                    } else {
                        divAdjacent.insertAdjacentHTML('afterend', MSGHTMlDelay)
                    }
                } else {
                    divFunil.innerHTML += MSGHTMlDelay
                }

                conteinerMSG = document.querySelector(`#conteinerFunilMSG${Id_Position_MSG}`)
                conteinerMSG.style.cssText =
                    `display: flex; opacity: 0;`
                setTimeout(function() {
                    conteinerMSG.style.cssText =
                        `display: flex; opacity: 1;`
                }, 300)

                resetLoadingBar()
                break
            case 2:
                const MSGHTMlText = `<div class="conteinerFunilMSG" id="conteinerFunilMSG${Id_Position_MSG}">

                                        <div class="divInfoPositionMSG" id="idivInfoPositionMSG${Id_Position_MSG}">
                                            <label title="Selecione esta posição (${Id_Position_MSG})" class="divSelectionPositionMSG">
                                                <input type="checkbox" class="inputCheckboxSelectionMSG" id="iinputCheckboxSelectionMSG${Id_Position_MSG}" onchange="selectionPositionMSG(this, 2)">
                                                <span class="checkSelectionMSG" id="icheckSelectionMSG"></span>
                                            </label>
                                            <h3 class="titlePositionMSG" id="ititlePositionMSG">Posicao MSG</h3>
                                            <p class="positionMSG" id="ipositionMSG">(${Id_Position_MSG})</p>

                                            <button title="Deletar posição MSG (${Id_Position_MSG})" class="erasePositionMSG" id="ierasePositionMSG" onclick="erasePosition(this.parentElement.parentElement, 2)">D</button>
                                        </div>

                                        <div class="divInnerConteinerFunilMSG" id="idivInnerConteinerFunilMSG">

                                            <div class="divTextarea" id="idivTextarea">
                                                <div class="divTextareaFunctions" id="idivTextareaFunctions">
                                                    <abbr title="StateTyping STATUS: off" id="iabbrOnOffStateTypingMSG"><button class="functionsDivStart OnOffStateTypingMSG" id="iOnOffStateTypingMSG" onclick="StateTypingMSG(this, true)">O</button></abbr>
                                                    
                                                    <abbr title="Modo Claro/Escuro STATUS: escuro" id="iabbrOnOffLightDarkMSG"><button class="functionsDivStart OnOffLightDarkMSG" id="iOnOffLightDarkMSG" onclick="LightDarkMSG(this, true)">O</button></abbr>
                                                    <abbr title="Modo Cliente/Usuario STATUS: cliente" id="iabbrOnOffLightDarkColorMSG"><button class="functionsDivStart OnOffLightDarkColorMSG" id="iOnOffLightDarkColorMSG" onclick="LightDarkColorMSG(this, true)">O</button></abbr>
                                                    
                                                    <abbr title="Reset"><button class="functionsDivStart OnOffResetScreenSetupText" id="iOnOffResetScreenSetupText1" onclick="resetScreenSetup(this, true)">R</button></abbr>
                                                    <abbr title="VLock Tela STATUS: off" id="iabbrOnOffVLockScreenSetupText2"><button class="functionsDivStart OnOffVLockScreenSetupText" id="iOnOffVLockScreenSetupText2" onclick="VLockScreenSetup(this, true)">O</button></abbr>
                                                    <abbr title="PC Tela STATUS: off" id="iabbrOnOffDesktopScreenSetupText3"><button class="functionsDivStart OnOffDesktopScreenSetupText" id="iOnOffDesktopScreenSetupText3" onclick="desktopScreenSetup(this, true)">O</button></abbr>
                                                    <abbr title="Celular Tela STATUS: off" id="iabbrOnOffPhoneScreenSetupText4"><button class="functionsDivStart OnOffPhoneScreenSetupText" id="iOnOffPhoneScreenSetupText4" onclick="phoneScreenSetup(this, true)">O</button></abbr>
                                                </div>
                                            
                                                <div class="divDelayText" id="idivDelayText">
                                                    <abbr title="Determine um valor para o tempo de Delay"><span class="delayTextTitle"><strong>ATRASO-StateTyping:</strong></span><label for="idelayTextTime" class="delayTextLabelTime">Tempo-<input type="number" class="delayTextTime" id="idelayTextTime" min="1" max="9999" step="1" oninput="delayLimitLength(this), sendToFunil(this, 2, 'input', null)" placeholder="00000"></label></abbr> 
                                                    
                                                    <select title="Selecione um tipo de duração" class="delayTextSelect" id="idelayTextSelect" oninput="sendToFunil(this, 2, this, null)">
                                                        <option value="none" selected>Nenhum</option>
                                                        <option value="seconds">Segundos</option>
                                                        <option value="minutes">Minutos</option>
                                                        <option value="hours">Horas</option>
                                                        <option value="days">Dias</option>
                                                    </select>
                                                </div>
                                                
                                                <abbr title="Digite a MSG"><textarea class="textAreaTypeMSG" id="itextAreaTypeMSG" placeholder="TEXTO-MSG: >..." oninput="sendToFunil(this, 2, undefined, this)"></textarea></abbr>
                                            </div>

                                        </div>

                                    </div>`
                if (divAdjacent) {
                    if (isFirstUndefined) {
                        divAdjacent.insertAdjacentHTML('beforebegin', MSGHTMlText)
                    } else {
                        divAdjacent.insertAdjacentHTML('afterend', MSGHTMlText)
                    }
                } else {
                    divFunil.innerHTML += MSGHTMlText
                }
                
                conteinerMSG = document.querySelector(`#conteinerFunilMSG${Id_Position_MSG}`)
                conteinerMSG.style.cssText =
                    `display: flex; opacity: 0;`
                setTimeout(function() {
                    conteinerMSG.style.cssText =
                        `display: flex; opacity: 1;`
                }, 300)

                resetLoadingBar()
                break
            case 3:
                const MSGHTMlFile = `<div class="conteinerFunilMSG" id="conteinerFunilMSG${Id_Position_MSG}">

                                        <div class="divInfoPositionMSG" id="idivInfoPositionMSG${Id_Position_MSG}">
                                            <label title="Selecione esta posição (${Id_Position_MSG})" class="divSelectionPositionMSG">
                                                <input type="checkbox" class="inputCheckboxSelectionMSG" id="iinputCheckboxSelectionMSG${Id_Position_MSG}" onchange="selectionPositionMSG(this, 3)">
                                                <span class="checkSelectionMSG" id="icheckSelectionMSG"></span>
                                            </label>
                                            <h3 class="titlePositionMSG" id="ititlePositionMSG">Posicao MSG</h3>
                                            <p class="positionMSG" id="ipositionMSG">(${Id_Position_MSG})</p>

                                            <button title="Deletar posição MSG (${Id_Position_MSG})" class="erasePositionMSG" id="ierasePositionMSG" onclick="erasePosition(this.parentElement.parentElement, 3)">D</button>
                                        </div>

                                        <div class="divInnerConteinerFunilMSG" id="idivInnerConteinerFunilMSG">

                                            <div class="fileTypeMSG" id="ifileTypeMSG">
                                                <div class="divFileFunctions" id="idivFileFunctions">
                                                    <abbr title="StateTyping STATUS: off" id="iabbrOnOffStateTypingFile"><button class="functionsDivStart OnOffStateTypingFile" id="iOnOffStateTypingFile" onclick="StateTypingMSG(this, false)">O</button></abbr>
                                                    <abbr title="StateRecording STATUS: off" id="iabbrOnOffStateRecordingFile"><button class="functionsDivStart OnOffStateRecordingFile" id="iOnOffStateRecordingFile" onclick="StateRecordingMSG(this)">O</button></abbr>
                                                    <abbr title="Area de texto STATUS: off" id="iabbrOnOffCaption"><button class="functionsDivStart OnOffCaption" id="iOnOffCaption" onclick="CaptionFileMSG(this)">O</button></abbr>
                                                    
                                                    <abbr title="Modo Claro/Escuro STATUS: escuro" id="iabbrOnOffLightDarkCaption"><button class="functionsDivStart OnOffLightDarkCaption" id="iOnOffLightDarkCaption" onclick="LightDarkMSG(this, false)">O</button></abbr>
                                                    <abbr title="Modo Cliente/Usuario STATUS: cliente" id="iabbrOnOffLightDarkColorCaption"><button class="functionsDivStart OnOffLightDarkColorCaption" id="iOnOffLightDarkColorCaption" onclick="LightDarkColorMSG(this, false)">O</button></abbr>
                                                    
                                                    <abbr title="Reset"><button class="functionsDivStart OnOffResetScreenSetupCaption" id="iOnOffResetScreenSetupCaption1" onclick="resetScreenSetup(this, false)">R</button></abbr>
                                                    <abbr title="VLock Tela STATUS: off" id="iabbrOnOffVLockScreenSetupCaption2"><button class="functionsDivStart OnOffVLockScreenSetupCaption" id="iOnOffVLockScreenSetupCaption2" onclick="VLockScreenSetup(this, false)">O</button></abbr>
                                                    <abbr title="PC Tela STATUS: off" id="iabbrOnOffDesktopScreenSetupCaption3"><button class="functionsDivStart OnOffDesktopScreenSetupCaption" id="iOnOffDesktopScreenSetupCaption3" onclick="desktopScreenSetup(this, false)">O</button></abbr>
                                                    <abbr title="Celular Tela STATUS: off" id="iabbrOnOffPhoneScreenSetupCaption4"><button class="functionsDivStart OnOffPhoneScreenSetupCaption" id="iOnOffPhoneScreenSetupCaption4" onclick="phoneScreenSetup(this, false)">O</button></abbr>
                                                </div>
                                                
                                                <div class="divDelayTextAudio" id="idivDelayTextAudio">
                                                    <abbr title="Determine um valor para o tempo de Delay"><strong><span class="delayTextAudioTitle" id="idelayTextAudioTitle">ATRASO-State=Typing&Recording:</span></strong><label for="idelayTexAudioTime" class="delayTextAudioLabelTime">Tempo-<input type="number" class="delayTextAudioTime" id="idelayTexAudioTime" min="1" max="9999" step="1" oninput="delayLimitLength(this), sendToFunil(this, 3, 'input', null)" placeholder="00000"></label></abbr> 
                                                    
                                                    <select title="Selecione um tipo de duração" class="delayTextAudioSelect" id="idelayTextAudioSelect" oninput="sendToFunil(this, 3, this, null)">
                                                        <option value="none" selected>Nenhum</option>
                                                        <option value="seconds">Segundos</option>
                                                        <option value="minutes">Minutos</option>
                                                        <option value="hours">Horas</option>
                                                        <option value="days">Dias</option>
                                                    </select>
                                                </div>
                                                
                                                <div class="divFileSelectMSG">
                                                    <abbr title="Clique e selecione ou arraste um arquivo aqui para poder enviar"><div class="fileTypeSelectMSG" id="ifileTypeSelectMSG" ondragover="fileHandleDragEnter(event, this)" ondragleave="fileHandleDragLeave(event, this)" onmouseenter="fileHoverEnter(this)" onmouseleave="fileHoverLeave(this)" ondrop="fileTypeAction(event, false, this)" onclick="fileAuxAction(this)">
                                                        <p class="fileTitleTypeMSG"><strong>ARQUIVO-MSG</strong></p>
                                                        <p class="fileStatus"><span id="ifileStatus">Clique ou arraste um arquivo</span></p>
                                                        <p class="fileTypeSelected">(<span id="ifileTypeSelected">...</span>)</p>
                                                        <p class="fileNameSelected"><span id="ifileNameSelected">...</span></p>
                                                        
                                                        <input type="file" class="fileTypeMSGAux" id="ifileTypeMSGAux" placeholder="..." onchange="fileTypeAction(null, true, this.parentElement)">
                                                    </div></abbr>
                                                </div>

                                                <abbr title="Digite a legenda do (...)" id="iabbrtextAreaCaption"><textarea class="textAreaCaption" id="itextAreaCaption" placeholder="Legenda do (...): >..." oninput="sendToFunil(this, 3, undefined, this)"></textarea></abbr>
                                            </div>
                                            
                                        </div>

                                    </div>`
                if (divAdjacent) {
                    if (isFirstUndefined) {
                        divAdjacent.insertAdjacentHTML('beforebegin', MSGHTMlFile)
                    } else {
                        divAdjacent.insertAdjacentHTML('afterend', MSGHTMlFile)
                    }
                } else {
                    divFunil.innerHTML += MSGHTMlFile
                }

                conteinerMSG = document.querySelector(`#conteinerFunilMSG${Id_Position_MSG}`)
                conteinerMSG.style.cssText =
                    `display: flex; opacity: 0;`
                setTimeout(function() {
                    conteinerMSG.style.cssText =
                        `display: flex; opacity: 1;`
                }, 300)

                resetLoadingBar()
                break
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR newTypeMSG: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> newTypeMSG: ${error.message}`, setLogError)
    }
}

async function newTypeMSGShown() {
    try {
        const divAddNewTypeMSG = document.querySelector('#addTypeMSG')
        const typeSelect = document.querySelector('#typeSelectMSG')
        const typeDelay = document.querySelector('#typeDelayMSG')
        const typeText = document.querySelector('#typeTextMSG')
        const typeFile = document.querySelector('#typeFileMSG')
        const isShown_typeSelect = window.getComputedStyle(typeSelect).display

        if (isShown_typeSelect === 'block') {
            typeDelay.style.cssText =
                'display: block; opacity: 0;'
            typeText.style.cssText =
                'display: block; opacity: 0;'
            typeFile.style.cssText =
                'display: block; opacity: 0;'

            setTimeout(function() {
                typeDelay.style.cssText =
                    'display: none; opacity: 0;'
                typeText.style.cssText =
                    'display: none; opacity: 0;'
                typeFile.style.cssText =
                    'display: none; opacity: 0;'

                typeSelect.style.cssText =
                    'display: block; height: 0vh; padding: 0px 10px 0px 10px;'
                setTimeout(function() {
                    typeSelect.style.cssText =
                        'display: none; height: 0vh; padding: 0px 10px 0px 10px;'
                    
                    divAddNewTypeMSG.style.cssText = 
                        'border-radius: 50px 50px 50px 50px;' 
                }, 300)
            }, 300)
        } else {
            divAddNewTypeMSG.style.cssText = 
                'border-radius: 0px 0px 50px 50px;'

            setTimeout(function() {
                typeSelect.style.cssText =
                    'display: block; height: 0vh; padding: 0px 10px 0px 10px;'
                setTimeout(function() {
                    typeSelect.style.cssText =
                        'display: block; height: 30vh; padding: 7px 10px 0px 10px;'
                }, 100)

                setTimeout(function() {
                    typeDelay.style.cssText =
                        'display: block; opacity: 0;'
                    typeText.style.cssText =
                        'display: block; opacity: 0;'
                    typeFile.style.cssText =
                        'display: block; opacity: 0;'
                    setTimeout(function() {
                        typeDelay.style.cssText =
                            'display: block; opacity: 1;'
                        typeText.style.cssText =
                            'display: block; opacity: 1;'
                        typeFile.style.cssText =
                            'display: block; opacity: 1;'
                    }, 100)
                }, 300)
            }, 300)
        }
    } catch (error) {
        console.error(`> ⚠️ ERROR newTypeMSGShown: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> newTypeMSGShown: ${error.message}`, setLogError)
    }
}

async function eraseClient_(Clientt_) {
    if (Client_NotReady) {
        displayOnConsole(`>  ℹ️  ${Clientt_} not Ready.`, setLogError)
        return
    }
    try {
        Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        let userConfirmation = confirm(`Tem certeza de que deseja apagar o Client_ ${Clientt_}?\nsera apagada para sempre.`)
        if (userConfirmation) {
            const status = document.querySelector('#status')

            const response = await axios.delete('/client/erase', { params: { Clientt_ } })
            const Sucess = response.data.sucess
            const Is_Empty = response.data.empty
            const Is_Empty_Input = response.data.empty_input
            const Not_Selected = response.nselected
            if (Not_Selected) {
                status.innerHTML = `O Client_ <strong>${Clientt_}</strong> esta para ser <strong>apagado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>apaga-lo</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(back)</span></strong></i><strong>O Client_ <strong>${Clientt_}</strong> esta para ser <strong>apagado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>apaga-lo</strong>!`)
                
                resetLoadingBar()
                
                Client_NotReady = false

                return
            }
            if (Is_Empty) {
                status.innerHTML = `Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>`)

                resetLoadingBar()
                
                Client_NotReady = false
                
                return
            }
            if (Is_Empty_Input) {
                status.innerHTML = `Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`)

                resetLoadingBar()
                
                Client_NotReady = false
                
                return  
            } 
            if (Sucess) {
                let dir_Path = null
                dir_Path = 'Local_Auth'
                const response1 = await axios.get('/functions/dir', { params: { dir_Path } })
                const Directories_1 = response1.data.dirs

                const divClientt_ = document.querySelector(`#${Clientt_}`)
                divClientt_.remove()

                status.innerHTML = `Client_ <strong>${Clientt_}</strong> foi <strong>Apagado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> foi <strong>Apagado</strong>!`)

                //o codigo abaixo e possivel botar tudo numa rota e devolver o porArrayClient e se tiver vazio nada e reset e tals, modelo REST e tals (se for preciso)

                await sleep(1.5 * 1000)
                dir_Path = 'Local_Auth'
                const response2 = await axios.get('/functions/dir', { params: { dir_Path } })
                const Directories_2 = response2.data.dirs

                if (Directories_2.length-1 === -1) {
                    status.innerHTML = `<strong>Dir</strong> off Clients_ (<strong>${Directories_2.length}</strong>) is <strong>empty</strong>!`
                    displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Dir</strong> off Clients_ (<strong>${Directories_2.length}</strong>) is <strong>empty</strong>!`)

                    let exitInten = true
                    await exit(exitInten)
                    await axios.put('/back/reset')
                } else {
                    const clientIdNumber = Clientt_.match(/\d+/g)

                    let Counter_Clients_ = 0
                    let posArrayClient = null
                    for (let i = -1; i < Directories_1.length-1; i++) {
                        const clientDirIdNumber = Directories_2[Counter_Clients_-1].match(/\d+/g)

                        if (clientIdNumber === clientDirIdNumber) {
                            posArrayClient = Counter_Clients_

                            if (Directories_1[posArrayClient++] === undefined) {
                                posArrayClient--
                            } else {
                                posArrayClient++
                            }
                        } else {
                            Counter_Clients_++
                        }
                    }
    
                    await selectClient_(`_${posArrayClient}_Client_`)
                }
            } else {
                status.innerHTML = `<i><strong>ERROR</strong></i> ao <strong>Apagar</strong> Client_ <strong>${Clientt_}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao <strong>Apagar</strong> Client_ <strong>${Clientt_}</strong>!`)
            }
        } else {
            resetLoadingBar()
            Client_NotReady = false
            return
        }

        resetLoadingBar()
        Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR eraseClient_ ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> eraseClient_ <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        Client_NotReady = false
        resetLoadingBar()
    }
}
async function DestroyClient_(Clientt_) {
    if (Client_NotReady) {
        displayOnConsole(`>  ℹ️  ${Clientt_} not Ready.`, setLogError)
        return
    }
    try {
        Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        let userConfirmation = confirm(`Tem certeza de que deseja desligar o Client_ ${Clientt_}?`)
        if (userConfirmation) {
            const status = document.querySelector('#status')

            const response = await axios.put('/client/destroy', { Clientt_ })
            const Sucess = response.data.sucess
            const Is_Empty = response.data.empty
            const Is_Empty_Input = response.data.empty_input
            const Not_Selected = response.nselected
            if (Not_Selected) {
                status.innerHTML = `O Client_ <strong>${Clientt_}</strong> esta para ser <strong>desligado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>desliga-lo</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(back)</span></strong></i><strong>O Client_ <strong>${Clientt_}</strong> esta para ser <strong>desligado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>desliga-lo</strong>!`)
                
                resetLoadingBar()
                
                Client_NotReady = false

                return
            }
            if (Is_Empty) {
                status.innerHTML = `Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>`)

                resetLoadingBar()
                
                Client_NotReady = false
                
                return
            }
            if (Is_Empty_Input) {
                status.innerHTML = `Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`)

                resetLoadingBar()
                
                Client_NotReady = false
                
                return  
            } 
            if (Sucess) {
                const clientHTMLReinitialize = `\n<abbr title="Client_ ${Clientt_}" id="abbrselect-${Clientt_}"><button class="Clients_" id="select-${Clientt_}" onclick="selectClient_('${Clientt_}')">${Clientt_}</button></abbr><abbr title="Ligar ${Clientt_}" id="abbrReinitialize-${Clientt_}"><button class="Clients_Reinitialize" id="Reinitialize-${Clientt_}" onclick="ReinitializeClient_('${Clientt_}')"><</button></abbr><abbr title="Apagar ${Clientt_}" id="abbrerase-${Clientt_}"><button class="Clients_Erase" id="erase-${Clientt_}" onclick="eraseClient_('${Clientt_}')"><</button></abbr>\n`
                document.querySelector(`#${Clientt_}`).innerHTML = clientHTMLReinitialize

                status.innerHTML = `Client_ <strong>${Clientt_}</strong> foi <strong>Desligado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> foi <strong>Desligado</strong>!`)
    
                //o codigo abaixo e possivel botar tudo numa rota e devolver o porArrayClient, modelo REST e tals (se for preciso)

                const dir_Path = 'Local_Auth'
                const response = await axios.get('/functions/dir', { params: { dir_Path } })
                const Directories_ = response.data.dirs

                if (Directories_.length-1 > 0) {
                    const clientIdNumber = Clientt_.match(/\d+/g) 

                    if (Directories_[clientIdNumber++] !== null) {
                        clientIdNumber++
                        
                        await selectClient_(`Client_${posArrayClient}`)
                    } else if (Directories_[clientIdNumber--] !== null) {
                        clientIdNumber--

                        await selectClient_(`Client_${posArrayClient}`)
                    }
                }
            } else {
                status.innerHTML = `<i><strong>ERROR</strong></i> ao <strong>Desligar</strong> Client_ <strong>${Clientt_}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao <strong>Desligar</strong> Client_ <strong>${Clientt_}</strong>!`)
            }
        } else {
            resetLoadingBar()
            Client_NotReady = false
            return
        }

        resetLoadingBar()
        Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR DestroyClient_ ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> DestroyClient_ <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        Client_NotReady = false
        resetLoadingBar()
    }
} 
async function ReinitializeClient_(Clientt_) {
    if (Client_NotReady) {
        displayOnConsole(`>  ℹ️  ${Clientt_} not Ready.`, setLogError)
        return
    }
    try {
        Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const status = document.querySelector('#status')

        const response = await axios.put('/client/reinitialize', { Clientt_ })
        const Sucess = response.data.sucess
        const Is_Empty = response.data.empty
        const Is_Empty_Input = response.data.empty_input
        const Not_Selected = response.nselected
        if (Not_Selected) {
            status.innerHTML = `O Client_ <strong>${Clientt_}</strong> esta para ser <strong>ligado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>liga-lo</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(back)</span></strong></i><strong>O Client_ <strong>${Clientt_}</strong> esta para ser <strong>ligado</strong> mas <strong>não</strong> esta <strong>selecionado</strong>, o Client_ <strong>selecionado</strong> é <strong>${Client_}</strong> então <strong>selecione</strong> <strong>${Clientt_}</strong> para poder <strong>liga-lo</strong>!`)
            
            resetLoadingBar()
            
            Client_NotReady = false

            return
        }
        if (Is_Empty) {
            status.innerHTML = `Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Dados de <strong>${Clientt_}</strong> esta <strong>vazio</strong>`)

            resetLoadingBar()
            
            Client_NotReady = false
            
            return
        }
        if (Is_Empty_Input) {
            status.innerHTML = `Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> não foi encontrado em <strong>nenhum</strong> dado!`)

            resetLoadingBar()
            
            Client_NotReady = false
            
            return  
        } 
        if (Sucess) {
            const clientHTMLDestroy = `\n<abbr title="Client_ ${Clientt_}" id="abbrselect-${Clientt_}"><button class="Clients_" id="select-${Clientt_}" onclick="selectClient_('${Clientt_}')">${Clientt_}</button></abb<abbr title="Desligar ${Clientt_}" id="abbrDestroy-${Clientt_}"><button class="Clients_Destroy" id="Destroy-${Clientt_}" onclick="DestroyClient_('${Clientt_}')"><</button></abb<abbr title="Apagar ${Clientt_}" id="abbrerase-${Clientt_}"><button class="Clients_Erase" id="erase-${Clientt_}" onclick="eraseClient_('${Clientt_}')"><</button></abbr>\n`
            document.querySelector(`#${Clientt_}`).innerHTML = clientHTMLDestroy

            status.innerHTML = `Client_ <strong>${Clientt_}</strong> foi <strong>Ligado</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> foi <strong>Ligado</strong>!`)
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> ao <strong>Desligar</strong> Client_ <strong>${Clientt_}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao <strong>Desligar</strong> Client_ <strong>${Clientt_}</strong>!`)
        }

        resetLoadingBar()
        Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR ReinitializeClient_ ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> ReinitializeClient_ <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        Client_NotReady = false
        resetLoadingBar()
    }
} 
async function selectClient_(Clientt_) {
    if (Client_NotReady = false) {
        displayOnConsole(`>  ℹ️  <strong>${Clientt_}</strong> not Ready.`, setLogError)
        return
    }
    try {
        Client_NotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const status = document.querySelector('#status')

        const divClientt_ = document.querySelector(`#${Clientt_}`)
        const capList = document.querySelector(`caption`)

        const divClientt_Temp = document.querySelector(`#${Clientt_Temp}`)
        if (divClientt_Temp !== null) {
            divClientt_Temp.style.cssText =
                'border-top: 5px solid var(--colorBlack); border-bottom: 5px solid var(--colorBlack); transition: var(--configTrasition03s);'
        }
        if (divClientt_ === null) {
            status.innerHTML = `Client_ <strong>${Clientt_}</strong> <strong>Não</strong> existe!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> <strong>Não</strong> existe!`)
            resetLoadingBar()

            Client_NotReady = false
            
            return
        }

        const response = await axios.post('/client/select', { Client_: Clientt_ })
        let Sucess = response.data.sucess
        if (Sucess) {
            divClientt_.style.cssText =
                'border-top: 5px solid var(--colorBlue); border-bottom: 5px solid var(--colorBlue); transition: var(--configTrasition03s);'

            capList.innerHTML = `<stronger>${Clientt_}</stronger>`

            Clientt_Temp = Clientt_
            Client_ = Clientt_

            document.title = `Selecionado ${Clientt_}`
            status.innerHTML = `Client_ <strong>${Clientt_}</strong> <strong>Selecionado</strong>`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Client_ <strong>${Clientt_}</strong> <strong>Selecionado</strong>.`)
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> <strong>selecionando</strong> Client_ <strong>${Clientt_}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> <strong>selecionando</strong> Client_ <strong>${Clientt_}</strong>!`)
        }

        resetLoadingBar()
        Client_NotReady = false
    } catch (error) {
        console.error(`> ⚠️ ERROR selectClient_ ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> selectClient_ <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        Client_NotReady = false
        resetLoadingBar()
    }
}

async function eraseChatDataByQuery(isFromTerminal, queryFromTerminal) {
    if (ChatDataNotReady) {
        displayOnConsole(`>  ℹ️ <strong>${Client_}</strong> not Ready.`, setLogError)
        return
    }
    if (isHideAP) {
        return
    }
    try {
        ChatDataNotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'
        
        const status = document.querySelector('#status')

        let queryList = null
        let userConfirmation = confirm(`Tem certeza de que deseja apagar o ChatData <strong>${Client_}</strong> de ${queryList} da lista?\nsera apagado para sempre.`)
        if (userConfirmation) {
            if (isFromTerminal) {
                queryList = queryFromTerminal
            } else {
                const query = document.querySelector('#inputList').value
                queryList = query
            }
            const response = await axios.delete('/chatdata/query-erase', { params: { queryList } })
            const Sucess = response.data.sucess
            const Is_Empty = response.data.empty
            const Is_Empty_Input = response.data.empty_input
            const Chat_Data_json = response.data.chatdatajson
            if (Is_Empty) {
                status.innerHTML = `Lista de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> esta <strong>vazia</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Lista de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> esta <strong>vazia</strong>!`)

                resetLoadingBar()
                if (isFromTerminal) isFromTerminal = false
                ChatDataNotReady = false
                return
            }
            if (Is_Empty_Input) {
                status.innerHTML = `ChatData <strong>${queryList}</strong> <strong>não</strong> foi <strong>encontrado</strong> na lista de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>ChatData <strong>${queryList}</strong> <strong>não</strong> foi <strong>encontrado</strong> na lista de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong>!`)

                resetLoadingBar()
                if (isFromTerminal) isFromTerminal = false
                ChatDataNotReady = false
                return  
            } 
            if (Sucess) {
                status.innerHTML = `<strong>${queryList}</strong> de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> foi <strong>Apagado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>${queryList}</strong> de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> foi <strong>Apagado</strong>!`)
            } else {
                status.innerHTML = `<i><strong>ERROR</strong></i> ao <strong>Apagar</strong> ChatData <strong>${Client_}</strong> <strong>${queryList}</strong> de <strong>${Chat_Data_json}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao <strong>Apagar</strong> ChatData <strong>${Client_}</strong> <strong>${queryList}</strong> de <strong>${Chat_Data_json}</strong>!`)
            }
        } else {
            resetLoadingBar()
            if (isFromTerminal) isFromTerminal = false
            
            ChatDataNotReady = false
            
            return
        }
        
        //document.querySelector('#inputList').value = ''
        resetLoadingBar()
        if (isFromTerminal) isFromTerminal = false

        ChatDataNotReady = false

        return
    } catch (error) {
        console.error(`> ⚠️ ERROR eraseChatDataByQuery ${Client_} ${Chat_Data_json}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> eraseChatDataByQuery ${Client_} ${Chat_Data_json}: ${error.message}`, setLogError)
        ChatDataNotReady = false
        resetLoadingBar()
    }
}
//async function allErase(sucess, empty, isFromTerminal) {
async function allErase() {
    if (ChatDataNotReady) {
        displayOnConsole(`>  ℹ️  <strong>${Client_}</strong> not Ready.`, setLogError)
        return
    }
    if (isHideAP) {
        return
    }
    try {
        ChatDataNotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'
    
        const status = document.querySelector('#status')

        let userConfirmation = confirm(`Tem certeza de que deseja apagar todo o ChatData de ${Client_}?\nsera apagado para sempre.`)
        if (userConfirmation) {
            /*const response = await axios.delete('/chatdata/all-erase')
            let Sucess = null
            let Is_Empty = null
            if (isFromTerminal) {
                Sucess = sucess 
                Is_Empty = empty
            } else {
                let sucess = response.data.sucess
                let empty = response.data.empty
                Sucess = sucess
                Is_Empty = empty
            }*/
            const response = await axios.delete('/chatdata/all-erase')
            const Sucess = response.data.sucess
            const Is_Empty = response.data.empty
            const Chat_Data_json = response.data.chatdatajson
            if (Is_Empty) {
                status.innerHTML = `ChatData de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> esta <strong>vazia</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>ChatData de <strong>${Chat_Data_json}</strong> <strong>${Client_}</strong> esta <strong>vazia</strong>!`)

                resetLoadingBar()

                ChatDataNotReady = false

                return
            } 
            if (Sucess) {
                status.innerHTML = `<strong>Todo</strong> o ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> foi <strong>Apagado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Todo</strong> o ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> foi <strong>Apagado</strong>!`)
            } else {
                status.innerHTML = `<i><strong>ERROR</strong></i> ao Apagar <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao Apagar <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>!`)
            } 
        } else {
            resetLoadingBar()

            ChatDataNotReady = false

            return
        }
        
        ChatDataNotReady = false
        resetLoadingBar()
    } catch (error) {
        console.error(`> ⚠️ ERROR allEraseList <strong>${Client_}</strong> ${Chat_Data_json}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> allEraseList <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>: ${error.message}`, setLogError)
        ChatDataNotReady = false
        resetLoadingBar()
    }
}
//async function searchChatDataBySearch(isFromTerminal, dataFromTerminal, searchFromTerminal) {
async function searchChatDataBySearch(isFromTerminal, searchFromTerminal) {
    if (ChatDataNotReady) {
        displayOnConsole(`>  ℹ️ <strong>${Client_}</strong> not Ready.`, setLogError)
        return
    }
    if (isHideAP) {
        return
    }
    try {
        ChatDataNotReady = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const status = document.querySelector('#status')
        let list = document.querySelector('table tbody')
        let counter = document.querySelector('thead > tr > td ')
        
        let response = null
        let Search = null
        //let ChatData = null
        if (isFromTerminal) {
            Search = searchFromTerminal
            response = await axios.get('/chatdata/search-print', { params: { Search } })
            //ChatData = dataFromTerminal
        } else {
            let sendSearch = document.querySelector('#sendSearchList')
            sendSearch.style.cssText =
            'background-color: #2b2b2b; color: var(--colorWhite); border: 1px solid var(--colorWhite); transition: var(--configTrasition01s);'
            setTimeout(function() {
                sendSearch.style.cssText =
                'background-color: var(--colorInteractionElements); color: var(--colorBlack); border: 1px solid rgba(0, 0, 0, 0); transition: var(--configTrasition03s);'
            }, 100)
            
            const search = document.querySelector('#inputList').value
            Search = search
            response = await axios.get('/chatdata/search-print', { params: { Search } })
            //const chatdata = response.data.chatdata
            //ChatData = chatdata
            //displayOnConsole(ChatData)
        }
        const Sucess = response.data.sucess
        const Is_Empty = response.data.empty
        const Is_Empty_Input = response.data.empty_input
        const ChatData = response.data.chatdata
        const Chat_Data_json = response.data.chatdatajson

        if (Is_Empty) {
            status.innerHTML = `Lista de <strong>${Chat_Data_json}</strong> esta <strong>vazia</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Lista de <strong>${Chat_Data_json}</strong> esta <strong>vazia</strong>!`)

            list.innerHTML = ''
            
            counter.textContent = `0`
            
            let row = list.insertRow(-1)
            
            let cell1 = row.insertCell(0)
            cell1.textContent = 'N/A'
            
            let cell2 = row.insertCell(1)
            cell2.textContent = 'N/A'

            resetLoadingBar()
            if (isFromTerminal) isFromTerminal = false

            ChatDataNotReady = false

            return
        }
        if (Is_Empty_Input) {
            status.innerHTML = `ChatData <strong>${Search}</strong> não foi encontrado na lista de <strong>${Chat_Data_json}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>ChatData <strong>${Search}</strong> não foi encontrado na lista de <strong>${Chat_Data_json}</strong>!`)

            list.innerHTML = ''
            
            counter.textContent = `0`
            
            let row = list.insertRow(-1)
            
            let cell1 = row.insertCell(0)
            cell1.textContent = 'N/A'
            
            let cell2 = row.insertCell(1)
            cell2.textContent = 'N/A'

            resetLoadingBar()
            if (isFromTerminal) isFromTerminal = false

            ChatDataNotReady = false

            return  
        } 
        if (Sucess) {
            status.innerHTML = `Listando ChatData <strong>${Search}</strong> de <strong>${Chat_Data_json}</strong>...`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Listando ChatData <strong>${Search}</strong> de <strong>${Chat_Data_json}</strong>...`)
            
            list.innerHTML = ''
            
            ChatData.forEach(entry => {
                counter.textContent = `${ChatData.length}`

                let row = list.insertRow(-1)
                
                let cell1 = row.insertCell(0)
                cell1.textContent = entry.chatId
                
                let cell2 = row.insertCell(1)
                cell2.textContent = entry.name
                
            })
            /*let bList = document.querySelector('#erase')
            
            bList.style.cssText =
                'opacity: 1 pointer-events: unset;'*/

            status.innerHTML = `Listado ChatData ${Search} de ${Chat_Data_json}!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Listado ChatData ${Search} de ${Chat_Data_json}!`)
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> ao pesquisar ChatData <strong>${Search}</strong> de <strong>${Chat_Data_json}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao pesquisar ChatData <strong>${Search}</strong> de <strong>${Chat_Data_json}</strong>!`)
        }

        //document.querySelector('#inputList').value = ''
        if (isFromTerminal) isFromTerminal = false
        ChatDataNotReady = false
        resetLoadingBar()
    } catch (error) {
        console.error(`> ⚠️ ERROR searchChatDataBySearch ${Chat_Data_json}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> searchChatDataBySearch ${Chat_Data_json}: ${error.message}`, setLogError)
        if (isFromTerminal) isFromTerminal = false
        ChatDataNotReady = false
        resetLoadingBar()
    }
}
//async function allPrint(Sucess, Is_Empty, ChatData, isFromButton, isallerase) {
async function allPrint(isFromButton, isallerase, Clientt_) {
    if (ChatDataNotReady) {
        displayOnConsole(`>  ℹ️ <strong>${Client_}</strong> not Ready.`, setLogError)
        return
    }
    if (isHideAP) {
        return
    }
    try {
        if (!isallerase) {   
            if (Clientt_ !== null) {   
                if (Client_ !== Clientt_) {
                    return
                }
            }
        }

        ChatDataNotReady = true


        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        const status = document.querySelector('#status')
        let list = document.querySelector('table tbody')
        let counter = document.querySelector('thead > tr > td ')

        if (isallerase) {
            await axios.get('/chatdata/all-print', { params: { isallerase } })
            counter.textContent = `0`
            
            list.innerHTML = ''
            
            let row = list.insertRow(-1)
            
            let cell1 = row.insertCell(0)
            cell1.textContent = 'N/A'
            
            let cell2 = row.insertCell(1)
            cell2.textContent = 'N/A'
            
            resetLoadingBar()

            ChatDataNotReady = false

            return
        }

        /*let Sucess = null
        let Is_Empty = null
        let ChatData = null*/
        const response = await axios.get('/chatdata/all-print')
        /*if (isFromButton) {
            /*let listShow = document.querySelector('#showList')
            let listShowAbbr = document.querySelector('#abbrShowList')
            if (isTableHidden === null) {
                isTableHidden = true
                listShow.style.cssText = 
                'background-color: var(--colorWhite); color: var(--colorBlack); pointer-events: auto; opacity: 1;'
                listShowAbbr.title = `STATUS Lista: visivel`
            } else if (isTableHidden = true) {
                isTableHidden = true
                listShow.style.cssText = 
                'background-color: var(--colorWhite); color: var(--colorBlack); pointer-events: auto; opacity: 1;'
                listShowAbbr.title = `STATUS Lista: visivel`
            }
            
            let tableList = document.querySelector('#listChatData')
            tableList.style.cssText =
            'display: inline-block; opacity: 1;'
            setTimeout(function() {
                tableList.style.cssText =
                'display: inline-block; opacity: 1;'
            }, 100)
            let eraseButton = document.querySelector('#erase')
            eraseButton.style.cssText =
            'display: inline-block; opacity: 1;'
            setTimeout(function() {
                eraseButton.style.cssText =
                'display: inline-block; opacity: 1;'
            }, 100)
            let sucess = response.data.sucess
            let empty = response.data.empty
            let chatdata = response.data.chatdata
            Sucess = sucess
            Is_Empty = empty
            ChatData = chatdata
        } /*else {
            Sucess = sucess 
            Is_Empty = empty
            ChatData = chatdata
        }*/
        const Sucess = response.data.sucess
        const Is_Empty = response.data.empty
        const ChatData = response.data.chatdata
        const Chat_Data_json = response.data.chatdatajson
        /*Sucess = sucess
        Is_Empty = empty
        ChatData = chatdata*/

        if (Is_Empty) {
            status.innerHTML = `ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> esta <strong>vazia</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> esta <strong>vazia</strong>!`)

            counter.textContent = `0`
            
            list.innerHTML = ''
            
            let row = list.insertRow(-1)
            
            let cell1 = row.insertCell(0)
            cell1.textContent = 'N/A'
            
            let cell2 = row.insertCell(1)
            cell2.textContent = 'N/A'
            
            resetLoadingBar()

            ChatDataNotReady = false
            
            return
        } 
        if (Sucess) {
            if (isFromButton) {
                status.innerHTML = `Listando <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>...`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Listando <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>...`)
            }

            list.innerHTML = ''
            
            for (let entry of ChatData) {
                counter.textContent = `${ChatData.length}`
                
                let row = list.insertRow(-1)

                let cell1 = row.insertCell(0)
                cell1.textContent = entry.chatId
                
                let cell2 = row.insertCell(1)
                cell2.textContent = entry.name    
            }
            /*let bList = document.querySelector('#erase')
            
            bList.style.cssText =
                'opacity: 1 pointer-events: unset;'*/
            if (isFromButton) {
                status.innerHTML = `<strong>Todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> Listado!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong> Listado`)
            }
        } else {
            status.innerHTML = `<i><strong>ERROR</strong></i> ao listar <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao listar <strong>todo</strong> ChatData de <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>!`)
        } 

        isFromButton = true
        ChatDataNotReady = false
        resetLoadingBar()
    } catch (error) {
        console.error(`> ⚠️ ERROR allPrint <strong>${Client_}</strong> ${Chat_Data_json}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> allPrint <strong>${Client_}</strong> <strong>${Chat_Data_json}</strong>: ${error.message}`, setLogError)
        isFromButton = true
        ChatDataNotReady = false
        resetLoadingBar()
    }
}

async function counterExceeds(QR_Counter_Exceeds) {
    if (isExceeds) {
        displayOnConsole('>  ℹ️  <strong>Client_</strong> not Ready.', setLogError)
        return
    }
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        isExceeds = true

        const mainContent = document.querySelector('#content')
        mainContent.style.cssText =
            'display: inline-block;'

        const status = document.querySelector('#status')
        status.innerHTML = `Excedido <strong>todas</strong> as tentativas (<strong>${QR_Counter_Exceeds}</strong>) de conexão pelo <strong>QR_Code</strong> ao <strong>WhatsApp Web</strong>, <strong>Tente novamente</strong>!`
        displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>Excedido <strong>todas</strong> as tentativas (<strong>${QR_Counter_Exceeds}</strong>) de conexão pelo <strong>QR_Code</strong> ao <strong>WhatsApp Web</strong>, <strong>Tente novamente</strong>!`)
        
        if (!isFromNew) {
            let buttonStart = document.querySelector('#start')
            buttonStart.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                    'display: inline-block; opacity: 1;'
            }, 100)
            isStarted = false
        } else {
            isStartedNew = false
        }

        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
            'display: none; opacity: 0;'
        }, 300)

        document.title = 'Tente iniciar novamente'

        resetLoadingBar()
    } catch (error) {
        document.title = 'ERROR'
        console.error(`> ⚠️ ERROR counterExceeds: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> counterExceeds: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}

async function generateQrCode(QR_Counter, Clientt_) {
    if (isQrOff) {
        displayOnConsole(`>  ℹ️ <strong>${Clientt_}</strong> not Ready.`, setLogError)
        return
    }
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        isQrOff = true

        document.title = `QR-Code(${QR_Counter}) ${Clientt_}`

        const mainContent = document.querySelector('#innerContent')
        mainContent.style.cssText =
            'display: inline-block;'

        if (!isFromNew) {
            let buttonStart = document.querySelector('#start')
            buttonStart.style.cssText =
                'display: none; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                'display: none; opacity: 0;'
            }, 300)
        }
        
        const status = document.querySelector('#status')
        const codeQr = document.querySelector('#qrCode')

        status.innerHTML = `<strong>${Clientt_}</strong> Gerando <strong>Qr-Code</strong>...`
        displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>${Clientt_}</strong> Gerando <strong>Qr-Code</strong>...`)
        
        axios.get('/client/qr-code')
        const { qrString, Is_Conected } = response.data
        if (Is_Conected) {
            setTimeout(function() {
                status.innerHTML = `<strong>${Clientt_}</strong> ja <strong>conectado</strong>!`
                displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>${Clientt_}</strong> ja <strong>conectado</strong>!`)
            }, 100)
            
            document.querySelector('#qrCode').innerText = ''

            codeQr.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                codeQr.style.cssText =
                    'display: none; opacity: 0;'
            }, 300)

            resetLoadingBar()
        } else {
            status.innerHTML = `↓↓ <strong>${Clientt_}</strong> tente se <strong>Conectar</strong> pela <strong>${QR_Counter}</strong>º ao <strong>WhatsApp Web</strong> pelo <strong>QR-Code</strong> abaixo ↓↓`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i>↓↓ <strong>${Clientt_}</strong> tente se <strong>Conectar</strong> pela <strong>${QR_Counter}</strong>º ao <strong>WhatsApp Web</strong> pelo <strong>QR-Code</strong> abaixo ↓↓`)
            
            codeQr.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                codeQr.style.cssText =
                    'display: inline-block; opacity: 1;'
            }, 100)
                
            document.querySelector('#qrCode').innerText = qrString
            //displayOnConsole(qrString)
            
            resetLoadingBar()
        }
    } catch (error) {
        const status = document.querySelector('#status')
        console.error(`> ⚠️ ERROR generateQrCode ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> generateQrCode <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        document.title = 'ERROR'
        status.innerHTML = `<i><strong>ERROR</strong></i> Gerando <strong>Qr-Code</strong> <strong>${Clientt_}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> Gerando <strong>Qr-Code</strong> <strong>${Clientt_}</strong>!`)
        if (!isFromNew) {
            let buttonStart = document.querySelector('#start')
            buttonStart.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                    'display: inline-block; opacity: 1;'
            }, 100)
            isStarted = false
        }
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
                'display: none; opacity: 0;'
        }, 300)
        resetLoadingBar() 
    }
}

async function insertClient_Front(Clientt_, isActive) {
    if (!Client_NotReady) {
        displayOnConsole(`>  ℹ️  <strong>${Clientt_}</strong> not Ready.`, setLogError)
        return
    }
    try {
        Client_NotReady = false

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        //ainda a testar o insert de posicao dinamica exponencial
        const ClientsDiv = document.querySelector('#Clients_')
        const allConteinerClients_ = ClientsDiv.querySelectorAll('.divClients_')
        let arrayIdNameClients_ = []
        allConteinerClients_.forEach((divElement) => {
            const Client_Id = Number(divElement.id.match(/\d+/g))
            const Client_Name = divElement.id.split('_').slice(2, -1).join('_')
            arrayIdNameClients_.push({ Client_Id, Client_Name })
        })
        let idNumberClient_DivAdjacent = null
        let isFirstUndefined = null
        if (arrayIdNameClients_.length > 0) {
            const response = await axios.get('/client/insert_exponecial_position_Client_', { params: { arrayIdNameClients_ } })
            idNumberClient_DivAdjacent = response.data.idnumberclient_divadjacent
            isFirstUndefined = response.data.isfirstundefined
        }
    
        const divAdjacent = document.querySelector(`#${idNumberClient_DivAdjacent}`)
        if (isActive) {
            const clientHTMlDestroy = `\n<div class="divClients_" id="${Clientt_}">\n<abbr title="Client_ ${Clientt_}" id="abbrselect-${Clientt_}"><button class="Clients_" id="select-${Clientt_}" onclick="selectClient_('${Clientt_}')">${Clientt_}</button></abbr><abbr title="Desligar ${Clientt_}" id="abbrDestroy-${Clientt_}"><button class="Clients_Destroy" id="Destroy-${Clientt_}" onclick="DestroyClient_('${Clientt_}')"><</button></abbr><abbr title="Apagar ${Clientt_}" id="abbrerase-${Clientt_}"><button class="Clients_Erase" id="erase-${Clientt_}" onclick="eraseClient_('${Clientt_}')"><</button></abbr>\n</div>\n`
            if (divAdjacent) {
                if (isFirstUndefined) {
                    divAdjacent.insertAdjacentHTML('beforebegin', clientHTMlDestroy)
                } else {
                    divAdjacent.insertAdjacentHTML('afterend', clientHTMlDestroy)
                }
            } else {
                ClientsDiv.innerHTML += clientHTMlDestroy
            }
        } else {
            const clientHTMLReinitialize = `\n<div class="divClients_" id="${Clientt_}">\n<abbr title="Client_ ${Clientt_}" id="abbrselect-${Clientt_}"><button class="Clients_" id="select-${Clientt_}" onclick="selectClient_('${Clientt_}')">${Clientt_}</button></abbr><abbr title="Ligar ${Clientt_}" id="abbrReinitialize-${Clientt_}"><button class="Clients_Reinitialize" id="Reinitialize-${Clientt_}" onclick="ReinitializeClient_('${Clientt_}')"><</button></abbr><abbr title="Apagar ${Clientt_}" id="abbrerase-${Clientt_}"><button class="Clients_Erase" id="erase-${Clientt_}" onclick="eraseClient_('${Clientt_}')"><</button></abbr>\n</div>\n`
            if (divAdjacent) {
                if (isFirstUndefined) {
                    console.log('toto2')
                    divAdjacent.insertAdjacentHTML('beforebegin', clientHTMLReinitialize)
                } else {
                    console.log('toto22')
                    divAdjacent.insertAdjacentHTML('afterend', clientHTMLReinitialize)
                }
            } else {
                console.log('toto33')
                ClientsDiv.innerHTML += clientHTMLReinitialize
            }
        }

        const divClientt_ = document.querySelector(`#${Clientt_}`)
        divClientt_.style.cssText =
            'border-top: 5px solid var(--colorBlack); border-bottom: 5px solid var(--colorBlack); transition: var(--configTrasition03s);'

        resetLoadingBar()
    } catch (error) {
        console.error(`> ⚠️ ERROR insertClient_Front ${Clientt_}: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> insertClient_Front <strong>${Clientt_}</strong>: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}
async function newClients() {
    if (isStartedNew) {
        displayOnConsole('>  ℹ️ <strong>newClients</strong> not Ready.', setLogError)
        return
    }
    try {
        isStartedNew = true

        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        let userConfirmation = confirm('Tem certeza de que deseja criar um novo Client_?')
        if (!userConfirmation) {
            resetLoadingBar()

            isStartedNew = false

            return
        }

        isFromNew = true

        document.title = 'Criando novo Client'

        await axios.post('/client/new')

        resetLoadingBar()
    } catch (error) {
        document.title = 'ERROR'
        console.error(`> ⚠️ ERROR newClients: ${error}`)
        displayOnConsole(`> ⚠️ <i><strong>ERROR</strong></i> newClients: ${error.message}`, setLogError)
        resetLoadingBar()
    }
}

async function startBot() {
    if (isStarted) {
        displayOnConsole(`> ⚠️ <strong>${nameApp}</strong> ja esta <strong>Iniciado</strong>.`, setLogError)
        return        
    }
    try {
        let barL = document.querySelector('#barLoading')
        barL.style.cssText =
            'width: 100vw; visibility: visible;'

        isStarted = true

        if (isDisconected) {
            reconnectWebSocket()
        }

        document.title = `Iniciando ${nameApp}`

        const mainContent = document.querySelector('#innerContent')
        mainContent.style.cssText =
            'display: inline-block;'

        let buttonStart = document.querySelector('#start')
        buttonStart.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            buttonStart.style.cssText =
                'display: none; opacity: 0;'
        }, 300)
        
        const status = document.querySelector('#status')
        status.innerHTML = `<strong>Iniciando</strong>...`
        displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Iniciando</strong>...`)
        
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
                'display: none; opacity: 0;'
        }, 300)
        const response = await axios.get('/clients/start')
        const Sucess = response.data.sucess
        if (Sucess) {
            document.title = `Iniciou o ${nameApp || 'BOT'} Corretamente`
            status.innerHTML = `<strong>Iniciou</strong> o ${nameApp || 'BOT'} <strong>Corretamente</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><strong>Iniciou</strong> o ${nameApp || 'BOT'} <strong>Corretamente</strong>!`)

            resetLoadingBar()
        } else {
            buttonStart.style.cssText =
                'display: inline-block; opacity: 0;'
            setTimeout(function() {
                buttonStart.style.cssText =
                    'display: inline-block; opacity: 1;'
            }, 100)

            document.title = 'ERROR'
            status.innerHTML = `<i><strong>ERROR</strong></i> ao iniciar o <strong>${nameApp || 'BOT'}</strong>!`
            displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> ao iniciar o <strong>${nameApp || 'BOT'}</strong>!`)
            
            isStarted = false

            resetLoadingBar()
        }
    } catch (error) {
        const status = document.querySelector('#status')
        console.error(`> ⚠️ ERROR startBot: ${error}`)
        displayOnConsole(`> ⚠️ ERROR startBot: ${error.message}`, setLogError)
        document.title = 'ERROR'
        status.innerHTML = `<i><strong>ERROR</strong></i> iniciando <strong>${nameApp || 'BOT'}</strong>!`
        displayOnConsole(`>  ℹ️  <i><strong><span class="sobTextColor">(status)</span></strong></i><i><strong>ERROR</strong></i> iniciando <strong>${nameApp || 'BOT'}</strong>!`)
        let buttonStart = document.querySelector('#start')
        buttonStart.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            buttonStart.style.cssText =
                'display: inline-block; opacity: 1;'
        }, 100)
        isStarted = false
        document.querySelector('#qrCode').innerText = ''
        const codeQr = document.querySelector('#qrCode')
        codeQr.style.cssText =
            'display: inline-block; opacity: 0;'
        setTimeout(function() {
            codeQr.style.cssText =
                'display: none; opacity: 0;'
        }, 300)
        
        resetLoadingBar()
    }
}

//tarefas bot frontend 
//em desenvolvimento...
    //na pagina separar por secoes, secao do qr code do start da lista e do funil e ser possivel mover entre elas mudar as posicao as ordem, e fazer algo igual ao funil ne, por mouse mesmo selecionando e segurnado, e a ordem que ficar ser salvo e quando voltar da load em tudo, talves pra fazer isso implementar um sistema que inves de display e opacity que seja automatico com javacript colado as funcoes na pagina, pode melhora a seguranca e tals ne
    //desenvolver o desenvolvimento de funils padroes de msg automaticas para o bot e implantar front end, principalmente front end so vai ser possivel mexer com isso la
        //filetypes, dps que for selecionado ele muda o design pra outro, e se for um audio ele da opcao e o tempo de delay e tals usa a mesma logica do delay padrao por MSG pro staterecording, e para apagar tem que deselecionar o arquivo ent fazer um esquema de design que o botao que apagar primeiro deseleciona e dps libera pra apagar, ma so substitui por outro botao n preccisa criar uma loucura na funcao de apagar so pra isso, e em questao de legendas pra documentos fotos videos ter tipo um textarea imbutido ali pra isso
        //texareas, tem uma opcao pro typing la e usa o delay padrao MSG e tals logica, e ter modos de tamanhos especificos selecionaveis da area de texto iguais do chat do whatsapp balao e tals, 
        //delay, meio que ja ta feito sla
        //counter, um sistemas semelhante ao delay pra pegar as info valor, e um sistemas de da pra selecionar outros card pra entra dentro do type counter ne pra ambos os caminhos e os que n tiver dps de acabar tudo vai continuar rodar normal, agora um sistemas de couter dentro do outro ja n sei como fazeria talves um igual? ai teria q ter um sistema de acumulo e ordem de selecoes counter kakakakaak meu deus du ceu
        //em cada card ter um botao pra apagar o proprio
        //implementar toda a logica tudo e tals disso tudo quando acabar o design e planejamento da logica do funil
        //arrumar a barra horizontal dos atraso-...
        //adicionar modo escuro e claro e cor do balao verde o whatsapp nos textarea funcoes opcoes
        //arrumar meio de onoff pq com uma varavel true false n vai dar pra todos tem comflito usando
        //alguma forma de junta o type file selected com o select dinamicamente num so inves de separado por display none iiii foda com as permisao tbm
        //atribuir o sistema do newTypeMSGShown() pra todos os toggle de tudo mui mior nue alem de que vai fazer ser possivel tudo as funcoes dos types e zas, alem de que agora pode ser possivel a questao que deixar tudo automatico questao de cenarios e tals sem precisar se preocupar com todos ai com isso seria automatico as reacoes a os cenarios e zas
    //faze o REST se der o ful mas n da ne, ver as funcoes do front e ver se precisa de uma rota so pra aquilo, padroniza os nomes dos callback websocket igual as rota, separa as rota e websocket do server, e os models client chatdada wweb.jss do app sla ainda como vai ser o app, ver os sistemas de camadas de tudo como fazer o certo ou se o gabiarra que e o jeito que ta ja serve sla 

//a desenvolver...
    //?//melhoras o tempo e utilizacao dos status multi client e mais?
    //arrumar meios de as coisas serem automaticas funcoes acionarem de acordo com certar coisas inves de prever todo cenario possivel em varias funcoes
    //talves algum dia fazer ums sistema frontend de commands igual no backend com requesicao http usando as funcoes padrao de funcao do backend e tals
    //?//arrumar meios de n precisar dessas variaveis permanentes, ou pelo menos diminuir muito?
    //?//melhorar o problema de de vez em quando o a barra de loading do start n funciona direito?
    //coisa de design... o border bottom do #divNewClient n ta aparecendo seila
    //quando ta fechado o server ao reconectar o estilo do botao WS some, arruma pra n sumir e so fazer oq tem que fazer que e deixa vermelhor ou laranja sla pisca e tals ne po
    //se tiver algum pau com estilos ver getComputedStyle computedStyle.(propriedade) trocar pra esse modo modelo sla inves de (nome).style.(propriedade)