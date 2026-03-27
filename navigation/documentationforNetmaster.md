# NetMaster — Educator Documentation

## What Is NetMaster?

NetMaster is a gamified, in-browser networking course built for AP CSP Unit 4. Students play the role of a network engineer guiding packets across the internet, stopping at nodes to learn a concept and then make a real configuration decision. There are 6 progressive levels followed by a hands-on network builder sandbox.

---

## How It Teaches MTU

### Where It Appears

MTU is introduced in the **Level 7 Builder Sandbox** as an integrated simulation panel, not as a standalone level. This placement is intentional — students have already learned TCP, IP, and fragmentation by Level 4, so the MTU sandbox serves as synthesis.

### What Students Do

The sandbox exposes two sliders and a network integrity control:

| Control | Range | Purpose |
|---|---|---|
| Payload slider | 100–18,000B | Set the data to send |
| MTU slider | 576–9,000B | Set the link's max frame size |
| Network Integrity | 1–100% | Simulate link quality |

Students adjust these in real time and watch the fragment count and success probability update live.

### The Core Formula

When payload exceeds MTU, the packet must be fragmented. The simulation uses a compounding probability model:

```
MSS = MTU − 40B (IP + TCP headers)
Fragments N = ceil(payload / MSS)

P(all arrive) = integrity^(N × (N+1) / 2)
```

This formula makes visible an abstract danger: with 3 fragments at 75% integrity, total success drops to ~42%. Students can see why **one lost fragment forces the entire payload to retransmit**, not just that fragment.

### What They Learn

- **Fragmentation is expensive.** More fragments = compounding loss probability.
- **Jumbo frames reduce overhead.** Setting MTU to 9000B can collapse a 3-fragment payload into 1 fragment.
- **Path MTU Discovery matters.** The builder teaches that real systems negotiate the lowest MTU across a path rather than fragmenting blindly.

### Interactive Element

Students can **click mid-flight fragments** to manually drop them and observe the failure state. This makes the risk tangible rather than theoretical.

---

## How It Teaches TCP

### Where It Appears

TCP is the central topic of **Level 2: "Protocols"**. It is also reinforced throughout Levels 3 (OSI encapsulation) and the MTU sandbox.

### Teaching Sequence

Each node in Level 2 follows a two-phase pattern:

1. **Teaching panel** — concept explained with diagrams before any question is asked.
2. **Scenario** — a real-world situation where students must apply the concept.

#### TCP vs UDP

Students see a side-by-side comparison:

| | TCP | UDP |
|---|---|---|
| Connection | 3-way handshake | Connectionless |
| Delivery | Guaranteed, ordered | Best-effort |
| Overhead | High | Low |
| Use cases | Web, email, file transfer | Video streaming, DNS, gaming |

The key insight taught is that **choosing the wrong protocol has real consequences** — TCP's retransmit mechanism causes lag in real-time applications.

#### The 3-Way Handshake

The handshake is taught step-by-step with a sequence diagram:

```
Client                    Server
  |--- SYN (seq=100) ------>|    "I want to connect"
  |<-- SYN-ACK (seq=200, ack=101) --|    "Accepted; here are my numbers"
  |--- ACK (ack=201) ------>|    "We are in sync"
```

Students learn that sequence numbers enable:
- **Out-of-order reassembly** — packets can arrive in any order and be sorted.
- **Lost packet detection** — gaps in sequence numbers trigger retransmit.

#### Scenario Questions (Level 2)

**Video call protocol selection**
Students choose TCP or UDP for a video call. The correct answer is UDP. A dropped frame is acceptable; TCP's retransmit stall is not.

**Handshake completion**
After SYN → SYN-ACK, students identify the next step. Correct answer: ACK. Missing it leaves a half-open connection.

**Multiplayer game packet loss**
A 80B game update fires every 50ms and a packet is lost. Students choose whether to retransmit (TCP) or discard (UDP). Correct answer: UDP — the next update supersedes the lost one in 50ms, so a TCP stall would be worse.

