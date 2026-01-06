import 'dotenv/config'; // Enforce early loading

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
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
                // avatarUrl: false // HIDDEN for Privacy (Whisper-to-Reveal)
                currentVibe: true,
                triggerInventory: true
            }
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Sensory Match Algorithm 🧠
// Logic: High score = Shared Triggers - Tolerance Delta
app.post('/match-score', async (req, res) => {
    const { userAId, userBId } = req.body;
    try {
        const userA = await prisma.user.findUnique({ where: { id: userAId } });
        const userB = await prisma.user.findUnique({ where: { id: userBId } });

        if (!userA || !userB) return res.status(404).json({ error: 'User not found' });

        const triggersA = new Set(userA.triggerInventory);
        const triggersB = userB.triggerInventory;

        // 1. Trigger Overlap (Base Score)
        let overlap = 0;
        triggersB.forEach(t => { if (triggersA.has(t)) overlap++; });
        const union = new Set([...userA.triggerInventory, ...userB.triggerInventory]).size || 1;
        const baseScore = (overlap / union) * 100;

        // 2. Sensory Tolerance Check (Penalty)
        // If one likes Loud (10) and other Whisper (2), penalty is high.
        const toleranceDelta = Math.abs((userA.sensoryTolerance || 5) - (userB.sensoryTolerance || 5));
        const penalty = toleranceDelta * 8; // Max 80 penalty points

        const finalScore = Math.max(0, Math.round(baseScore - penalty));

        res.json({ score: finalScore, common: overlap, toleranceDelta });
    } catch (e) {
        res.status(500).json({ error: "Calc failed" });
    }
});

app.post('/whisper', async (req, res) => {
    try {
        const { senderId, receiverId, audioData } = req.body;
        const whisper = await prisma.whisper.create({
            data: { senderId, receiverId, audioData }
        });

        // Notify receiver if connected via socket (Future enhancement)
        // io.to(`user_${receiverId}`).emit('new_whisper', whisper);

        res.json(whisper);
    } catch (e) {
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
    try {
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('✅ pgvector extension enabled');
    } catch (e) {
        console.warn('⚠️ Failed to enable pgvector (might need superuser):', e);
    }
    console.log(`Server running on port ${PORT}`);
});
