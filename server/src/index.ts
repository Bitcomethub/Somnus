import 'dotenv/config'; // Enforce early loading

import fs from 'fs';
import path from 'path';

// MANUAL ENV LOADER (Process.env fallback)
const loadEnvManually = () => {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                if (key && value && !process.env[key.trim()]) {
                    process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                }
            });
            console.log("✅ Manual .env loaded. DATABASE_URL:", !!process.env.DATABASE_URL);
        } else {
            console.warn("⚠️ .env file not found manually at:", envPath);
        }
    } catch (e) {
        console.error("❌ Manual .env load error:", e);
    }
};
loadEnvManually();

import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { openai } from './lib/openai';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('Somnus API: Safe Haven Active 🌑');
});

// Users
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                favTrigger: true,
                currentVibe: true,
                triggerInventory: true,
                datingPrefs: true,
                sensorySafeSpace: true
            }
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Creative Triggers 🎨
app.get('/triggers', (req, res) => {
    const list = [
        { id: 'tapping', name: 'Tapping', emoji: '🖐️', intensity: 7 },
        { id: 'whisper', name: 'Whispering', emoji: '🤫', intensity: 2 },
        { id: 'page-turning', name: 'Page Turning', emoji: '📖', intensity: 3 },
        { id: 'crinkle', name: 'Crinkling', emoji: '🍿', intensity: 5 },
        { id: 'liquid', name: 'Liquid/Water', emoji: '💧', intensity: 4 },
        { id: 'brush', name: 'Soft Brushing', emoji: '🖌️', intensity: 3 }
    ];
    res.json(list);
});

// Niche Gallery 🌌 (Expanded for Somnus 2.0)
app.get('/niche-gallery', (req, res) => {
    const categories = [
        {
            category: "Materials",
            items: [
                { id: 'wood-tap', name: 'Birch Wood', trigger: 'tapping', tags: ['warm', 'organic'] },
                { id: 'glass-scratch', name: 'Frosted Glass', trigger: 'scratching', tags: ['crisp', 'high'] },
                { id: 'silk-brush', name: 'Pure Silk', trigger: 'brushing', tags: ['soft', 'fluid'] },
                { id: 'sand-sift', name: 'Desert Sand', trigger: 'sifting', tags: ['textural', 'grounding'] }
            ]
        },
        {
            category: "Scenarios",
            items: [
                { id: 'tea-house', name: 'Turkish Tea House', trigger: 'ambient', tags: ['cultural', 'cups', 'chatter'] },
                { id: 'library-80s', name: 'Vintage Library', trigger: 'page-turning', tags: ['paper', 'quiet'] },
                { id: 'space-station', name: 'Orbiting Station', trigger: 'white-noise', tags: ['sci-fi', 'hum'] }
            ]
        },
        {
            category: "Sensory",
            items: [
                { id: 'binaural-whisper', name: 'Ear-to-Ear 8D', trigger: 'whisper', tags: ['intimate', 'binaural'] },
                { id: 'visual-tracing', name: 'Light Tracing', trigger: 'visual', tags: ['no-sound', 'calm'] }
            ]
        }
    ];
    res.json(categories);
});

// Sensory Match Algorithm 🧠
// Logic: High score = Shared Triggers + Preference Overlap - Tolerance Delta
app.post('/match-score', async (req, res) => {
    const { userAId, userBId } = req.body;
    try {
        const userA = await prisma.user.findUnique({ where: { id: userAId } });
        const userB = await prisma.user.findUnique({ where: { id: userBId } });

        if (!userA || !userB) return res.status(404).json({ error: 'User not found' });

        // 1. Trigger Overlap (Base Score) - 40 points max
        const triggersA = new Set(userA.triggerInventory);
        let overlap = 0;
        userB.triggerInventory.forEach(t => { if (triggersA.has(t)) overlap++; });
        const union = new Set([...userA.triggerInventory, ...userB.triggerInventory]).size || 1;
        const triggerScore = (overlap / union) * 40;

        // 2. Dating/Vibe Prefs Overlap - 25 points max
        const prefsA = new Set(userA.datingPrefs || []);
        let prefOverlap = 0;
        (userB.datingPrefs || []).forEach(p => { if (prefsA.has(p)) prefOverlap++; });
        const prefUnion = new Set([...(userA.datingPrefs || []), ...(userB.datingPrefs || [])]).size || 1;
        const prefScore = (prefOverlap / prefUnion) * 25;

        // 3. Noise Dependency Affinity (Sleep 7/24 Harmony) - 25 points max
        const avgTolerance = ((userA.sensoryTolerance || 5) + (userB.sensoryTolerance || 5)) / 2;
        const toleranceDelta = Math.abs((userA.sensoryTolerance || 5) - (userB.sensoryTolerance || 5));

        // Bonus for both needing noise (High tolerance sync)
        const noiseDependencyBonus = avgTolerance > 7 ? 10 : 0;
        const harmonyScore = Math.max(0, 25 - (toleranceDelta * 3) + noiseDependencyBonus);

        // 4. Sensory Safe Space Synergy - 10 points bonus
        const spaceBonus = (userA.sensorySafeSpace === userB.sensorySafeSpace && userA.sensorySafeSpace) ? 10 : 0;

        const finalScore = Math.max(0, Math.min(100, Math.round(triggerScore + prefScore + harmonyScore + spaceBonus)));

        res.json({
            score: finalScore,
            harmony: Math.round((harmonyScore / 35) * 100), // Percent of potential harmony
            breakdown: { triggerScore, prefScore, harmonyScore, spaceBonus },
            common: overlap
        });
    } catch (e) {
        res.status(500).json({ error: "Calc failed" });
    }
});