---

## How It Teaches the OSI Model

### Where It Appears

OSI is the central topic of **Level 3: "OSI vs TCP/IP Models"**. It runs across five node stops:

```
Application → Transport → Network → Data Link → Physical
```

### OSI vs TCP/IP Mapping

```
OSI (7 layers)                 TCP/IP (5 layers)
7. Application  ─┐
6. Presentation ─├──> 5. Application
5. Session      ─┘
4. Transport    ────> 4. Transport
3. Network      ────> 3. Internet
2. Data Link    ────> 2. Data Link
1. Physical     ────> 1. Physical
```

Students learn that OSI is a **conceptual model** (used for teaching and troubleshooting) while TCP/IP is the **implementation model** (what actually runs on the internet). OSI's Presentation and Session layers collapse into Application in TCP/IP.

### Encapsulation

The encapsulation stop shows how data is wrapped as it travels down the stack:

```
HTTP Data
→ TCP Header + HTTP Data          (Segment, Layer 4)
→ IP Header + TCP Segment         (Packet, Layer 3)
→ Ethernet Header + IP Packet + FCS  (Frame, Layer 2)
→ 10101001...                     (Bits, Layer 1)
```

De-encapsulation reverses this at the destination — each layer strips its own header.

**Scenario:** "A browser sends 1KB of JSON. What is the outermost wrapping?" Answer: Ethernet Frame. Students learn that routers only read up to Layer 3 (IP) and never inspect the HTTP payload.

### MAC vs IP Addressing

This is one of the most counterintuitive concepts in networking, and Level 3 addresses it directly with a concrete multi-hop example:

```
Laptop (IP: 10.0.0.5)  →  R1  →  R2  →  R3  →  Server (IP: 93.184.216.34)

Link 1: Frame src=AA:BB  dst=CC:DD   (Laptop MAC → R1 MAC)
Link 2: Frame src=EE:FF  dst=GG:HH   (R1 MAC → R2 MAC)
Link 3: Frame src=II:JJ  dst=KK:LL   (R2 MAC → R3 MAC)
Link 4: Frame src=MM:NN  dst=OO:PP   (R3 MAC → Server MAC)

IP src/dst: 10.0.0.5 → 93.184.216.34  (unchanged across all hops)
```

**Scenario:** "With 3 routers, how many distinct MAC pairs are used?" Answer: 4 (one per link). N routers = N+1 links = N+1 MAC pairs. Students internalize why both address types exist: **IP is end-to-end, MAC is hop-by-hop**.

### TLS Placement

Students are asked where TLS encryption lives in the OSI model. Correct answer: Layer 6 (Presentation). This surprises most students who assume it belongs at Layer 4 (Transport) because it runs "over TCP." The teaching point: TLS sits above TCP but below HTTP, using asymmetric encryption for key exchange and symmetric AES for actual data transfer.

### PDU Names by Layer

| Layer | PDU Name |
|---|---|
| Transport (L4) | Segment (TCP) / Datagram (UDP) |
| Network (L3) | Packet |
| Data Link (L2) | Frame |
| Physical (L1) | Bits |

---

## How It Is Gamified

### Core Loop

Every node in every level follows the same three-phase loop:

1. **Learn** — A teaching panel explains the concept. Students click "Got it" before seeing the question.
2. **Decide** — A real-world scenario with 4 shuffled multiple-choice options.
3. **Feedback** — Immediate, explained feedback with a visual effect.

This loop ensures students are never surprised by a question they haven't been prepared for.

### Scoring

| Outcome | Points |
|---|---|
| Correct on first try | 200 |
| Correct on second try | 100 |
| Wrong twice | 0, lose 1 life |

### Lives System

Students start with 3 lives (displayed as hearts in the HUD). Two wrong answers at one node costs a life. Losing all 3 ends the game. This creates meaningful stakes without being punishing — a single mistake is survivable.

### Final Grade

At game end, the score maps to a title:

