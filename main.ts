import { exists } from "https://deno.land/std/fs/exists.ts";

// ==================== CONFIGURATION ====================
// 5 different UUIDs supported simultaneously
const UUID1 = '117a2ca0-8d8f-4611-a174-5d950dba8669';
const UUID2 = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const UUID3 = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
const UUID4 = 'c3d4e5f6-a7b8-9012-cdef-345678901234';
const UUID5 = 'd4e5f6a7-b8c9-0123-defg-456789012345';
const OLD_UUID = 'e5185305-1984-4084-81e0-f77271159c62'; // Legacy support

const envUUID1 = Deno.env.get('UUID1') || UUID1;
const envUUID2 = Deno.env.get('UUID2') || UUID2;
const envUUID3 = Deno.env.get('UUID3') || UUID3;
const envUUID4 = Deno.env.get('UUID4') || UUID4;
const envUUID5 = Deno.env.get('UUID5') || UUID5;
const proxyIP = Deno.env.get('PROXYIP') || '';
const credit = Deno.env.get('CREDIT') || 'ZeroFreeVPN-by-မောင်သုည';

const CONFIG_FILE = 'config.json';
// Original working path
const WS_PATH = '/';

interface Config {
  uuid1?: string;
  uuid2?: string;
  uuid3?: string;
  uuid4?: string;
  uuid5?: string;
}

// ==================== UUID HELPERS ====================
async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

async function getUUIDsFromConfig(): Promise<{ uuid1: string; uuid2: string; uuid3: string; uuid4: string; uuid5: string } | undefined> {
  if (await fileExists(CONFIG_FILE)) {
    try {
      const configText = await Deno.readTextFile(CONFIG_FILE);
      const config: Config = JSON.parse(configText);
      if (config.uuid1 && config.uuid2 && config.uuid3 && config.uuid4 && config.uuid5 &&
          isValidUUID(config.uuid1) && isValidUUID(config.uuid2) && isValidUUID(config.uuid3) && 
          isValidUUID(config.uuid4) && isValidUUID(config.uuid5)) {
        console.log(`Loaded UUIDs from ${CONFIG_FILE}`);
        return { uuid1: config.uuid1, uuid2: config.uuid2, uuid3: config.uuid3, uuid4: config.uuid4, uuid5: config.uuid5 };
      }
    } catch (e) {
      console.warn(`Error reading ${CONFIG_FILE}:`, e.message);
    }
  }
  return undefined;
}

async function saveUUIDsToConfig(uuid1: string, uuid2: string, uuid3: string, uuid4: string, uuid5: string): Promise<void> {
  try {
    const config: Config = { uuid1, uuid2, uuid3, uuid4, uuid5 };
    await Deno.writeTextFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`Saved UUIDs to ${CONFIG_FILE}`);
  } catch (e) {
    console.error(`Failed to save UUIDs:`, e.message);
  }
}

let vlessID1: string, vlessID2: string, vlessID3: string, vlessID4: string, vlessID5: string;

const configUUIDs = await getUUIDsFromConfig();
if (configUUIDs) {
  vlessID1 = configUUIDs.uuid1;
  vlessID2 = configUUIDs.uuid2;
  vlessID3 = configUUIDs.uuid3;
  vlessID4 = configUUIDs.uuid4;
  vlessID5 = configUUIDs.uuid5;
} else {
  vlessID1 = envUUID1;
  vlessID2 = envUUID2;
  vlessID3 = envUUID3;
  vlessID4 = envUUID4;
  vlessID5 = envUUID5;
  await saveUUIDsToConfig(vlessID1, vlessID2, vlessID3, vlessID4, vlessID5);
}

// Validate all UUIDs
console.log(`Validating UUIDs...`);
console.log(`VLESS UUID 1: ${vlessID1} - ${isValidUUID(vlessID1) ? '✅ Valid' : '❌ Invalid'}`);
console.log(`VLESS UUID 2: ${vlessID2} - ${isValidUUID(vlessID2) ? '✅ Valid' : '❌ Invalid'}`);
console.log(`VLESS UUID 3: ${vlessID3} - ${isValidUUID(vlessID3) ? '✅ Valid' : '❌ Invalid'}`);
console.log(`VLESS UUID 4: ${vlessID4} - ${isValidUUID(vlessID4) ? '✅ Valid' : '❌ Invalid'}`);
console.log(`VLESS UUID 5: ${vlessID5} - ${isValidUUID(vlessID5) ? '✅ Valid' : '❌ Invalid'}`);

