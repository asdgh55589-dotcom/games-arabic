import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const user = await db.user.findFirst({ where: { username: 'Momen Hani' } })
  console.log('Direct query - username:', user?.username)
  console.log('Direct query - password field:', user?.password ? 'EXISTS' : 'NULL')
  console.log('Direct query - password length:', user?.password?.length)
}
main().catch(console.error).finally(() => db.$disconnect())
