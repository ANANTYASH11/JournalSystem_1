"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const sampleEntries = [
    {
        ambience: 'forest',
        text: 'I felt so calm today walking through the virtual forest. The sound of birds chirping and leaves rustling helped me forget about my work stress. I feel more connected to nature now.',
        emotion: 'calm',
        keywords: ['forest', 'birds', 'nature', 'stress-relief'],
        summary: 'User experienced deep relaxation during the forest session, finding relief from work-related stress.',
    },
    {
        ambience: 'ocean',
        text: 'The ocean waves were incredibly soothing. I closed my eyes and imagined myself on a beach. My anxiety about the upcoming presentation melted away.',
        emotion: 'peaceful',
        keywords: ['ocean', 'waves', 'anxiety', 'beach', 'relaxation'],
        summary: 'User found peace listening to ocean sounds, successfully reducing anxiety about upcoming work.',
    },
    {
        ambience: 'mountain',
        text: 'The mountain ambience made me feel powerful and grounded. I could hear the wind and it reminded me of hiking trips with my family. I feel grateful for these memories.',
        emotion: 'grateful',
        keywords: ['mountain', 'wind', 'hiking', 'family', 'memories'],
        summary: 'User felt empowered and grateful during the mountain session, connecting with positive family memories.',
    },
    {
        ambience: 'forest',
        text: 'Today was harder. Even the peaceful forest sounds couldn\'t completely quiet my racing thoughts. But I stayed with it and by the end, I felt a little better.',
        emotion: 'anxious',
        keywords: ['difficult', 'racing-thoughts', 'persistence', 'improvement'],
        summary: 'User struggled with anxious thoughts but showed resilience by completing the session.',
    },
    {
        ambience: 'ocean',
        text: 'I love how the ocean sounds transport me to another place. I visualized dolphins swimming freely. It made me feel hopeful about the future.',
        emotion: 'hopeful',
        keywords: ['ocean', 'dolphins', 'visualization', 'freedom', 'future'],
        summary: 'User engaged in positive visualization during ocean session, cultivating hope.',
    },
];
async function main() {
    console.log('🌱 Seeding database...');
    // Create a demo user
    const user = await prisma.user.upsert({
        where: { id: '123' },
        create: {
            id: '123',
            name: 'Demo User',
            email: 'demo@example.com',
        },
        update: {},
    });
    console.log(`✅ Created user: ${user.id}`);
    // Create sample journal entries
    for (const entry of sampleEntries) {
        const journalEntry = await prisma.journalEntry.create({
            data: {
                userId: user.id,
                ambience: entry.ambience,
                text: entry.text,
            },
        });
        // Create associated analysis
        await prisma.emotionAnalysis.create({
            data: {
                journalEntryId: journalEntry.id,
                emotion: entry.emotion,
                keywords: JSON.stringify(entry.keywords),
                summary: entry.summary,
                confidence: 0.85,
                textHash: `seed-${Date.now()}-${Math.random()}`,
            },
        });
        console.log(`✅ Created entry: ${entry.ambience} - ${entry.emotion}`);
    }
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map