| Score | Title |
|---|---|
| 3000+ | Network Architect |
| 2000+ | Senior Engineer |
| 1000+ | Junior SysAdmin |
| <1000 | Intern — keep studying |

### Visual Feedback

- **Correct answer:** Green particle burst, score increments, option highlights green.
- **Wrong answer (first attempt):** Red highlight, explanation of why it's wrong, option to retry.
- **Wrong answer (second attempt):** Correct answer revealed, life deducted.

### Canvas Animation

The network is rendered on a live canvas with:
- **Data pulse animations** running along edges between nodes.
- **A packet (triangle)** that visibly travels from node to node as the player progresses.
- **Glow effects** on the currently active node.
- **Particle bursts** on correct/wrong answers.

### HUD Elements

At all times, the top bar shows:
- Current level name and number
- Live score
- Remaining lives (heart symbols)
- Current node name

### The Builder as Culminating Game

Level 7 is a drag-and-drop network builder where students must:
- Place 6 device types (PC, Switch, Router, Firewall, DNS, Web Server)
- Wire them in the correct topology
- Configure each device (IP, gateway, port rules, DNS records, protocols)
- Click **Test** to validate

The test runs a multi-step checker and returns color-coded results:
- **Green:** Correct
- **Orange:** Config is valid but wiring is missing
- **Red:** Issues found

A **Debug** mode shows a step-by-step checklist of what's failing, turning the builder into a structured troubleshooting exercise.

### Accessibility and Anti-Frustration Design

- Concept is always taught before the question is asked — no gotcha moments.
- A **Concept Reference** button is available at any time, summarizing 12 key terms.
- First wrong answer gives a hint and allows a retry; correct answer is only revealed after the second miss.
- An **Auto-Wire** button in the builder removes the mechanical tedium of wiring so students can focus on configuration.

---

## Additional Notes

### MTU on Aircraft (Satellite and Air-to-Ground Links)

Aircraft internet works over links with fundamentally different MTU constraints than ground-based Ethernet. There are two main link types:

**Satellite (Geostationary / LEO)**
- Geostationary satellites sit ~35,786 km up, adding ~600ms round-trip latency.
- LEO constellations (Starlink, etc.) reduce this to ~20–40ms but the link still has high jitter.
- MTU is typically limited to **1400–1430B** (below the standard 1500B Ethernet MTU) because the ground station and aircraft antenna negotiate a lower path MTU to avoid fragmentation mid-hop.
- With high latency, a single lost fragment is extremely expensive — a 600ms retransmit stall is noticeable to users. This is why aircraft networks aggressively use **Path MTU Discovery (PMTUD)** and often clamp MSS at the gateway.

**Air-to-Ground (ATG)**
- Uses LTE/5G towers pointed upward at low-altitude aircraft.
- Lower latency (~30–80ms) but MTU is still conservatively set (often ~1400B) because the link hops through multiple carrier aggregation layers before reaching the internet backbone.

**Why This Matters for NetMaster's MTU Concepts**

The compounding fragment probability formula taught in the sandbox applies directly here. An aircraft link with 90% integrity and 3 fragments has roughly a 53% chance all fragments arrive — far worse than a wired link. Airlines and inflight Wi-Fi providers solve this by:

1. Setting a low MTU at the edge gateway so packets are never fragmented mid-air.
2. Using TCP MSS clamping at the firewall to prevent oversized segments from entering the link.
3. Preferring UDP-based protocols (QUIC/HTTP3) for browser traffic because QUIC handles its own retransmit at the application layer, avoiding TCP's head-of-line blocking over a lossy satellite link.

This is a real-world extension of the "one lost fragment = full retransmit" lesson in the sandbox.

---

### Deploying with AWS Route 53 + EC2 — Through OSI and TCP/IP

