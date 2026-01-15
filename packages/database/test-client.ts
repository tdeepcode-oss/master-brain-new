
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking UserProgress model...')
    console.log('prisma.userProgress:', !!prisma.userProgress)
    if (prisma.userProgress) {
        console.log('SUCCESS: Model exists on client.')
    } else {
        console.log('FAILURE: Model is undefined.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
