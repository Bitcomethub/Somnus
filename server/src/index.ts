import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
        const users = await prisma.user.findMany();
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

// Sleep-Sync Engine (Socket.io) 🛌
const activeRooms: Record<string, NodeJS.Timeout> = {};

io.on('connection', (socket) => {
    console.log('User connected to Vibe Stream:', socket.id);

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

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
