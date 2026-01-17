export const DEV = import.meta.env.DEV;

export const SOCKET_SERVER = DEV ? `ws://localhost:5000/server` : `wss://${location.host}/server`;