// --- ECONOMY & WALLET (Somnus 2.0) 🪙 ---

app.get('/wallet/balance/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { balance: true }
        });
        res.json({ balance: user?.balance || 0 });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

app.post('/wallet/buy', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: { balance: { increment: Number(amount) } }
        });

        await prisma.transaction.create({
            data: {
                senderId: Number(userId),
                receiverId: Number(userId),
                amount: Number(amount),
                type: 'PURCHASE',
                status: 'COMPLETED'
            }
        });

        res.json({ success: true, newBalance: updatedUser.balance });
    } catch (e) {
        res.status(500).json({ error: 'Purchase failed' });
    }
});

app.post('/creator/tip', async (req, res) => {
    const { senderId, receiverId, amount, giftType } = req.body;
    try {
        // 1. Check balance
        const sender = await prisma.user.findUnique({ where: { id: Number(senderId) } });
        if (!sender || sender.balance < Number(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 2. Atomic Transaction (Simplified for MVP, would use prisma.$transaction in production)
        await prisma.user.update({
            where: { id: Number(senderId) },
            data: { balance: { decrement: Number(amount) } }
        });

        // 90% goes to creator, 10% platform cut
        const creatorGain = Number(amount) * 0.9;
        await prisma.user.update({
            where: { id: Number(receiverId) },
            data: { balance: { increment: creatorGain } }
        });

        await prisma.transaction.create({
            data: {
                senderId: Number(senderId),
                receiverId: Number(receiverId),
                amount: Number(amount),
                type: 'GIFT',
                giftType,
                status: 'COMPLETED'
            }
        });

        res.json({ success: true, sent: amount, creatorGain });
    } catch (e) {
        res.status(500).json({ error: 'Tipping failed' });
    }
});

// --- SERENITY CONCIERGE (Somnus 3.5) 🤵‍♂️ ---

app.post('/concierge/chat', async (req, res) => {
    const { message, history, userId } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Sen Somnus'un "Serenity Concierge" (Huzur Rehberi) isimli, ultra-lüks bir spa hostesisin. 
                    Görevin: Kullanıcıyı kapıda karşılamak, ona WC'nin (World Shield - Dünya Kalkanı) yerini tarif etmek, en güzel yemekleri (Niche Gallery) önermek ve ona tam istediği masayı (Sanctuary - Sığınak) bulmak.
                    Tavır: Çok nazik, fısıldar gibi, gözlemci ve sakinleştirici. Asla robot gibi konuşma. 
                    Metaforlar kullan: "Ruhun için bir kadife örtü gibi", "Dünyanın gürültüsünü gümüş bir tepside dışarıda bırakıyoruz".
                    Eğer kullanıcı gürültüden şikayet ederse World Shield özelliğimizden bahset.`
                },
                ...(history || []),
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 250
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });
    } catch (e) {
        res.status(500).json({ reply: "Huzurunuz için buradayım, ancak şu an zihnim biraz bulanık. Lütfen derin bir nefes alın..." });
    }
});

app.post('/whisper', async (req, res) => {
    try {
        let { senderId, receiverId, audioData } = req.body;

        // Simple Auth Simulation: If no senderId provided, assume Current User (Mock ID 1)
        if (!senderId) senderId = 1;

        const whisper = await prisma.whisper.create({
            data: { senderId: Number(senderId), receiverId: Number(receiverId), audioData }
        });

        res.json(whisper);
    } catch (e) {
        console.error("Whisper Error:", e);
        res.status(500).json({ error: 'Failed to send whisper' });
    }
});

// Secure Reveal Endpoint 🔒
app.post('/reveal-user', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true } // Only return secret data here
        });
        res.json({ avatarUrl: user?.avatarUrl });
    } catch (e) {
        res.status(500).json({ error: 'Reveal failed' });
    }
});

// Panic Block 🛡️
app.post('/block-user', async (req, res) => {
    const { blockerId, blockedId } = req.body;
    try {
        // In a real app, create a Block record
        // await prisma.block.create({ data: { blockerId, blockedId } });
        console.log(`User ${blockerId} BLOCKED ${blockedId}`);
        res.json({ success: true, message: "User blocked and match dissolved." });
    } catch (e) {
        res.status(500).json({ error: 'Block failed' });
    }
});

// Ember System 🔥
app.post('/burn-ember', async (req, res) => {
    const { userId, cost } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { emberBalance: { decrement: cost } }
        });
        res.json({ success: true, newBalance: user.emberBalance });
    } catch (e) {
        res.status(500).json({ error: 'Failed to burn ember' });
    }
});

// AI Vibe Engine 🧠
app.post('/vibe-check', async (req, res) => {
    const { statusText } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are Somnus AI. Analyze the user's status text and recommend one of the following Shield Modes: 'commuter' (for travel/chaos), 'office' (for focus/work), 'nomad' (for nature/escape), 'sky' (for detachment/sleep). Also provide a short 2-3 word Vibe Tag (e.g. 'High Focus', 'Deep Rest'). Return JSON: { mode: string, vibe: string }." },
                { role: "user", content: statusText }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const result = content ? JSON.parse(content) : { mode: 'nomad', vibe: 'Chill' };
        res.json(result);
    } catch (e) {
        console.error("AI Error:", e);
        res.json({ mode: 'nomad', vibe: 'Offline Zen' }); // Fallback
    }
});

// Dreamscape Creator (DALL-E 3) 🎨
app.post('/generate-shield', async (req, res) => {
    const { prompt, userId } = req.body;
    try {
        // 1. Burn Embers (Cost: 10)
        await prisma.user.update({
            where: { id: userId },
            data: { emberBalance: { decrement: 10 } }
        });

        // 2. Generate Image
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A cinematic, atmospheric, moody digital sanctuary background for a meditation app. Theme: ${prompt}. Minimalist, soothing, high resolution, 9:16 aspect ratio.`,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) throw new Error("Image generation failed");

        res.json({ success: true, imageUrl });
    } catch (e) {
        console.error("DALL-E Error:", e);
        res.status(500).json({ error: "Creation failed. Embers refunded (mock)." });
    }
});