This maps a real deployment (a student's project hosted on EC2 behind Route 53) onto the models NetMaster teaches.

#### The Stack in Plain Terms

```
User's browser
    → Route 53 (DNS resolution)
    → EC2 instance (web server, e.g. nginx/Flask/Spring)
    → Response back to browser
```

#### Step-by-Step Through the OSI Model

| OSI Layer | What Happens in a Route 53 + EC2 Request |
|---|---|
| 7 — Application | Browser constructs HTTP GET request for `yourproject.com` |
| 6 — Presentation | TLS handshake encrypts the request (HTTPS); certificate served by EC2 |
| 5 — Session | TLS session established and maintained for the connection duration |
| 4 — Transport | TCP 3-way handshake between browser and EC2's public IP on port 443 |
| 3 — Network | IP packets routed across the internet to EC2's Elastic IP address |
| 2 — Data Link | Ethernet frames hop between routers; MAC addresses change at each hop |
| 1 — Physical | Bits travel over fiber/copper between ISP, AWS backbone, and EC2 datacenter |

**Where Route 53 fits:** Route 53 operates at **Layer 7 (Application)** of OSI — it is an application-layer DNS service. The DNS query itself is a UDP datagram (Layer 4) sent to Route 53's resolver IP before the HTTP connection to EC2 even begins. Route 53 returns the EC2 Elastic IP, and only then does the browser open a TCP connection to EC2.

#### Step-by-Step Through the TCP/IP Model

```
TCP/IP Layer       Component
──────────────────────────────────────────────────
5. Application     HTTP/HTTPS request + Route 53 DNS query (UDP port 53)
4. Transport       TCP (port 443 to EC2) / UDP (port 53 to Route 53)
3. Internet        IP routing to EC2's Elastic IP via AWS backbone
2. Data Link       Ethernet frames across each hop (MACs change per router)
1. Physical        Fiber between user ISP → AWS edge → EC2 datacenter
```

#### The Full Request Flow

```
1. Browser needs IP for yourproject.com
   → UDP packet to Route 53 resolver (Layer 4 / Layer 3)
   → Route 53 returns EC2 Elastic IP (e.g. 54.210.x.x)

2. Browser opens TCP connection to 54.210.x.x:443
   → SYN → SYN-ACK → ACK  (3-way handshake, Layer 4)

3. TLS handshake over that TCP connection
   → Asymmetric key exchange, then AES session key (Layer 6 OSI / Layer 5 App TCP/IP)

4. HTTP GET / sent inside encrypted TLS tunnel (Layer 7 OSI)

5. EC2 nginx/app server processes request, sends HTTP response

6. Response travels back through same layers in reverse (de-encapsulation)
```

#### Key Teaching Connections to NetMaster

| NetMaster Lesson | How It Appears in Route 53 + EC2 |
|---|---|
| DNS hierarchy (Level 4) | Route 53 is the authoritative DNS server for your domain; it answers what the recursive resolver asks |
| TCP 3-way handshake (Level 2) | Every HTTPS connection to EC2 begins with SYN/SYN-ACK/ACK |
| TLS at Layer 6 (Level 3) | EC2 serves a TLS certificate; encryption wraps HTTP before TCP carries it |
| MAC changes per hop (Level 3) | Every AWS backbone router between the user and EC2 swaps MAC addresses; the EC2 Elastic IP stays constant |
| Firewall port rules (Level 6) | EC2 Security Groups act as the firewall — port 443 ALLOW, port 80 optionally redirect, port 22 restricted |
| MTU on the path (Level 7 sandbox) | AWS backbone links typically enforce 1500B MTU; EC2 instances use PMTUD to avoid fragmentation |

---

## Summary

| Topic | Primary Location | Teaching Method |
|---|---|---|
| MTU & Fragmentation | Level 7 Builder Sandbox | Interactive sliders, live probability formula, mid-flight packet dropping |
| TCP vs UDP | Level 2: Protocols | Comparison table, 3-way handshake diagram, scenario questions |
| OSI Model | Level 3: OSI vs TCP/IP | Layer mapping, encapsulation walkthrough, MAC/IP hop example |
| Gamification | All levels | Lives, score, grade, particle effects, packet animation, builder validation |
