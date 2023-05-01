<script>
    import { onMount } from 'svelte';
    import {v4 as uuid} from 'uuid';

    let cacheItems = [];
    let lastRequestTime = new Date();
    let sessionId;
    let hostname = '';

    function pollServer() {
        fetch(`${hostname}fetch`, {
            headers: {
                'session-id': sessionId,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(resp => {
                const {data} = resp;
                if (data.length > 0) {
                    data.map(it => {
                        cacheItems.unshift(it)
                        console.log('cacheItem:', cacheItems);
                        cacheItems = cacheItems;

                    });
                }
                lastRequestTime = new Date();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    function begin() {
        console.log('+++ Begin +++');
        setInterval(pollServer, 5 * 1000);
    }

    onMount(() => {
        sessionId = uuid();
        hostname = window.location.href;
        begin();
    });
</script>

<div>
    <p>
        Simply send your REST request to: {hostname}
    </p>

    <p>
        You request body will be printed below.
    </p>

    <p>
        Data polled since {lastRequestTime.toLocaleString()}.
    </p>

    {#each cacheItems as item (item)}
        <div class="cache-item">
            <div class="timestamp">
                {new Date(item.timestamp).toLocaleString()}:
            </div>
            <div>
                {item.data}
            </div>
        </div>
    {/each}

</div>

<style>
    p {
        margin-bottom: 3px;
    }

    .cache-item {
        border-radius: 5px;
        background-color: white;
        padding: 5px;
        border: 1px solid white;
        margin-bottom: 5px;
    }

    .cache-item .timestamp {
        font-size: 0.95em;
        color: #333;
        margin-bottom: 5px;
    }
</style>