console.log(Deno.version);
console.log(`WebSocket Path: ${WS_PATH}`);

// Function to check if any UUID is valid for auth
function isUUIDValidForAuth(uuid: string): boolean {
  return uuid === vlessID1 || uuid === vlessID2 || uuid === vlessID3 || 
         uuid === vlessID4 || uuid === vlessID5 || uuid === OLD_UUID;
}

// ==================== SERVER ====================
Deno.serve(async (request: Request) => {
  const upgrade = request.headers.get('upgrade') || '';
  if (upgrade.toLowerCase() != 'websocket') {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/': {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno GCP VLESS - Zero Free VPN</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; text-align: center; }
        .container { background: white; padding: 40px 60px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 800px; width: 90%; }
        h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
        .badge { background: #764ba2; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        .btn-group { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin: 30px 0; }
        .btn { background: #667eea; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s; }
        .btn:hover { background: #764ba2; transform: translateY(-2px); }
        .footer { margin-top: 30px; font-size: 0.9em; color: #888; }
        a { color: #667eea; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Deno GCP VLESS 🚀</h1>
        <div class="badge">Powered by မောင်သုည</div>
        <p>High-speed, secure VPN proxy service with 5 simultaneous UUIDs.</p>
        <div class="btn-group">
            <a href="/vless" class="btn">🔷 VLESS Config (5 UUIDs)</a>
        </div>
        <div class="footer">
            📡 Support: <a href="https://t.me/Zero_Free_Vpn" target="_blank">@Zero_Free_Vpn</a><br>
            👤 Developer: မောင်သုည
        </div>
    </div>
</body>
</html>`;
        return new Response(htmlContent, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      
      case '/vless': {
        const hostName = url.hostname;
        const port = url.port || (url.protocol === 'https:' ? 443 : 80);
        
        // Generate 5 different VLESS configs with 5 different UUIDs
        const vlessLink1 = `vless://${vlessID1}@${hostName}:${port}?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${credit}-1`;
        const vlessLink2 = `vless://${vlessID2}@${hostName}:${port}?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${credit}-2`;
        const vlessLink3 = `vless://${vlessID3}@${hostName}:${port}?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${credit}-3`;
        const vlessLink4 = `vless://${vlessID4}@${hostName}:${port}?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${credit}-4`;
        const vlessLink5 = `vless://${vlessID5}@${hostName}:${port}?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${credit}-5`;
        
        // Clash config with all 5 UUIDs
        const clashConfig = `proxies:
  # ========== VLESS Config #1 ==========
  - name: "VLESS-1-${hostName}"
    type: vless
    server: ${hostName}
    port: ${port}
    uuid: ${vlessID1}
    network: ws
    tls: true
    udp: true
    sni: ${hostName}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${hostName}

  # ========== VLESS Config #2 ==========
  - name: "VLESS-2-${hostName}"
    type: vless
    server: ${hostName}
    port: ${port}
    uuid: ${vlessID2}
    network: ws
    tls: true
    udp: true
    sni: ${hostName}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${hostName}

  # ========== VLESS Config #3 ==========
  - name: "VLESS-3-${hostName}"
    type: vless
    server: ${hostName}
    port: ${port}
    uuid: ${vlessID3}
    network: ws
    tls: true
    udp: true
    sni: ${hostName}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${hostName}

  # ========== VLESS Config #4 ==========
  - name: "VLESS-4-${hostName}"
    type: vless
    server: ${hostName}
    port: ${port}
    uuid: ${vlessID4}
    network: ws
    tls: true
    udp: true
    sni: ${hostName}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${hostName}

  # ========== VLESS Config #5 ==========
  - name: "VLESS-5-${hostName}"
    type: vless
    server: ${hostName}
    port: ${port}
    uuid: ${vlessID5}
    network: ws
    tls: true
    udp: true
    sni: ${hostName}
    client-fingerprint: chrome
    ws-opts:
      path: "/?ed=2048"
      headers:
        host: ${hostName}`;
        
        return new Response(generateConfigHTML(
          vlessLink1, vlessLink2, vlessLink3, vlessLink4, vlessLink5,
          clashConfig,
          vlessID1, vlessID2, vlessID3, vlessID4, vlessID5
        ), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      
      default:
        return new Response('Not found', { status: 404 });
    }
  } else {
    // Check if path matches (original path is / or /?ed=2048)
    const url = new URL(request.url);
    if (url.pathname !== '/') {
      return new Response('Not found', { status: 404 });
    }
    return await vlessOverWSHandler(request);
  }
});

function generateConfigHTML(
  link1: string, link2: string, link3: string, link4: string, link5: string,
  clashConfig: string,
  uuid1: string, uuid2: string, uuid3: string, uuid4: string, uuid5: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VLESS Configs - Deno GCP VLESS</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; margin: 0; }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        h1 { color: #2c3e50; margin-top: 0; }
        .config-box { background: #1e1e2e; color: #50fa7b; padding: 20px; border-radius: 8px; font-family: monospace; word-break: break-all; white-space: pre-wrap; font-size: 14px; }
        .btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 10px 5px 0 0; font-size: 14px; }
        .btn:hover { background: #764ba2; }
        .back-btn { background: #6c757d; text-decoration: none; display: inline-block; }
        .back-btn:hover { background: #5a6268; }
        .footer { text-align: center; color: white; margin-top: 20px; }
        a { color: white; }
        .config-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f9f9f9; }
        .config-title { font-size: 1.2em; font-weight: bold; color: #667eea; margin-bottom: 15px; border-left: 4px solid #667eea; padding-left: 15px; }
        .uuid-badge { font-family: monospace; background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>🚀 Deno GCP VLESS 🚀</h1>
            <p>Developer: <strong>မောင်သုည</strong> | Support: <strong>@Zero_Free_Vpn</strong></p>
            <p>🌐 WebSocket Path: <code>/?ed=2048</code></p>
            <p>✅ All 5 UUIDs work simultaneously. Try each until one works for you.</p>
            
            <!-- Config 1 -->
            <div class="config-card">
                <div class="config-title">🔷 VLESS Config #1 <span class="uuid-badge">UUID: ${uuid1.substring(0, 8)}...</span></div>
                <div class="config-box" id="linkConfig1">${link1}</div>
                <button class="btn" onclick="copyToClipboard('linkConfig1')">📋 Copy Link #1</button>
            </div>
            
            <!-- Config 2 -->
            <div class="config-card">
                <div class="config-title">🔷 VLESS Config #2 <span class="uuid-badge">UUID: ${uuid2.substring(0, 8)}...</span></div>
                <div class="config-box" id="linkConfig2">${link2}</div>
                <button class="btn" onclick="copyToClipboard('linkConfig2')">📋 Copy Link #2</button>
            </div>
            
            <!-- Config 3 -->
            <div class="config-card">
                <div class="config-title">🔷 VLESS Config #3 <span class="uuid-badge">UUID: ${uuid3.substring(0, 8)}...</span></div>
                <div class="config-box" id="linkConfig3">${link3}</div>
                <button class="btn" onclick="copyToClipboard('linkConfig3')">📋 Copy Link #3</button>
            </div>
            
            <!-- Config 4 -->
            <div class="config-card">
                <div class="config-title">🔷 VLESS Config #4 <span class="uuid-badge">UUID: ${uuid4.substring(0, 8)}...</span></div>
                <div class="config-box" id="linkConfig4">${link4}</div>
                <button class="btn" onclick="copyToClipboard('linkConfig4')">📋 Copy Link #4</button>
            </div>
            
            <!-- Config 5 -->
            <div class="config-card">
                <div class="config-title">🔷 VLESS Config #5 <span class="uuid-badge">UUID: ${uuid5.substring(0, 8)}...</span></div>
                <div class="config-box" id="linkConfig5">${link5}</div>
                <button class="btn" onclick="copyToClipboard('linkConfig5')">📋 Copy Link #5</button>
            </div>
            
            <!-- Full Clash Config with all UUIDs -->
            <div class="config-card">
                <div class="config-title">⚙️ Complete Clash Meta Config (All 5 UUIDs)</div>
                <div class="config-box" id="clashConfigFull" style="max-height: 500px; overflow-y: auto;">${clashConfig}</div>
                <button class="btn" onclick="copyToClipboard('clashConfigFull')">📋 Copy Full Clash Config</button>
            </div>
            
            <div style="margin-top: 20px;">
                <a href="/" class="btn back-btn">← Back to Home</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 0.9em;">💡 Note: All 5 UUIDs are supported simultaneously. If one doesn't work, try another.</p>
        </div>
        <div class="footer">Deno GCP VLESS - Created by မောင်သုည | Telegram: @Zero_Free_Vpn</div>
    </div>
    <script>
        function copyToClipboard(elementId) {
            const text = document.getElementById(elementId).innerText;
            navigator.clipboard.writeText(text).then(() => alert('Copied!')).catch(() => alert('Manual copy please'));
        }
    </script>
</body>
</html>`;
}

// ==================== VLESS WEBSOCKET HANDLER ====================
async function vlessOverWSHandler(request: Request) {
  const { socket, response } = Deno.upgradeWebSocket(request);
  let address = '';
  let portWithRandomLog = '';
  const log = (info: string, event = '') => {
    console.log(`[${address}:${portWithRandomLog}] ${info}`, event);
  };
  const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
  const readableWebSocketStream = makeReadableWebSocketStream(socket, earlyDataHeader, log);
  let remoteSocketWapper: any = { value: null };
  let udpStreamWrite: any = null;
  let isDns = false;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDns && udpStreamWrite) {
            return udpStreamWrite(chunk);
          }
          if (remoteSocketWapper.value) {
            const writer = remoteSocketWapper.value.writable.getWriter();
            await writer.write(new Uint8Array(chunk));
            writer.releaseLock();
            return;
          }

          const {
            hasError,
            message,
            portRemote = 443,
            addressRemote = '',
            rawDataIndex,
            vlessVersion = new Uint8Array([0, 0]),
            isUDP,
          } = processVlessHeader(chunk);
          address = addressRemote;
          portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? 'udp ' : 'tcp '}`;
          if (hasError) {
            throw new Error(message);
          }
          if (isUDP) {
            if (portRemote === 53) {
              isDns = true;
            } else {
              throw new Error('UDP proxy only enabled for DNS (port 53)');
            }
          }

          const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
          const rawClientData = chunk.slice(rawDataIndex);

          if (isDns) {
            console.log('DNS request detected');
            const { write } = await handleUDPOutBound(socket, vlessResponseHeader, log);
            udpStreamWrite = write;
            udpStreamWrite(rawClientData);
            return;
          }
          handleTCPOutBound(
            remoteSocketWapper,
            addressRemote,
            portRemote,
            rawClientData,
            socket,
            vlessResponseHeader,
            log
          );
        },
        close() { log(`Stream closed`); },
        abort(reason) { log(`Stream aborted`, JSON.stringify(reason)); },
      })
    )
    .catch((err) => { log('Stream error', err); });

  return response;
}

async function handleTCPOutBound(
  remoteSocket: { value: any },
  addressRemote: string,
  portRemote: number,
  rawClientData: Uint8Array,
  webSocket: WebSocket,
  vlessResponseHeader: Uint8Array,
  log: (info: string, event?: string) => void
) {
  async function connectAndWrite(address: string, port: number) {
    const tcpSocket = await Deno.connect({ port: port, hostname: address });
    remoteSocket.value = tcpSocket;
    log(`Connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(new Uint8Array(rawClientData));
    writer.releaseLock();
    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = await connectAndWrite(proxyIP || addressRemote, portRemote);
    remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);
  remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
}

function makeReadableWebSocketStream(webSocketServer: WebSocket, earlyDataHeader: string, log: (info: string, event?: string) => void) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener('message', (event) => {
        if (readableStreamCancel) return;
        controller.enqueue(event.data);
      });
      webSocketServer.addEventListener('close', () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) return;
        controller.close();
      });
      webSocketServer.addEventListener('error', (err) => {
        log('WebSocket error');
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) controller.error(error);
      else if (earlyData) controller.enqueue(earlyData);
    },
    cancel(reason) {
      if (readableStreamCancel) return;
      log(`ReadableStream cancelled: ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });
  return stream;
}

function processVlessHeader(vlessBuffer: ArrayBuffer) {
  if (vlessBuffer.byteLength < 24) {
    return { hasError: true, message: 'Invalid data length' };
  }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isValidUser = false;
  let isUDP = false;
  
  const receivedUUID = stringify(new Uint8Array(vlessBuffer.slice(1, 17)));
  
  // Check against all 5 valid UUIDs and legacy
  if (receivedUUID === vlessID1 || receivedUUID === vlessID2 || receivedUUID === vlessID3 || 
      receivedUUID === vlessID4 || receivedUUID === vlessID5 || receivedUUID === OLD_UUID) {
    isValidUser = true;
    console.log(`✅ Authenticated with UUID: ${receivedUUID}`);
  }
  
  if (!isValidUser) {
    console.log(`❌ Invalid UUID attempt: ${receivedUUID}`);
    return { hasError: true, message: 'Invalid user' };
  }

  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
  const command = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];

  if (command === 1) {
    // TCP
  } else if (command === 2) {
    isUDP = true;
  } else {
    return { hasError: true, message: `Command ${command} not supported (only TCP/UDP)` };
  }
  
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));
  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = '';
  
  switch (addressType) {
    case 1: // IPv4
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join('.');
      break;
    case 2: // Domain
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // IPv6
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6: string[] = [];
      for (let i = 0; i < 8; i++) ipv6.push(dataView.getUint16(i * 2).toString(16));
      addressValue = ipv6.join(':');
      break;
    default:
      return { hasError: true, message: `Invalid address type: ${addressType}` };
  }
  
  if (!addressValue) {
    return { hasError: true, message: `Empty address value` };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    vlessVersion: version,
    isUDP,
  };
}

async function remoteSocketToWS(remoteSocket: Deno.TcpConn, webSocket: WebSocket, vlessResponseHeader: Uint8Array, retry: (() => Promise<void>) | null, log: (info: string, event?: string) => void) {
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error('WebSocket not open');
          }
          if (vlessResponseHeader) {
            webSocket.send(new Uint8Array([...vlessResponseHeader, ...chunk]));
            vlessResponseHeader = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() { log(`Remote connection closed, hasData: ${hasIncomingData}`); },
        abort(reason) { console.error(`Remote abort:`, reason); },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS error:`, error.stack || error);
      safeCloseWebSocket(webSocket);
    });

  if (hasIncomingData === false && retry) {
    log(`Retrying connection`);
    retry();
  }
}

function base64ToArrayBuffer(base64Str: string) {
  if (!base64Str) return { error: null };
  try {
    base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error: error };
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;

function safeCloseWebSocket(socket: WebSocket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error('Close error:', error);
  }
}

const byteToHex: string[] = [];
for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));

function unsafeStringify(arr: Uint8Array, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' +
    byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' +
    byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' +
    byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' +
    byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

function stringify(arr: Uint8Array, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!isValidUUID(uuid)) throw TypeError('Invalid UUID');
  return uuid;
}

async function handleUDPOutBound(webSocket: WebSocket, vlessResponseHeader: Uint8Array, log: (info: string) => void) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength;) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
  });

  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          const resp = await fetch('https://1.1.1.1/dns-query', {
            method: 'POST',
            headers: { 'content-type': 'application/dns-message' },
            body: chunk,
          });
          const dnsQueryResult = await resp.arrayBuffer();
          const udpSize = dnsQueryResult.byteLength;
          const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            log(`DNS success, length: ${udpSize}`);
            if (isVlessHeaderSent) {
              webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            } else {
              webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              isVlessHeaderSent = true;
            }
          }
        },
      })
    )
    .catch((error) => { log('DNS error: ' + error); });

  const writer = transformStream.writable.getWriter();
  return { write(chunk: Uint8Array) { writer.write(chunk); } };
}
