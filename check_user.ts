
import { prisma } from './packages/database';

async function main() {
    const userId = 'feec719c-c22e-4a49-b2ef-576f83d1eb3f'; // ID from logs
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User NOT found!');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
