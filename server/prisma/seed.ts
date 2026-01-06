import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Somnus VIP Rooms...');

    const vipUsers = [
        { username: 'Lumina', favTrigger: 'Thumb Lights', triggerInventory: ['ThumbLights', 'Visual'], sensoryTolerance: 4 },
        { username: 'Glitch', favTrigger: 'Blinking', triggerInventory: ['ThumbLights'], sensoryTolerance: 6 },
        { username: 'Coco', favTrigger: 'Coconut Crack', triggerInventory: ['CoconutCrack', 'Tapping'], sensoryTolerance: 9 }, // High tolerance for loud cracks
        { username: 'Scholar', favTrigger: 'Book Tapping', triggerInventory: ['CoconutCrack'], sensoryTolerance: 3 },
        { username: 'Storm', favTrigger: 'Rainstorm', triggerInventory: ['WaterClips'], sensoryTolerance: 7 },
        { username: 'Mist', favTrigger: 'Water Clips', triggerInventory: ['WaterClips'], sensoryTolerance: 2 },
        { username: 'Ariel', favTrigger: 'Mermaid Brush', triggerInventory: ['Hairplay'], sensoryTolerance: 5 },
        { username: 'Flash', favTrigger: 'Taking Photos', triggerInventory: ['TakingPhotos'], sensoryTolerance: 8 }, // Bright flashes/loud shutter
        { username: 'Fizz', favTrigger: 'Carbonated Spray', triggerInventory: ['BodySpray'], sensoryTolerance: 6 },
        { username: 'Salty', favTrigger: 'Ocean Trigger', triggerInventory: ['OceanTrigger'], sensoryTolerance: 4 },
    ];

    for (const user of vipUsers) {
        await prisma.user.create({
            data: {
                username: user.username,
                favTrigger: user.favTrigger,
                avatarUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`, // Aesthetic avatars
                triggerInventory: user.triggerInventory,
                currentVibe: user.triggerInventory[0],
                sensoryTolerance: user.sensoryTolerance
            }
        });
    }

    console.log('✅ Seeding complete: 10 VIP Sonomates created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
