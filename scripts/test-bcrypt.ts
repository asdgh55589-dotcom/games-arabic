import bcrypt from 'bcryptjs'
async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  console.log('Hash:', hash)
  const valid = await bcrypt.compare('admin123', hash)
  console.log('Compare:', valid)
}
main()
