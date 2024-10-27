import crypto from 'crypto'

// 비밀번호 생성기
const clientSideHashingPassword = (password: string): string => {
  const clientSalt = 'meaninglessClientSalt'
  return crypto
    .createHash('sha256')
    .update(password + clientSalt)
    .digest('hex')
}

export { clientSideHashingPassword }
