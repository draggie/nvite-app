// @ts-check
// Load environment variables from .env file
require('dotenv').config()

const express = require('express')
const http = require('http')
const path = require('path')
var cookieParser = require('cookie-parser')
var cors = require('cors')
var fs = require('fs')
const { values } = require('lodash')
const { randomIntFromInterval } = require('./util')
const admin = require('firebase-admin')

// Initialize Firebase Admin
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL
console.log(FIREBASE_SERVICE_ACCOUNT, FIREBASE_DATABASE_URL)

if (!FIREBASE_SERVICE_ACCOUNT || !FIREBASE_DATABASE_URL) {
    throw new Error(
        'Missing Firebase configuration. Set either FIREBASE_SERVICE_ACCOUNT (JSON string) or FIREBASE_SERVICE_ACCOUNT_PATH (file path), and FIREBASE_DATABASE_URL',
    )
}

let serviceAccount
try {
    serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT)
    
    // Fix escaped newlines in private key (\\n -> \n)
    // This is needed when JSON is stored in .env files as a string
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_DATABASE_URL,
    })
    console.log('Firebase initialized successfully')
} catch (error) {
    throw new Error(`Failed to initialize Firebase: ${error.message}`)
}

const db = admin.database()

// Load mapped data from Firebase
async function loadMappedData() {
    try {
        const snapshot = await db.ref('/mapped').once('value')
        const data = snapshot.val()
        // Return array as-is, or empty array if null/undefined
        if (Array.isArray(data)) {
            return data
        }
        // If it's an object, convert to array format
        if (data && typeof data === 'object') {
            const maxKey = Math.max(...Object.keys(data).map(k => parseInt(k, 10)).filter(k => !isNaN(k)))
            const arr = new Array(maxKey + 1).fill(null)
            Object.keys(data).forEach(key => {
                const index = parseInt(key, 10)
                if (!isNaN(index) && data[key]) {
                    arr[index] = data[key]
                }
            })
            return arr
        }
        return []
    } catch (error) {
        console.error('Error loading mapped data from Firebase:', error.message)
        return []
    }
}

// Save mapped data to Firebase
async function saveMappedData(mapped) {
    try {
        await db.ref('/mapped').set(mapped)
        console.log('Saved mapped data to Firebase')
    } catch (error) {
        console.error('Error saving mapped data to Firebase:', error.message)
        throw error
    }
}

// Load list data from Firebase
async function loadListData() {
    try {
        const snapshot = await db.ref('/list').once('value')
        const data = snapshot.val()
        if (data && Array.isArray(data)) {
            return data
        }
        // Fallback: migrate from file if Firebase is empty
        const listFile = __dirname + '/public/list.json'
        if (fs.existsSync(listFile)) {
            const fileData = JSON.parse(fs.readFileSync(listFile, 'utf8'))
            await db.ref('/list').set(fileData)
            console.log('Migrated list.json to Firebase')
            return fileData
        }
        return []
    } catch (error) {
        console.error('Error loading list data from Firebase:', error.message)
        // Fallback to file
        try {
            const listFile = __dirname + '/public/list.json'
            if (fs.existsSync(listFile)) {
                return JSON.parse(fs.readFileSync(listFile, 'utf8'))
            }
        } catch (fileError) {
            console.error('Error reading list.json file:', fileError.message)
        }
        return []
    }
}

