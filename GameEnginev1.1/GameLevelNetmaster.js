// ══════════════════════════════════════════════════════
//  LEVEL DATA — all 6 Netmaster levels
// ══════════════════════════════════════════════════════
const NM_LEVELS = [
{
  name:"The Internet", desc:"Learn how data actually travels across networks. Every device, every packet.",
  tags:["Packet Switching","IP Addresses","IPv4 vs IPv6","Fault Tolerance","Routers"],
  nodes:[
    {id:"pc",     label:"Your PC",  x:0.06,y:0.50,color:"#00aaff"},
    {id:"switch", label:"Switch",   x:0.28,y:0.50,color:"#00ff88"},
    {id:"router", label:"Router",   x:0.55,y:0.28,color:"#ffaa00"},
    {id:"isp",    label:"ISP Node", x:0.78,y:0.50,color:"#aa00ff"},
    {id:"server", label:"Server",   x:0.94,y:0.50,color:"#ff5555"},
  ],
  edges:[["pc","switch"],["switch","router"],["router","isp"],["isp","server"],["switch","isp"]],
  path:["pc","switch","router","isp","server"],
  stops:{
    "switch":{
      teach:`A <b>switch</b> connects devices on the same local network (LAN). It learns each device's <b>MAC address</b> — a unique hardware ID burned into every network card — and sends frames only to the right port instead of broadcasting to everyone.<br><br><div class="mermaid">
graph LR
  PC1[PC A] --> SW((Switch))
  PC2[PC B] --> SW
  PR[Printer] --> SW
  SW -- direct --> PC2
  SW -. ignored .-> PC1
  SW -. ignored .-> PR
  style SW fill:#00aa44,stroke:#00ff88,color:#fff
  style PC2 fill:#003366,stroke:#0af,color:#fff
</div>
Unlike a hub (which shouts to everyone), a switch whispers directly to the right device.`,
      scenario:`Your packet needs to reach the printer at MAC address <code>AA:BB:CC:DD</code>. The switch has never seen this device before. What does it do?`,
      opts:["Flood the packet out all ports to find the device, then remember the MAC for next time","Drop the packet — unknown MACs are blocked","Ask the router for the MAC address","Broadcast a DNS request"],
      correct:0,
      bad:`Not quite. Switches <i>flood</i> unknown destinations — they send the frame out every port, then update their MAC table when the device replies. This is how they learn.`,
      good:`Exactly. This is called <b>flooding + learning</b>. The switch discovers MAC-to-port mappings dynamically and never has to flood that MAC again.`
    },
    "router":{
      teach:`A <b>router</b> connects different networks together using <b>IP addresses</b>. Every device on the internet has an IP — a numerical address like <code>142.250.80.46</code>.<br><br>IPv4 uses <b>32 bits</b> (about 4.3 billion addresses). We ran out, so IPv6 uses <b>128 bits</b> — enough for 340 undecillion devices.<br><br><div class="mermaid">
graph LR
  LAN[Your LAN] --> R((Router))
  R --> RT[Routing Table]
  RT --> NET[Internet]
  style R fill:#aa6600,stroke:#ffaa00,color:#fff
  style RT fill:#1a1a3a,stroke:#4466aa,color:#aaf
  style NET fill:#003344,stroke:#0af,color:#fff
</div>
The router reads the destination IP on every packet and consults its <b>routing table</b> to decide which direction to forward it.`,
      scenario:`Your packet's destination IP is <code>8.8.8.8</code> (Google's DNS server). Your router's table has two routes: via ISP-A (3 hops) and via ISP-B (7 hops). Which route does the router choose?`,
      opts:["ISP-A — routers pick the shortest/lowest-cost path","ISP-B — more hops means more reliable","Random — routers don't use routing tables","It broadcasts the packet on both paths"],
      correct:0,
      bad:`Routers use routing protocols (like OSPF or BGP) to find the best path — lowest cost, fewest hops, most reliable. They don't just guess or blast everything.`,
      good:`Right. Routing algorithms (Dijkstra's, BGP path selection) always find the optimal path. The internet routes around failures automatically.`
    },
    "isp":{
      teach:`Your <b>ISP (Internet Service Provider)</b> connects your local network to the global internet. The internet itself is built on <b>packet switching</b>: data is broken into small packets, each routed independently.<br><br>This is why the internet is <b>fault-tolerant</b> — if one router fails, packets just take a different route. No single point of failure can take down the whole network.<br><br><div class="mermaid">
graph LR
  A((Source)) --> B[Router B]
  B --> D[Router D] --> F((Dest))
  A --> C[Router C] --> E[Router E] --> F
  B -. fails .-> DEAD[ X ]
  style A fill:#004488,stroke:#0af,color:#fff
  style F fill:#004488,stroke:#0af,color:#fff
  style DEAD fill:#550000,stroke:#f00,color:#f88
  style B fill:#553300,stroke:#f80,color:#fff
</div>`,
      scenario:`A major undersea cable between the US and Europe is cut. What happens to internet traffic?`,
      opts:["Packets are automatically rerouted through other paths — traffic slows but continues","All US-Europe internet goes down immediately","Only HTTP traffic is affected; TCP traffic is rerouted","ISPs have to manually reprogram every router"],
      correct:0,
      bad:`This is the key insight about packet switching: because there's no single dedicated circuit, traffic can flow around failures. The internet was literally designed to survive nuclear attacks.`,
      good:`Correct. The internet's decentralized, redundant design means no single cable cut can stop traffic — it finds another path automatically.`
    }
  }
},
{
  name:"Protocols", desc:"Every conversation on the internet follows rules called protocols. Learn the ones that matter.",
  tags:["TCP vs UDP","HTTP/HTTPS","3-Way Handshake","Port Numbers","Protocol Selection","TLS Encryption"],
  nodes:[
    {id:"pc",     label:"Client",     x:0.06,y:0.50,color:"#00aaff"},
    {id:"tcp",    label:"TCP/UDP",    x:0.20,y:0.28,color:"#00ff88"},
    {id:"tcpq2",  label:"Handshake",  x:0.38,y:0.64,color:"#00ddaa"},
    {id:"tcpq3",  label:"Port/Proto", x:0.56,y:0.28,color:"#00ffcc"},
    {id:"http",   label:"HTTP",       x:0.70,y:0.64,color:"#ffaa00"},
    {id:"tls",    label:"TLS/HTTPS",  x:0.82,y:0.28,color:"#aa00ff"},
    {id:"server", label:"Web Server", x:0.94,y:0.50,color:"#ff5555"},
  ],
  edges:[["pc","tcp"],["tcp","tcpq2"],["tcpq2","tcpq3"],["tcpq3","http"],["http","tls"],["tls","server"],["tcp","tcpq3"]],
  path:["pc","tcp","tcpq2","tcpq3","http","tls","server"],
  stops:{
    "tcp":{
      teach:`<b>TCP</b> and <b>UDP</b> are the two main transport protocols:<br><br>
<b>TCP (Transmission Control Protocol)</b><br>
• Establishes a connection first: <code>SYN → SYN-ACK → ACK</code> (3-way handshake)<br>
• Guarantees every packet arrives, in order<br>
• Retransmits lost packets<br>
• Slower — but you get everything<br><br>
<b>UDP (User Datagram Protocol)</b><br>
• No connection, no handshake, no guarantees<br>
• Packets can be lost or arrive out of order<br>
• Much faster<br><br>
Rule of thumb: <b>TCP for correctness</b> (files, email, web), <b>UDP for speed</b> (live video, gaming, DNS).`,
      scenario:`You're building a video call app. A few dropped frames are acceptable, but lag makes it unusable. Which transport do you use?`,
      opts:["UDP — a dropped frame shows as a brief glitch, but low latency keeps the call smooth","TCP — we need every frame in perfect order","Both equally — it doesn't matter","HTTP — because it's a web app"],
      correct:0,
      bad:`TCP would actually hurt video calls. When a packet is lost, TCP waits and retransmits it — by the time it arrives, it's too old to use. You'd get a laggy, stuttery call. UDP drops it and moves on.`,
      good:`Exactly. Apps like Zoom, FaceTime, and Google Meet all use UDP under the hood. A brief glitch is better than a frozen screen.`
    },
    "tcpq2":{
      teach:`The <b>TCP 3-Way Handshake</b> establishes a reliable connection before any data flows:<br><br>
<div class="mermaid">
sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: SYN (seq=100)
  S-->>C: SYN-ACK (seq=200, ack=101)
  C->>S: ACK (ack=201)
  Note over C,S: Connection open — data can now flow
</div>
<b>What each step does:</b><br>
• <b>SYN</b> — "I want to connect; my sequence numbers start at 100"<br>
• <b>SYN-ACK</b> — "Accepted; my sequences start at 200, I confirm yours at 101"<br>
• <b>ACK</b> — "I confirm yours at 201 — we're in sync"<br><br>
Sequence numbers let the receiver reassemble out-of-order packets and detect lost ones.<br><br>
<b>UDP skips all of this</b> — it fires packets immediately with zero handshake. Faster, but no delivery guarantee and no ordering.`,
      scenario:`A client sends a SYN packet. The server replies with SYN-ACK. What is the <i>only</i> valid next step to complete the TCP connection?`,
      opts:["Client sends ACK — completing the 3-way handshake","Client sends another SYN to re-confirm","Server sends a second SYN-ACK","Data transfer begins immediately after the SYN-ACK"],
      correct:0,
      bad:`After SYN-ACK, the client must send an ACK to confirm receipt of the server's sequence number. Only then does the connection become "ESTABLISHED." Skipping ACK leaves the server in a SYN-RECEIVED state — half-open and unusable.`,
      good:`Correct. SYN→SYN-ACK→ACK is the complete handshake. Each side proves it can both send and receive before any data flows. This is what "connection-oriented" means.`
    },
    "tcpq3":{
      teach:`Choosing between TCP and UDP comes down to one question: <b>is stale data worse than no data?</b><br><br>
<table style="border-collapse:collapse;width:100%;font-size:13px;margin:8px 0">
<tr style="color:#0df;border-bottom:1px solid #048">
  <th style="padding:5px 8px;text-align:left">Application</th>
  <th style="padding:5px 8px">Protocol</th>
  <th style="padding:5px 8px;text-align:left">Reason</th>
</tr>
<tr style="border-bottom:1px solid #023"><td style="padding:4px 8px">Web (HTTP/S)</td><td style="padding:4px 8px;text-align:center;color:#0f9">TCP</td><td style="padding:4px 8px;color:#8bc">Page must arrive complete</td></tr>
<tr style="border-bottom:1px solid #023"><td style="padding:4px 8px">File Transfer</td><td style="padding:4px 8px;text-align:center;color:#0f9">TCP</td><td style="padding:4px 8px;color:#8bc">Missing bytes = corrupt file</td></tr>
<tr style="border-bottom:1px solid #023"><td style="padding:4px 8px">Email (SMTP)</td><td style="padding:4px 8px;text-align:center;color:#0f9">TCP</td><td style="padding:4px 8px;color:#8bc">Message must be intact</td></tr>
<tr style="border-bottom:1px solid #023"><td style="padding:4px 8px">DNS Lookup</td><td style="padding:4px 8px;text-align:center;color:#fa0">UDP</td><td style="padding:4px 8px;color:#8bc">One request/reply, speed beats reliability</td></tr>
<tr style="border-bottom:1px solid #023"><td style="padding:4px 8px">Live Video</td><td style="padding:4px 8px;text-align:center;color:#fa0">UDP</td><td style="padding:4px 8px;color:#8bc">Old frames are useless when they arrive late</td></tr>
<tr><td style="padding:4px 8px">Online Gaming</td><td style="padding:4px 8px;text-align:center;color:#fa0">UDP</td><td style="padding:4px 8px;color:#8bc">Low latency beats perfect delivery</td></tr>
</table>
<b>The retransmission trap:</b> TCP retransmits lost packets — but for real-time audio/video, a packet that arrives 300ms late is worthless. You'd rather skip it and move on.`,
      scenario:`Your multiplayer game sends 80 bytes of player position every 50ms. A packet is lost mid-game. Which protocol and reasoning is correct?`,
      opts:["UDP — the next position update arrives in 50ms anyway; TCP's retransmit would cause a visible lag spike","TCP — positions must arrive in order or the game breaks","UDP — because game servers can't use TCP","TCP — UDP doesn't support the port numbers games use"],
      correct:0,
      bad:`UDP is correct. Game position is refreshed constantly — a lost update is superseded by the next one 50ms later. TCP would stall the pipeline waiting for the retransmit, causing exactly the kind of lag that ruins online games.`,
      good:`Exactly. This is the "stale data" principle: when your data has a short shelf life, UDP's best-effort delivery is the right choice. The next update makes the lost one irrelevant.`
    },
    "http":{
      teach:`<b>HTTP (HyperText Transfer Protocol)</b> is how browsers and servers talk. It's a <b>request-response</b> protocol:<br><br>
<div class="mermaid">
sequenceDiagram
  participant B as Browser
  participant S as Server
  B->>S: GET /page HTTP/1.1
  S-->>B: 200 OK + HTML
  B->>S: GET /style.css
  S-->>B: 200 OK + CSS
</div>
<b>Status codes you need to know:</b><br>
• <code>200</code> OK — success<br>
• <code>301/302</code> — redirect<br>
• <code>404</code> Not Found — page doesn't exist<br>
• <code>500</code> — server crashed<br><br>
HTTP is <b>stateless</b> — the server forgets you after each request. Cookies and sessions are added on top to fake memory.<br><br>
Default port: <b>80</b> for HTTP, <b>443</b> for HTTPS.`,
      scenario:`You visit <code>http://bank.com/login</code> and enter your password. The site uses plain HTTP. What's the risk?`,
      opts:["Anyone on the same network can read your password — it's sent as plain text","The password is automatically hashed by HTTP","HTTP uses port 80 which is firewall-protected","The bank's server encrypts it before you send it"],
      correct:0,
      bad:`HTTP sends everything as readable text. On shared WiFi, anyone running a packet capture (like Wireshark) can read your credentials. This is why HTTPS exists.`,
      good:`Exactly why banks (and everyone) use HTTPS. Plain HTTP on a login form is a critical security vulnerability.`
    },
    "tls":{
      teach:`<b>HTTPS = HTTP + TLS</b> (Transport Layer Security). TLS encrypts everything so eavesdroppers see gibberish.<br><br>
<b>How TLS works (simplified):</b><br>
1. Server sends its <b>certificate</b> (signed by a trusted Certificate Authority)<br>
2. Your browser verifies the certificate is real (not a fake)<br>
3. They use <b>asymmetric encryption</b> (public/private keys) to agree on a secret<br>
4. All further data uses <b>symmetric encryption</b> (AES) — fast<br><br>
<div class="mermaid">
sequenceDiagram
  participant C as Client
  participant S as Server
  S-->>C: Certificate + public key
  C->>S: Session key (asymmetric)
  Note over C,S: Shared secret established
  C->>S: Data via AES symmetric
  S-->>C: Response via AES symmetric
</div>
Symmetric is used for data because it's 1000× faster than asymmetric.`,
      scenario:`A TLS certificate for <code>secure-bank.com</code> is signed by a Certificate Authority your browser trusts. The site loads with a padlock. Is this sufficient proof the site is legitimate?`,
      opts:["No — a certificate only proves the server owns that domain, not that the site is trustworthy. Phishing sites can get valid TLS certs too.","Yes — a padlock means the site is safe to use","Yes — Certificate Authorities verify the company's reputation","No — only government websites can get valid TLS certs"],
      correct:0,
      bad:`Many people assume the padlock means "safe". TLS only guarantees the connection is encrypted and you're talking to the real server at that domain — it says nothing about whether that domain is a scam.`,
      good:`Important distinction. TLS = encrypted connection. It doesn't mean the site behind it is honest. Phishing sites use HTTPS all the time.`
    }
  }
},
{
  name:"OSI vs TCP/IP Models", desc:"Master the blueprint of all networking. See how the 7-layer OSI model maps to the 5-layer TCP/IP stack — and why every packet is an onion.",
  tags:["OSI 7 Layers","TCP/IP 5 Layers","Encapsulation","PDUs","Layer Comparison","L2 vs L3"],
  nodes:[
    {id:"app",      label:"Application",  x:0.06,y:0.50,color:"#00aaff"},
    {id:"transport",label:"Transport",    x:0.28,y:0.28,color:"#00ff88"},
    {id:"network",  label:"Network",      x:0.52,y:0.62,color:"#ffaa00"},
    {id:"datalink", label:"Data Link",    x:0.76,y:0.28,color:"#aa00ff"},
    {id:"physical", label:"Physical",     x:0.94,y:0.50,color:"#ff5555"},
  ],
  edges:[["app","transport"],["transport","network"],["network","datalink"],["datalink","physical"],["transport","datalink"]],
  path:["app","transport","network","datalink","physical"],
  stops:{
    "transport":{
      teach:`The OSI model has <b>7 layers</b>; TCP/IP collapses those into <b>5 practical layers</b>:<br><br>
<div class="mermaid">
graph LR
  subgraph OSI["OSI — 7 layers"]
    O7[7 · Application]
    O6[6 · Presentation]
    O5[5 · Session]
    O4[4 · Transport]
    O3[3 · Network]
    O2[2 · Data Link]
    O1[1 · Physical]
  end
  subgraph TCP["TCP/IP — 5 layers"]
    T5[5 · Application]
    T4[4 · Transport]
    T3[3 · Internet]
    T2[2 · Data Link]
    T1[1 · Physical]
  end
  O7 --> T5
  O6 --> T5
  O5 --> T5
  O4 --> T4
  O3 --> T3
  O2 --> T2
  O1 --> T1
  style O7 fill:#003366,stroke:#0af,color:#cef
  style O6 fill:#003366,stroke:#0af,color:#cef
  style O5 fill:#003366,stroke:#0af,color:#cef
  style T5 fill:#001a33,stroke:#06f,color:#adf
</div>
OSI layers 5/6/7 (Session, Presentation, Application) are all merged into TCP/IP's <b>Application layer</b>. In practice your app handles encryption (L6), sessions (L5), and data (L7).<br><br>
<b>Key PDU names:</b> L4 = Segment (TCP) / Datagram (UDP) · L3 = Packet · L2 = Frame · L1 = Bits`,
      scenario:`A web browser sends an HTTPS request. At which OSI layer does TLS encryption/decryption happen?`,
      opts:["Layer 6 (Presentation) in OSI — maps to Application layer in TCP/IP; TLS handles encoding and encryption","Layer 4 (Transport) — TLS runs inside TCP","Layer 3 (Network) — encryption protects routing","Layer 2 (Data Link) — the WiFi card encrypts it"],
      correct:0,
      bad:`TLS is technically OSI Layer 6 (Presentation), which handles data format, encoding, and encryption. In TCP/IP that whole OSI top-3 block collapses into one Application layer. TLS runs above TCP (Layer 4), not inside it.`,
      good:`Right. OSI Layer 6 = encryption, encoding, compression. In TCP/IP it lives inside the Application layer. TLS sits above TCP but below HTTP — which is why changing HTTP to HTTPS doesn't change the port/transport, only the Presentation-layer wrapper.`
    },
    "network":{
      teach:`<b>Encapsulation</b>: as data travels <i>down</i> the stack, each layer wraps it with its own header:<br><br>
<div class="mermaid">
graph TD
  A["HTTP Data  ← Application layer"]
  B["TCP Header + HTTP Data  ← Transport (Segment)"]
  C["IP Header + TCP Segment  ← Network (Packet)"]
  D["ETH Header + IP Packet + FCS  ← Data Link (Frame)"]
  E["10101001...  ← Physical (Bits)"]
  A --> B --> C --> D --> E
  style A fill:#003355,stroke:#0af,color:#cef
  style B fill:#004400,stroke:#0f6,color:#cfc
  style C fill:#442200,stroke:#f80,color:#fdb
  style D fill:#330044,stroke:#a0f,color:#daf
  style E fill:#220000,stroke:#f44,color:#faa
</div>
At the receiver, each layer strips its header (<b>de-encapsulation</b>) going back up the stack. A router only reads up to Layer 3 (IP header) — it never sees your HTTP data.`,
      scenario:`Your browser sends 1 KB of JSON. By the time it leaves your network card, what is the <i>outermost-to-innermost</i> wrapping order?`,
      opts:["Ethernet Frame → IP Packet → TCP Segment → JSON data","IP Packet → Ethernet Frame → TCP Segment → data","TCP Segment → IP Packet → Ethernet Frame → data","HTTP header → Ethernet → IP → data"],
      correct:0,
      bad:`Encapsulation wraps from the bottom up. Ethernet (L2) is added last before hitting the wire, so it's the outermost layer. Then IP (L3), then TCP (L4), then your application data at the core.`,
      good:`Correct. Ethernet is outermost because it's added last (L2) before the physical medium. When a router receives this, it strips the Ethernet frame, reads the IP header to decide where to forward, then re-wraps in a brand new Ethernet frame for the next hop.`
    },
    "datalink":{
      teach:`The single biggest confusion in networking: <b>why do we have both IP addresses and MAC addresses?</b><br><br>
• <b>IP (Layer 3)</b> — end-to-end addressing. Your laptop's IP and the server's IP stay the same across every hop.<br>
• <b>MAC (Layer 2)</b> — hop-by-hop addressing. Changes at every router.<br><br>
<div class="mermaid">
graph LR
  PC["Laptop\nIP: 10.0.0.5\nMAC: AA:BB"] -- "Frame src=AA:BB\ndst=CC:DD" --> RT["Router\nMAC: CC:DD / EE:FF"]
  RT -- "Frame src=EE:FF\ndst=GG:HH" --> SV["Server\nIP: 93.1.2.3\nMAC: GG:HH"]
  PC -- "Packet src=10.0.0.5 dst=93.1.2.3" --> RT
  RT -- "Packet src=10.0.0.5 dst=93.1.2.3" --> SV
  style PC fill:#003355,stroke:#0af,color:#fff
  style RT fill:#442200,stroke:#f80,color:#fff
  style SV fill:#220033,stroke:#f5f,color:#fff
</div>
Switches (L2) forward based on MAC. Routers (L3) forward based on IP. This split is why you can move a server to a different datacenter (new MAC, new router) without changing its public IP.`,
      scenario:`A packet travels from your laptop (IP: 10.0.0.5) to a server (IP: 93.184.216.34) through 3 routers. How many distinct MAC address pairs are used for the full journey?`,
      opts:["4 pairs — one per link (laptop→R1, R1→R2, R2→R3, R3→server)","1 pair — MACs don't change in transit","2 pairs — one for each network boundary","3 pairs — one per router hop"],
      correct:0,
      bad:`Each link has its own MAC pair. With 3 routers there are 4 links: laptop→R1, R1→R2, R2→R3, R3→server. At every router, the Ethernet frame is stripped and rebuilt with new MACs for the next link. The IP src/dst never changes.`,
      good:`Exactly. N routers = N+1 links = N+1 MAC pairs. IP addresses are end-to-end (unchanged). MAC addresses are link-local (regenerated at every hop). This is the fundamental difference between Layer 2 and Layer 3.`
    }
  }
},
{
  name:"DNS & Routing", desc:"Every web address must be translated to an IP. Follow the lookup chain.",
  tags:["DNS Hierarchy","Recursive Lookup","Routing Tables","BGP","TTL"],
  nodes:[
    {id:"pc",      label:"Your PC",    x:0.06,y:0.50,color:"#00aaff"},
    {id:"recurse", label:"Resolver",   x:0.28,y:0.32,color:"#00ff88"},
    {id:"root",    label:"Root DNS",   x:0.52,y:0.55,color:"#ffaa00"},
    {id:"tld",     label:".com TLD",   x:0.74,y:0.30,color:"#aa00ff"},
    {id:"auth",    label:"Auth DNS",   x:0.94,y:0.55,color:"#ff5555"},
  ],
  edges:[["pc","recurse"],["recurse","root"],["root","tld"],["tld","auth"],["recurse","auth"]],
  path:["pc","recurse","root","tld","auth"],
  stops:{
    "recurse":{
      teach:`When you type <code>google.com</code>, your computer can't find the IP itself. It asks a <b>recursive resolver</b> (usually your ISP's or one like Google's <code>8.8.8.8</code>).<br><br>The resolver does all the legwork of the DNS lookup <i>for you</i> and caches the result for future requests.<br><br><b>DNS Cache:</b> Every DNS answer has a <b>TTL (Time To Live)</b> in seconds. The resolver stores the answer until TTL expires. This is why DNS changes take time to "propagate" worldwide — old caches must expire first.`,
      scenario:`You change your website's IP address in DNS. You set a TTL of 3600 (1 hour). A user visited your site 30 minutes ago. When will they see the new IP?`,
      opts:["In about 30 minutes — their resolver's cache will expire and re-query","Immediately — DNS changes are instant","Never — cached DNS can't be updated without a browser restart","In 3600 minutes (TTL is in minutes)"],
      correct:0,
      bad:`DNS changes are not instant. Each resolver caches the old answer for the full TTL. Since the user queried 30 minutes ago with a 3600-second TTL, their cache expires in ~30 more minutes.`,
      good:`Correct. This is why engineers set low TTLs (like 60s) before planned IP migrations, then raise them afterward.`
    },
    "root":{
      teach:`The <b>DNS hierarchy</b> has three levels:<br><br>
<div class="mermaid">
graph TD
  R[Root DNS]
  R --> COM[.com TLD]
  R --> ORG[.org TLD]
  R --> NET[.net TLD]
  COM --> GNS[google.com NS]
  COM --> ANS[amazon.com NS]
  GNS --> IP[142.250.80.46]
  style R fill:#444400,stroke:#ffaa00,color:#fff
  style IP fill:#004400,stroke:#0a4,color:#afa
  style GNS fill:#003355,stroke:#0af,color:#fff
</div>
There are <b>13 root server identifiers</b> (A–M), but hundreds of physical machines worldwide use <b>anycast routing</b> to respond from the nearest location.<br><br>
The root server doesn't know google.com's IP. It only knows: <i>"for .com domains, ask this TLD server."</i>`,
      scenario:`The resolver asks a root server: "What's the IP for maps.google.com?" What does the root server reply?`,
      opts:[`"I don't know the IP, but the .com TLD server is at 192.5.6.30 — ask them"`,`"The IP is 142.250.80.0"`,`"I don't know — try a different root server"`,`"maps.google.com doesn't exist"`],
      correct:0,
      bad:`Root servers only handle delegation — they direct you to the right TLD server. They don't store individual domain records.`,
      good:`Right. Each level of DNS only knows the next step. This delegation keeps the system scalable — no single server needs to know every domain.`
    },
    "tld":{
      teach:`The <b>TLD (Top-Level Domain) server</b> handles a specific extension: <code>.com</code>, <code>.org</code>, <code>.edu</code>, country codes like <code>.uk</code>.<br><br>
It doesn't know google.com's IP either — it knows which <b>authoritative nameserver</b> is responsible for google.com.<br><br>
<b>Authoritative nameserver</b> = the final source of truth. It holds the actual DNS records:<br>
• <b>A record</b> — domain → IPv4 address<br>
• <b>AAAA record</b> — domain → IPv6 address<br>
• <b>CNAME</b> — domain → another domain<br>
• <b>MX</b> — mail server for the domain`,
      scenario:`You want <code>blog.mysite.com</code> to point to the same server as <code>mysite.com</code> without duplicating the IP. Which DNS record type do you use?`,
      opts:["CNAME — an alias that points one domain to another domain","A record — enter the IP address directly","MX record — for pointing to mail servers","TXT record — for storing text data"],
      correct:0,
      bad:`A CNAME (Canonical Name) creates an alias. <code>blog.mysite.com CNAME mysite.com</code> means: look up mysite.com's IP and use that. If the IP changes, you only update one record.`,
      good:`Exactly. CNAMEs are aliases — great for subdomains because if the underlying IP changes, you only update the A record once.`
    }
  }
},
{
  name:"Bandwidth & Latency", desc:"Fast internet isn't just about speed. Learn what actually makes data transfer slow or fast.",
  tags:["Bandwidth","Latency","Throughput","CDNs","Compression"],
  nodes:[
    {id:"pc",      label:"Client",    x:0.06,y:0.50,color:"#00aaff"},
    {id:"modem",   label:"Modem",     x:0.28,y:0.34,color:"#00ff88"},
    {id:"backbone",label:"Backbone",  x:0.54,y:0.56,color:"#ffaa00"},
    {id:"cdn",     label:"CDN Edge",  x:0.76,y:0.30,color:"#aa00ff"},
    {id:"server",  label:"Origin",    x:0.94,y:0.55,color:"#ff5555"},
  ],
  edges:[["pc","modem"],["modem","backbone"],["backbone","cdn"],["cdn","server"],["modem","cdn"]],
  path:["pc","modem","backbone","cdn","server"],
  stops:{
    "modem":{
      teach:`Two things determine how fast internet feels:<br><br>
<b>Bandwidth</b> — the pipe's capacity. How much data <i>can</i> flow per second (Mbps, Gbps).<br>
<b>Latency</b> — the delay. How long it takes a single packet to travel (milliseconds).<br><br>
You can have a 1 Gbps connection with 300ms latency — downloads are fast but every click feels sluggish.<br><br>
<b>Remember:</b> 1 byte = 8 bits. A "100 Mbps" connection transfers 12.5 <i>megabytes</i> per second.<br><br>
<b>Throughput</b> is what you actually get — always less than bandwidth because of congestion, overhead, and distance.`,
      scenario:`You have 1 Gbps fiber bandwidth but your video game feels laggy. Your latency to the game server is 180ms. What's the actual problem?`,
      opts:["Latency — 180ms is high for gaming; bandwidth is irrelevant since game data is tiny","Bandwidth — 1 Gbps isn't enough for games","You need to upgrade to IPv6","The game server is using UDP which is slower"],
      correct:0,
      bad:`Game data packets are tiny — a few kilobytes. Even a 10 Mbps connection handles that easily. What matters for gaming is latency: the 180ms round-trip means 90ms before the server even hears your action.`,
      good:`Right. For interactive applications (gaming, video calls), latency matters more than bandwidth. High latency = delayed reactions regardless of connection speed.`
    },
    "backbone":{
      teach:`The internet <b>backbone</b> consists of high-speed fiber optic cables connecting cities, countries, and continents — including undersea cables spanning oceans.<br><br>
<b>Why satellite internet has high latency:</b><br>
Geostationary satellites orbit at 35,786 km. A signal travels up and back = 71,572 km ÷ speed of light ≈ <b>600ms round-trip</b>. Compare to fiber's ~5ms across a continent.<br><br>
<b>Compression</b> reduces data size before sending:<br>
• <b>Lossless</b> (ZIP, PNG) — perfect reconstruction, less compression<br>
• <b>Lossy</b> (JPEG, MP3, H.264) — discards some data, much smaller files`,
      scenario:`You're sending source code in a ZIP file. A coworker suggests converting it to JPEG to make it even smaller. Why is that wrong?`,
      opts:["JPEG is lossy — it permanently discards data. Source code would be corrupted and unusable.","JPEG is actually lossless for text files","ZIP and JPEG have the same compression ratio","JPEG only works for images under 10MB"],
      correct:0,
      bad:`JPEG is a lossy format that discards pixel data that's "hard to notice" in photos. Applied to source code, it would corrupt the file completely — a missing character in code is catastrophic.`,
      good:`Exactly. Lossy compression is great for media where small quality loss is imperceptible. For code, configs, or any binary data — always lossless.`
    },
    "cdn":{
      teach:`A <b>CDN (Content Delivery Network)</b> solves the latency problem by keeping copies of your content on servers physically close to users worldwide.<br><br>
<div class="mermaid">
graph TD
  U[User: Tokyo] -- 5ms --> E[CDN Edge: Tokyo]
  E -- cache hit --> U
  E -- cache miss --> O[Origin: New York]
  O -- 120ms --> E
  style E fill:#440088,stroke:#aa00ff,color:#fff
  style O fill:#880000,stroke:#ff5555,color:#fff
  style U fill:#003355,stroke:#0af,color:#fff
</div>
On a cache hit, the user gets the content in milliseconds. Only cache misses go all the way to the origin server.<br><br>
CDNs like Cloudflare, Akamai, and AWS CloudFront power most of the modern web.`,
      scenario:`You run a global website. Users in Australia complain of slow page loads — your server is in Germany. What's the best fix?`,
      opts:["Put your static assets (images, CSS, JS) on a CDN with an edge node in Australia","Upgrade your Germany server to 10 Gbps bandwidth","Use UDP instead of TCP for web requests","Increase the TTL on your DNS records"],
      correct:0,
      bad:`More bandwidth in Germany doesn't fix the physical distance — light still takes ~170ms to travel Germany→Australia. You need content physically closer to Australian users.`,
      good:`Correct. CDNs are the standard solution for global performance. The origin server handles dynamic requests; the CDN edge handles static content from nearby.`
    }
  }
},
{
  name:"Cybersecurity", desc:"Secure the packet's final journey. Threats are real — know how to stop them.",
  tags:["Encryption","Firewalls","Malware","Phishing","Net Neutrality"],
  nodes:[
    {id:"pc",       label:"Client",      x:0.06,y:0.50,color:"#00aaff"},
    {id:"firewall", label:"Firewall",    x:0.28,y:0.32,color:"#00ff88"},
    {id:"crypto",   label:"Encryption",  x:0.54,y:0.56,color:"#ffaa00"},
    {id:"threats",  label:"Threat Zone", x:0.76,y:0.30,color:"#aa00ff"},
    {id:"server",   label:"Secure Server",x:0.94,y:0.55,color:"#ff5555"},
  ],
  edges:[["pc","firewall"],["firewall","crypto"],["crypto","threats"],["threats","server"],["firewall","threats"]],
  path:["pc","firewall","crypto","threats","server"],
  stops:{
    "firewall":{
      teach:`A <b>firewall</b> is a security system that monitors and filters network traffic based on rules.<br><br>
Example rules:<br>
• Allow all outbound TCP on port 443 (HTTPS)<br>
• Block all inbound connections except port 80 and 443<br>
• Block all traffic from IP range 10.0.0.0/8<br><br>
<b>Types:</b><br>
• <b>Network firewall</b> — at the edge of a network, protects everything inside<br>
• <b>Host-based firewall</b> — software running on each machine (Windows Defender Firewall, etc.)<br>
• <b>Stateful firewall</b> — tracks connection state, allows responses to outbound requests`,
      scenario:`A web server should only accept HTTP (80) and HTTPS (443) traffic. An attacker tries to SSH into it (port 22). You have a firewall. What rule blocks this?`,
      opts:["Block all inbound traffic except ports 80 and 443","Block the attacker's specific IP address","Disable SSH on the server","Use UDP instead of TCP for SSH"],
      correct:0,
      bad:`Blocking one IP only stops that attacker temporarily — they can try another. A proper rule allows only the ports you need. Everything else is denied by default. This is called "default deny."`,
      good:`Right. "Default deny" is a core security principle — block everything, then explicitly allow what's needed. Much safer than trying to block known bad traffic.`
    },
    "crypto":{
      teach:`<b>Symmetric encryption</b>: same key encrypts and decrypts. Fast. Problem: how do you share the key securely?<br><br>
<b>Asymmetric encryption</b>: two mathematically linked keys — a <b>public key</b> (share freely) and a <b>private key</b> (never share).<br>
• Anyone encrypts with your public key<br>
• Only your private key decrypts it<br><br>
<b>How HTTPS uses both:</b><br>
1. Asymmetric crypto to safely exchange a shared secret<br>
2. Then symmetric (AES) for all actual data — 1000× faster<br><br>
<b>Hashing</b> (SHA-256): one-way function. Can't reverse it. Used to verify file integrity and store passwords.`,
      scenario:`Your company stores user passwords. An engineer suggests storing them as SHA-256 hashes instead of plain text. Is this secure enough?`,
      opts:["Better than plain text, but SHA-256 alone isn't enough — passwords need salting to prevent rainbow table attacks","Yes, SHA-256 hashes are completely unbreakable","No — you should store passwords symmetrically encrypted so you can decrypt them if needed","Yes, as long as you use SHA-256 and not MD5"],
      correct:0,
      bad:`Storing encrypted passwords is actually worse — if someone gets your encryption key, they decrypt all passwords. Hashing is correct, but without a unique random "salt" per password, attackers can use precomputed tables (rainbow tables) to crack common passwords.`,
      good:`Right. Modern password storage uses bcrypt, scrypt, or Argon2 — which are slow hashing functions with built-in salting. Fast hash functions like SHA-256 are designed for speed, which makes them bad for passwords.`
    },
    "threats":{
      teach:`<b>Common attack types:</b><br><br>
<b>Phishing</b> — fake emails/sites that trick you into entering credentials<br>
<b>Ransomware</b> — encrypts your files, demands payment for the key<br>
<b>DDoS</b> — floods a server with traffic from thousands of compromised machines (botnet)<br>
<b>Man-in-the-Middle (MitM)</b> — attacker intercepts communication between two parties<br><br>
<b>Net Neutrality</b> — the principle that ISPs must treat all internet traffic equally. Without it, your ISP could throttle Netflix while speeding up their own streaming service, or charge websites to be in a "fast lane."`,
      scenario:`You get an urgent email from "IT Support" asking you to click a link and re-enter your company password because "your account was compromised." The link goes to <code>company-support-portal.net</code>. What do you do?`,
      opts:["Don't click — verify by contacting IT directly through a known channel. This is a classic phishing attack.","Click and re-enter credentials — IT support needs access urgently","Forward the email to coworkers so they can also update their passwords","Reply asking for more information before entering credentials"],
      correct:0,
      bad:`Urgency is a phishing red flag. Attackers create pressure to make you act before thinking. IT departments should never ask for your password. Always verify through a trusted channel (call the IT helpdesk directly).`,
      good:`Correct. Phishing relies on urgency and authority. The tell: the domain <code>company-support-portal.net</code> is not your company's real domain. Always check URLs and verify unusual requests independently.`
    }
  }
},
{
  name:"Build the Network",
  type:"builder",
  desc:"Apply everything. Wire a complete network from scratch, configure every device correctly, then fire a live HTTPS packet to prove it works.",
  tags:["Topology","Wiring","TCP vs UDP","HTTPS","Firewall Rules","DNS Records","Routing"],
}
];

