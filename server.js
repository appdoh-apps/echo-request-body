import {handler} from './build/handler.js';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

// Add routes that lives separately from the SvelteKit app.
app.get('/ping', (req, res) => {
    res.end(JSON.stringify({pong: true}));
});

let cache = []
app.post('/', (req, res) => {
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    });
    req.on('end', () => {
        body = Buffer.concat(body).toString();
        res.end(body);

        console.log('Adding to cache...')
        const cacheItem = {
            data: body,
            timestamp: new Date()
        }
        cache.push(cacheItem)
        console.log('Added to cache with timestamp', cacheItem.timestamp)
    });
});

let sessionReads = {}
app.get('/fetch', (req, res) => {
    const sessionId = req.headers['session-id'];
    if (!sessionId) {
        res.end(JSON.stringify({error: true, message: 'Session ID is missing!'}));
        return
    }

    const sessions = Object.keys(sessionReads).length
    const lastReadTime = sessionReads[sessionId]
    if (!lastReadTime) {
        res.end(JSON.stringify({
            data: cache,
            sessions,
        }));
    } else {
        const delta = cache.filter(cacheItem => {
            const {timestamp} = cacheItem;
            return timestamp > lastReadTime;
        })
        res.end(JSON.stringify({
            data: delta,
            sessions,
        }));

        // Clean up any outdated cache after 15 seconds of staleness.
        cache = cache.filter(cacheItem => {
            const {timestamp} = cacheItem;
            return new Date() - timestamp < 15 * 1000;
        });
    }

    sessionReads[sessionId] = new Date();
    console.log('Updated timestamp for sessionId', sessionId, 'as', sessionReads[sessionId]);

    // Clean up any outdated sessions after 15 seconds of staleness.
    Object.keys(sessionReads).map(sessionId => {
        const timestamp = sessionReads[sessionId];
        if (new Date() - timestamp > 15 * 1000) {
            delete sessionReads[sessionId];
            console.log('Removed stale sessionId', sessionId, 'since', timestamp);
        }
    });
});

// Let SvelteKit handle everything else, including serving prerendered pagses and static assets.
app.use(handler);

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});