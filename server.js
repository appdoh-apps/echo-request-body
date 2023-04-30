import { handler } from './build/handler.js';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

// Add routes that lives separately from the SvelteKit app.
app.get('/ping', (req, res) => {
    res.end(JSON.stringify({ pong: true }));
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

app.get('/fetch', (req, res) => {
    res.end(JSON.stringify({
        data: cache
    }));
    cache = []
})

// Let SvelteKit handle everything else, including serving prerendered pagses and static assets.
app.use(handler);


app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});