// ── Builder constants ──
const NM_PART_DEFS = {
  pc:      {label:'PC',         short:'PC',  color:'#00aaff', desc:'End-user device that sends requests'},
  switch:  {label:'Switch',     short:'SW',  color:'#00cc66', desc:'Connects LAN devices using MAC addresses. Auto-configures.'},
  router:  {label:'Router',     short:'RT',  color:'#ffaa00', desc:'Routes packets between networks via IP'},
  firewall:{label:'Firewall',   short:'FW',  color:'#ff6600', desc:'Filters inbound/outbound traffic by port & protocol'},
  dns:     {label:'DNS Server', short:'DNS', color:'#aa00ff', desc:'Resolves domain names to IP addresses'},
  server:  {label:'Web Server', short:'SRV', color:'#ff4455', desc:'Hosts the HTTPS web service'},
};
const NM_DEVICE_ORDER = ['pc','switch','router','firewall','dns','server'];
const NM_SLOTS = [
  {fx:.12,fy:.25},{fx:.37,fy:.25},{fx:.62,fy:.25},{fx:.87,fy:.25},
  {fx:.12,fy:.55},{fx:.37,fy:.55},{fx:.62,fy:.55},{fx:.87,fy:.55},
  {fx:.12,fy:.82},{fx:.37,fy:.82},{fx:.62,fy:.82},{fx:.87,fy:.82},
];
const NM_DEVICE_CONFIGS = {
  pc:[
    {key:'ip',        label:'IP Address',        opts:['192.168.1.10','10.0.0.50','172.16.1.5'],   correct:0, hint:"Use the LAN subnet 192.168.1.x"},
    {key:'gateway',   label:'Default Gateway',   opts:['192.168.1.1','192.168.1.10','10.0.0.1'],   correct:0, hint:"The router's LAN IP is the gateway"},
    {key:'dns_ip',    label:'DNS Server IP',      opts:['192.168.1.20','8.8.8.8','192.168.1.1'],    correct:0, hint:"Point to the local DNS server"},
    {key:'transport', label:'Transport Protocol', opts:['TCP','UDP'],                                correct:0, hint:"Web traffic needs reliable TCP"},
  ],
  switch:[],
  router:[
    {key:'routing',   label:'Routing Mode',       opts:['Disabled','Static Routes','OSPF Dynamic'], correct:1, hint:"Static routes work for this topology"},
    {key:'lan_ip',    label:'LAN Interface IP',   opts:['192.168.1.1','192.168.1.10','10.0.0.1'],   correct:0, hint:"Becomes the gateway for LAN devices"},
    {key:'wan_ip',    label:'WAN Interface IP',   opts:['10.0.0.1','192.168.1.1','172.16.0.1'],     correct:0, hint:"WAN side connects toward the firewall"},
  ],
  firewall:[
    {key:'p443', label:'Port 443 (HTTPS)', opts:['ALLOW','BLOCK'], correct:0, hint:"Allow HTTPS — this is your web traffic"},
    {key:'p80',  label:'Port 80 (HTTP)',   opts:['ALLOW','BLOCK'], correct:1, hint:"Block HTTP — force HTTPS only"},
    {key:'p22',  label:'Port 22 (SSH)',    opts:['ALLOW','BLOCK'], correct:1, hint:"Block external SSH"},
  ],
  dns:[
    {key:'record', label:'A Record',
     opts:['mycompany.com → 10.0.0.5','mycompany.com → 192.168.1.10','site.net → 10.0.0.5'],
     correct:0, hint:"Map the domain to the web server's IP"},
  ],
  server:[
    {key:'protocol',  label:'Protocol',         opts:['HTTP only','HTTPS only','HTTP + HTTPS'], correct:1, hint:"HTTPS only in production"},
    {key:'transport', label:'Transport Layer',  opts:['TCP','UDP'],                              correct:0, hint:"HTTP always uses TCP"},
    {key:'port',      label:'Listen Port',      opts:['80','443','8080'],                        correct:1, hint:"HTTPS standard port is 443"},
  ],
};
const NM_DW = 72, NM_DH = 40;
const NM_PORTS = [{dx:NM_DW/2,dy:0},{dx:-NM_DW/2,dy:0},{dx:0,dy:NM_DH/2},{dx:0,dy:-NM_DH/2}];