async function createApp() {
    // Create the express routes
    let app = express()
    // @ts-ignore - Express middleware works correctly at runtime
    app.use(cookieParser())
    app.use(cors())
    app.use(express.json())

    // Serve static files from public directory (for API JSON files)
    app.use('/api', express.static(path.join(__dirname, 'public')))

    // Serve React app static files from build directory
    // This must come before the catch-all route
    app.use(express.static(path.join(__dirname, 'public/build')))

    // API routes
    app.get('/list', async (_req, res, _next) => {
        try {
            const list = await loadListData()
            res.json(list)
        } catch (error) {
            console.error('Error in /list:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    })

    app.get('/test', (_req, res, _next) => {
        res.json({ status: 'OK' })
    })

    app.get('/picklist', async (_req, res, _next) => {
        try {
            const publicList = await loadListData()
            const mapped = await loadMappedData()

            // Filter out people who are already targets (mapped values)
            // Handle both array and object formats, filtering out null values
            const mappedValues = Array.isArray(mapped) 
                ? mapped.filter(x => x && x.id) 
                : values(mapped).filter(x => x && x.id)
            
            const filtered = publicList.filter(q => !mappedValues.some(x => x.id === q.id))
            res.status(200)
            res.json(filtered)
        } catch (error) {
            console.error('Error in /picklist:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    })

    app.post('/lottery/:id', async (req, res, _next) => {
        try {
            const publicList = await loadListData()
            console.log('Public list:', publicList)
            let mapped = await loadMappedData()
            console.log('Mapped:', mapped)

            const actor = publicList.find(q => q.id === Number.parseInt(req.params.id, 10))
            if (!actor) {
                res.status(404)
                res.end()
                return
            }
            
            // Check if actor already has a mapping (handle array format)
            // For arrays, check if the index exists and is not null
            const existingMapping = Array.isArray(mapped) 
                ? (mapped[actor.id] || null)
                : mapped[actor.id]
            
            if (existingMapping) {
                res.status(412).json({
                    error: 'Lottery already completed for this user',
                    result: existingMapping,
                })
                return
            }

            // Get all mapped targets, filtering out null values
            const mappedValues = Array.isArray(mapped) 
                ? mapped.filter(x => x && x.id) 
                : values(mapped).filter(x => x && x.id)

            const filtered = publicList
                .filter(q => !mappedValues.some(x => x.id === q.id))
                .filter(q => q.id !== actor.id)
                .filter(q => q.groupId !== actor.groupId)

            if (filtered.length === 0) {
                res.status(400).json({ error: 'No available targets' })
                return
            }

            const index = randomIntFromInterval(0, filtered.length - 1)
            console.log(actor, filtered[index], index, filtered)
            const target = filtered[index]
            
            // Ensure mapped is an array and has enough length
            if (!Array.isArray(mapped)) {
                mapped = []
            }
            // Extend array if needed to accommodate the actor id
            while (mapped.length <= actor.id) {
                mapped.push(null)
            }
            
            mapped[actor.id] = target
            await saveMappedData(mapped)
            res.status(200)
            res.json(mapped[actor.id])
            res.end()
        } catch (error) {
            console.error('Error in /lottery/:id:', error)
            res.status(500).json({ error: 'Internal server error', details: error.message })
        }
    })

    // Handle React Router - serve index.html for all non-API routes
    // This must be last, after static file serving
    // Express static middleware will handle static files before this route
    app.get('*', (req, res) => {
        // Don't serve index.html for API routes
        if (
            req.path.startsWith('/api/') ||
            req.path.startsWith('/list') ||
            req.path.startsWith('/picklist') ||
            req.path.startsWith('/lottery') ||
            req.path.startsWith('/test')
        ) {
            res.status(404).json({ error: 'Not found' })
            return
        }

        // Don't serve index.html for requests that look like static files
        // (Express static middleware should have handled these, but just in case)
        if (req.path.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i)) {
            res.status(404).send('File not found')
            return
        }

        // Serve React app for all other routes (SPA routing)
        const indexPath = path.join(__dirname, 'public/build/index.html')
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath)
        } else {
            res.status(500).send("Build files not found. Please run 'yarn build' first.")
        }
    })

    return app
}

async function main() {
    // Render will set process.env.PORT for you, but we use 3001 in development.
    const PORT = process.env.PORT || 3001
    const app = await createApp()
    
    // Create the HTTP server.
    let server = http.createServer(app)
    server.listen(PORT, function () {
        console.log(`Listening on port ${PORT}`)
    })
}

// Export app for testing
if (require.main !== module) {
    module.exports = { createApp, loadListData, loadMappedData, saveMappedData }
} else {
    main()
}