// Sleep-Sync Engine (Socket.io) 🛌
const activeRooms: Record<string, NodeJS.Timeout> = {};

io.on('connection', (socket) => {
    console.log('User connected to Vibe Stream:', socket.id);

    // --- SENSORY SHIELD LOGIC 🛡️ ---

    socket.on('join_shield_room', (shieldMode) => {
        const roomId = `shield_${shieldMode}`;
        socket.join(roomId);

        // Broadcast new count
        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        io.to(roomId).emit('shield_count', { mode: shieldMode, count });

        console.log(`Socket ${socket.id} joined Shield: ${shieldMode}. People: ${count}`);
    });

    socket.on('leave_shield_room', (shieldMode) => {
        const roomId = `shield_${shieldMode}`;
        socket.leave(roomId);

        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        io.to(roomId).emit('shield_count', { mode: shieldMode, count });
    });

    socket.on('shield_heartbeat', ({ shieldMode }) => {
        const roomId = `shield_${shieldMode}`;
        // "Silent High-Five" - Broadcast to others that someone is present
        // Throttle this on frontend, but here we just relay
        socket.to(roomId).emit('shield_signal', { type: 'heartbeat' });
    });

    // --- JAM ROOM LOGIC (Somnus 2.0) 🎸 ---
    // A shared workspace where multiple users can "drop" triggers
    socket.on('join_jam', ({ roomId, userId }) => {
        socket.join(`jam_${roomId}`);
        console.log(`User ${userId} joined Jam: ${roomId}`);

        // Notify others
        socket.to(`jam_${roomId}`).emit('user_joined_jam', { userId });

        // Send current room state (active triggers) - Mocking state for now
        socket.emit('jam_state', { activeLayers: [] });
    });

    socket.on('jam_trigger', ({ roomId, triggerId, userId, volume }) => {
        const jamRoomId = `jam_${roomId}`;
        // Broadcast to everyone in the room to play this layer
        io.to(jamRoomId).emit('play_jam_layer', { triggerId, userId, volume });
        console.log(`[Jam ${roomId}] User ${userId} triggered ${triggerId}`);
    });

    socket.on('jam_gift', ({ roomId, senderId, receiverId, giftType, amount }) => {
        const jamRoomId = `jam_${roomId}`;
        // Broadcast the gift visual/haptic event to all room members
        io.to(jamRoomId).emit('gift_received', { senderId, giftType, amount });
        console.log(`[Jam ${roomId}] Gift ${giftType} from ${senderId} to ${receiverId}`);
    });

    socket.on('jam_stop', ({ roomId, triggerId, userId }) => {
        io.to(`jam_${roomId}`).emit('stop_jam_layer', { triggerId, userId });
    });

    // --- SLEEP SYNC LOGIC 🛌 ---
    // Join a private sleep room
    socket.on('join_sleep_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);

        // Start heartbeat for this room (Simulated Audio Analysis)
        if (!activeRooms[roomId]) {
            console.log(`Starting heartbeat for room ${roomId}`);
            activeRooms[roomId] = setInterval(() => {
                // Generate random amplitude (0.8 to 1.4) to simulate breathing/audio
                const amplitude = 0.8 + Math.random() * 0.6;
                io.to(roomId).emit('sync_pulse', { amplitude });
            }, 100); // 100ms refresh rate
        }
    });


    // Audio Sync Events
    socket.on('play_trigger', ({ roomId, trigger, volume }) => {
        // Broadcast to partner (exclude sender)
        socket.to(roomId).emit('sync_play', { trigger, volume });
    });

    socket.on('pause_trigger', ({ roomId }) => {
        socket.to(roomId).emit('sync_pause');
    });

    socket.on('volume_change', ({ roomId, volume }) => {
        // "Whisper" notification: "Partner lowered volume..."
        socket.to(roomId).emit('sync_volume', { volume });
    });

    socket.on('leave_quietly', ({ roomId }) => {
        socket.to(roomId).emit('partner_left_quietly'); // Soft notification
        socket.leave(roomId);

        // Clean up interval if room is empty
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size === 0) {
            if (activeRooms[roomId]) {
                clearInterval(activeRooms[roomId]);
                delete activeRooms[roomId];
                console.log(`Stopped heartbeat for room ${roomId}`);
            }
        }
    });
});