// ══════════════════════════════════════════════════════
//  GameLevelNetmaster — GameEngine v1.1 compatible level
// ══════════════════════════════════════════════════════
class GameLevelNetmaster {
    constructor(gameEnv) {
        this.gameEnv = gameEnv;
        this.classes = []; // No sprites — we draw everything ourselves
        this._cleanup = null;
        this._resizeHandler = null;
        this._windowGlobals = [];
    }

    initialize() {
        const gameEnv = this.gameEnv;
        const canvas = gameEnv.canvas;

        // Style canvas for embedded (non-fullscreen) use
        canvas.style.position = 'relative';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.borderRadius = '8px';
        canvas.style.background = '#030b18';
        canvas.style.display = 'block';

        const ctx = canvas.getContext('2d');

        // ── roundRect polyfill ──
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
                this.beginPath();this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.arcTo(x+w,y,x+w,y+r,r);
                this.lineTo(x+w,y+h-r);this.arcTo(x+w,y+h,x+w-r,y+h,r);
                this.lineTo(x+r,y+h);this.arcTo(x,y+h,x,y+h-r,r);
                this.lineTo(x,y+r);this.arcTo(x,y,x+r,y,r);this.closePath();
            };
        }

        // ── canvas size helpers ──
        function resizeCanvas() {
            const container = document.getElementById('gameContainer');
            const w = container ? container.clientWidth : (canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
            const h = Math.round(w * 0.44);
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            if (container) container.style.height = h + 'px';
        }
        function W() { return canvas.width; }
        function H() { return canvas.height; }

        // ── STATE ──
        let G = {};
        let tick = 0;

        // ── Builder state ──
        let B = {};
        let btick = 0;
        let _devCounter = 0;

        // ── OVERLAY HELPERS ──
        function setSiteNav(visible) {
            const selectors = ['header','nav','.site-header','.navbar','#navbar','[role="banner"]'];
            selectors.forEach(s => {
                document.querySelectorAll(s).forEach(el => { el.style.display = visible ? '' : 'none'; });
            });
        }
        function showOv(id) {
            document.querySelectorAll('.ov').forEach(e => e.classList.remove('on'));
            document.getElementById(id).classList.add('on');
            setSiteNav(false);
        }
        function hideOv(id) {
            document.getElementById(id).classList.remove('on');
            if (!document.querySelector('.ov.on')) setSiteNav(true);
        }

        // ── GAME FLOW ──
        function startSandbox() {
            G = { lv:5, lives:3, score:0, nodeIdx:0, phase:'teach',
                  activeStop:null, attempts:0, af:null, particles:[], t:0,
                  px:0, py:0, travelling:false };
            startBuilder();
        }

        function startGame() {
            G = { lv:0, lives:3, score:0, nodeIdx:0, phase:'teach',
                  activeStop:null, attempts:0, af:null, particles:[], t:0,
                  px:0, py:0, travelling:false };
            updateHUD();
            showLevelIntro();
        }

        function showLevelIntro() {
            const lv = NM_LEVELS[G.lv];
            document.getElementById('li-num').textContent = `Level ${G.lv+1} of ${NM_LEVELS.length} · ${lv.name}`;
            document.getElementById('li-name').textContent = lv.name;
            document.getElementById('li-desc').textContent = lv.desc;
            document.getElementById('li-tags').innerHTML = (lv.tags||[]).map(t=>`<span class="ttag">${t}</span>`).join('');
            document.getElementById('pb').style.width = (G.lv/NM_LEVELS.length*100)+'%';
            showOv('s-intro');
        }

        function startLevel() {
            hideOv('s-intro');
            const lv = NM_LEVELS[G.lv];
            if (lv.type === 'builder') { startBuilder(); return; }
            document.getElementById('hud').style.display = 'flex';
            resizeCanvas();
            G.nodeIdx = 0;
            G.travelling = false;
            const start = nodeById(lv.path[0]);
            G.px = start.x * W();
            G.py = start.y * H();
            if (G.af) cancelAnimationFrame(G.af);
            drawLoop();
            advancePath();
        }

        function nodeById(id) { return NM_LEVELS[G.lv].nodes.find(n => n.id === id); }

        function advancePath() {
            const lv = NM_LEVELS[G.lv];
            G.nodeIdx++;
            if (G.nodeIdx >= lv.path.length) { levelDone(); return; }
            const nid = lv.path[G.nodeIdx];
            const nd = nodeById(nid);
            travelTo(nd.x*W(), nd.y*H(), () => {
                document.getElementById('h-nd').textContent = nd.label;
                if (lv.stops[nid]) { setTimeout(() => openStop(nid), 300); }
                else { setTimeout(advancePath, 400); }
            });
        }

        function travelTo(tx, ty, done) {
            const sx = G.px, sy = G.py;
            G.travelling = true;
            let t = 0;
            function step() {
                t = Math.min(t + 0.02, 1);
                const e = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
                G.px = sx + (tx-sx)*e;
                G.py = sy + (ty-sy)*e;
                if (t >= 1) { G.travelling = false; G.px = tx; G.py = ty; done(); return; }
                G.af = requestAnimationFrame(step);
            }
            if (G.af) cancelAnimationFrame(G.af);
            G.af = requestAnimationFrame(step);
        }

        // ── STOP ──
        function openStop(nid) {
            G.activeStop = nid;
            G.attempts = 0;
            showTeach(nid);
        }

        function showTeach(nid) {
            const stop = NM_LEVELS[G.lv].stops[nid];
            const nd = nodeById(nid);
            G.phase = 'teach';
            document.getElementById('panel-phase').innerHTML = `<span style="color:#0af">📡 ARRIVING AT NODE</span>`;
            document.getElementById('panel-node').textContent = nd.label;
            document.getElementById('panel-title').textContent = '— How this works —';
            document.getElementById('teach-box').innerHTML = stop.teach;
            if (window.mermaid) mermaid.run({nodes: document.querySelectorAll('#teach-box .mermaid')});
            document.getElementById('scenario-box').style.display = 'none';
            document.getElementById('opts').innerHTML = '';
            document.getElementById('consequence').style.display = 'none';
            document.getElementById('retry-hint').style.display = 'none';
            const btn = document.getElementById('panel-btn');
            btn.textContent = 'Got it — show me the scenario →';
            btn.style.display = 'inline-block';
            document.getElementById('panel').style.display = 'block';
        }

        function showScenario(nid) {
            const stop = NM_LEVELS[G.lv].stops[nid];
            G.phase = 'scenario';
            document.getElementById('panel-phase').innerHTML = `<span style="color:#fa0">⚙ YOUR DECISION</span>`;
            document.getElementById('panel-title').textContent = '— What do you do? —';
            document.getElementById('scenario-box').innerHTML = stop.scenario;
            document.getElementById('scenario-box').style.display = 'block';
            document.getElementById('consequence').style.display = 'none';
            document.getElementById('retry-hint').style.display = 'none';
            document.getElementById('panel-btn').style.display = 'none';

            const opts = shuffleWithIdx(stop.opts, stop.correct);
            stop._sc = opts.ci;
            const div = document.getElementById('opts');
            div.innerHTML = '';
            opts.arr.forEach((txt, i) => {
                const b = document.createElement('button');
                b.className = 'opt';
                b.innerHTML = `<b>${['A','B','C','D'][i]}</b>) ${txt}`;
                b.onclick = () => pick(i, stop, nid);
                div.appendChild(b);
            });
        }

        function pick(i, stop, nid) {
            const btns = document.querySelectorAll('.opt');
            btns.forEach(b => b.disabled = true);
            const correct = stop._sc;
            const fb = document.getElementById('consequence');
            const retry = document.getElementById('retry-hint');
            const btn = document.getElementById('panel-btn');

            if (i === correct) {
                btns[i].classList.add('correct');
                G.score += G.attempts === 0 ? 200 : 100;
                fb.className = 'consequence good';
                fb.innerHTML = `✓ <b>Correct.</b> ${stop.good}`;
                fb.style.display = 'block';
                retry.style.display = 'none';
                btn.textContent = 'Continue →';
                btn.style.display = 'inline-block';
                spawnParticles(G.px, G.py, '#00ff88');
                updateHUD();
            } else {
                btns[i].classList.add('wrong');
                G.attempts++;
                fb.className = 'consequence bad';
                fb.innerHTML = `✗ <b>Not quite.</b> ${stop.bad}`;
                fb.style.display = 'block';
                spawnParticles(G.px, G.py, '#ff4444');
                if (G.attempts >= 2) {
                    btns[correct].classList.add('correct');
                    G.lives--;
                    updateLives();
                    retry.style.display = 'none';
                    btn.textContent = G.lives <= 0 ? 'See what happened...' : 'Understood — continue →';
                    btn.style.display = 'inline-block';
                    if (G.lives <= 0) { setTimeout(gameOver, 1200); }
                } else {
                    retry.innerHTML = `💡 Hint: re-read the concept above, then try again.`;
                    retry.style.display = 'block';
                    btns.forEach((b, bi) => { if (bi !== i) { b.disabled = false; b.classList.remove('wrong','correct'); } });
                }
                updateHUD();
            }
        }

        function panelNext() {
            if (G.phase === 'teach') {
                showScenario(G.activeStop);
            } else {
                document.getElementById('panel').style.display = 'none';
                advancePath();
            }
        }

        function levelDone() {
            document.getElementById('panel').style.display = 'none';
            spawnParticles(W()/2, H()/2, '#ffaa00', 30);
            G.lv++;
            if (G.lv >= NM_LEVELS.length) { setTimeout(winGame, 700); }
            else { setTimeout(showLevelIntro, 700); }
        }

        function gameOver() {
            document.getElementById('panel').style.display = 'none';
            document.getElementById('go-score').textContent = `Score: ${G.score}`;
            showOv('s-over');
        }

        function winGame() {
            document.getElementById('panel').style.display = 'none';
            document.getElementById('fscore').textContent = G.score;
            const g = G.score>=3000?'🏆 Network Architect':G.score>=2000?'🥈 Senior Engineer':G.score>=1000?'🥉 Junior SysAdmin':'📚 Intern — keep studying!';
            document.getElementById('win-grade').textContent = g;
            showOv('s-win');
        }

        // ── HUD ──
        function updateHUD() {
            document.getElementById('h-lv').textContent = `${G.lv+1}/${NM_LEVELS.length}`;
            document.getElementById('h-sc').textContent = G.score;
        }
        function updateLives() {
            const icons = ['❤️','❤️','❤️'].map((_,i) => i < G.lives ? '❤️' : '🖤').join('');
            document.getElementById('h-li').textContent = icons;
        }

        // ── CANVAS DRAW LOOP ──
        function drawLoop() {
            tick++;
            ctx.clearRect(0, 0, W(), H());
            const lv = NM_LEVELS[G.lv];
            if (!lv) return;

            lv.edges.forEach(([a,b]) => {
                const na = nodeById(a), nb = nodeById(b);
                const x1=na.x*W(),y1=na.y*H(),x2=nb.x*W(),y2=nb.y*H();
                ctx.strokeStyle='rgba(0,100,200,0.2)'; ctx.lineWidth=2;
                ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
                const pt=((tick*0.01)%1);
                const px=x1+(x2-x1)*pt, py=y1+(y2-y1)*pt;
                ctx.fillStyle='rgba(0,170,255,0.45)';
                ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
            });

            lv.nodes.forEach(nd => {
                const x=nd.x*W(), y=nd.y*H();
                const active = G.activeStop===nd.id;
                const r = active ? 22 : 17;
                const g = ctx.createRadialGradient(x,y,0,x,y,r*2.2);
                g.addColorStop(0, nd.color+'55');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle=g;
                ctx.beginPath(); ctx.arc(x,y,r*2.2,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = active ? nd.color+'cc' : nd.color+'44';
                ctx.strokeStyle = nd.color;
                ctx.lineWidth = active ? 3 : 1.5;
                ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
                ctx.fillStyle='#cce8ff';
                ctx.font=`bold ${Math.max(9,W()*0.013)}px Courier New`;
                ctx.textAlign='center';
                ctx.fillText(nd.label, x, y+r+13);
            });

            const pulse = 1+0.12*Math.sin(tick*0.13);
            ctx.save();
            ctx.shadowColor='#00ffff'; ctx.shadowBlur=14;
            ctx.fillStyle='#ffffff';
            ctx.beginPath();
            ctx.moveTo(G.px, G.py-11*pulse);
            ctx.lineTo(G.px+8*pulse, G.py+6*pulse);
            ctx.lineTo(G.px-8*pulse, G.py+6*pulse);
            ctx.closePath(); ctx.fill();
            ctx.restore();
            ctx.fillStyle='#00ddff';
            ctx.font=`bold ${Math.max(8,W()*0.011)}px Courier New`;
            ctx.textAlign='center';
            ctx.fillText('PKT', G.px, G.py-15*pulse);

            G.particles = G.particles.filter(p => p.life > 0);
            G.particles.forEach(p => {
                p.x+=p.vx; p.y+=p.vy; p.life-=2;
                ctx.globalAlpha=p.life/100;
                ctx.fillStyle=p.color;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
            });
            ctx.globalAlpha=1;

            G.af = requestAnimationFrame(drawLoop);
        }

        function spawnParticles(x, y, color, n=14) {
            for (let i=0;i<n;i++) {
                const a=Math.random()*Math.PI*2, s=1+Math.random()*3;
                G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
                    life:70+Math.random()*50,color,r:2+Math.random()*3});
            }
        }

        // ── UTILS ──
        function easeInOut(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }

        function shuffleWithIdx(arr, ci) {
            const indexed = arr.map((a,i) => ({a,i}));
            for (let i=indexed.length-1;i>0;i--) {
                const j=Math.floor(Math.random()*(i+1));
                [indexed[i],indexed[j]]=[indexed[j],indexed[i]];
            }
            return { arr: indexed.map(x=>x.a), ci: indexed.findIndex(x=>x.i===ci) };
        }

        // ══════════════════════════════════════════════════════
        //  BUILDER
        // ══════════════════════════════════════════════════════
        function startBuilder() {
            showOv('s-builder');
            document.getElementById('hud').style.display='none';
            if (G.af) cancelAnimationFrame(G.af);
            _devCounter=0;

            B={devices:[], wires:[], cfgs:{}, selected:null, wireFrom:null,
               dragging:null, dragOX:0, dragOY:0, mode:'select',
               bc:null, bctx:null, baf:null, pkt:null, hover:null,
               pkts:[], fragDropped:new Set(), simPhase:null,
               mtu:1500, payload:4000, bparticles:[]};

            B.bc   = document.getElementById('b-canvas');
            B.bctx = B.bc.getContext('2d');
            requestAnimationFrame(() => { resizeBuilderCanvas(); });

            B.bc.addEventListener('mousedown', onBDown);
            B.bc.addEventListener('mousemove', onBMove);
            B.bc.addEventListener('mouseup',   onBUp);
            B.bc.addEventListener('mouseleave', onBUp);
            B.bc.addEventListener('touchstart', onBTouchStart, {passive:false});
            B.bc.addEventListener('touchmove',  onBTouchMove,  {passive:false});
            B.bc.addEventListener('touchend',   onBUp);

            NM_DEVICE_ORDER.forEach(t => {
                const el = document.getElementById('bpart-'+t);
                if (el) el.classList.remove('placed');
            });

            updateBuilderMode('select');
            renderConfigPanel(null);
            document.getElementById('b-mode-hint').textContent='Place devices → Auto-Wire → configure each → Test';
            bDrawLoop();
        }

        function resizeBuilderCanvas() {
            const wrap=document.getElementById('b-canvas-wrap');
            const toolbar=document.getElementById('b-toolbar');
            const tbH=toolbar?toolbar.offsetHeight:48;
            const w=wrap.offsetWidth||window.innerWidth-380;
            const h=wrap.offsetHeight||(window.innerHeight-tbH-8);
            B.bc.width=Math.max(w,200);
            B.bc.height=Math.max(h,200);
        }
        function bW(){ return B.bc?B.bc.width:1; }
        function bH(){ return B.bc?B.bc.height:1; }

        function canvasXY(e) {
            const r=B.bc.getBoundingClientRect();
            const src=e.touches?e.touches[0]:e;
            return { mx:(src.clientX-r.left)*(bW()/r.width),
                     my:(src.clientY-r.top) *(bH()/r.height) };
        }

        function deviceAt(mx, my) {
            for (let i=B.devices.length-1;i>=0;i--) {
                const d=B.devices[i];
                if (mx>=d.x-NM_DW/2&&mx<=d.x+NM_DW/2&&my>=d.y-NM_DH/2&&my<=d.y+NM_DH/2) return d;
            }
            return null;
        }

        function onBDown(e) {
            const {mx,my}=canvasXY(e);
            if (B.simPhase==='flying' && B.pkts.length>0) {
                let hit=false;
                for (const pkt of B.pkts) {
                    if (pkt.dropped||pkt.done) continue;
                    if (Math.hypot(pkt.x-mx,pkt.y-my)<42) {
                        dropFragPkt(pkt); e.preventDefault(); hit=true; break;
                    }
                }
                if (hit) return;
            }
            const hit=deviceAt(mx,my);
            if (B.mode==='wire') {
                if (!hit) return;
                if (!B.wireFrom) {
                    B.wireFrom=hit.id;
                } else if (B.wireFrom!==hit.id) {
                    const idx=B.wires.findIndex(w=>(w.a===B.wireFrom&&w.b===hit.id)||(w.a===hit.id&&w.b===B.wireFrom));
                    if (idx>=0) B.wires.splice(idx,1);
                    else B.wires.push({a:B.wireFrom,b:hit.id});
                    B.wireFrom=null;
                } else { B.wireFrom=null; }
            } else {
                if (!hit) { B.selected=null; renderConfigPanel(null); return; }
                B.selected=hit.id; B.dragging=hit.id;
                B.dragOX=mx-hit.x; B.dragOY=my-hit.y;
                renderConfigPanel(hit.id);
            }
            e.preventDefault();
        }
        function onBMove(e) {
            const {mx,my}=canvasXY(e);
            B.hover=deviceAt(mx,my)?.id||null;
            B.bc.style.cursor=B.hover?(B.mode==='wire'?'crosshair':'grab'):'default';
            if (B.dragging&&B.mode==='select') {
                const d=B.devices.find(x=>x.id===B.dragging);
                if (d){ d.x=Math.max(NM_DW/2,Math.min(bW()-NM_DW/2,mx-B.dragOX));
                        d.y=Math.max(NM_DH/2,Math.min(bH()-NM_DH/2,my-B.dragOY)); }
                e.preventDefault();
            }
            B.wireTarget=B.mode==='wire'&&B.wireFrom?deviceAt(mx,my)?.id:null;
            B.mouseX=mx; B.mouseY=my;
        }
        function onBUp(){ B.dragging=null; }
        function onBTouchStart(e){ onBDown(e); }
        function onBTouchMove(e){ onBMove(e); e.preventDefault(); }

        function placePart(type) {
            const id=type+'_'+(++_devCounter);
            const slot=NM_SLOTS[B.devices.length%NM_SLOTS.length];
            const jx=(B.devices.length>=NM_SLOTS.length)?(Math.random()*30-15):0;
            const jy=(B.devices.length>=NM_SLOTS.length)?(Math.random()*20-10):0;
            const x=slot.fx*bW()+jx, y=slot.fy*bH()+jy;
            B.devices.push({id,type,x,y});
            B.cfgs[id]={};
            (NM_DEVICE_CONFIGS[type]||[]).forEach(f=>{ B.cfgs[id][f.key]=0; });
            B.selected=id; B.pkt=null;
            renderConfigPanel(id);
        }

        function removePart(id) {
            B.devices=B.devices.filter(d=>d.id!==id);
            B.wires=B.wires.filter(w=>w.a!==id&&w.b!==id);
            delete B.cfgs[id];
            if (B.selected===id){ B.selected=null; renderConfigPanel(null); }
            if (B.wireFrom===id) B.wireFrom=null;
            B.pkt=null;
        }

        function updateBuilderMode(m) {
            B.mode=m; B.wireFrom=null; B.wireTarget=null;
            document.getElementById('b-btn-select').style.background=m==='select'?'#0060c0':'#001830';
            document.getElementById('b-btn-wire').style.background  =m==='wire'  ?'#804000':'#001830';
            document.getElementById('b-mode-hint').textContent=m==='select'
                ?'Drag to move · click to configure'
                :'Click an orange port dot, then click a second device';
            document.getElementById('b-wire-hint').style.display=m==='wire'?'block':'none';
        }

        function autoWire() {
            const get=t=>B.devices.find(d=>d.type===t);
            const pairs=[['pc','switch'],['switch','router'],['router','firewall'],['firewall','dns'],['firewall','server']];
            let added=0;
            pairs.forEach(([a,b])=>{
                const da=get(a),db=get(b);
                if (!da||!db) return;
                const exists=B.wires.some(w=>(w.a===da.id&&w.b===db.id)||(w.a===db.id&&w.b===da.id));
                if (!exists){ B.wires.push({a:da.id,b:db.id}); added++; }
            });
            if (!added) document.getElementById('b-mode-hint').textContent='Already wired (or missing a device type)';
        }

        function setConfig(id, key, idx) {
            if (!B.cfgs[id]) return;
            B.cfgs[id][key]=parseInt(idx);
            B.pkt=null;
            renderConfigPanel(id);
        }

        function renderConfigPanel(id) {
            const el=document.getElementById('b-config-inner');
            const dev=id?B.devices.find(d=>d.id===id):null;
            if (!dev) {
                el.innerHTML='<div style="color:#446;font-size:13px">Place a device, then click it to configure.</div>';
                return;
            }
            const def=NM_PART_DEFS[dev.type], fields=NM_DEVICE_CONFIGS[dev.type]||[];
            let h=`<div style="color:${def.color};font-weight:bold;font-size:15px;margin-bottom:3px">${def.label}</div>
                <div style="color:#557;font-size:11px;margin-bottom:12px;line-height:1.5">${def.desc}</div>`;
            if (!fields.length) {
                h+=`<div style="padding:8px;background:rgba(0,80,40,0.3);border:1px solid #0a4;border-radius:6px;color:#5f9;font-size:13px">
                ✓ Auto-configures. No settings needed.</div>`;
            } else {
                fields.forEach(f=>{
                    const cur=B.cfgs[id]?.[f.key]??0;
                    h+=`<div style="margin-bottom:11px">
                        <div style="font-size:11px;color:#8ac;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${f.label}</div>
                        <select onchange="nmSetConfig('${id}','${f.key}',this.value)" style="width:100%">
                          ${f.opts.map((o,i)=>`<option value="${i}"${i===cur?' selected':''}>${o}</option>`).join('')}
                        </select>
                        <div style="font-size:11px;color:#446;margin-top:3px">💡 ${f.hint}</div>
                    </div>`;
                });
            }
            h+=`<button onclick="nmRemovePart('${id}')"
                style="margin-top:4px;padding:4px 12px;background:#300;border:1px solid #a00;color:#f88;
                border-radius:4px;cursor:pointer;font-family:'Courier New',monospace;font-size:11px">✕ Remove</button>`;
            el.innerHTML=h;
        }

        function testNetwork() {
            B.pkt=null;
            const res=[];
            const chk=(l,p,m)=>res.push({label:l,pass:p,msg:m});
            const ofType=t=>B.devices.filter(d=>d.type===t);
            const wired=(a,b)=>B.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));

            const missing=NM_DEVICE_ORDER.filter(t=>ofType(t).length===0);
            chk('All 6 device types placed',!missing.length,
                missing.length?`Missing: ${missing.map(t=>NM_PART_DEFS[t].label).join(', ')}`:'All types present');

            let topoOk=false, topoPath=[];
            outer:
            for (const pc of ofType('pc'))
            for (const sw of ofType('switch'))   if (wired(pc.id,sw.id))
            for (const rt of ofType('router'))   if (wired(sw.id,rt.id))
            for (const fw of ofType('firewall')) if (wired(rt.id,fw.id))
            for (const dn of ofType('dns'))      if (wired(fw.id,dn.id))
            for (const sv of ofType('server'))   if (wired(fw.id,sv.id)) {
                topoOk=true; topoPath=[pc.id,sw.id,rt.id,fw.id,dn.id,sv.id]; break outer;
            }
            chk('Topology: PC→Switch→Router→Firewall→{DNS,Server}',topoOk,
                topoOk?'Valid path found':'Wire devices in the correct order');

            const checkType=(type,label,ok_msg)=>{
                const devs=ofType(type); if (!devs.length) return;
                const fields=NM_DEVICE_CONFIGS[type]||[];
                if (!fields.length){ chk(label,true,'Auto-configures'); return; }
                let bestBad=fields, bestDev=devs[0];
                for (const d of devs) {
                    const bad=fields.filter(f=>(B.cfgs[d.id]?.[f.key]??0)!==f.correct);
                    if (bad.length<bestBad.length){ bestBad=bad; bestDev=d; }
                }
                chk(label,!bestBad.length,
                    bestBad.length?bestBad.map(f=>`${f.label} → "${f.opts[f.correct]}"`).join(' · '):ok_msg);
            };
            checkType('pc',      'PC configured',       'IP, gateway, DNS, TCP correct');
            checkType('router',  'Router configured',   'Static routing, correct IPs');
            checkType('firewall','Firewall rules',       'Allow 443, Block 80 & 22');
            checkType('dns',     'DNS record',           'mycompany.com → 10.0.0.5');
            checkType('server',  'Server secured',       'HTTPS only, TCP, port 443');

            const allPass=res.every(r=>r.pass);
            const configsPass=res.filter(r=>r.label!=='Topology: PC→Switch→Router→Firewall→{DNS,Server}').every(r=>r.pass);

            let h=`<div style="font-size:14px;font-weight:bold;color:${allPass?'#0f6':configsPass?'#fa0':'#f55'};
                margin-bottom:10px;padding:8px;border-radius:6px;
                background:${allPass?'rgba(0,60,30,0.5)':configsPass?'rgba(60,40,0,0.5)':'rgba(60,0,0,0.4)'}">
                ${allPass?'✅ NETWORK OPERATIONAL':configsPass?'⚡ CONFIGS CORRECT — wire devices to complete':'⚠ FIX ISSUES BELOW'}</div>`;
            res.forEach(r=>{
                h+=`<div style="margin-bottom:7px;padding:7px 9px;border-radius:5px;font-size:12px;line-height:1.5;
                    background:${r.pass?'rgba(0,50,25,0.6)':'rgba(50,0,0,0.6)'};border:1px solid ${r.pass?'#0a4':'#a00'}">
                    ${r.pass?'✓':'✗'} <b>${r.label}</b><br>
                    <span style="color:${r.pass?'#5f9':'#f88'}">${r.msg}</span></div>`;
            });
            if (allPass) {
                h+=`<button onclick="nmBuilderWin()" style="margin-top:10px;width:100%;padding:9px;
                    background:#004f30;border:1px solid #0f6;color:#0f6;border-radius:6px;
                    cursor:pointer;font-family:'Courier New',monospace;font-size:14px">✓ Complete Mission →</button>`;
            }
            if (!topoOk&&configsPass) {
                h+=`<div style="margin-top:8px;padding:8px;background:rgba(60,40,0,0.5);border:1px solid #a60;
                    border-radius:6px;font-size:12px;color:#fa0">
                    💡 Hit <b>⚡ Auto-Wire</b> or switch to <b>〰 Wire mode</b> to connect your devices, then re-test.</div>`;
            }
            if (configsPass) {
                if (topoOk) animateFragments(topoPath);
                else animatePacketPartial();
            }
            document.getElementById('b-config-inner').innerHTML=h;
        }

        function animatePacketPartial() {
            const pc=B.devices.find(d=>d.type==='pc');
            if (!pc) return;
            const visited=new Set([pc.id]);
            const route=[pc.id];
            let frontier=[pc.id];
            while (frontier.length) {
                const next=[];
                frontier.forEach(id=>{
                    B.wires.forEach(w=>{
                        const other=w.a===id?w.b:w.b===id?w.a:null;
                        if (other&&!visited.has(other)){ visited.add(other); route.push(other); next.push(other); }
                    });
                });
                frontier=next;
            }
            if (route.length<2) return;
            animatePacket(route);
        }

        function animatePacket(path) {
            if (path.length<6) return;
            const [pcId,swId,rtId,fwId,dnId,svId]=path;
            const route=[pcId,swId,rtId,fwId,dnId,fwId,svId];
            const getPos=id=>{ const d=B.devices.find(x=>x.id===id); return d?{x:d.x,y:d.y}:{x:0,y:0}; };
            let step=0, t=0;
            const start=getPos(route[0]);
            B.pkt={route,step,t,x:start.x,y:start.y,done:false,getPos};
            function tick(){
                if (!B.pkt||B.pkt.done) return;
                B.pkt.t+=0.025;
                if (B.pkt.t>=1){
                    B.pkt.t=0; B.pkt.step++;
                    if (B.pkt.step>=route.length-1){ B.pkt.done=true; return; }
                }
                const fp=getPos(route[B.pkt.step]),tp=getPos(route[B.pkt.step+1]);
                const e=easeInOut(B.pkt.t);
                B.pkt.x=fp.x+(tp.x-fp.x)*e; B.pkt.y=fp.y+(tp.y-fp.y)*e;
                requestAnimationFrame(tick);
            }
            tick();
        }

        function debugNetwork() {
            const ofType=t=>B.devices.filter(d=>d.type===t);
            const wired=(a,b)=>B.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));
            const lines=[];
            const log=(icon,title,body,ok)=>lines.push({icon,title,body,ok});

            const REQUIRED=['pc','switch','router','firewall','dns','server'];
            const missing=REQUIRED.filter(t=>ofType(t).length===0);
            if (missing.length) {
                log('📦','Missing devices',`You haven't placed: <b>${missing.map(t=>NM_PART_DEFS[t].label).join(', ')}</b>.<br>Click each one in the left palette to add it to the canvas.`, false);
            } else {
                log('📦','All devices present','PC, Switch, Router, Firewall, DNS Server, Web Server — all placed.', true);
            }

            const pairs=[['pc','switch'],['switch','router'],['router','firewall'],['firewall','dns'],['firewall','server']];
            const unwired=[];
            pairs.forEach(([a,b])=>{
                const da=ofType(a)[0], db=ofType(b)[0];
                if (!da||!db){ return; }
                if (!wired(da.id,db.id)) unwired.push([a,b]);
            });
            if (unwired.length) {
                const fixes=unwired.map(([a,b])=>`<b>${NM_PART_DEFS[a].label} → ${NM_PART_DEFS[b].label}</b>`).join(', ');
                log('〰','Missing cables',`These connections aren't wired yet: ${fixes}.<br>Hit <b>⚡ Auto-Wire</b> or switch to 〰 Wire mode.`, false);
            } else if (!missing.length) {
                log('〰','Topology wired','All required cables are in place.', true);
            }

            const LABELS={pc:'PC',switch:'Switch (auto)',router:'Router',firewall:'Firewall',dns:'DNS Server',server:'Web Server'};
            REQUIRED.forEach(type=>{
                const devs=ofType(type);
                if (!devs.length) return;
                const fields=NM_DEVICE_CONFIGS[type]||[];
                if (!fields.length){ log('⚙️',`${LABELS[type]} config`,'Auto-configures — nothing to set.', true); return; }
                let bestBad=fields, bestDev=devs[0];
                devs.forEach(d=>{
                    const bad=fields.filter(f=>(B.cfgs[d.id]?.[f.key]??0)!==f.correct);
                    if (bad.length<bestBad.length){ bestBad=bad; bestDev=d; }
                });
                if (!bestBad.length) {
                    log('⚙️',`${LABELS[type]} config`,'All settings correct.', true);
                } else {
                    const fixes=bestBad.map(f=>{
                        const cur=f.opts[B.cfgs[bestDev.id]?.[f.key]??0];
                        const want=f.opts[f.correct];
                        return `<b>${f.label}</b>: currently "<span style="color:#f88">${cur}</span>" → should be "<span style="color:#5f9">${want}</span>"`;
                    }).join('<br>');
                    log('⚙️',`${LABELS[type]} misconfigured`,`Click the ${LABELS[type]} on the canvas, then fix:<br>${fixes}`, false);
                }
            });

            const allOk=missing.length===0&&unwired.length===0&&
                REQUIRED.every(type=>{
                    const devs=ofType(type); if (!devs.length) return false;
                    const fields=NM_DEVICE_CONFIGS[type]||[]; if (!fields.length) return true;
                    return devs.some(d=>fields.every(f=>(B.cfgs[d.id]?.[f.key]??0)===f.correct));
                });
            if (allOk) {
                log('✅','Network is fully operational','All devices placed, wired, and configured correctly. Hit <b>▶ Test</b> to run the simulation!', true);
            } else {
                const nProblems=lines.filter(l=>!l.ok).length;
                log('🔎','Summary',`Found <b>${nProblems} issue${nProblems!==1?'s':''}</b> above. Fix them top-to-bottom — wiring first, then config.`, false);
            }

            const out=document.getElementById('b-debug-output');
            out.innerHTML=lines.map(l=>`
                <div style="margin-bottom:12px;padding:10px 12px;border-radius:7px;
                    background:${l.ok?'rgba(0,50,25,0.6)':'rgba(40,10,0,0.7)'};
                    border:1px solid ${l.ok?'#0a4':'#a40'}">
                    <div style="font-size:13px;font-weight:bold;color:${l.ok?'#5f9':'#f80'};margin-bottom:5px">
                        ${l.icon} ${l.title}</div>
                    <div style="font-size:12px;color:${l.ok?'#9db':'#cba'};line-height:1.7">${l.body}</div>
                </div>`).join('');
            document.getElementById('b-debug').style.display='block';
        }

        function builderWin() {
            G.score+=500;
            if (B.baf) cancelAnimationFrame(B.baf);
            hideOv('s-builder');
            G.lv++;
            winGame();
        }

        // ── Builder draw loop ──
        function bDrawLoop() {
            btick++;
            if (!B.bc||!B.bctx) return;
            const bctx=B.bctx;
            bctx.clearRect(0,0,bW(),bH());

            bctx.strokeStyle='rgba(0,100,200,0.07)'; bctx.lineWidth=1;
            for (let x=0;x<bW();x+=40){ bctx.beginPath(); bctx.moveTo(x,0); bctx.lineTo(x,bH()); bctx.stroke(); }
            for (let y=0;y<bH();y+=40){ bctx.beginPath(); bctx.moveTo(0,y); bctx.lineTo(bW(),y); bctx.stroke(); }

            B.wires.forEach(({a,b})=>{
                const da=B.devices.find(d=>d.id===a), db=B.devices.find(d=>d.id===b);
                if (!da||!db) return;
                bctx.strokeStyle='rgba(0,190,255,0.55)'; bctx.lineWidth=2.5; bctx.setLineDash([]);
                bctx.beginPath(); bctx.moveTo(da.x,da.y); bctx.lineTo(db.x,db.y); bctx.stroke();
                const mx=(da.x+db.x)/2, my=(da.y+db.y)/2;
                bctx.fillStyle='rgba(0,180,255,0.35)';
                bctx.beginPath(); bctx.arc(mx,my,4,0,Math.PI*2); bctx.fill();
                const pt=((btick*0.012)%1);
                const px=da.x+(db.x-da.x)*pt, py=da.y+(db.y-da.y)*pt;
                bctx.fillStyle='rgba(0,220,255,0.8)';
                bctx.beginPath(); bctx.arc(px,py,3,0,Math.PI*2); bctx.fill();
            });

            if (B.mode==='wire'&&B.wireFrom&&B.mouseX!==undefined) {
                const from=B.devices.find(d=>d.id===B.wireFrom);
                if (from) {
                    bctx.strokeStyle='rgba(255,150,0,0.6)'; bctx.lineWidth=2; bctx.setLineDash([6,4]);
                    bctx.beginPath(); bctx.moveTo(from.x,from.y); bctx.lineTo(B.mouseX,B.mouseY); bctx.stroke();
                    bctx.setLineDash([]);
                }
            }

            B.devices.forEach(dev=>{
                const {x,y,type,id}=dev;
                const def=NM_PART_DEFS[type];
                const sel=B.selected===id, wf=B.wireFrom===id, hov=B.hover===id;
                if (sel||wf) {
                    const g=bctx.createRadialGradient(x,y,0,x,y,NM_DW*0.9);
                    g.addColorStop(0,def.color+'44'); g.addColorStop(1,'rgba(0,0,0,0)');
                    bctx.fillStyle=g;
                    bctx.beginPath(); bctx.arc(x,y,NM_DW*0.9,0,Math.PI*2); bctx.fill();
                }
                bctx.beginPath(); bctx.roundRect(x-NM_DW/2,y-NM_DH/2,NM_DW,NM_DH,8);
                bctx.fillStyle  = sel?def.color+'66':hov?def.color+'33':'rgba(4,14,30,0.92)';
                bctx.strokeStyle= wf?'#ffaa00':sel?def.color:hov?def.color+'88':'rgba(0,180,255,0.35)';
                bctx.lineWidth  = sel||wf?2.5:1.5;
                bctx.fill(); bctx.stroke();
                if (B.mode==='wire') {
                    NM_PORTS.forEach(p=>{
                        const pulse=wf?(1+0.4*Math.sin(btick*0.15)):1;
                        const r=wf?7*pulse:5;
                        bctx.save();
                        if (wf){ bctx.shadowColor='#ffaa00'; bctx.shadowBlur=10; }
                        bctx.fillStyle=wf?'#ffaa00':def.color+'cc';
                        bctx.strokeStyle=wf?'#fff3':'rgba(0,0,0,0.5)'; bctx.lineWidth=1.5;
                        bctx.beginPath(); bctx.arc(x+p.dx,y+p.dy,r,0,Math.PI*2);
                        bctx.fill(); bctx.stroke(); bctx.restore();
                    });
                }
                bctx.fillStyle=def.color;
                bctx.font=`bold ${Math.max(11,bW()*0.018)}px Courier New`;
                bctx.textAlign='center'; bctx.textBaseline='middle';
                bctx.fillText(def.short,x,y);
                bctx.fillStyle='#88aacc';
                bctx.font=`${Math.max(9,bW()*0.012)}px Courier New`;
                bctx.fillText(def.label,x,y+NM_DH/2+11);
            });

            // fragment packets
            if (B.simPhase==='flying'&&B.pkts.length>0) {
                let allSettled=true;
                B.pkts.forEach(pkt=>{
                    if (pkt.done||pkt.dropped) return;
                    if (pkt.delay>0){ pkt.delay--; allSettled=false; return; }
                    allSettled=false;
                    pkt.t+=0.010;
                    if (pkt.t>=1){ pkt.t=0; pkt.step++; if (pkt.step>=pkt.route.length-1){ pkt.done=true; return; } }
                    if (pkt.willDrop&&pkt.step===pkt.dropStep&&pkt.t>=pkt.dropT){ dropFragPkt(pkt); return; }
                    const fp=pkt.getPos(pkt.route[pkt.step]),tp=pkt.getPos(pkt.route[pkt.step+1]);
                    const e=easeInOut(pkt.t);
                    pkt.x=fp.x+(tp.x-fp.x)*e; pkt.y=fp.y+(tp.y-fp.y)*e+pkt.yOff;
                });
                if (allSettled) {
                    B.simPhase='result';
                    const p=B.fragParams||{};
                    setTimeout(()=>showFragResult(B.fragDropped.size===0,p.totalFrags,p.payload,p.mtu,p.mss),300);
                }
            }

            if (B.pkts&&B.pkts.length>0) {
                B.pkts.forEach(pkt=>{
                    if (pkt.delay>0) return;
                    const FW=54, FH=22;
                    bctx.save();
                    if (pkt.dropped) {
                        bctx.globalAlpha=0.85;
                        const shake=(pkt.shakeFrames>0)?(Math.sin(btick*1.8)*3):0;
                        bctx.translate(pkt.x+shake,pkt.y);
                        bctx.strokeStyle='#f44'; bctx.fillStyle='rgba(140,10,10,0.85)';
                        if (pkt.shakeFrames>0) pkt.shakeFrames--;
                    } else if (pkt.done) {
                        bctx.globalAlpha=0.2; bctx.translate(pkt.x,pkt.y);
                        bctx.strokeStyle=pkt.color; bctx.fillStyle=pkt.color+'22';
                    } else {
                        bctx.shadowColor=pkt.color; bctx.shadowBlur=10;
                        bctx.translate(pkt.x,pkt.y);
                        bctx.strokeStyle=pkt.color; bctx.fillStyle=pkt.color+'33';
                        bctx.globalAlpha=0.6+0.4*Math.sin(btick*0.18);
                    }
                    bctx.lineWidth=1.5;
                    bctx.beginPath(); bctx.roundRect(-FW/2,-FH/2,FW,FH,4); bctx.fill(); bctx.stroke();
                    bctx.globalAlpha=1;
                    bctx.fillStyle=pkt.dropped?'#f66':pkt.done?pkt.color+'66':pkt.color;
                    bctx.font=`bold 9px Courier New`; bctx.textAlign='center'; bctx.textBaseline='middle';
                    bctx.fillText(pkt.dropped?`✗ ${pkt.label}`:pkt.label,0,-3);
                    bctx.font=`8px Courier New`;
                    bctx.fillStyle=pkt.dropped?'#f88':pkt.done?'#5f966':'rgba(200,230,255,0.7)';
                    bctx.fillText(pkt.dropped?'DROPPED':pkt.done?'✓ RX':`${pkt.size}B`,0,6);
                    bctx.restore();
                });
            } else if (B.pkt&&!B.pkt.done) {
                const pulse=1+0.15*Math.sin(btick*0.2);
                bctx.save();
                bctx.shadowColor='#0ff'; bctx.shadowBlur=14; bctx.fillStyle='#fff';
                bctx.beginPath();
                bctx.moveTo(B.pkt.x,B.pkt.y-10*pulse);
                bctx.lineTo(B.pkt.x+7*pulse,B.pkt.y+5*pulse);
                bctx.lineTo(B.pkt.x-7*pulse,B.pkt.y+5*pulse);
                bctx.closePath(); bctx.fill(); bctx.restore();
            }

            B.bparticles=B.bparticles.filter(p=>p.life>0);
            B.bparticles.forEach(p=>{
                p.x+=p.vx; p.y+=p.vy; p.life-=2;
                bctx.globalAlpha=p.life/80;
                bctx.fillStyle=p.color;
                bctx.beginPath(); bctx.arc(p.x,p.y,p.r,0,Math.PI*2); bctx.fill();
            });
            bctx.globalAlpha=1;

            B.baf=requestAnimationFrame(bDrawLoop);
        }

        // ── MTU ──
        function onMTUChange() {
            B.mtu=parseInt(document.getElementById('b-mtu-input').value);
            B.payload=parseInt(document.getElementById('b-payload-input').value);
            const mss=B.mtu-40;
            const frags=Math.ceil(B.payload/mss);
            const presets={576:'dial-up',1280:'IPv6 min',1500:'Ethernet',9000:'Jumbo'};
            const fc=frags===1?'#0f6':frags<=4?'#fa0':'#f55';
            document.getElementById('b-mtu-val').textContent=B.mtu;
            document.getElementById('b-payload-val').textContent=B.payload;
            document.getElementById('b-mtu-display').innerHTML=
                `<span style="color:${fc};font-weight:bold">${frags} fragment${frags!==1?'s':''}</span>`+
                (presets[B.mtu]?` <span style="color:#fa0;font-size:9px">(${presets[B.mtu]})</span>`:'')+
                ` <span style="color:#446;font-size:9px">MSS=${mss}B</span>`;
            updateSuccessProb();
        }
        function bSetMTU(v){ document.getElementById('b-mtu-input').value=v; onMTUChange(); }

        function onIntegrityChange() {
            const integrity=parseInt(document.getElementById('b-integrity-input').value);
            const col=integrity>70?'#0f6':integrity>30?'#fa0':'#f55';
            const barBg=integrity>70?'linear-gradient(90deg,#0f6,#0af)':integrity>30?'linear-gradient(90deg,#fa0,#f80)':'linear-gradient(90deg,#f44,#f80)';
            document.getElementById('b-integrity-val').textContent=integrity+'%';
            document.getElementById('b-integrity-val').style.color=col;
            document.getElementById('b-integrity-bar').style.width=integrity+'%';
            document.getElementById('b-integrity-bar').style.background=barBg;
            document.getElementById('b-integrity-input').style.accentColor=col;
            updateSuccessProb();
        }
        function bSetIntegrity(v){ document.getElementById('b-integrity-input').value=v; onIntegrityChange(); }

        function updateSuccessProb() {
            const el=document.getElementById('b-success-prob');
            if (!el) return;
            const integrity=parseInt(document.getElementById('b-integrity-input')?.value??'100');
            const p=integrity/100;
            const mtu=B.mtu||1500, payload=B.payload||4000;
            const frags=Math.ceil(payload/(mtu-40));
            const totalExp=frags*(frags+1)/2;
            const pSuccess=Math.pow(p,totalExp)*100;
            const fc=n=>n>70?'#0f6':n>20?'#fa0':'#f55';
            const fmt=n=>n<0.01?'<0.01':n.toFixed(n<1?2:n<10?1:0);
            const f1=(p*100).toFixed(0), fN=(Math.pow(p,frags)*100);
            const col=fc(pSuccess);
            el.innerHTML=frags===1
                ?`F1 survival: <b style="color:${fc(p*100)}">${f1}%</b><br>P(success) = <b style="color:${col}">${fmt(pSuccess)}%</b>`
                :`F1: <b style="color:${fc(p*100)}">${f1}%</b> → F${frags}: <b style="color:${fc(fN)}">${fmt(fN)}%</b><br>P(all ${frags} arrive) = <b style="color:${col}">${fmt(pSuccess)}%</b>`;
        }

        function animateFragments(path) {
            if (path.length<6) return;
            const mtu=B.mtu||1500, payload=B.payload||4000;
            const mss=mtu-40;
            const fragCount=Math.ceil(payload/mss);
            const maxFrags=Math.min(fragCount,12);
            const [pcId,swId,rtId,fwId,dnId,svId]=path;
            const route=[pcId,swId,rtId,fwId,dnId,fwId,svId];
            const getPos=id=>{ const d=B.devices.find(x=>x.id===id); return d?{x:d.x,y:d.y}:{x:0,y:0}; };
            B.pkts=[]; B.fragDropped=new Set(); B.simPhase='flying'; B.bparticles=[];
            hideMTUBanner();
            const hues=[200,160,120,80,40,0,280,240,320,60,180,300];
            const STAGGER=14;
            const integrity=parseInt(document.getElementById('b-integrity-input')?.value??'100');
            for (let i=0;i<maxFrags;i++) {
                const isLast=i===fragCount-1;
                const size=isLast?(payload%mss||mss):mss;
                const color=`hsl(${hues[i%hues.length]},80%,60%)`;
                const startPos=getPos(route[0]);
                const yOff=(i-(maxFrags-1)/2)*18;
                const fragSurvival=Math.pow(integrity/100, i+1);
                const willDrop=integrity<100&&Math.random()>fragSurvival;
                const dropStep=willDrop?(1+Math.floor(Math.random()*(route.length-2))):-1;
                const dropT=willDrop?(0.25+Math.random()*0.5):-1;
                B.pkts.push({id:i,route,getPos,step:0,t:0,
                    x:startPos.x,y:startPos.y+yOff,yOff,
                    done:false,dropped:false,shakeFrames:0,
                    color,label:`F${i+1}`,size,delay:i*STAGGER,
                    willDrop,dropStep,dropT});
            }
            document.getElementById('b-config-inner').innerHTML=
                `<div style="color:#0df;font-size:13px;font-weight:bold;margin-bottom:8px">
                   📡 Transmitting ${fragCount} fragment${fragCount>1?'s':''}...</div>
                 <div style="font-size:11px;color:#8bc;line-height:1.8;margin-bottom:8px">
                   MTU <b style="color:#0df">${mtu}B</b> → MSS <b style="color:#0df">${mss}B</b><br>
                   Payload <b style="color:#fa0">${payload}B</b> ÷ ${mss}B = <b style="color:#0df">${fragCount} fragment${fragCount>1?'s':''}</b>
                 </div>
                 <div style="font-size:11px;color:#f80;padding:7px;border:1px solid #f805;border-radius:5px;background:rgba(40,20,0,0.5)">
                   ⚡ <b>Click any fragment</b> on the canvas to drop it and trigger reassembly failure.
                 </div>`;
            B.fragParams={totalFrags:fragCount,payload,mtu,mss};
        }

        function dropFragPkt(pkt) {
            pkt.dropped=true; pkt.shakeFrames=12;
            B.fragDropped.add(pkt.id);
            for (let i=0;i<12;i++) {
                const a=Math.random()*Math.PI*2, s=1+Math.random()*3;
                B.bparticles.push({x:pkt.x,y:pkt.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
                    life:60+Math.random()*40,color:'#ff4444',r:2+Math.random()*3});
            }
            showMTUBanner(`✗ Fragment ${pkt.label} dropped — waiting for others...`,'rgba(80,10,10,0.9)','#f44');
        }

        function showFragResult(success, totalFrags, payload, mtu, mss) {
            B.simPhase='done';
            if (success) {
                const overhead=totalFrags>1?(totalFrags*20):0;
                document.getElementById('b-config-inner').innerHTML=
                    `<div style="padding:10px;background:rgba(0,60,30,0.7);border:2px solid #0f6;border-radius:8px;margin-bottom:10px">
                       <div style="color:#0f6;font-size:14px;font-weight:bold;margin-bottom:6px">✅ TRANSMISSION COMPLETE</div>
                       <div style="font-size:12px;color:#9db;line-height:1.9">
                         All <b style="color:#0df">${totalFrags}</b> fragment${totalFrags>1?'s':''} received intact.<br>
                         ${totalFrags>1?`Reassembled into <b>${payload}B</b> payload at receiver.<br>Fragmentation overhead: <b style="color:#fa0">${overhead}B</b> extra IP headers.`:`No fragmentation — single segment, zero overhead.`}
                       </div>
                     </div>
                     <button onclick="nmResetFragSim()" style="margin-top:4px;padding:6px 14px;background:#003060;border:1px solid #0af;color:#0df;border-radius:6px;cursor:pointer;font-family:'Courier New',monospace;font-size:12px">↺ Simulate Again</button>
                     <button onclick="nmBuilderWin()" style="margin-top:4px;margin-left:6px;padding:6px 14px;background:#004f30;border:1px solid #0f6;color:#0f6;border-radius:6px;cursor:pointer;font-family:'Courier New',monospace;font-size:12px">✓ Complete →</button>`;
                showMTUBanner(`✓ All ${totalFrags} fragments received — reassembly complete`,'rgba(0,60,30,0.95)','#0f6');
                for (let i=0;i<20;i++) {
                    const a=Math.random()*Math.PI*2, s=1+Math.random()*4;
                    B.bparticles.push({x:bW()/2,y:bH()/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
                        life:80+Math.random()*50,color:'#00ff88',r:2+Math.random()*4});
                }
            } else {
                const dropped=[...B.fragDropped].map(i=>`F${i+1}`).join(', ');
                document.getElementById('b-config-inner').innerHTML=
                    `<div style="padding:10px;background:rgba(80,10,10,0.8);border:2px solid #f44;border-radius:8px;margin-bottom:10px">
                       <div style="color:#f55;font-size:14px;font-weight:bold;margin-bottom:6px">✗ REASSEMBLY FAILED</div>
                       <div style="font-size:12px;color:#fbb;line-height:1.9">
                         Fragment${B.fragDropped.size>1?'s':''} <b style="color:#f44">${dropped}</b> lost in transit.<br>
                         <b>All ${totalFrags} fragments discarded.</b><br>
                         Receiver cannot reconstruct incomplete data — entire <b>${payload}B</b> payload must be retransmitted.
                       </div>
                     </div>
                     <button onclick="nmResetFragSim()" style="padding:6px 14px;background:#300;border:1px solid #f44;color:#f88;border-radius:6px;cursor:pointer;font-family:'Courier New',monospace;font-size:12px">↺ Retry</button>`;
                showMTUBanner(`✗ Reassembly FAILED — ${B.fragDropped.size} fragment${B.fragDropped.size>1?'s':''} lost`,'rgba(80,5,5,0.95)','#f44');
            }
        }

        function resetFragSim() {
            B.pkts=[]; B.fragDropped=new Set(); B.simPhase=null; B.bparticles=[]; B.pkt=null;
            hideMTUBanner();
            renderConfigPanel(null);
        }

        function showMTUBanner(msg, bg, col) {
            const el=document.getElementById('b-mtu-banner');
            el.style.display='block'; el.style.background=bg;
            el.style.border=`2px solid ${col}`; el.style.color=col; el.textContent=msg;
        }
        function hideMTUBanner() { document.getElementById('b-mtu-banner').style.display='none'; }

        // ── Expose globals for onclick attrs (prefixed nm_ to avoid collisions) ──
        const _globals = {
            nmStartGame: startGame,
            nmStartSandbox: startSandbox,
            nmShowOv: showOv,
            nmHideOv: hideOv,
            nmStartLevel: startLevel,
            nmPanelNext: panelNext,
            nmUpdateBuilderMode: updateBuilderMode,
            nmPlacePart: placePart,
            nmAutoWire: autoWire,
            nmTestNetwork: testNetwork,
            nmDebugNetwork: debugNetwork,
            nmSetConfig: setConfig,
            nmRemovePart: removePart,
            nmBSetMTU: bSetMTU,
            nmOnMTUChange: onMTUChange,
            nmOnIntegrityChange: onIntegrityChange,
            nmBSetIntegrity: bSetIntegrity,
            nmBuilderWin: builderWin,
            nmResetFragSim: resetFragSim,
        };
        Object.entries(_globals).forEach(([k,v]) => { window[k]=v; });
        this._windowGlobals = Object.keys(_globals);

        // ── Resize handler ──
        this._resizeHandler = () => {
            resizeCanvas();
            if (B.bc) resizeBuilderCanvas();
        };
        window.addEventListener('resize', this._resizeHandler);

        // ── Cleanup refs ──
        this._cleanup = () => {
            if (G.af) cancelAnimationFrame(G.af);
            if (B.baf) cancelAnimationFrame(B.baf);
            if (B.bc) {
                B.bc.removeEventListener('mousedown', onBDown);
                B.bc.removeEventListener('mousemove', onBMove);
                B.bc.removeEventListener('mouseup', onBUp);
                B.bc.removeEventListener('mouseleave', onBUp);
                B.bc.removeEventListener('touchstart', onBTouchStart);
                B.bc.removeEventListener('touchmove', onBTouchMove);
                B.bc.removeEventListener('touchend', onBUp);
            }
        };

        // ── Init ──
        resizeCanvas();
        setSiteNav(false);
    }

    destroy() {
        if (this._cleanup) this._cleanup();
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        if (this._windowGlobals) this._windowGlobals.forEach(k => { delete window[k]; });
    }
}

export default GameLevelNetmaster;
