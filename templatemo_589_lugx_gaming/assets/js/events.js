(function () {
    const CLICKHOUSE_API_URL = '/analytics';

    const sessionId = '0';
    const eventId = '0';
    const gameId = '1'; // set this dynamically if needed
    const startTime = Date.now();
    let maxScroll = 0;

    function getFormattedTimestamp() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');

        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
           `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    // Capture scroll depth
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY + window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight;
        const depth = Math.min(100, Math.round((scrolled / totalHeight) * 100));
        maxScroll = Math.max(maxScroll, depth);

        const scrollEvent = {
            event_id: eventId,
            session_id: sessionId,
            event_type: 'scroll',
            event_timestamp: getFormattedTimestamp(),
            game_id: gameId,
            scroll_depth: maxScroll,
            time_on_page: Math.round((Date.now() - startTime) / 1000),
            session_duration: 0,
            click_target: ''
        };

        fetch(CLICKHOUSE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scrollEvent)
        }).catch((err) => {
            console.warn('Failed to post scroll event:', err);
        });
    });

    // Capture click events
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[id], [class], button, a') || e.target;
        const clickTarget = target.id || target.className || target.tagName;

        const clickEvent = {
            event_id: eventId,
            session_id: sessionId,
            event_type: 'click',
            event_timestamp: getFormattedTimestamp(),
            game_id: gameId,
            scroll_depth: maxScroll,
            time_on_page: Math.round((Date.now() - startTime) / 1000),
            session_duration: 0,
            click_target: clickTarget
        };

        fetch(CLICKHOUSE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clickEvent)
        }).catch((err) => {
            console.warn('Failed to post click event:', err);
        });
    });

    // Send initial page view event
    const pageViewEvent = {
        event_id: eventId,
        session_id: sessionId,
        event_type: 'page_view',
        event_timestamp: getFormattedTimestamp(),
        game_id: gameId,
        scroll_depth: 0,
        time_on_page: 0,
        session_duration: 0,
        click_target: ""
    };

    fetch(CLICKHOUSE_API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(pageViewEvent)
    }).catch((err) => {
        console.warn('Failed to post click event:', err);
    });

    // Capture session end on unload
    window.addEventListener('beforeunload', () => {
        const sessionEndEvent = {
            event_id: eventId,
            session_id: sessionId,
            event_type: 'session_end',
            event_timestamp: getFormattedTimestamp(),
            game_id: gameId,
            scroll_depth: maxScroll,
            time_on_page: Math.round((Date.now() - startTime) / 1000),
            session_duration: Math.round((Date.now() - startTime) / 1000),
            click_target: ""
        };

        fetch(CLICKHOUSE_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(pageViewEvent)
        }).catch((err) => {
            console.warn('Failed to post click event:', err);
        });
    });
})();