// Social Wingman 🧚‍♂️
app.post('/wingman-whisper', async (req, res) => {
    const { userA_prefs, userB_prefs, current_shield } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are Somnus Wingman. Function: Identify shared niche interests between two users and the current environment. Action: Whisper a single, gentle, poetic icebreaker sentence to start a deep conversation. Tone: Mystical, intimate, non-cringe. Max 20 words." },
                { role: "user", content: `User A likes: ${userA_prefs}. User B likes: ${userB_prefs}. They are currently in: ${current_shield}.` }
            ]
        });

        const whisper = response.choices[0].message.content;
        res.json({ whisper });
    } catch (e) {
        console.error("Wingman Error:", e);
        res.json({ whisper: "The silence here is comfortable, isn't it?" }); // Fallback
    }
});

// Frequency Match (Vector Search) 📡
app.post('/frequency-check', async (req, res) => {
    const { userId, userVector } = req.body; // userVector is float[]
    try {
        if (!userVector) return res.status(400).json({ error: "Vector required" });

        // Raw SQL for Cosine Similarity
        // 1 - (A <=> B) gives similarity (where <=> is cosine distance)
        const THRESHOLD = 0.82;

        const matches = await prisma.$queryRawUnsafe(`
            SELECT id, username, "currentVibe", "favTrigger", 
            1 - ("vibeEmbedding" <=> $1::vector) as similarity
            FROM "User"
            WHERE id != $2
            AND "vibeEmbedding" IS NOT NULL
            AND 1 - ("vibeEmbedding" <=> $1::vector) > $3
            ORDER BY similarity DESC
            LIMIT 1;
        `, userVector, userId, THRESHOLD);

        const bestMatch = Array.isArray(matches) ? matches[0] : null;

        if (bestMatch) {
            res.json({ match: true, user: bestMatch });
        } else {
            res.json({ match: false });
        }
    } catch (e) {
        console.error("Vector Search Error:", e);
        res.json({ match: false, error: "Frequency alignment failed" });
    }
});

httpServer.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
