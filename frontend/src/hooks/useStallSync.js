import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useStallSync(eventId, onUpdate) {
    useEffect(() => {
        if (!eventId) return;

        let client;
        try {
            const socket = new SockJS('/ws');
            client = new Client({
                webSocketFactory: () => socket,
                debug: () => {}, // quiet when WS fails (e.g. 403)
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                client.subscribe(`/topic/stalls/${eventId}`, (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body);
                            onUpdate(data.bookedStallIds || []);
                        } catch (_) {}
                    }
                });
            };

            client.onStompError = () => {};
            client.activate();
        } catch (_) {
            // SockJS or STOMP not available; booking still works without live sync
        }

        return () => {
            if (client) client.deactivate();
        };
    }, [eventId, onUpdate]);
}
